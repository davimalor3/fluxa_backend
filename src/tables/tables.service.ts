import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  // --------- cria uma nova mesa para restaurante especifico ---------------
  async create(dto: CreateTableDto, restaurante_id: string) {
    // Verifica se o número da mesa já existe para este restaurante específico
    const mesaExistente = await this.prisma.mesas.findUnique({
      where: {
        numero_restaurante_id: {
          numero: dto.numero,
          restaurante_id,
        },
      },
    });

    if (mesaExistente) {
      throw new BadRequestException(
        `A mesa número ${dto.numero} já está cadastrada.`,
      );
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
      where: { restaurante_id, deleted_at: null },
      orderBy: { numero: 'asc' },
    });
  }

  async findOne(id: string, restaurante_id: string) {
    const mesa = await this.prisma.mesas.findFirst({
      where: { id, restaurante_id, deleted_at: null },
    });

    if (!mesa) {
      throw new NotFoundException('Mesa não encontrada.');
    }
    return mesa;
  }
}
