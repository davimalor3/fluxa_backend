import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { AuthUser } from '../auth/types/auth-user.interface';

@Controller('analytics')
@Auth(UserRole.GERENTE)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  dashboard(
    @CurrentUser() user: AuthUser,
    @Query() filters: AnalyticsFilterDto,
  ) {
    return this.analyticsService.dashboardComplete(
      user.restaurante_id,
      filters.inicio,
      filters.fim,
    );
  }
}
