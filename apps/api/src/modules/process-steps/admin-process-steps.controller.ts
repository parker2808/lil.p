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
  type AdminProcessStep,
  type ProcessStepCreateInput,
  processStepCreateSchema,
  type ProcessStepUpdateInput,
  processStepUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProcessStepsService } from './process-steps.service';

@Controller('admin/process-steps')
export class AdminProcessStepsController {
  constructor(private readonly steps: ProcessStepsService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminProcessStep[]> {
    return this.steps.listAdmin();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminProcessStep[]> {
    return this.steps.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminProcessStep> {
    return this.steps.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(processStepCreateSchema)) body: ProcessStepCreateInput,
  ): Promise<AdminProcessStep> {
    return this.steps.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(processStepUpdateSchema)) body: ProcessStepUpdateInput,
  ): Promise<AdminProcessStep> {
    return this.steps.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminProcessStep> {
    return this.steps.remove(id);
  }
}
