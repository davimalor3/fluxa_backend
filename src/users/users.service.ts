import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.usuarios.findUnique({
      where: { id },
    });
  }

  // TODO: Implement pagination
  // REMOVER ESSA FUNÇÃO DEPOIS, apenas para teste de criação de usuário e login
  async findAll() {
    return this.prisma.usuarios.findMany();
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    return this.prisma.usuarios.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha: hashedPassword,
        role: dto.role,
        restaurante_id: dto.restaurante_id,
      },
    });
  }
}
