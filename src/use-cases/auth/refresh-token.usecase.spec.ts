import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { TokenService } from './token.service';
import { randomUUID } from 'crypto';

describe('RefreshTokenUseCase', () => {
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

  function makeUseCase() {
    const jwtService = new JwtService({ secret: 'test-secret' });
    const tokenService = new TokenService(jwtService, refreshTokenRepository as any);
    return new RefreshTokenUseCase(refreshTokenRepository as any, userRepository as any, tokenService);
  }

  it('should return a new token pair for a valid refresh token', async () => {
    const useCase = makeUseCase();

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@example.com', 'hash', 'User', UserRole.USER, new Date()));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenValue = randomUUID();
    await refreshTokenRepository.create(new RefreshToken(randomUUID(), tokenValue, userId, expiresAt, undefined, new Date()));

    const result = await useCase.execute(tokenValue);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(tokenValue);
  });

  it('should throw UnauthorizedException for expired token', async () => {
    const useCase = makeUseCase();

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@example.com', 'hash', 'User', UserRole.USER, new Date()));

    const expiresAt = new Date(Date.now() - 1000);
    const tokenValue = randomUUID();
    await refreshTokenRepository.create(new RefreshToken(randomUUID(), tokenValue, userId, expiresAt, undefined, new Date()));

    await expect(useCase.execute(tokenValue)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for revoked token', async () => {
    const useCase = makeUseCase();

    const userId = randomUUID();
    await userRepository.create(new User(userId, 'user@example.com', 'hash', 'User', UserRole.USER, new Date()));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenValue = randomUUID();
    await refreshTokenRepository.create(new RefreshToken(randomUUID(), tokenValue, userId, expiresAt, new Date(), new Date()));

    await expect(useCase.execute(tokenValue)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-existent token', async () => {
    const useCase = makeUseCase();
    await expect(useCase.execute('non-existent-token')).rejects.toThrow(UnauthorizedException);
  });
});
