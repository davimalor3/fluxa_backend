import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateGarcomDto, CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../auth/types/user-role.enum';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UpdateGarcomDto } from './dto/update-garcom.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(UserRole.GERENTE)
  @Post('register')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(dto, user.restaurante_id);
  }
  @Auth(UserRole.GERENTE)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.usersService.findAll(user.restaurante_id);
  }
  //  ============================ ROTA APENAS PARA TESTE: RETORNA TODOS OS USERS
  //  TODO: APAGAR
  @Auth(UserRole.GERENTE)
  @Get('all')
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Auth(UserRole.GERENTE)
  @Post('garcons')
  createGarcom(@Body() dto: CreateGarcomDto, @CurrentUser() user: AuthUser) {
    return this.usersService.createGarcom(dto, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get('garcons')
  findAllGarcons(@CurrentUser() user: AuthUser) {
    return this.usersService.findAllGarcons(user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get('garcons/:id')
  findGarcomById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.findGarcomById(id, user.restaurante_id);
  }
  @Auth(UserRole.GERENTE)
  @Patch('garcons/:id')
  updateGarcom(
    @Param('id') id: string,
    @Body() dto: UpdateGarcomDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateGarcom(id, dto, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Delete('garcons/:id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.remove(id, user.restaurante_id);
  }
}
