import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import {
  type AdminContactMessage,
  type AdminContactMessageListPage,
  type AdminContactMessageListParams,
  adminContactMessageListParamsSchema,
  type UnreadCount,
  type UpdateContactMessageInput,
  updateContactMessageSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ContactService } from './contact.service';

@Controller('admin/messages')
export class AdminContactController {
  constructor(private readonly contact: ContactService) {}

  @Get('unread-count')
  unreadCount(): Promise<UnreadCount> {
    return this.contact.unreadCount();
  }

  @Get()
  list(
    @Query(new ZodValidationPipe(adminContactMessageListParamsSchema))
    query: AdminContactMessageListParams,
  ): Promise<AdminContactMessageListPage> {
    return this.contact.list(query);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminContactMessage> {
    return this.contact.get(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateContactMessageSchema)) body: UpdateContactMessageInput,
  ): Promise<AdminContactMessage> {
    return this.contact.update(id, body);
  }
}
