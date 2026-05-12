import { Controller, Get, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/types/user-role.enum';

@Controller('estoque')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Teste de proteção de rota com JWT e roles
  // implementar a rota de criação de item do estoque depois
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GERENTE)
  @Get()
  findAll() {
    return {
      ok: true,
    };
  }
}
