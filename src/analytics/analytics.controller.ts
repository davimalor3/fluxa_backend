import { Controller, Get, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { UserRole } from '../auth/types/user-role.enum';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('analytics')
@Auth(UserRole.GERENTE)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  dashboard(
    @Body('restauranteId') restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    return this.analyticsService.dashboard(restauranteId, inicio, fim);
  }

  @Get('vendas')
  sales(
    @Body('restauranteId') restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    return this.analyticsService.sales(restauranteId, inicio, fim);
  }

  @Get('formas-pagamento')
  paymentMethods(
    @Body('restauranteId') restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    return this.analyticsService.paymentMethods(restauranteId, inicio, fim);
  }

  @Get('top-produtos')
  topProducts(
    @Body('restauranteId') restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    return this.analyticsService.topProducts(restauranteId, inicio, fim);
  }

  @Get('top-garcons')
  topWaiters(
    @Body('restauranteId') restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    return this.analyticsService.topWaiters(restauranteId, inicio, fim);
  }

  @Get('desempenho-mesas')
  tablePerformance(
    @Body('restauranteId') restauranteId: string,
    inicio?: string,
    fim?: string,
  ) {
    return this.analyticsService.tablePerformance(restauranteId, inicio, fim);
  }

  @Get('vendas-horarias')
  hourlySales(@Body('restauranteId') restauranteId: string) {
    return this.analyticsService.hourlySales(restauranteId);
  }

  @Get('vendas-diarias')
  dailySales(@Body('restauranteId') restauranteId: string) {
    return this.analyticsService.dailySales(restauranteId);
  }

  @Get('vendas-mensais')
  monthlySales(@Body('restauranteId') restauranteId: string) {
    return this.analyticsService.monthlySales(restauranteId);
  }

  @Get('alertas-estoque')
  stockAlerts(@Body('restauranteId') restauranteId: string) {
    return this.analyticsService.stockAlerts(restauranteId);
  }
}
