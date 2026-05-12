import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto) {
    return this.prisma.restaurantes.create({
      data: {
        nome: dto.nome,
        cnpj: dto.cnpj,
        endereco: dto.endereco,
      },
    });
  }

  async findAll() {
    return this.prisma.restaurantes.findMany();
  }

  findById(id: string) {
    return this.prisma.restaurantes.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.restaurantes.delete({
      where: { id },
    });
  }
}
