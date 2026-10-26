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
  type AdminEducation,
  type EducationCreateInput,
  educationCreateSchema,
  type EducationUpdateInput,
  educationUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { EducationService } from './education.service';

@Controller('admin/education')
export class AdminEducationController {
  constructor(private readonly education: EducationService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminEducation[]> {
    return this.education.listAdmin();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminEducation[]> {
    return this.education.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminEducation> {
    return this.education.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(educationCreateSchema)) body: EducationCreateInput,
  ): Promise<AdminEducation> {
    return this.education.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(educationUpdateSchema)) body: EducationUpdateInput,
  ): Promise<AdminEducation> {
    return this.education.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminEducation> {
    return this.education.remove(id);
  }
}
