import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/types/user-role.enum';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GERENTE)
  @Post('register')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(dto, user.restaurante_id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GERENTE)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.usersService.findAll(user.restaurante_id);
  }

  // ROTA APENAS PARA TESTE: RETORNA TODOS OS USUÁRIOS, INDEPENDENTE DO RESTAURANTE E DO STATUS DE EXCLUSÃO. NÃO DEVE SER USADA EM PRODUÇÃO.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GERENTE)
  @Get('all')
  findAllUsers() {
    return this.usersService.findAllUsers();
  }
}
