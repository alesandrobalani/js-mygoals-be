import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async generateTokenPair(userId: string, email: string): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '15m' },
    );

    const refreshTokenValue = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = new RefreshToken(
      randomUUID(),
      refreshTokenValue,
      userId,
      expiresAt,
      undefined,
      new Date(),
    );

    await this.refreshTokenRepository.create(refreshToken);
    this.logger.debug(`Generated token pair for user: ${userId}`, 'TokenService');

    return { accessToken, refreshToken: refreshTokenValue };
  }
}
