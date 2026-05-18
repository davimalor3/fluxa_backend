import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { Roles } from 'src/auth/decorators/roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/types/user-role.enum';
import type { AuthUser } from 'src/auth/types/auth-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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
