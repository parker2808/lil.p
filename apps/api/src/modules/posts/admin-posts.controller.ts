import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  type AdminPost,
  type AdminPostListPage,
  type AdminPostListParams,
  adminPostListParamsSchema,
  type PostCreateInput,
  postCreateSchema,
  type PostUpdateInput,
  postUpdateSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PostsService } from './posts.service';

@Controller('admin/posts')
export class AdminPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminPostListParamsSchema)) query: AdminPostListParams,
  ): Promise<AdminPostListPage> {
    return this.posts.listAdmin(query);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminPost> {
    return this.posts.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(postCreateSchema)) body: PostCreateInput): Promise<AdminPost> {
    return this.posts.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(postUpdateSchema)) body: PostUpdateInput,
  ): Promise<AdminPost> {
    return this.posts.update(id, body);
  }

  @Delete(':id')
  archive(@Param('id', ParseIntPipe) id: number): Promise<AdminPost> {
    return this.posts.archive(id);
  }
}
