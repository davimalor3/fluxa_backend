import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OpenOrderDto } from './dto/open-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { Auth } from '../auth/decorators/auth.decorator'; // Ajuste o path se necessário
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { UserRole } from '../auth/types/user-role.enum';

@Controller('comandas')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('abrir')
  @Auth(UserRole.GERENTE, UserRole.GARCOM)
  async open(@Body() dto: OpenOrderDto, @CurrentUser() user: AuthUser) {
    // PASSANDO user.userId CORRETAMENTE CONFORME SUA INTERFACE
    return this.ordersService.openOrder(dto, user.restaurante_id, user.userId);
  }

  @Post(':id/itens')
  @Auth(UserRole.GERENTE, UserRole.GARCOM)
  async addItem(
    @Param('id') comanda_id: string,
    @Body() dto: AddItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.addItem(comanda_id, dto, user.restaurante_id);
  }

  @Post(':id/solicitar-fechamento')
  @Auth(UserRole.GERENTE, UserRole.GARCOM)
  async requestClosure(
    @Param('id') comanda_id: string,
    @CurrentUser() user: AuthUser,
  ) {
    // PASSANDO user.userId CORRETAMENTE CONFORME SUA INTERFACE
    return this.ordersService.requestClosure(
      comanda_id,
      user.restaurante_id,
      user.userId,
    );
  }

  @Get(':id')
  @Auth(UserRole.GERENTE, UserRole.GARCOM)
  async getOrderDetails(
    @Param('id') comanda_id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.getOrderDetails(comanda_id, user.restaurante_id);
  }
}
