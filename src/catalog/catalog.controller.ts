import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AddCatalogProductDto } from './dto/add-catalog-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.interface';

@Controller('catalog')
@Auth(UserRole.GERENTE)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('categories/:categoryId/products')
  getProducts(@Param('categoryId') categoryId: string) {
    return this.catalogService.getProductsByCategory(categoryId);
  }

  @Post('add-to-stock')
  addToStock(@Body() dto: AddCatalogProductDto, @CurrentUser() user: AuthUser) {
    return this.catalogService.addProductToStock(user.restaurante_id, dto);
  }
}
