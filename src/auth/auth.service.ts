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

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
