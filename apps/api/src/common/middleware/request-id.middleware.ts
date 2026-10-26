import { randomUUID } from 'node:crypto';

import { type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export type RequestWithId = Request & { requestId: string };

/**
 * Reuse an incoming `x-request-id` or mint one. Echoed on the response
 * and copied into error bodies so a screenshot matches a log line.
 */
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    const requestId = incoming && incoming.trim().length > 0 ? incoming : randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
