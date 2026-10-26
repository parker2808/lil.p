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
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { EducationService } from './education.service';

@Controller('admin/education')
export class AdminEducationController {
  constructor(private readonly education: EducationService) {}

  @Get()
  list(): Promise<AdminEducation[]> {
    return this.education.listAdmin();
  }

  @Get(':id')
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
