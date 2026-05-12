import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payloads.interface';
import { AuthUser } from '../types/auth-user.interface';
import { UserRole } from '../types/user-role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    const { sub, role, restauranteId } = payload;

    if (!sub || !role || !restauranteId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      userId: sub,
      role, // só pode ser "GERENTE" | "GARCOM"
      restauranteId,
    };
  }
}
