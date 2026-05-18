import { UserRole } from './user-role.enum';

export interface AuthUser {
  userId: string;
  role: UserRole;
  restaurante_id: string;
}
