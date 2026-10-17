import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-chats')
  getMyChats(@CurrentUser() user: any) {
    return this.chatService.getChatsForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  initiateChat(
    @CurrentUser() user: any,
    @Body() body: { targetUserId: string; inmuebleId?: string },
  ) {
    return this.chatService.getOrCreateChat(
      user.id,
      body.targetUserId,
      body.inmuebleId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.chatService.sendMessage({
      chatId: id,
      remitenteId: user.id,
      ...body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markAsRead(id, user.id);
  }
}
