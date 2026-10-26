import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  type PublicPostDetail,
  type PublicPostListItem,
  publicPostListQuerySchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Locale } from '../../i18n/locale.decorator';
import { PostsService } from './posts.service';

@Controller('public/posts')
export class PublicPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(
    @Locale() locale: 'en' | 'vi',
    @Query(new ZodValidationPipe(publicPostListQuerySchema)) query: { tag?: string },
  ): Promise<PublicPostListItem[]> {
    return this.posts.listPublic(locale, query);
  }

  @Get(':slug')
  get(@Param('slug') slug: string, @Locale() locale: 'en' | 'vi'): Promise<PublicPostDetail> {
    return this.posts.getPublic(slug, locale);
  }
}
