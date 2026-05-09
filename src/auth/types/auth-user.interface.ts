import { UserRole } from './user-role.enum';

export interface AuthUser {
  userId: string;
  role: UserRole;
  restauranteId: string;
}
