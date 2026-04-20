import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory/user.repository';
import { InMemoryRefreshTokenRepository } from '../../infrastructure/persistence/in-memory/refresh-token.repository';
import { User, UserRole } from '../../domain/entities/user.entity';
import { LoginUseCase } from './login.usecase';
import { TokenService } from './token.service';
import { randomUUID } from 'crypto';

async function makeUseCase() {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const jwtService = new JwtService({ secret: 'test-secret' });
  const tokenService = new TokenService(jwtService, refreshTokenRepository as any);
  const useCase = new LoginUseCase(userRepository as any, tokenService);

  const passwordHash = await bcrypt.hash('correct-password', 12);
  await userRepository.create(new User(randomUUID(), 'user@example.com', passwordHash, 'Test User', UserRole.USER, new Date()));

  return { useCase };
}

describe('LoginUseCase', () => {
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
