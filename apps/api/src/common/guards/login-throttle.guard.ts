import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      { code: 'RATE_LIMITED', message: 'Too many requests' },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

@Injectable()
export class LoginThrottleGuard extends RateLimitGuard {
  protected async getTracker(req: Request): Promise<string> {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    return `${req.ip ?? 'unknown'}:${email}`;
  }
}
