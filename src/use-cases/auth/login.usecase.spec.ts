import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { LoginUseCase } from './login.usecase';
import { TokenService } from './token.service';
import { randomUUID } from 'crypto';

describe('LoginUseCase', () => {
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

  async function makeUseCase() {
    const jwtService = new JwtService({ secret: 'test-secret' });
    const tokenService = new TokenService(jwtService, refreshTokenRepository as any);
    const useCase = new LoginUseCase(userRepository as any, tokenService);

    const passwordHash = await bcrypt.hash('correct-password', 12);
    await userRepository.create(new User(randomUUID(), 'user@example.com', passwordHash, 'Test User', UserRole.USER, new Date()));

    return { useCase };
  }

  it('should return tokens on valid credentials', async () => {
    const { useCase } = await makeUseCase();

    const result = await useCase.execute({ email: 'user@example.com', password: 'correct-password' });

    expect(result.user.email).toBe('user@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throw UnauthorizedException for unknown email', async () => {
    const { useCase } = await makeUseCase();

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'correct-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    const { useCase } = await makeUseCase();

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
