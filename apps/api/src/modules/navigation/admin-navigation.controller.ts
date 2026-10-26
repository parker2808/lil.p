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
  type AdminNavItem,
  type NavItemCreateInput,
  navItemCreateSchema,
  type NavItemUpdateInput,
  navItemUpdateSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { NavigationService } from './navigation.service';

@Controller('admin/navigation')
export class AdminNavigationController {
  constructor(private readonly navigation: NavigationService) {}

  @Get()
  list(): Promise<AdminNavItem[]> {
    return this.navigation.listAdmin();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminNavItem> {
    return this.navigation.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(navItemCreateSchema)) body: NavItemCreateInput,
  ): Promise<AdminNavItem> {
    return this.navigation.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(navItemUpdateSchema)) body: NavItemUpdateInput,
  ): Promise<AdminNavItem> {
    return this.navigation.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminNavItem> {
    return this.navigation.remove(id);
  }
}
