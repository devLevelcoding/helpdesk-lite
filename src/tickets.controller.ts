import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Ported from Project CRM (#08)'s tickets.controller.ts (itself from
// apps/crm-svc's HelpdeskController) — same shape and update logic
// (closedAt auto-set on status: closed). New here: closing a ticket also
// queues a WhatsAppNotification — the "one click, several consequences"
// shape already established across this catalog (loyalty-on-visit-complete,
// review-request-on-reservation-complete, etc), applied to "did my thing
// get done" — the customer gets WhatsApped that their ticket is resolved.
@Controller('tickets')
export class TicketsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = {};
    if (clientId) where.clientId = +clientId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { client: true } }),
      this.prisma.ticket.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Post()
  create(@Body() body: any) {
    const { clientId, title, body: text, category, priority } = body;
    if (!clientId || !title) throw new BadRequestException('clientId and title are required');
    return this.prisma.ticket.create({
      data: { clientId: +clientId, title, body: text ?? '', category, priority: priority ?? 'medium' },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['title', 'category', 'priority', 'status']) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.body !== undefined) data.body = body.body;
    if (body.response !== undefined) data.response = body.response;

    const current = await this.prisma.ticket.findUnique({ where: { id: +id }, include: { client: true } });
    if (!current) throw new BadRequestException('Ticket not found');

    if (body.status === 'closed' && current.status !== 'closed') {
      data.closedAt = new Date();
    }

    const updated = await this.prisma.ticket.update({ where: { id: +id }, data });

    if (body.status === 'closed' && current.status !== 'closed' && current.client.phone) {
      await this.prisma.whatsAppNotification.create({
        data: {
          ticketId: updated.id,
          phone: current.client.phone,
          message: `Hi ${current.client.name}, your request "${current.title}" is done!`,
        },
      });
    }

    return updated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.ticket.delete({ where: { id: +id } });
  }
}
