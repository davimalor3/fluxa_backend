import { applyDecorators, UseGuards } from '@nestjs/common';

import { Roles } from './roles.decorator';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { SubscriptionGuard } from 'src/subscription/guards/subscription.guard';

import { UserRole } from '../types/user-role.enum';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard),
    Roles(...roles),
  );
}
