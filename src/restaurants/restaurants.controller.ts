import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.findById(user.restaurante_id);
  }

  @Patch('me')
  @Roles(UserRole.GERENTE)
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantsService.update(user.restaurante_id, dto);
  }

  @Get('me/stats')
  @Roles(UserRole.GERENTE)
  stats(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.stats(user.restaurante_id);
  }
}
