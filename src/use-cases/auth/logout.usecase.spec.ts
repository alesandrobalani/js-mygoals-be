import { InMemoryRefreshTokenRepository } from '../../infrastructure/persistence/in-memory/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { LogoutUseCase } from './logout.usecase';
import { randomUUID } from 'crypto';

describe('LogoutUseCase', () => {
  it('should revoke the refresh token on logout', async () => {
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const useCase = new LogoutUseCase(refreshTokenRepository as any);

    const tokenValue = randomUUID();
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(new RefreshToken(tokenId, tokenValue, 'user-1', expiresAt, undefined, new Date()));

    await useCase.execute(tokenValue);

    const stored = await refreshTokenRepository.findByToken(tokenValue);
    expect(stored?.revokedAt).toBeDefined();
    expect(stored?.isValid).toBe(false);
  });

  it('should do nothing if token does not exist', async () => {
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const useCase = new LogoutUseCase(refreshTokenRepository as any);

    await expect(useCase.execute('non-existent')).resolves.toBeUndefined();
  });
});
