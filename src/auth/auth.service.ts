import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    };
  }

  // funçao de login assincrona
  async login(email: string, senha: string) {
    // aqui normalizo o emailk para evitar problemas
    const nomalizedEmail = email.trim().toLowerCase();
    //  aqui busco o usuário pelo email normalizado
    const user = await this.usersService.findByEmail(nomalizedEmail);

    // verifica se user existe e se senha bate
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      restauranteId: user.restaurante_id,
    };

    // aqui gero o token de acesso usando o payload e retorno ele para o cliente
    // o payload é o objeto que contém as informações do usuário que serão codificadas no token JWT. O método signAsync do JwtService é usado para gerar o token de acesso
    return {
      access_token: await this.jwtService.signAsync(payload),
      // aqui retorno as informações do usuário que serão usadas no frontend para exibir o nome do usuário, o email, o papel e o id do restaurante
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        restaurante_id: user.restaurante_id,
      },
    };
  }
}
