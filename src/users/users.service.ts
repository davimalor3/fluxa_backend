import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

import { CreateGarcomDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateGarcomDto } from './dto/update-garcom.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    nome: true,
    email: true,
    role: true,
    restaurante_id: true,
    created_at: true,
    updated_at: true,
  };

  findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: {
        email,
      },
    });
  }

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
      select: this.userSelect,
    });
  }

  findAll(restauranteId: string) {
    return this.prisma.usuarios.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
      },
      select: this.userSelect,
    });
  }
  // MÉTODO APENAS PARA TESTE: RETORNA TODOS OS USUÁRIOS, INDEPENDENTE DO RESTAURANTE E DO STATUS DE EXCLUSÃO. NÃO DEVE SER USADO EM PRODUÇÃO.
  findAllUsers() {
    return this.prisma.usuarios.findMany({
      where: {
        deleted_at: null,
      },
      select: this.userSelect,
    });
  }

  findById(id: string) {
    return this.prisma.usuarios.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: this.userSelect,
    });
  }

  async createGarcom(dto: CreateGarcomDto, restauranteId: string) {
    const restauranteAtual = await this.prisma.restaurantes.findUnique({
      where: {
        id: restauranteId,
      },
    });

    if (!restauranteAtual) {
      throw new BadRequestException('Restaurante não encontrado');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    const emailAlreadyExists = await this.findByEmail(normalizedEmail);

    if (emailAlreadyExists) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    const garcom = await this.prisma.usuarios.create({
      data: {
        nome: dto.nome,
        email: normalizedEmail,
        senha: hashedPassword,
        restaurante_id: restauranteId,
        role: 'GARCOM',
      },
      select: this.userSelect,
    });

    return garcom;
  }

  async findAllGarcons(restauranteId: string) {
    return this.prisma.usuarios.findMany({
      where: {
        restaurante_id: restauranteId,
        deleted_at: null,
        role: 'GARCOM',
      },
      select: this.userSelect,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findGarcomById(id: string, restauranteId: string) {
    const garcom = await this.prisma.usuarios.findFirst({
      where: {
        id,
        restaurante_id: restauranteId,
        deleted_at: null,
        role: 'GARCOM',
      },
      select: this.userSelect,
    });

    if (!garcom) {
      throw new NotFoundException('Garçom não encontrado');
    }

    return garcom;
  }

  async updateGarcom(id: string, dto: UpdateGarcomDto, restauranteId: string) {
    const garcom = await this.prisma.usuarios.findFirst({
      where: {
        id,
        restaurante_id: restauranteId,
        deleted_at: null,
        role: 'GARCOM',
      },
    });

    if (!garcom) {
      throw new NotFoundException('Garçom não encontrado');
    }

    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();

      const emailAlreadyExists = await this.prisma.usuarios.findFirst({
        where: {
          email: normalizedEmail,
          deleted_at: null,
          id: {
            not: id,
          },
        },
      });

      if (emailAlreadyExists) {
        throw new BadRequestException('Email já cadastrado');
      }
    }

    const data = {
      ...(dto.nome && { nome: dto.nome }),
      ...(dto.email && { email: dto.email.trim().toLowerCase() }),
      ...(dto.senha && { senha: await bcrypt.hash(dto.senha, 10) }),
    };

    return this.prisma.usuarios.update({
      where: {
        id,
      },
      data,
      select: this.userSelect,
    });
  }

  async updateUser(id: string, dto: UpdateUserDto, restauranteId: string) {
    const user = await this.prisma.usuarios.findFirst({
      where: {
        id,
        restaurante_id: restauranteId,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();

      const emailAlreadyExists = await this.prisma.usuarios.findFirst({
        where: {
          email: normalizedEmail,
          deleted_at: null,
          id: { not: id },
        },
      });

      if (emailAlreadyExists) {
        throw new BadRequestException('Email já cadastrado');
      }
    }

    return this.prisma.usuarios.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.email && { email: dto.email.trim().toLowerCase() }),
        ...(dto.senha && { senha: await bcrypt.hash(dto.senha, 10) }),
        ...(dto.role && { role: dto.role }),
      },
      select: this.userSelect,
    });
  }

  async remove(id: string, restauranteId: string) {
    const user = await this.prisma.usuarios.findFirst({
      where: {
        id,
        restaurante_id: restauranteId,
        deleted_at: null,
        role: 'GARCOM',
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.usuarios.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Usuário removido com sucesso',
    };
  }
}
