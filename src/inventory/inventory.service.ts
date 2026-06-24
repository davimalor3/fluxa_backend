import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { movimento_tipo, Prisma, produto_tipo } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async registrarEntrada(dto: CreateStockEntryDto, restauranteId: string) {
    const produto = await this.prisma.produtos.findFirst({
      where: {
        id: dto.produto_id,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (produto.tipo === produto_tipo.PRODUTO_COMPOSTO) {
      throw new BadRequestException(
        'Produtos compostos não recebem entrada de estoque',
      );
    }

    if (!produto.controla_estoque) {
      throw new BadRequestException('Este produto não controla estoque');
    }

    return this.prisma.$transaction(async (tx) => {
      const estoqueAtual = produto.quantidade ?? new Prisma.Decimal(0);

      const novaQuantidade = estoqueAtual.add(
        new Prisma.Decimal(dto.quantidade),
      );

      await tx.produtos.update({
        where: {
          id: produto.id,
        },
        data: {
          quantidade: novaQuantidade,
        },
      });

      const movimentacao = await tx.estoque_movimentacoes.create({
        data: {
          produto_id: produto.id,
          restaurante_id: restauranteId,
          tipo: movimento_tipo.ENTRADA,
          quantidade: dto.quantidade,
          motivo: dto.motivo ?? 'Entrada manual de estoque',
        },
      });

      return movimentacao;
    });
  }

  async registrarInventario(dto: CreateInventoryDto, restauranteId: string) {
    const produto = await this.prisma.produtos.findFirst({
      where: {
        id: dto.produto_id,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (produto.tipo === produto_tipo.PRODUTO_COMPOSTO) {
      throw new BadRequestException(
        'Produtos compostos não participam de inventário',
      );
    }

    if (!produto.controla_estoque) {
      throw new BadRequestException('Este produto não controla estoque');
    }

    return this.prisma.$transaction(async (tx) => {
      const quantidadeTeorica = produto.quantidade ?? new Prisma.Decimal(0);

      const quantidadeReal = new Prisma.Decimal(dto.quantidade_real);

      const diferenca = quantidadeReal.sub(quantidadeTeorica);

      await tx.inventarios.create({
        data: {
          produto_id: produto.id,
          restaurante_id: restauranteId,
          quantidade_real: quantidadeReal,
        },
      });

      await tx.produtos.update({
        where: {
          id: produto.id,
        },
        data: {
          quantidade: quantidadeReal,
        },
      });

      await tx.estoque_movimentacoes.create({
        data: {
          produto_id: produto.id,
          restaurante_id: restauranteId,
          tipo: movimento_tipo.AJUSTE,
          quantidade: diferenca,
          motivo: 'Inventário físico',
        },
      });

      return {
        produto_id: produto.id,
        quantidade_teorica: quantidadeTeorica,
        quantidade_real: quantidadeReal,
        diferenca,
      };
    });
  }

  async findMovimentacoes(restauranteId: string) {
    return this.prisma.estoque_movimentacoes.findMany({
      where: {
        restaurante_id: restauranteId,
      },
      include: {
        produtos: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findMovimentacoesProduto(produtoId: string, restauranteId: string) {
    const produto = await this.prisma.produtos.findFirst({
      where: {
        id: produtoId,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.estoque_movimentacoes.findMany({
      where: {
        produto_id: produtoId,
        restaurante_id: restauranteId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getEstoque(restauranteId: string) {
    return this.prisma.produtos.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
        tipo: {
          in: [produto_tipo.PRODUTO_SIMPLES, produto_tipo.INSUMO], // Regra do módulo Estoque
        },
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        quantidade: true,
        tipo: true,
        unidade_medida: true,
        ativo: true,
        controla_estoque: true,
        estoque_minimo: true, // Importante para alertar o frontend sobre falta de produto
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }
}
