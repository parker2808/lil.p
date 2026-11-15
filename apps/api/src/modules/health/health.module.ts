import { Module } from '@nestjs/common';

import { DeploymentStateController } from './deployment-state.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController, DeploymentStateController],
})
export class HealthModule {}
