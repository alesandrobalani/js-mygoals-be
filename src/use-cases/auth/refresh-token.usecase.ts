import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TokenService, TokenPair } from './token.service';

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(token: string): Promise<RefreshTokenOutput> {
    this.logger.log('Refreshing token', 'RefreshTokenUseCase');

    const storedToken = await this.refreshTokenRepository.findByToken(token);
    if (!storedToken || !storedToken.isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.refreshTokenRepository.revoke(storedToken.id);

    const tokens: TokenPair = await this.tokenService.generateTokenPair(user.id, user.email, user.role);

    this.logger.log(`Token refreshed for user: ${user.id}`, 'RefreshTokenUseCase');
    return tokens;
  }
}
