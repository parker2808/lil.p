import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type LoginInput, loginSchema, type Me } from '@portfolio/contracts';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { LoginThrottleGuard, RateLimitGuard } from '../../common/guards/login-throttle.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AppConfigService } from '../../config/app-config.service';
import { toMeDto } from '../users/entities/user.mapper';
import { AuthService } from './auth.service';
import { clearAuthCookies, setAuthCookies } from './auth-cookies.util';
import type { RequestUser } from './strategies/jwt.strategy';

type AuthedRequest = Request & { user: RequestUser };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(LoginThrottleGuard)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Me> {
    const result = await this.auth.login(body);
    setAuthCookies(res, result, this.config);
    return toMeDto(result.user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(RateLimitGuard, JwtRefreshGuard)
  async refresh(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.auth.refresh(req.user.id);
    setAuthCookies(res, tokens, this.config);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    clearAuthCookies(res, this.config);
  }

  @Get('me')
  @Roles('admin', 'user')
  async me(@CurrentUser() user: RequestUser): Promise<Me> {
    const row = await this.auth.me(user.id);
    return toMeDto(row);
  }
}
