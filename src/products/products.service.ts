import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthUser } from '../auth/types/auth-user.interface';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto, user: AuthUser) {
    return this.prisma.produtos.create({
      data: {
        ...dto,
        restaurante_id: user.restauranteId,
      },
    });
  }

  async findAll(restauranteId: string) {
    return this.prisma.produtos.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, restauranteId: string) {
    const product = await this.prisma.produtos.findFirst({
      where: {
        id,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, restauranteId: string) {
    await this.findOne(id, restauranteId);

    return this.prisma.produtos.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, restauranteId: string) {
    await this.findOne(id, restauranteId);

    return this.prisma.produtos.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
