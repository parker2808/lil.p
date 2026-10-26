import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  type AdminProfile,
  type ProfileUpdateInput,
  profileUpdateSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProfileService } from './profile.service';

@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(): Promise<AdminProfile> {
    return this.profile.getAdmin();
  }

  @Patch()
  update(
    @Body(new ZodValidationPipe(profileUpdateSchema)) body: ProfileUpdateInput,
  ): Promise<AdminProfile> {
    return this.profile.update(body);
  }
}
