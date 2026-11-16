import { Controller, Get } from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { pageWritesFrozen } from '../../common/middleware/page-write-freeze.middleware';

function safeIdentity(value: string | undefined, pattern: RegExp): string | null {
  return value && pattern.test(value) ? value : null;
}

export function deploymentState() {
  return {
    pageWritesFrozen: pageWritesFrozen(),
    commit: safeIdentity(process.env.RENDER_GIT_COMMIT, /^[a-f0-9]{40}$/i),
    instanceId: safeIdentity(process.env.RENDER_INSTANCE_ID, /^[a-zA-Z0-9_-]{1,128}$/),
    serviceId: safeIdentity(process.env.RENDER_SERVICE_ID, /^[a-zA-Z0-9_-]{1,128}$/),
  };
}

@Controller('admin/deployment-state')
export class DeploymentStateController {
  @Get()
  @Roles('admin')
  getState(): ReturnType<typeof deploymentState> {
    return deploymentState();
  }
}
