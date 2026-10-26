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
  type AdminSocialLink,
  type ReorderInput,
  reorderSchema,
  type SocialLinkCreateInput,
  socialLinkCreateSchema,
  type SocialLinkUpdateInput,
  socialLinkUpdateSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SocialLinksService } from './social-links.service';

@Controller('admin/social-links')
export class AdminSocialLinksController {
  constructor(private readonly links: SocialLinksService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminSocialLink[]> {
    return this.links.listAdmin();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminSocialLink[]> {
    return this.links.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminSocialLink> {
    return this.links.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(socialLinkCreateSchema)) body: SocialLinkCreateInput,
  ): Promise<AdminSocialLink> {
    return this.links.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(socialLinkUpdateSchema)) body: SocialLinkUpdateInput,
  ): Promise<AdminSocialLink> {
    return this.links.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminSocialLink> {
    return this.links.remove(id);
  }
}
