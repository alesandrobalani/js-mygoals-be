import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { RegisterUseCase } from '../../use-cases/auth/register.usecase';
import { LoginUseCase } from '../../use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../use-cases/auth/refresh-token.usecase';
import { LogoutUseCase } from '../../use-cases/auth/logout.usecase';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

class RefreshTokenDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

class LogoutDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() payload: RegisterDto) {
    this.logger.log(`POST /auth/register - ${payload.email}`, 'AuthController');
    try {
      const result = await this.registerUseCase.execute(payload);
      this.logger.log(`User registered: ${result.user.id}`, 'AuthController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Registration failed: ${errorMessage}`, errorStack, 'AuthController');
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() payload: LoginDto) {
    this.logger.log(`POST /auth/login - ${payload.email}`, 'AuthController');
    try {
      const result = await this.loginUseCase.execute(payload);
      this.logger.log(`User logged in: ${result.user.id}`, 'AuthController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Login failed: ${errorMessage}`, errorStack, 'AuthController');
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() payload: RefreshTokenDto) {
    this.logger.log('POST /auth/refresh', 'AuthController');
    try {
      const result = await this.refreshTokenUseCase.execute(payload.refreshToken);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Token refresh failed: ${errorMessage}`, errorStack, 'AuthController');
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() payload: LogoutDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /auth/logout - user: ${user.userId}`, 'AuthController');
    await this.logoutUseCase.execute(payload.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
