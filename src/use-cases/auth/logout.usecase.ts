import { Inject, Injectable, Logger } from '@nestjs/common';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    this.logger.log('Logging out user', 'LogoutUseCase');
    const token = await this.refreshTokenRepository.findByToken(refreshToken);
    if (token) {
      await this.refreshTokenRepository.revoke(token.id);
    }
  }
}
