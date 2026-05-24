import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';
import { RegisterUseCase } from './register.usecase';
import { TokenService } from './token.service';

describe('RegisterUseCase', () => {
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
    return new RegisterUseCase(userRepository as any, tokenService);
  }

  it('should register a user and return tokens', async () => {
    const useCase = makeUseCase();

    const result = await useCase.execute({ email: 'user@example.com', password: 'password123', name: 'Test User' });

    expect(result.user.email).toBe('user@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.user.id).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throw ConflictException if email already in use', async () => {
    const useCase = makeUseCase();

    await useCase.execute({ email: 'dup@example.com', password: 'password123', name: 'User' });

    await expect(
      useCase.execute({ email: 'dup@example.com', password: 'other123', name: 'Other' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should store a hashed password (not plaintext)', async () => {
    const useCase = makeUseCase();

    await useCase.execute({ email: 'hash@example.com', password: 'plaintext', name: 'User' });

    const user = await userRepository.findByEmail('hash@example.com');
    expect(user?.passwordHash).not.toBe('plaintext');
    expect(user?.passwordHash).toMatch(/^\$2b\$/);
  });
});
