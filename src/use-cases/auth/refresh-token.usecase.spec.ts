import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory/user.repository';
import { InMemoryRefreshTokenRepository } from '../../infrastructure/persistence/in-memory/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { User } from '../../domain/entities/user.entity';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { TokenService } from './token.service';
import { randomUUID } from 'crypto';

function makeUseCase() {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const jwtService = new JwtService({ secret: 'test-secret' });
  const tokenService = new TokenService(jwtService, refreshTokenRepository as any);
  const useCase = new RefreshTokenUseCase(refreshTokenRepository as any, userRepository as any, tokenService);
  return { useCase, userRepository, refreshTokenRepository };
}

describe('RefreshTokenUseCase', () => {
  it('should return a new token pair for a valid refresh token', async () => {
    const { useCase, userRepository, refreshTokenRepository } = makeUseCase();

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@example.com', 'hash', 'User', new Date()));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenValue = randomUUID();
    await refreshTokenRepository.create(new RefreshToken(randomUUID(), tokenValue, userId, expiresAt, undefined, new Date()));

    const result = await useCase.execute(tokenValue);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(tokenValue);
  });

  it('should throw UnauthorizedException for expired token', async () => {
    const { useCase, userRepository, refreshTokenRepository } = makeUseCase();

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@example.com', 'hash', 'User', new Date()));

    const expiresAt = new Date(Date.now() - 1000);
    const tokenValue = randomUUID();
    await refreshTokenRepository.create(new RefreshToken(randomUUID(), tokenValue, userId, expiresAt, undefined, new Date()));

    await expect(useCase.execute(tokenValue)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for revoked token', async () => {
    const { useCase, userRepository, refreshTokenRepository } = makeUseCase();

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@example.com', 'hash', 'User', new Date()));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenValue = randomUUID();
    const tokenId = randomUUID();
    await refreshTokenRepository.create(new RefreshToken(tokenId, tokenValue, userId, expiresAt, new Date(), new Date()));

    await expect(useCase.execute(tokenValue)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-existent token', async () => {
    const { useCase } = makeUseCase();
    await expect(useCase.execute('non-existent-token')).rejects.toThrow(UnauthorizedException);
  });
});
