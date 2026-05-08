export enum UserRole {
  GERENTE = 'GERENTE',
  GARCOM = 'GARCOM',
}

export interface AuthUser {
  userId: string;
  role: UserRole;
  restauranteId: string;
}

export interface JwtPayload {
  sub: string; // normalmente o ID do usuário
  role: UserRole; // GERENTE ou GARCOM
  restauranteId: string; // id do restaurante
  iat?: number;
  exp?: number;
}
