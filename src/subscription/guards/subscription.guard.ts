import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../../auth/types/auth-user.interface';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as AuthUser;

    if (!user?.restaurante_id) {
      throw new ForbiddenException(
        'Acesso negado. Restaurante não identificado.',
      );
    }

    await this.subscriptionService.validateRestaurantAccess(
      user.restaurante_id,
    );

    return true;
  }
}
