import { Controller, Get, NotFoundException, Param, Req } from '@nestjs/common';
import { pageKeySchema, type PublicPage } from '@portfolio/contracts';
import type { Request } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { PagesService } from './pages.service';

type RequestWithId = Request & { requestId?: string };

@Public()
@Controller('public/pages')
export class PublicPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get(':key')
  getPage(
    @Param('key') rawKey: string,
    @Locale() locale: 'en' | 'vi',
    @Req() request: RequestWithId,
  ): Promise<PublicPage> {
    const parsed = pageKeySchema.safeParse(rawKey);
    if (!parsed.success) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${rawKey} was not found` });
    }
    return this.pages.getPublic(parsed.data, locale, request.requestId);
  }
}
