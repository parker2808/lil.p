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
  type AdminDomain,
  type DomainCreateInput,
  domainCreateSchema,
  type DomainUpdateInput,
  domainUpdateSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { DomainsService } from './domains.service';

@Controller('admin/domains')
export class AdminDomainsController {
  constructor(private readonly domains: DomainsService) {}

  @Get()
  list(): Promise<AdminDomain[]> {
    return this.domains.listAdmin();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminDomain> {
    return this.domains.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(domainCreateSchema)) body: DomainCreateInput,
  ): Promise<AdminDomain> {
    return this.domains.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(domainUpdateSchema)) body: DomainUpdateInput,
  ): Promise<AdminDomain> {
    return this.domains.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminDomain> {
    return this.domains.remove(id);
  }
}
