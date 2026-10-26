import { Controller, Get } from '@nestjs/common';
import type { PublicProcessStep } from '@portfolio/contracts';

import { Locale } from '../../i18n/locale.decorator';
import { ProcessStepsService } from './process-steps.service';

@Controller('public/process-steps')
export class PublicProcessStepsController {
  constructor(private readonly processSteps: ProcessStepsService) {}

  @Get()
  list(@Locale() locale: 'en' | 'vi'): Promise<PublicProcessStep[]> {
    return this.processSteps.listPublic(locale);
  }
}
