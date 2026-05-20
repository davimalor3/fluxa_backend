import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { Auth } from '../auth/decorators/auth.decorator'; // Ajuste o path se necessário
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { UserRole } from '../auth/types/user-role.enum';

@Controller('mesas')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Auth(UserRole.GERENTE) // Apenas gerentes criam a disposição física do salão
  async create(@Body() dto: CreateTableDto, @CurrentUser() user: AuthUser) {
    return this.tablesService.create(dto, user.restaurante_id);
  }

  @Get()
  @Auth(UserRole.GERENTE, UserRole.GARCOM) // Ambos listam o salão
  async findAll(@CurrentUser() user: AuthUser) {
    return this.tablesService.findAll(user.restaurante_id);
  }

  @Get(':id')
  @Auth(UserRole.GERENTE, UserRole.GARCOM)
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tablesService.findOne(id, user.restaurante_id);
  }
}
