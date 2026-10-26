import { Controller, Get, Header, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { MediaService } from './media.service';

@Controller('public/media')
export class PublicMediaController {
  constructor(private readonly media: MediaService) {}

  @Public()
  @Get(':file')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async file(@Param('file') file: string, @Res() res: Response): Promise<void> {
    const url = await this.media.publicUrl(file);
    if (!url) {
      throw new NotFoundException({ code: 'NOT_FOUND' });
    }
    res.redirect(302, url);
  }
}
