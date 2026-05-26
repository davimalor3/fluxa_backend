import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
    });
  }

  // TODO: Implement pagination
  // TODO: Implementar atualização e remoção de usuários

  // Método para criar um novo usuário associado a um restaurante
  async create(dto: CreateUserDto, restauranteId: string) {
    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    return this.prisma.usuarios.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha: hashedPassword,
        role: dto.role,
        restaurante_id: restauranteId,
      },
    });
  }

  // aqui retorna todos os usuários de um restaurante específico, filtrando por restaurante_id e garantindo que apenas os usuários ativos (deleted_at: null) sejam retornados.
  findAll(restauranteId: string) {
    return this.prisma.usuarios.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });
  }

  // MÉTODO APENAS PARA TESTE: RETORNA TODOS OS USUÁRIOS, INDEPENDENTE DO RESTAURANTE E DO STATUS DE EXCLUSÃO. NÃO DEVE SER USADO EM PRODUÇÃO.
  findAllUsers() {
    return this.prisma.usuarios.findMany({
      where: {
        deleted_at: null,
      },
    });
  }

  findById(id: string) {
    return this.prisma.usuarios.findUnique({
      where: {
        id,
      },
    });
  }
}
