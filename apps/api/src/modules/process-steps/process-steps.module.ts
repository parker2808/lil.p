import { Module } from '@nestjs/common';

import { ProcessStepsService } from './process-steps.service';
import { PublicProcessStepsController } from './public-process-steps.controller';

@Module({
  controllers: [PublicProcessStepsController],
  providers: [ProcessStepsService],
  exports: [ProcessStepsService],
})
export class ProcessStepsModule {}
