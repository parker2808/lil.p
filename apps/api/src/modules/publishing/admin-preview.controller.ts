import { Controller, Get, Param } from '@nestjs/common';
import type { PublicPostDetail, PublicProjectDetail } from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { PostsService } from '../posts/posts.service';
import { ProjectsService } from '../projects/projects.service';

@Controller('admin/preview')
export class AdminPreviewController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly posts: PostsService,
  ) {}

  @Get('projects/:slug')
  @Roles('admin', 'user')
  project(
    @Param('slug') slug: string,
    @Locale() locale: 'en' | 'vi',
  ): Promise<PublicProjectDetail> {
    return this.projects.getPreview(slug, locale);
  }

  @Get('posts/:slug')
  @Roles('admin', 'user')
  post(@Param('slug') slug: string, @Locale() locale: 'en' | 'vi'): Promise<PublicPostDetail> {
    return this.posts.getPreview(slug, locale);
  }
}
