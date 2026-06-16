import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface DateRange {
  inicio: Date;
  fim: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================================= HELPERS
  private buildDateRange(inicio?: string, fim?: string): DateRange | undefined {
    if (!inicio && !fim) {
      return undefined;
    }

    if (!inicio || !fim) {
      throw new BadRequestException('Informe início e fim do período.');
    }

    const [anoInicio, mesInicio, diaInicio] = inicio.split('-').map(Number);

    const [anoFim, mesFim, diaFim] = fim.split('-').map(Number);

    const dataInicio = new Date(
      Date.UTC(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0),
    );

    const dataFimObj = new Date(
      Date.UTC(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999),
    );

    return {
      inicio: dataInicio,
      fim: dataFimObj,
    };
  }

  private paymentWhere(
    restauranteId: string,
    range?: DateRange,
  ): Prisma.pagamentosWhereInput {
    const where = {
      deleted_at: null,
      comandas: {
        restaurante_id: restauranteId,
      },
      ...(range && {
        data_pagamento: {
          gte: range.inicio,
          lte: range.fim,
        },
      }),
    };

    console.log('PAYMENT WHERE');
    console.log(JSON.stringify(where, null, 2));

    return where;
  }

  // ========================================================= DASHBOARD
  async dashboard(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    // TODO: REMOVER LOGS
    console.log('RANGE FINAL');
    console.log(range);

    const where = this.paymentWhere(restauranteId, range);

    const [
      faturamento,
      pagamentos,
      comandasFechadas,
      comandasAbertas,
      comandasPendentes,
      mesasDisponiveis,
      mesasOcupadas,
    ] = await Promise.all([
      this.prisma.pagamentos.aggregate({
        where,
        _sum: {
          valor_total: true,
        },
      }),

      this.prisma.pagamentos.count({
        where,
      }),

      this.prisma.comandas.count({
        where: {
          restaurante_id: restauranteId,
          status: 'FECHADA',
          ...(range && {
            data_fechamento: {
              gte: range.inicio,
              lte: range.fim,
            },
          }),
        },
      }),

      this.prisma.comandas.count({
        where: {
          restaurante_id: restauranteId,
          status: 'ABERTA',
        },
      }),

      this.prisma.comandas.count({
        where: {
          restaurante_id: restauranteId,
          status: 'AGUARDANDO_FECHAMENTO',
        },
      }),

      this.prisma.mesas.count({
        where: {
          restaurante_id: restauranteId,
          deleted_at: null,
          status: 'DISPONIVEL',
        },
      }),

      this.prisma.mesas.count({
        where: {
          restaurante_id: restauranteId,
          deleted_at: null,
          status: 'OCUPADA',
        },
      }),
    ]);

    console.log('RESULTADO DASHBOARD');
    console.log({
      faturamento,
      pagamentos,
      comandasFechadas,
    });

    return {
      faturamento: Number(faturamento._sum.valor_total ?? 0),

      pagamentos,

      comandas: {
        abertas: comandasAbertas,
        aguardandoFechamento: comandasPendentes,
        fechadas: comandasFechadas,
      },

      mesas: {
        disponiveis: mesasDisponiveis,
        ocupadas: mesasOcupadas,
      },
    };
  }

  // ========================================================= VENDAS
  async sales(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const pagamentos = await this.prisma.pagamentos.findMany({
      where: this.paymentWhere(restauranteId, range),
      select: {
        id: true,
        valor_total: true,
        data_pagamento: true,
      },
    });

    // TODO: REMOVER LOGS
    console.log(
      'PAGAMENTOS ENCONTRADOS:',
      pagamentos.map((p) => ({
        valor: p.valor_total,
        data: p.data_pagamento,
      })),
    );

    const total = pagamentos.reduce(
      (acc, pagamento) => acc + Number(pagamento.valor_total),
      0,
    );

    const ticketMedio = pagamentos.length === 0 ? 0 : total / pagamentos.length;

    return {
      totalVendido: total,
      ticketMedio,
      quantidadeVendas: pagamentos.length,
      vendas: pagamentos,
    };
  }

  // ========================================================= VENDAS POR FORMA DE PAGAMENTO
  async paymentMethods(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const pagamentos = await this.prisma.pagamentos.groupBy({
      by: ['forma_pagamento'],

      where: this.paymentWhere(restauranteId, range),

      _sum: {
        valor_total: true,
      },

      _count: {
        _all: true,
      },
    });

    return pagamentos.map((item) => ({
      formaPagamento: item.forma_pagamento,
      quantidade: item._count._all,
      total: Number(item._sum.valor_total ?? 0),
    }));
  }

  // ========================================================= PRODUTOS MAIS VENDIDOS
  async topProducts(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const itens = await this.prisma.itens_comanda.groupBy({
      by: ['produto_id'],

      where: {
        deleted_at: null,

        comandas: {
          restaurante_id: restauranteId,
          status: 'FECHADA',

          ...(range && {
            data_fechamento: {
              gte: range.inicio,
              lte: range.fim,
            },
          }),
        },
      },

      _sum: {
        quantidade: true,
        subtotal: true,
      },

      orderBy: {
        _sum: {
          quantidade: 'desc',
        },
      },

      take: 10,
    });

    return Promise.all(
      itens.map(async (item) => {
        const produto = await this.prisma.produtos.findUnique({
          where: {
            id: item.produto_id,
          },

          select: {
            nome: true,
          },
        });

        return {
          produtoId: item.produto_id,
          nome: produto?.nome,
          quantidade: Number(item._sum.quantidade ?? 0),
          faturamento: Number(item._sum.subtotal ?? 0),
        };
      }),
    );
  }

  async topWaiters(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const comandas = await this.prisma.comandas.groupBy({
      by: ['aberta_por'],

      where: {
        restaurante_id: restauranteId,

        ...(range && {
          data_abertura: {
            gte: range.inicio,
            lte: range.fim,
          },
        }),
      },

      _count: {
        _all: true,
      },

      _sum: {
        total: true,
      },

      orderBy: {
        _count: {
          aberta_por: 'desc',
        },
      },

      take: 10,
    });

    return Promise.all(
      comandas.map(async (item) => {
        const usuario = await this.prisma.usuarios.findUnique({
          where: {
            id: item.aberta_por!,
          },

          select: {
            nome: true,
          },
        });

        return {
          usuarioId: item.aberta_por,
          nome: usuario?.nome,
          comandas: item._count._all,
          faturamento: Number(item._sum.total ?? 0),
        };
      }),
    );
  }

  async tablePerformance(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const comandas = await this.prisma.comandas.groupBy({
      by: ['mesa_id'],

      where: {
        restaurante_id: restauranteId,
        status: 'FECHADA',

        ...(range && {
          data_fechamento: {
            gte: range.inicio,
            lte: range.fim,
          },
        }),
      },

      _count: {
        _all: true,
      },

      _sum: {
        total: true,
      },

      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
    });

    return Promise.all(
      comandas.map(async (item) => {
        const mesa = await this.prisma.mesas.findUnique({
          where: {
            id: item.mesa_id,
          },

          select: {
            numero: true,
          },
        });

        return {
          mesaId: item.mesa_id,
          numero: mesa?.numero,
          faturamento: Number(item._sum.total ?? 0),
          comandas: item._count._all,
        };
      }),
    );
  }

  async hourlySales(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const pagamentos = await this.prisma.pagamentos.findMany({
      where: this.paymentWhere(restauranteId, range),

      select: {
        valor_total: true,
        data_pagamento: true,
      },
    });

    const horas = Array.from({ length: 24 }, (_, i) => ({
      hora: i,
      total: 0,
    }));

    pagamentos.forEach((pagamento) => {
      const hora = pagamento.data_pagamento?.getHours() ?? 0;

      horas[hora].total += Number(pagamento.valor_total);
    });

    return horas;
  }

  async dailySales(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const pagamentos = await this.prisma.pagamentos.findMany({
      where: this.paymentWhere(restauranteId, range),

      orderBy: {
        data_pagamento: 'asc',
      },
    });

    const mapa = new Map<string, number>();

    pagamentos.forEach((item) => {
      const dia = item.data_pagamento?.toISOString().substring(0, 10);

      if (!dia) return;

      mapa.set(dia, (mapa.get(dia) ?? 0) + Number(item.valor_total));
    });

    return [...mapa.entries()].map(([dia, total]) => ({
      dia,
      total,
    }));
  }

  async monthlySales(restauranteId: string, inicio?: string, fim?: string) {
    const range = this.buildDateRange(inicio, fim);

    const pagamentos = await this.prisma.pagamentos.findMany({
      where: this.paymentWhere(restauranteId, range),
    });

    const mapa = new Map<string, number>();

    pagamentos.forEach((item) => {
      const mes = `${item.data_pagamento?.getFullYear()}-${String(
        (item.data_pagamento?.getMonth() ?? 0) + 1,
      ).padStart(2, '0')}`;

      mapa.set(mes, (mapa.get(mes) ?? 0) + Number(item.valor_total));
    });

    return [...mapa.entries()].map(([mes, total]) => ({
      mes,
      total,
    }));
  }

  async stockAlerts(restauranteId: string) {
    const produtos = await this.prisma.produtos.findMany({
      where: {
        restaurante_id: restauranteId,
        controla_estoque: true,
        ativo: true,
        deleted_at: null,
        quantidade: {
          lte: 10,
        },
      },

      orderBy: {
        quantidade: 'asc',
      },

      select: {
        id: true,
        nome: true,
        quantidade: true,
        unidade_medida: true,
      },
    });

    return produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      quantidade: Number(produto.quantidade),
      unidade: produto.unidade_medida,
      nivel: Number(produto.quantidade) <= 3 ? 'CRITICO' : 'BAIXO',
    }));
  }

  async dashboardComplete(
    restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    const [
      resumo,
      vendas,
      formasPagamento,
      topProdutos,
      topGarcons,
      desempenhoMesas,
      vendasDiarias,
      vendasMensais,
      vendasHorarias,
      alertasEstoque,
    ] = await Promise.all([
      this.dashboard(restauranteId, inicio, fim),
      this.sales(restauranteId, inicio, fim),
      this.paymentMethods(restauranteId, inicio, fim),
      this.topProducts(restauranteId, inicio, fim),
      this.topWaiters(restauranteId, inicio, fim),
      this.tablePerformance(restauranteId, inicio, fim),
      this.dailySales(restauranteId, inicio, fim),
      this.monthlySales(restauranteId, inicio, fim),
      this.hourlySales(restauranteId, inicio, fim),
      this.stockAlerts(restauranteId),
    ]);

    console.log('DASHBOARD COMPLETE');
    console.log({
      resumo,
      vendas,
      formasPagamento,
    });
    return {
      resumo,
      vendas: {
        totalVendido: vendas.totalVendido,
        ticketMedio: vendas.ticketMedio,
        quantidadeVendas: vendas.quantidadeVendas,
      },
      formasPagamento,
      topProdutos,
      topGarcons,
      desempenhoMesas,
      vendasDiarias,
      vendasMensais,
      vendasHorarias,
      alertasEstoque,
    };
  }
}
