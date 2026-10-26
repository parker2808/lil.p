import { Module } from '@nestjs/common';

import { AdminProcessStepsController } from './admin-process-steps.controller';
import { ProcessStepsService } from './process-steps.service';
import { PublicProcessStepsController } from './public-process-steps.controller';

@Module({
  controllers: [PublicProcessStepsController, AdminProcessStepsController],
  providers: [ProcessStepsService],
  exports: [ProcessStepsService],
})
export class ProcessStepsModule {}
