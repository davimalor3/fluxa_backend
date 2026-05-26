import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  // ------------- cria uma nova mesa para um restaurante ---------
  async create(dto: CreateTableDto, restaurante_id: string) {
    const mesaExistente = await this.prisma.mesas.findUnique({
      where: {
        numero_restaurante_id: {
          numero: dto.numero,
          restaurante_id,
        },
      },
    });

    if (mesaExistente && !mesaExistente.deleted_at) {
      throw new BadRequestException(
        `A mesa número ${dto.numero} já está cadastrada para este restaurante.`,
      );
    }

    // se a mesa já existiu mas foi deletada (soft delete), reativa ela
    if (mesaExistente && mesaExistente.deleted_at) {
      return this.prisma.mesas.update({
        where: { id: mesaExistente.id },
        data: {
          deleted_at: null,
          observacao: dto.observacao ?? null,
          status: 'DISPONIVEL',
          ativo: true,
        },
      });
    }

    return this.prisma.mesas.create({
      data: {
        numero: dto.numero,
        observacao: dto.observacao,
        restaurante_id,
        status: 'DISPONIVEL',
      },
    });
  }

  async findAll(restaurante_id: string) {
    return this.prisma.mesas.findMany({
      where: {
        restaurante_id,
        deleted_at: null,
        ativo: true,
      },
      include: {
        comandas: {
          where: { status: { in: ['ABERTA', 'AGUARDANDO_FECHAMENTO'] } },
          select: {
            id: true,
            status: true,
            total: true,
          },
        },
      },
      orderBy: { numero: 'asc' },
    });
  }

  async findOne(id: string, restaurante_id: string) {
    const mesa = await this.prisma.mesas.findFirst({
      where: { id, restaurante_id, deleted_at: null },
      include: {
        comandas: {
          where: { status: { in: ['ABERTA', 'AGUARDANDO_FECHAMENTO'] } },
        },
      },
    });

    if (!mesa) {
      throw new NotFoundException('Mesa não encontrada.');
    }
    return mesa;
  }

  async remove(id: string, restaurante_id: string) {
    const mesa = await this.findOne(id, restaurante_id);

    if (mesa.status === 'OCUPADA') {
      throw new BadRequestException(
        'Não é possível remover uma mesa que está ocupada.',
      );
    }

    return this.prisma.mesas.update({
      where: { id },
      data: { deleted_at: new Date(), ativo: false },
    });
  }
}
