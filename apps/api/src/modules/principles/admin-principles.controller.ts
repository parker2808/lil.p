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
  type AdminPrinciple,
  type PrincipleCreateInput,
  principleCreateSchema,
  type PrincipleUpdateInput,
  principleUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PrinciplesService } from './principles.service';

@Controller('admin/principles')
export class AdminPrinciplesController {
  constructor(private readonly principles: PrinciplesService) {}

  @Get()
  list(): Promise<AdminPrinciple[]> {
    return this.principles.listAdmin();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminPrinciple[]> {
    return this.principles.reorder(body.ids);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminPrinciple> {
    return this.principles.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(principleCreateSchema)) body: PrincipleCreateInput,
  ): Promise<AdminPrinciple> {
    return this.principles.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(principleUpdateSchema)) body: PrincipleUpdateInput,
  ): Promise<AdminPrinciple> {
    return this.principles.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminPrinciple> {
    return this.principles.remove(id);
  }
}
