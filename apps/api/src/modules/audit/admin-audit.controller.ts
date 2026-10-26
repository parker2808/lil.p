import { Controller, Get, Query } from '@nestjs/common';
import {
  type AdminAuditListPage,
  type AdminAuditListParams,
  adminAuditListParamsSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditService } from './audit.service';

@Controller('admin/audit')
export class AdminAuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminAuditListParamsSchema)) query: AdminAuditListParams,
  ): Promise<AdminAuditListPage> {
    return this.audit.list(query);
  }
}
