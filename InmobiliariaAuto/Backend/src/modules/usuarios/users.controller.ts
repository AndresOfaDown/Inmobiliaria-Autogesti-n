import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@CurrentUser() user: any, @Body() data: any) {
    return this.usersService.updateProfile(user.id, data);
  }

  // Notificaciones
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  getNotifications(@CurrentUser() user: any) {
    return this.usersService.getNotifications(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('notifications/:id/read')
  markNotificationRead(@Param('id') id: string) {
    return this.usersService.markNotificationAsRead(id);
  }

  // Agenda
  @UseGuards(JwtAuthGuard)
  @Get('agenda')
  getAgenda(@CurrentUser() user: any) {
    return this.usersService.getAgenda(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('agenda')
  createAgendaItem(@CurrentUser() user: any, @Body() data: any) {
    return this.usersService.createAgendaItem(user.id, data);
  }

  // Reseñas públicas
  @Get('reviews/inmueble/:inmuebleId')
  getReviews(@Param('inmuebleId') inmuebleId: string) {
    return this.usersService.getReviewsForInmueble(inmuebleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  addReview(
    @CurrentUser() user: any,
    @Body() body: { inmuebleId: string; calificacion: number; comentario: string },
  ) {
    return this.usersService.addReview(
      user.id,
      body.inmuebleId,
      body.calificacion,
      body.comentario,
    );
  }

  // Bloqueos
  @UseGuards(JwtAuthGuard)
  @Post('block/:targetId')
  blockUser(@CurrentUser() user: any, @Param('targetId') targetId: string) {
    return this.usersService.blockUser(user.id, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unblock/:targetId')
  unblockUser(@CurrentUser() user: any, @Param('targetId') targetId: string) {
    return this.usersService.unblockUser(user.id, targetId);
  }
}
