import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { LogoutUseCase } from './logout.usecase';
import { randomUUID } from 'crypto';

describe('LogoutUseCase', () => {
  let dataSource: DataSource;
  let userRepository: PostgreSQLUserRepository;
  let refreshTokenRepository: PostgreSQLRefreshTokenRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    userRepository = repos.userRepository;
    refreshTokenRepository = repos.refreshTokenRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    await dataSource.getRepository(RefreshTokenEntity).clear();
    await dataSource.getRepository(UserEntity).clear();
  });

  it('should revoke the refresh token on logout', async () => {
    const useCase = new LogoutUseCase(refreshTokenRepository as any);

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@test.com', 'hash', 'User', UserRole.USER, new Date()));

    const tokenValue = randomUUID();
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(new RefreshToken(tokenId, tokenValue, userId, expiresAt, undefined, new Date()));

    await useCase.execute(tokenValue);

    const stored = await refreshTokenRepository.findByToken(tokenValue);
    expect(stored?.revokedAt).toBeDefined();
    expect(stored?.isValid).toBe(false);
  });

  it('should do nothing if token does not exist', async () => {
    const useCase = new LogoutUseCase(refreshTokenRepository as any);

    await expect(useCase.execute('non-existent')).resolves.toBeUndefined();
  });
});
