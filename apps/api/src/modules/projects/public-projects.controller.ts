import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  type PublicProjectDetail,
  type PublicProjectListItem,
  publicProjectListQuerySchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Locale } from '../../i18n/locale.decorator';
import { ProjectsService } from './projects.service';

@Controller('public/projects')
export class PublicProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(
    @Locale() locale: 'en' | 'vi',
    @Query(new ZodValidationPipe(publicProjectListQuerySchema))
    query: { featured?: '1' | 'true' | '0' | 'false'; domain?: string },
  ): Promise<PublicProjectListItem[]> {
    return this.projects.listPublic(locale, query);
  }

  @Get(':slug')
  get(@Param('slug') slug: string, @Locale() locale: 'en' | 'vi'): Promise<PublicProjectDetail> {
    return this.projects.getPublic(slug, locale);
  }
}
