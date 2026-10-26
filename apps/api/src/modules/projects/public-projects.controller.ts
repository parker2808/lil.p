import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  type ProjectListParams,
  projectListParamsSchema,
  type PublicProjectDetail,
  type PublicProjectListPage,
} from '@portfolio/contracts';

import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Locale } from '../../i18n/locale.decorator';
import { ProjectsService } from './projects.service';

@Public()
@Controller('public/projects')
export class PublicProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(
    @Locale() locale: 'en' | 'vi',
    @Query(new ZodValidationPipe(projectListParamsSchema)) query: ProjectListParams,
  ): Promise<PublicProjectListPage> {
    return this.projects.listPublic(locale, query);
  }

  @Get(':slug')
  get(@Param('slug') slug: string, @Locale() locale: 'en' | 'vi'): Promise<PublicProjectDetail> {
    return this.projects.getPublic(slug, locale);
  }
}
