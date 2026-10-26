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
} from '@nestjs/common';
import {
  type AdminBlock,
  type AdminPage,
  type AdminPageListItem,
  type AdminPageVersion,
  type AdminPageVersionListItem,
  type BlockCreateInput,
  type BlockUpdateInput,
  createBlockSchema,
  type PageUpdateInput,
  type PublishPageInput,
  publishPageSchema,
  type ReorderInput,
  reorderSchema,
  updateBlockSchema,
  updatePageSchema,
} from '@portfolio/contracts';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { PageVersionsService } from './page-versions.service';
import { PagesService } from './pages.service';

@Controller('admin/pages')
export class AdminPagesController {
  constructor(
    private readonly pages: PagesService,
    private readonly versions: PageVersionsService,
  ) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminPageListItem[]> {
    return this.pages.listAdmin();
  }

  @Get(':key')
  @Roles('admin', 'user')
  get(@Param('key') key: string): Promise<AdminPage> {
    return this.pages.getAdmin(key);
  }

  @Patch(':key')
  update(
    @Param('key') key: string,
    @Body(new ZodValidationPipe(updatePageSchema)) body: PageUpdateInput,
  ): Promise<AdminPage> {
    return this.pages.updatePage(key, body);
  }

  @Post(':key/blocks')
  @HttpCode(HttpStatus.CREATED)
  createBlock(
    @Param('key') key: string,
    @Body(new ZodValidationPipe(createBlockSchema)) body: BlockCreateInput,
  ): Promise<AdminBlock> {
    return this.pages.createBlock(key, body);
  }

  @Patch(':key/blocks/order')
  reorderBlocks(
    @Param('key') key: string,
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminPage> {
    return this.pages.reorderBlocks(key, body.ids);
  }

  @Patch(':key/blocks/:id')
  updateBlock(
    @Param('key') key: string,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateBlockSchema)) body: BlockUpdateInput,
  ): Promise<AdminBlock> {
    return this.pages.updateBlock(key, id, body);
  }

  @Post(':key/blocks/:id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  duplicateBlock(
    @Param('key') key: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminBlock> {
    return this.pages.duplicateBlock(key, id);
  }

  @Delete(':key/blocks/:id')
  deleteBlock(
    @Param('key') key: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminBlock> {
    return this.pages.deleteBlock(key, id);
  }

  @Post(':key/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @Param('key') key: string,
    @Body(new ZodValidationPipe(publishPageSchema)) body: PublishPageInput,
    @CurrentUser() user: RequestUser,
  ): Promise<AdminPage> {
    return this.versions.publish(key, body, user.id);
  }

  @Get(':key/versions')
  @Roles('admin', 'user')
  listVersions(@Param('key') key: string): Promise<AdminPageVersionListItem[]> {
    return this.versions.listVersions(key);
  }

  @Get(':key/versions/:version')
  @Roles('admin', 'user')
  getVersion(
    @Param('key') key: string,
    @Param('version', ParseIntPipe) version: number,
  ): Promise<AdminPageVersion> {
    return this.versions.getVersion(key, version);
  }

  @Post(':key/versions/:version/restore')
  @HttpCode(HttpStatus.OK)
  restore(
    @Param('key') key: string,
    @Param('version', ParseIntPipe) version: number,
  ): Promise<AdminPage> {
    return this.versions.restore(key, version);
  }

  @Post(':key/discard')
  @HttpCode(HttpStatus.OK)
  discard(@Param('key') key: string): Promise<AdminPage> {
    return this.versions.discard(key);
  }
}
