import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OpenOrderDto } from './dto/open-order.dto';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // -------------- Abrir comanda ------------------------------
  // (Altera status da mesa e cria a comanda em transação)
  async openOrder(dto: OpenOrderDto, restaurante_id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const mesa = await tx.mesas.findUnique({
        where: { id: dto.mesa_id, restaurante_id, deleted_at: null },
      });

      if (!mesa) throw new NotFoundException('Mesa não encontrada.');
      if (mesa.status !== 'DISPONIVEL') {
        throw new BadRequestException(
          'Esta mesa não está disponível para abertura.',
        );
      }

      // atualiza o status de mesa comp ocupada e evita race conditions
      const updated = await tx.mesas.updateMany({
        where: {
          id: dto.mesa_id,
          restaurante_id,
          status: 'DISPONIVEL',
          deleted_at: null,
        },
        data: { status: 'OCUPADA' },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Mesa já está ocupada.');
      }

      // inicia a comanda vinculada a uma mesa em questao
      return tx.comandas.create({
        data: {
          mesa_id: mesa.id,
          restaurante_id,
          aberta_por: userId,
          status: 'ABERTA',
          observacao: dto.observacao,
          total: 0,
        },
      });
    });
  }

  // -------------- Lançamento de Item ------------------------------
  // (Calcula subtotal baseado no preço atual do produto e incrementa o total da comanda)
  async addItem(comanda_id: string, dto: AddItemDto, restaurante_id: string) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findUnique({
        where: { id: comanda_id, restaurante_id, status: 'ABERTA' },
      });

      if (!comanda) {
        throw new BadRequestException(
          'Comanda não encontrada ou já fechada/em processo de fechamento.',
        );
      }

      const produto = await tx.produtos.findFirst({
        where: {
          id: dto.produto_id,
          restaurante_id,
          ativo: true,
          deleted_at: null,
        },
      });

      if (!produto || !produto.preco) {
        throw new NotFoundException(
          'Produto não disponível ou sem preço configurado.',
        );
      }

      const precoUnitario = produto.preco;
      const subtotal = Number(precoUnitario) * dto.quantidade;

      // Adiciona o item à comanda
      const item = await tx.itens_comanda.create({
        data: {
          comanda_id,
          produto_id: dto.produto_id,
          quantidade: dto.quantidade,
          preco_unitario: precoUnitario,
          subtotal: subtotal,
        },
      });

      // atualiza o valor total acumulado da comanda
      const novoTotal = Number(comanda.total) + subtotal;
      await tx.comandas.update({
        where: { id: comanda_id },
        data: { total: novoTotal },
      });

      return item;
    });
  }

  // -------------- solicitação de fechamento ------------------------------
  // (Fluxo do Garçom enviando pedido de fechamento para o gerente aprovar)
  async requestClosure(
    comanda_id: string,
    restaurante_id: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findFirst({
        where: { id: comanda_id, restaurante_id, status: 'ABERTA' },
      });

      if (!comanda) {
        throw new BadRequestException(
          'Comanda não encontrada ou já fechada/em processo de fechamento.',
        );
      }

      await tx.comandas.update({
        where: { id: comanda_id },
        data: { status: 'AGUARDANDO_FECHAMENTO' },
      });

      return tx.solicitacoes_fechamento.create({
        data: {
          comanda_id,
          solicitado_por: userId,
          status: 'PENDENTE',
        },
      });
    });
  }

  // -------------- lista de pedidos da comanda em questão ------------------------------
  // (Para visualização do garcom/cliente)
  async getOrderDetails(comanda_id: string, restaurante_id: string) {
    const comanda = await this.prisma.comandas.findFirst({
      where: { id: comanda_id, restaurante_id },
      include: {
        mesas: true,
        itens_comanda: {
          where: { deleted_at: null },
          include: { produtos: true },
        },
      },
    });

    if (!comanda) throw new NotFoundException('Comanda não encontrada.');
    return comanda;
  }
}
