import { Global, Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { SubscriptionService } from './subscription.service';
import { SubscriptionGuard } from './guards/subscription.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SubscriptionService, SubscriptionGuard],
  exports: [SubscriptionService, SubscriptionGuard],
})
export class SubscriptionModule {}
