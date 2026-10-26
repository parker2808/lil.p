import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type ContactInput, contactSchema, type ContactSubmitResult } from '@portfolio/contracts';
import type { Request } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { ContactThrottleGuard } from '../../common/guards/login-throttle.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ContactService } from './contact.service';

@Controller('public/contact')
@Public()
export class PublicContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 600_000 } })
  @UseGuards(ContactThrottleGuard)
  submit(
    @Body(new ZodValidationPipe(contactSchema)) body: ContactInput,
    @Req() req: Request,
  ): Promise<ContactSubmitResult> {
    return this.contact.submit(body, req);
  }
}
