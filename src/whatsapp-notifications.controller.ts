import { BadRequestException, Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const VALID_STATUSES = ['PENDING', 'SENT'];

// Simulate-only, same as every WhatsApp touchpoint elsewhere in this
// catalog — a human opens wa.me/<phone> and sends the message manually,
// then flips the status here. No real WhatsApp API integration exists in
// leadMarketing or anywhere in this catalog.
@Controller('whatsapp-notifications')
export class WhatsAppNotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const data = await this.prisma.whatsAppNotification.findMany({
      where, orderBy: { createdAt: 'desc' }, include: { ticket: true },
    });
    return { data, total: data.length };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { status: string }) {
    if (!VALID_STATUSES.includes(body.status)) throw new BadRequestException(`status must be one of ${VALID_STATUSES.join(', ')}`);
    return this.prisma.whatsAppNotification.update({
      where: { id: +id },
      data: { status: body.status, sentAt: body.status === 'SENT' ? new Date() : null },
    });
  }
}
