import { UserRole } from './user-role.enum';

export interface JwtPayload {
  sub: string; // normalmente o ID do usuário
  role: UserRole; // GERENTE ou GARCOM
  restaurante_id: string; // id do restaurante
  iat?: number;
  exp?: number;
}
