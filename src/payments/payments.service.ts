import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CloseOrderDto } from './dto/close-order.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================================= REGISTRAR PAGAMENTO
  async registrarPagamento(
    comandaId: string,
    dto: CloseOrderDto,
    restauranteId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comandas.findFirst({
        where: {
          id: comandaId,
          restaurante_id: restauranteId,
        },
      });

      if (!comanda) {
        throw new NotFoundException('Comanda não encontrada.');
      }

      if (comanda.status !== 'FECHADA') {
        throw new BadRequestException(
          'A comanda deve estar fechada antes do registro do pagamento.',
        );
      }

      const pagamentoExistente = await tx.pagamentos.findFirst({
        where: {
          comanda_id: comanda.id,
          deleted_at: null,
        },
      });

      if (pagamentoExistente) {
        throw new BadRequestException(
          'Já existe um pagamento registrado para esta comanda.',
        );
      }

      const pagamento = await tx.pagamentos.create({
        data: {
          comanda_id: comanda.id,
          registrado_por: userId,
          valor_total: comanda.total,
          forma_pagamento: dto.forma_pagamento,
          data_pagamento: new Date(),
        },
      });

      return {
        message: 'Pagamento registrado com sucesso.',
        pagamento,
      };
    });
  }

  // ========================================================= BUSCAR PAGAMENTO
  async buscarPagamento(id: string, restauranteId: string) {
    const pagamento = await this.prisma.pagamentos.findFirst({
      where: {
        id,
        deleted_at: null,
        comandas: {
          restaurante_id: restauranteId,
        },
      },
      include: {
        comandas: {
          include: {
            mesas: true,
          },
        },
        usuarios: true,
      },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado.');
    }

    return pagamento;
  }

  // ========================================================= LISTAR PAGAMENTOS
  async listarPagamentos(restauranteId: string) {
    return this.prisma.pagamentos.findMany({
      where: {
        deleted_at: null,
        comandas: {
          restaurante_id: restauranteId,
        },
      },
      include: {
        comandas: {
          include: {
            mesas: true,
          },
        },
        usuarios: true,
      },
      orderBy: {
        data_pagamento: 'desc',
      },
    });
  }

  // ========================================================= RESUMO FINANCEIRO
  async obterResumoFinanceiro(restauranteId: string) {
    const pagamentos = await this.prisma.pagamentos.findMany({
      where: {
        deleted_at: null,
        comandas: {
          restaurante_id: restauranteId,
        },
      },
    });

    const totalRecebido = pagamentos.reduce(
      (acc, item) => acc + Number(item.valor_total),
      0,
    );

    const pix = pagamentos
      .filter((p) => p.forma_pagamento === 'PIX')
      .reduce((acc, item) => acc + Number(item.valor_total), 0);

    const cartao = pagamentos
      .filter((p) => p.forma_pagamento === 'CARTAO')
      .reduce((acc, item) => acc + Number(item.valor_total), 0);

    const dinheiro = pagamentos
      .filter((p) => p.forma_pagamento === 'DINHEIRO')
      .reduce((acc, item) => acc + Number(item.valor_total), 0);

    const quantidadePagamentos = pagamentos.length;

    const ticketMedio =
      quantidadePagamentos > 0 ? totalRecebido / quantidadePagamentos : 0;

    return {
      totalRecebido,
      quantidadePagamentos,
      ticketMedio,
      porFormaPagamento: {
        pix,
        cartao,
        dinheiro,
      },
    };
  }
}
