import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClientsController } from './clients.controller';
import { TicketsController } from './tickets.controller';
import { WhatsAppNotificationsController } from './whatsapp-notifications.controller';

@Module({
  controllers: [ClientsController, TicketsController, WhatsAppNotificationsController],
  providers: [PrismaService],
})
export class AppModule {}
