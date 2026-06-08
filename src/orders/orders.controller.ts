import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OpenOrderDto } from './dto/open-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { UserRole } from '../auth/types/user-role.enum';

@Controller('comandas')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Auth(UserRole.GARCOM, UserRole.GERENTE)
  @Post()
  openOrder(@Body() dto: OpenOrderDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.openOrder(dto, user.restaurante_id, user.userId);
  }

  @Auth(UserRole.GARCOM, UserRole.GERENTE)
  @Post(':id/itens')
  addItem(
    @Param('id') comandaId: string,
    @Body() dto: AddItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.addItem(comandaId, dto, user.restaurante_id);
  }

  @Auth(UserRole.GARCOM)
  @Post(':id/solicitar-fechamento')
  requestClosure(
    @Param('id') comandaId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.requestClosure(
      comandaId,
      user.restaurante_id,
      user.userId,
    );
  }

  @Auth(UserRole.GERENTE)
  @Patch(':id/confirmar-fechamento')
  confirmarFechamento(
    @Param('id') comandaId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.confirmarFechamento(
      comandaId,
      user.restaurante_id,
      user.userId,
    );
  }

  @Auth(UserRole.GARCOM, UserRole.GERENTE)
  @Get(':id')
  getOrderDetails(
    @Param('id') comandaId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.getOrderDetails(comandaId, user.restaurante_id);
  }

  @Auth(UserRole.GARCOM, UserRole.GERENTE)
  @Delete(':comandaId/itens/:itemId')
  removeItem(@Param('itemId') itemId: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.removeItem(itemId, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Patch(':id/cancelar')
  cancelarComanda(
    @Param('id') comandaId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.cancelarComanda(comandaId, user.restaurante_id);
  }
}
