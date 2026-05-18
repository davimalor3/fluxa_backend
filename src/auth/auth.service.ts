import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  // --------- método para registrar um novo usuário e restaurante ---------
  async register(dto: RegisterDto) {
    const normalizedCnpj = dto.cnpj.replace(/\D/g, '');
    const normalizedEmail = dto.email.trim().toLowerCase();
    const emailAlreadyExists =
      await this.usersService.findByEmail(normalizedEmail);

    if (emailAlreadyExists) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    // INICIANDO TRANSAÇÃO PARA CRIAR RESTAURANTE, GERENTE E VALIDAR CÓDIGO DE CONVITE
    const result = await this.prisma.$transaction(async (tx) => {
      // busca p código de convite
      const normalizesCode = dto.inviteCode.trim().toUpperCase();
      const invite = await tx.inviteCodes.findUnique({
        where: { code: normalizesCode },
      });
      // validações de código de convite
      if (!invite || !invite.active) {
        throw new BadRequestException('Código inválido ou inativo');
      }

      if (invite.expires_at && invite.expires_at < new Date()) {
        throw new BadRequestException('Código expirado');
      }

      if (invite.max_uses && invite.uses >= invite.max_uses) {
        throw new BadRequestException('Código esgotado');
      }

      // código que sera utilizado
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + invite.trial_days);

      // parte de cadastro do restaurante
      const restaurant = await tx.restaurantes.create({
        data: {
          nome: dto.restaurantName,
          cnpj: normalizedCnpj,
          endereco: dto.endereco,
          trial_ends_at: trialEndsAt,
          subscription_status: 'TRIAL',
          is_active: true,
        },
      });

      // parte de cadastro do gerente
      const manager = await tx.usuarios.create({
        data: {
          nome: dto.managerName,
          email: normalizedEmail,
          senha: hashedPassword,
          role: 'GERENTE',
          restaurante_id: restaurant.id,
        },
      });

      await tx.inviteCodes.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } },
      });

      //  VALE RESSALTAR QUE TODOS OS DADOS PRECISAM SER PREENCHIDOS
      // CASO CONTRÁRIO,M QUALQUER ERRO DURANTE O PROCESSO DE CRIAÇÃO DO RESTAURANTE OU DO GERENTE
      // A TRANSACTION SERÁ ANULADA E NENHUM DADO SERÁ GRAVADO NO BANCO DE DADOS
      return { restaurant, manager };
    });

    const payload = {
      sub: result.manager.id,
      role: result.manager.role,
      restaurante_id: result.manager.restaurante_id,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: result.manager.id,
        nome: result.manager.nome,
        email: result.manager.email,
        role: result.manager.role,
        restaurante_id: result.manager.restaurante_id,
      },
    };
  }

  // --------- método para obter as informações do usuário autenticado ----------
  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    //  Etapa de verificação do status do restaurnte para garantir que
    //  usuários com jwt antigo não acessem o sistema caso restaurante esteja bloqueado ou assinatura expirada
    // aqui chama o restaurante autenticado por meio de subscriptionService
    await this.subscriptionService.validateRestaurantAccess(
      user.restaurante_id,
    );

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      restaurante_id: user.restaurante_id,
    };
  }

  // ------------ funçao de login assincrona ----------------------------------
  async login(email: string, senha: string) {
    // aqui normalizo o emailk para evitar problemas
    const normalizedEmail = email.trim().toLowerCase();
    //  aqui busco o usuário pelo email normalizado
    const user = await this.usersService.findByEmail(normalizedEmail);

    // verifica se user existe e se senha bate
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.subscriptionService.validateRestaurantAccess(
      user.restaurante_id,
    );

    // aqui crio o payload do token JWT
    const payload = {
      sub: user.id,
      role: user.role,
      restaurante_id: user.restaurante_id,
    };

    // aqui gero o token de acesso usando o payload e retorno ele para o cliente
    // o payload é o objeto que contém as informações do usuário que serão codificadas no token JWT. O método signAsync do JwtService é usado para gerar o token de acesso
    return {
      access_token: await this.jwtService.signAsync(payload),
      // aqui retorno as informações do usuário que serão usadas no frontend para exibir o nome do usuário, o email, o papel e o id do restaurante
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        restaurante_id: user.restaurante_id,
      },
    };
  }
}
