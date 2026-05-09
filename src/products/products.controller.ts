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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.productsService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.productsService.findAll(user.restauranteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.productsService.findOne(id, user.restauranteId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.update(id, dto, user.restauranteId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.productsService.remove(id, user.restauranteId);
  }
}
