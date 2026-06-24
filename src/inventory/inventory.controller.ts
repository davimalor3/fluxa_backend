import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UserRole } from '../auth/types/user-role.enum';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { AuthUser } from '../auth/types/auth-user.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Controller('estoque')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Auth(UserRole.GERENTE)
  @Get()
  getEstoque(@CurrentUser() user: AuthUser) {
    return this.inventoryService.getEstoque(user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Post('entrada')
  registrarEntrada(
    @Body() dto: CreateStockEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.registrarEntrada(dto, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Post('inventario')
  registrarInventario(
    @Body() dto: CreateInventoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.registrarInventario(dto, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get('movimentacoes')
  findMovimentacoes(@CurrentUser() user: AuthUser) {
    return this.inventoryService.findMovimentacoes(user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get('movimentacoes/:produtoId')
  findMovimentacoesProduto(
    @Param('produtoId') produtoId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.findMovimentacoesProduto(
      produtoId,
      user.restaurante_id,
    );
  }
}
