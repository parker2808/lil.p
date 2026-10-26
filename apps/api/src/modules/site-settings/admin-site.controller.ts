import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  type AdminSiteSettings,
  type SiteSettingsUpdateInput,
  siteSettingsUpdateSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SiteSettingsService } from './site-settings.service';

@Controller('admin/site')
export class AdminSiteController {
  constructor(private readonly site: SiteSettingsService) {}

  @Get()
  get(): Promise<AdminSiteSettings> {
    return this.site.getAdmin();
  }

  @Patch()
  update(
    @Body(new ZodValidationPipe(siteSettingsUpdateSchema)) body: SiteSettingsUpdateInput,
  ): Promise<AdminSiteSettings> {
    return this.site.update(body);
  }
}
