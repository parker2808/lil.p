import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type {
  AdminContactMessage,
  AdminContactMessageListPage,
  AdminContactMessageListParams,
  ContactInput,
  ContactSubmitResult,
  Paginated,
  UnreadCount,
  UpdateContactMessageInput,
} from '@portfolio/contracts';
import { CONTACT_MESSAGE_HIDDEN_STATUSES, parseSort } from '@portfolio/contracts';
import type { Request } from 'express';

import { hashIp, requestIp } from '../../common/utils/ip-hash.util';
import { paginate } from '../../common/utils/paginate.util';
import { AppConfigService } from '../../config/app-config.service';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { contactMessageSelect } from './entities/contact-message.entity';
import { toAdminContactMessage } from './entities/contact-message.mapper';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly config: AppConfigService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async submit(input: ContactInput, req: Request): Promise<ContactSubmitResult> {
    const topicId = await this.resolveTopicId(input.topic);
    const honeypot = input.website.trim() !== '';
    const status = honeypot ? 'SPAM' : 'NEW';
    const row = await this.prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email,
        topicId,
        message: input.message,
        locale: input.locale,
        status,
        ipHash: hashIp(requestIp(req), this.config.jwtAccessSecret),
      },
      select: { id: true, name: true },
    });
    if (!honeypot) {
      this.events.emit('contact.created', { id: row.id, name: row.name });
    }
    return { ok: true };
  }

  async list(params: AdminContactMessageListParams): Promise<AdminContactMessageListPage> {
    const { field, direction } = parseSort(params.sort);
    const where: Prisma.ContactMessageWhereInput = params.status
      ? { status: params.status }
      : { status: { notIn: [...CONTACT_MESSAGE_HIDDEN_STATUSES] } };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        select: contactMessageSelect,
        orderBy: { [field]: direction },
        ...paginate(params.page, params.pageSize),
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return {
      items: rows.map(toAdminContactMessage),
      page: params.page,
      pageSize: params.pageSize,
      total,
    } satisfies Paginated<AdminContactMessage>;
  }

  async get(id: number): Promise<AdminContactMessage> {
    return toAdminContactMessage(await this.findRow(id));
  }

  async update(id: number, input: UpdateContactMessageInput): Promise<AdminContactMessage> {
    await this.findRow(id);
    const row = await this.prisma.contactMessage.update({
      where: { id },
      data: { status: input.status },
      select: contactMessageSelect,
    });
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'contact-message',
      entityId: id,
      summary: `Marked message ${id} as ${row.status}`,
    });
    return toAdminContactMessage(row);
  }

  unreadCount(): Promise<UnreadCount> {
    return this.countUnread();
  }

  async countUnread(): Promise<UnreadCount> {
    const unread = await this.prisma.contactMessage.count({ where: { status: 'NEW' } });
    return { unread };
  }

  private async resolveTopicId(topic: string | undefined): Promise<number | null> {
    const slug = topic?.trim();
    if (!slug) {
      return null;
    }
    const row = await this.prisma.contactTopic.findFirst({
      where: { slug, isVisible: true },
      select: { id: true },
    });
    if (!row) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: { topic: ['Unknown topic'] },
      });
    }
    return row.id;
  }

  private async findRow(id: number) {
    const row = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: contactMessageSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Message ${id} was not found`,
      });
    }
    return row;
  }
}
