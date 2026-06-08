import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CloseOrderDto } from './dto/close-order.dto';

import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthUser } from '../auth/types/auth-user.interface';
import { UserRole } from '../auth/types/user-role.enum';

@Controller('pagamentos')
@Auth(UserRole.GERENTE)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ========================================================= REGISTRAR PAGAMENTO
  @Post('comandas/:id')
  registrarPagamento(
    @Param('id') comandaId: string,
    @Body() dto: CloseOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.registrarPagamento(
      comandaId,
      dto,
      user.restaurante_id,
      user.userId,
    );
  }

  // ========================================================= BUSCAR PAGAMENTO
  @Get(':id')
  buscarPagamento(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.buscarPagamento(id, user.restaurante_id);
  }

  // ========================================================= LISTAR PAGAMENTOS
  @Get()
  listarPagamentos(@CurrentUser() user: AuthUser) {
    return this.paymentsService.listarPagamentos(user.restaurante_id);
  }

  // ========================================================= RESUMO FINANCEIRO
  @Get('resumo/financeiro')
  obterResumoFinanceiro(@CurrentUser() user: AuthUser) {
    return this.paymentsService.obterResumoFinanceiro(user.restaurante_id);
  }
}
