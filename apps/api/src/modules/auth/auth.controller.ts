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
import { type LoginInput, loginSchema, type Me } from '@portfolio/contracts';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Me> {
    const result = await this.auth.login(body);
    setAuthCookies(res, result, this.config);
    return toMeDto(result.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.auth.refresh(req.user.id);
    setAuthCookies(res, tokens, this.config);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    clearAuthCookies(res, this.config);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthedRequest): Promise<Me> {
    const user = await this.auth.me(req.user.id);
    return toMeDto(user);
  }
}
