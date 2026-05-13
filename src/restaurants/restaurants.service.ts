import { Injectable } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findById(restauranteId: string) {
    return this.prisma.restaurantes.findUnique({
      where: {
        id: restauranteId,
      },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        endereco: true,
        created_at: true,
      },
    });
  }

  async update(restauranteId: string, dto: UpdateRestaurantDto) {
    return this.prisma.restaurantes.update({
      where: {
        id: restauranteId,
      },
      data: {
        nome: dto.nome,
        cnpj: dto.cnpj,
        endereco: dto.endereco,
      },
    });
  }

  async stats(restauranteId: string) {
    const [totalProdutos, totalMesas, comandasAbertas, totalUsuarios] =
      await Promise.all([
        this.prisma.produtos.count({
          where: {
            restaurante_id: restauranteId,
            deleted_at: null,
          },
        }),

        this.prisma.mesas.count({
          where: {
            restaurante_id: restauranteId,
          },
        }),

        this.prisma.comandas.count({
          where: {
            restaurante_id: restauranteId,
            status: 'ABERTA',
          },
        }),

        this.prisma.usuarios.count({
          where: {
            restaurante_id: restauranteId,
            deleted_at: null,
          },
        }),
      ]);

    return {
      totalProdutos,
      totalMesas,
      comandasAbertas,
      totalUsuarios,
    };
  }
}
