import { Controller, Get, Param, Query } from '@nestjs/common';
import type {
  PublicPagePreview,
  PublicPostDetail,
  PublicProjectDetail,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { Locale } from '../../i18n/locale.decorator';
import { PageVersionsService } from '../pages/page-versions.service';
import { PostsService } from '../posts/posts.service';
import { ProjectsService } from '../projects/projects.service';

@Controller('admin/preview')
export class AdminPreviewController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly posts: PostsService,
    private readonly pages: PageVersionsService,
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

  @Get('pages/:key')
  @Roles('admin', 'user')
  page(
    @Param('key') key: string,
    @Locale() locale: 'en' | 'vi',
    @Query('version') version?: string,
  ): Promise<PublicPagePreview> {
    const parsed = version ? Number(version) : undefined;
    return this.pages.getPreview(
      key,
      locale,
      parsed !== undefined && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined,
    );
  }
}
