import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenOrderDto } from './dto/open-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import {
  movimento_tipo,
  Prisma,
  produto_tipo,
  produtos,
  referencia_tipo,
} from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private decimal(value: number | string | Prisma.Decimal) {
    return new Prisma.Decimal(value);
  }

  private multiply(a: Prisma.Decimal, b: Prisma.Decimal): Prisma.Decimal {
    return a.mul(b);
  }
  private subtract(a: Prisma.Decimal, b: Prisma.Decimal): Prisma.Decimal {
    return a.sub(b);
  }

  // ========================================================= ABRIR COMANDA

  async openOrder(dto: OpenOrderDto, restaurante_id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const mesa = await tx.mesas.findFirst({
        where: {
          id: dto.mesa_id,
          restaurante_id,
          deleted_at: null,
        },
      });

      if (!mesa) {
        throw new NotFoundException('Mesa não encontrada.');
      }

      if (mesa.status !== 'DISPONIVEL') {
        throw new BadRequestException(
          'Esta mesa não está disponível para abertura.',
        );
      }

      const updated = await tx.mesas.updateMany({
        where: {
          id: dto.mesa_id,
          restaurante_id,
          status: 'DISPONIVEL',
          deleted_at: null,
        },
        data: {
          status: 'OCUPADA',
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Mesa já está ocupada.');
      }

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

  // ========================================================= BAIXA DE PRODUTO SIMPLES

  private async baixarProdutoSimples(
    tx: Prisma.TransactionClient,
    produto: produtos,
    quantidadeVendida: number,
    restauranteId: string,
    comandaId: string,
  ) {
    if (!produto.controla_estoque) {
      return;
    }

    const quantidade = new Prisma.Decimal(quantidadeVendida);

    const estoqueAtual = produto.quantidade ?? new Prisma.Decimal(0);

    if (estoqueAtual.lessThan(quantidade)) {
      throw new BadRequestException(
        `Estoque insuficiente para ${produto.nome}`,
      );
    }

    const novoEstoque = estoqueAtual.sub(quantidade);

    await tx.produtos.update({
      where: {
        id: produto.id,
      },
      data: {
        quantidade: novoEstoque,
      },
    });

    await tx.estoque_movimentacoes.create({
      data: {
        produto_id: produto.id,
        restaurante_id: restauranteId,
        tipo: 'SAIDA',
        referencia_tipo: 'COMANDA',
        referencia_id: comandaId,
        quantidade,
        motivo: 'Venda direta',
      },
    });
  }

  // ========================================================= CONSUMO DE FICHA TÉCNICA

  private async consumirFichaTecnica(
    tx: Prisma.TransactionClient,
    produto: Prisma.produtosGetPayload<{
      include: { ficha_tecnica_ficha_tecnica_produto_idToprodutos: true };
    }>,
    quantidadeVendida: number,
    restauranteId: string,
    comandaId: string,
  ) {
    const ficha =
      produto.ficha_tecnica_ficha_tecnica_produto_idToprodutos || [];

    if (!ficha.length) {
      throw new BadRequestException(
        `O produto ${produto.nome} não possui ficha técnica cadastrada`,
      );
    }

    for (const item of ficha) {
      const insumo = await tx.produtos.findFirst({
        where: {
          id: item.insumo_id,
          restaurante_id: restauranteId,
          tipo: produto_tipo.INSUMO,
          deleted_at: null,
        },
      });

      if (!insumo) {
        throw new BadRequestException(
          `Insumo não encontrado para ficha técnica`,
        );
      }

      if (!insumo.controla_estoque) {
        continue;
      }

      const consumoPorUnidade = item.quantidade;

      const consumoTotal = consumoPorUnidade.mul(
        new Prisma.Decimal(quantidadeVendida),
      );

      const estoqueAtual = insumo.quantidade ?? new Prisma.Decimal(0);

      if (estoqueAtual.lessThan(consumoTotal)) {
        throw new BadRequestException(
          `Estoque insuficiente para o insumo ${insumo.nome}`,
        );
      }

      const novoEstoque = estoqueAtual.sub(consumoTotal);

      await tx.produtos.update({
        where: {
          id: insumo.id,
        },
        data: {
          quantidade: novoEstoque,
        },
      });

      await tx.estoque_movimentacoes.create({
        data: {
          produto_id: insumo.id,
          restaurante_id: restauranteId,
          tipo: 'SAIDA',
          referencia_tipo: 'COMANDA',
          referencia_id: comandaId,
          quantidade: consumoTotal,
          motivo: `Consumo ficha técnica - ${produto.nome}`,
        },
      });
    }
  }

  // ========================================================= ADICIONAR ITEM

  async addItem(comanda_id: string, dto: AddItemDto, restaurante_id: string) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findFirst({
        where: {
          id: comanda_id,
          restaurante_id,
          status: 'ABERTA',
        },
      });

      if (!comanda) {
        throw new BadRequestException('Comanda não encontrada ou fechada');
      }

      const produto = await tx.produtos.findFirst({
        where: {
          id: dto.produto_id,
          restaurante_id,
          ativo: true,
          deleted_at: null,
        },
        include: {
          ficha_tecnica_ficha_tecnica_produto_idToprodutos: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      if (!produto) {
        throw new NotFoundException('Produto não encontrado');
      }

      if (!produto.preco) {
        throw new BadRequestException('Produto sem preço configurado');
      }

      const quantidade = new Prisma.Decimal(dto.quantidade);

      const subtotal = produto.preco.mul(quantidade);

      switch (produto.tipo) {
        case 'PRODUTO_SIMPLES':
          await this.baixarProdutoSimples(
            tx,
            produto,
            dto.quantidade,
            restaurante_id,
            comanda_id,
          );
          break;

        case 'PRODUTO_COMPOSTO':
          await this.consumirFichaTecnica(
            tx,
            produto,
            dto.quantidade,
            restaurante_id,
            comanda_id,
          );
          break;

        case 'INSUMO':
          throw new BadRequestException(
            'Insumos não podem ser vendidos diretamente',
          );
      }

      const item = await tx.itens_comanda.create({
        data: {
          comanda_id,
          produto_id: produto.id,
          quantidade,
          preco_unitario: produto.preco,
          subtotal,
        },
      });

      const novoTotal = new Prisma.Decimal(comanda.total).add(subtotal);

      await tx.comandas.update({
        where: {
          id: comanda.id,
        },
        data: {
          total: novoTotal,
        },
      });

      return item;
    });
  }

  // ========================================================== SOLICITAÇÃO FECHAMENTO

  async requestClosure(
    comanda_id: string,
    restaurante_id: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findFirst({
        where: {
          id: comanda_id,
          restaurante_id,
          status: 'ABERTA',
        },
      });

      if (!comanda) {
        throw new BadRequestException('Comanda não encontrada.');
      }

      await tx.comandas.update({
        where: {
          id: comanda_id,
        },
        data: {
          status: 'AGUARDANDO_FECHAMENTO',
        },
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

  // ========================================================= DETALHES COMANDA

  async getOrderDetails(comanda_id: string, restaurante_id: string) {
    const comanda = await this.prisma.comandas.findFirst({
      where: {
        id: comanda_id,
        restaurante_id,
      },
      include: {
        mesas: true,
        itens_comanda: {
          where: {
            deleted_at: null,
          },
          include: {
            produtos: true,
          },
        },
      },
    });

    if (!comanda) {
      throw new NotFoundException('Comanda não encontrada.');
    }

    return comanda;
  }

  private async estornarProdutoSimples(
    tx: Prisma.TransactionClient,
    produto: produtos,
    quantidade: Prisma.Decimal,
    restauranteId: string,
    comandaId: string,
  ) {
    if (!produto.controla_estoque) {
      return;
    }

    const estoqueAtual = produto.quantidade ?? new Prisma.Decimal(0);

    const novoEstoque = estoqueAtual.add(quantidade);

    await tx.produtos.update({
      where: {
        id: produto.id,
      },
      data: {
        quantidade: novoEstoque,
      },
    });

    await tx.estoque_movimentacoes.create({
      data: {
        produto_id: produto.id,
        restaurante_id: restauranteId,
        tipo: movimento_tipo.ENTRADA,
        referencia_tipo: referencia_tipo.COMANDA,
        referencia_id: comandaId,
        quantidade,
        motivo: 'Estorno de item removido',
      },
    });
  }

  private async estornarFichaTecnica(
    tx: Prisma.TransactionClient,
    produto: Prisma.produtosGetPayload<{
      include: {
        ficha_tecnica_ficha_tecnica_produto_idToprodutos: true;
      };
    }>,
    quantidadeVendida: number,
    restauranteId: string,
    comandaId: string,
  ) {
    const ficha =
      produto.ficha_tecnica_ficha_tecnica_produto_idToprodutos || [];

    if (!ficha.length) {
      return;
    }

    for (const item of ficha) {
      const insumo = await tx.produtos.findFirst({
        where: {
          id: item.insumo_id,
          restaurante_id: restauranteId,
          deleted_at: null,
        },
      });

      if (!insumo) {
        continue;
      }

      if (!insumo.controla_estoque) {
        continue;
      }

      const quantidadeEstorno = item.quantidade.mul(
        new Prisma.Decimal(quantidadeVendida),
      );

      const estoqueAtual = insumo.quantidade ?? new Prisma.Decimal(0);

      const novoEstoque = estoqueAtual.add(quantidadeEstorno);

      await tx.produtos.update({
        where: {
          id: insumo.id,
        },
        data: {
          quantidade: novoEstoque,
        },
      });

      await tx.estoque_movimentacoes.create({
        data: {
          produto_id: insumo.id,
          restaurante_id: restauranteId,
          tipo: movimento_tipo.ENTRADA,
          referencia_tipo: referencia_tipo.COMANDA,
          referencia_id: comandaId,
          quantidade: quantidadeEstorno,
          motivo: `Estorno ficha técnica - ${produto.nome}`,
        },
      });
    }
  }

  async removeItem(itemId: string, restauranteId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.itens_comanda.findFirst({
        where: {
          id: itemId,
          deleted_at: null,
        },
        include: {
          comandas: true,
        },
      });

      if (!item) {
        throw new NotFoundException('Item não encontrado');
      }

      if (item.comandas.restaurante_id !== restauranteId) {
        throw new ForbiddenException();
      }

      if (item.comandas.status !== 'ABERTA') {
        throw new BadRequestException('A comanda não está aberta');
      }

      const produto = await tx.produtos.findFirst({
        where: {
          id: item.produto_id,
          restaurante_id: restauranteId,
        },
        include: {
          ficha_tecnica_ficha_tecnica_produto_idToprodutos: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      if (!produto) {
        throw new NotFoundException('Produto não encontrado');
      }

      switch (produto.tipo) {
        case 'PRODUTO_SIMPLES':
          await this.estornarProdutoSimples(
            tx,
            produto,
            item.quantidade,
            restauranteId,
            item.comanda_id,
          );
          break;

        case 'PRODUTO_COMPOSTO':
          await this.estornarFichaTecnica(
            tx,
            produto,
            Number(item.quantidade),
            restauranteId,
            item.comanda_id,
          );
          break;
      }

      const novoTotal = new Prisma.Decimal(item.comandas.total).sub(
        item.subtotal,
      );

      await tx.comandas.update({
        where: {
          id: item.comanda_id,
        },
        data: {
          total: novoTotal,
        },
      });

      await tx.itens_comanda.update({
        where: {
          id: item.id,
        },
        data: {
          deleted_at: new Date(),
        },
      });

      return {
        message: 'Item removido com sucesso',
      };
    });
  }

  async cancelarComanda(comandaId: string, restauranteId: string) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findFirst({
        where: {
          id: comandaId,
          restaurante_id: restauranteId,
        },
        include: {
          itens_comanda: {
            where: {
              deleted_at: null,
            },
          },
          mesas: true,
        },
      });

      if (!comanda) {
        throw new NotFoundException('Comanda não encontrada');
      }

      if (comanda.status === 'FECHADA') {
        throw new BadRequestException('Comanda já foi fechada');
      }

      for (const item of comanda.itens_comanda) {
        const produto = await tx.produtos.findFirst({
          where: {
            id: item.produto_id,
            restaurante_id: restauranteId,
          },
          include: {
            ficha_tecnica_ficha_tecnica_produto_idToprodutos: {
              where: {
                deleted_at: null,
              },
            },
          },
        });

        if (!produto) {
          continue;
        }

        switch (produto.tipo) {
          case 'PRODUTO_SIMPLES':
            await this.estornarProdutoSimples(
              tx,
              produto,
              item.quantidade,
              restauranteId,
              comanda.id,
            );
            break;

          case 'PRODUTO_COMPOSTO':
            await this.estornarFichaTecnica(
              tx,
              produto,
              Number(item.quantidade),
              restauranteId,
              comanda.id,
            );
            break;
        }
      }

      await tx.itens_comanda.updateMany({
        where: {
          comanda_id: comanda.id,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date(),
        },
      });

      await tx.comandas.update({
        where: {
          id: comanda.id,
        },
        data: {
          status: 'CANCELADA',
          total: new Prisma.Decimal(0),
        },
      });

      await tx.mesas.update({
        where: {
          id: comanda.mesa_id,
        },
        data: {
          status: 'DISPONIVEL',
        },
      });

      return {
        message: 'Comanda cancelada com sucesso',
      };
    });
  }

  // ========================================================= CONFIRMAR FECHAMENTO
  async confirmarFechamento(
    comandaId: string,
    restauranteId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findFirst({
        where: {
          id: comandaId,
          restaurante_id: restauranteId,
        },
        include: {
          mesas: true,
        },
      });

      if (!comanda) {
        throw new NotFoundException('Comanda não encontrada.');
      }

      if (comanda.status === 'FECHADA') {
        throw new BadRequestException('Esta comanda já foi fechada.');
      }

      if (comanda.status === 'CANCELADA') {
        throw new BadRequestException('Esta comanda foi cancelada.');
      }

      await tx.comandas.update({
        where: {
          id: comanda.id,
        },
        data: {
          status: 'FECHADA',
          fechada_por: userId,
          data_fechamento: new Date(),
        },
      });

      await tx.mesas.update({
        where: {
          id: comanda.mesa_id,
        },
        data: {
          status: 'DISPONIVEL',
        },
      });

      await tx.solicitacoes_fechamento.updateMany({
        where: {
          comanda_id: comanda.id,
          status: 'PENDENTE',
        },
        data: {
          status: 'APROVADA',
        },
      });

      return {
        message: 'Comanda fechada com sucesso.',
      };
    });
  }
}
