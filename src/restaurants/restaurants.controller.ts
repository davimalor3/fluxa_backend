import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.interface';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/types/user-role.enum';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.findById(user.restauranteId);
  }

  @Patch('me')
  @Roles(UserRole.GERENTE)
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantsService.update(user.restauranteId, dto);
  }

  @Get('me/stats')
  @Roles(UserRole.GERENTE)
  stats(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.stats(user.restauranteId);
  }
}
