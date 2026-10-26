import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  type AdminMedia,
  type AdminMediaListPage,
  type AdminMediaListParams,
  adminMediaListParamsSchema,
  MEDIA_MAX_BYTES,
  type UpdateMediaInput,
  updateMediaSchema,
} from '@portfolio/contracts';
import { memoryStorage } from 'multer';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { MediaService } from './media.service';

@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @Roles('admin', 'user')
  list(
    @Query(new ZodValidationPipe(adminMediaListParamsSchema)) query: AdminMediaListParams,
  ): Promise<AdminMediaListPage> {
    return this.media.list(query);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MEDIA_MAX_BYTES },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: RequestUser,
  ): Promise<AdminMedia> {
    if (!file) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        fieldErrors: { file: ['A file is required'] },
      });
    }
    return this.media.upload(file, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateMediaSchema)) body: UpdateMediaInput,
  ): Promise<AdminMedia> {
    return this.media.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.media.remove(id);
  }
}
