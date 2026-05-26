import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async validateRestaurantAccess(restauranteId: string) {
    const restaurante = await this.prisma.restaurantes.findUnique({
      where: { id: restauranteId },
    });

    if (!restaurante) {
      throw new ForbiddenException('Restaurante não encontrado');
    }

    const agora = new Date();

    const trialExpired =
      restaurante.subscription_status === 'TRIAL' &&
      restaurante.trial_ends_at &&
      restaurante.trial_ends_at < agora;

    if (trialExpired) {
      await this.prisma.restaurantes.update({
        where: { id: restaurante.id },
        data: {
          subscription_status: 'EXPIRED',
          is_active: false,
        },
      });

      throw new ForbiddenException('Assinatura ou trial expirado');
    }

    if (
      !restaurante.is_active ||
      restaurante.subscription_status === 'BLOCKED' ||
      restaurante.subscription_status === 'EXPIRED'
    ) {
      throw new ForbiddenException('Assinatura inválida');
    }

    return restaurante;
  }
}
