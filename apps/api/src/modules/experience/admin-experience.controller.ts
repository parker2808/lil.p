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
  type AdminExperience,
  type AdminExperienceListPage,
  type AdminExperienceListParams,
  adminExperienceListParamsSchema,
  type ExperienceCreateInput,
  experienceCreateSchema,
  type ExperienceUpdateInput,
  experienceUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ExperienceService } from './experience.service';

@Controller('admin/experience')
export class AdminExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  @Roles('admin', 'user')
  list(
    @Query(new ZodValidationPipe(adminExperienceListParamsSchema))
    query: AdminExperienceListParams,
  ): Promise<AdminExperienceListPage> {
    return this.experience.listAdmin(query);
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminExperience[]> {
    return this.experience.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminExperience> {
    return this.experience.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(experienceCreateSchema)) body: ExperienceCreateInput,
  ): Promise<AdminExperience> {
    return this.experience.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(experienceUpdateSchema)) body: ExperienceUpdateInput,
  ): Promise<AdminExperience> {
    return this.experience.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminExperience> {
    return this.experience.remove(id);
  }
}
