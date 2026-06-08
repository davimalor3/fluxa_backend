import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { CreateFichaTecnicaDto } from './dto/create-ficha-tecnica.dto';

@Controller('produtos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Auth(UserRole.GERENTE)
  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.productsService.create(dto, user);
  }

  @Auth(UserRole.GERENTE)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.productsService.findAll(user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get('produtos')
  findProdutos(@CurrentUser() user: AuthUser) {
    return this.productsService.findProdutos(user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get('insumos')
  findInsumos(@CurrentUser() user: AuthUser) {
    return this.productsService.findInsumos(user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.productsService.findOne(id, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.update(id, dto, user.restaurante_id);
  }

  @Auth(UserRole.GERENTE)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.productsService.remove(id, user.restaurante_id);
  }

  // =========================== ROTAS PARA FICHA TECNICA
  @Auth(UserRole.GERENTE)
  @Post(':id/ficha-tecnica')
  addFichaTecnica(
    @Param('id') produtoId: string,
    @Body() dto: CreateFichaTecnicaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.addFichaTecnica(
      produtoId,
      dto,
      user.restaurante_id,
    );
  }

  @Auth(UserRole.GERENTE)
  @Get(':id/ficha-tecnica')
  findFichaTecnica(
    @Param('id') produtoId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.findFichaTecnica(
      produtoId,
      user.restaurante_id,
    );
  }

  @Auth(UserRole.GERENTE)
  @Delete('ficha-tecnica/:fichaTecnicaId')
  removeFichaTecnica(
    @Param('fichaTecnicaId') fichaTecnicaId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.removeFichaTecnica(
      fichaTecnicaId,
      user.restaurante_id,
    );
  }
}
