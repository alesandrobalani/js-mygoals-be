import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { RegisterUseCase } from '../../use-cases/auth/register.usecase';
import { LoginUseCase } from '../../use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../use-cases/auth/refresh-token.usecase';
import { LogoutUseCase } from '../../use-cases/auth/logout.usecase';
import { TokenService } from '../../use-cases/auth/token.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    TokenService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
})
export class AuthModule {}
