import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory/user.repository';
import { InMemoryRefreshTokenRepository } from '../../infrastructure/persistence/in-memory/refresh-token.repository';
import { RegisterUseCase } from './register.usecase';
import { TokenService } from './token.service';

function makeUseCase() {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const jwtService = new JwtService({ secret: 'test-secret' });
  const tokenService = new TokenService(jwtService, refreshTokenRepository as any);
  const useCase = new RegisterUseCase(userRepository as any, tokenService);
  return { useCase, userRepository };
}

describe('RegisterUseCase', () => {
  it('should register a user and return tokens', async () => {
    const { useCase } = makeUseCase();

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(result.user.email).toBe('user@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.user.id).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throw ConflictException if email already in use', async () => {
    const { useCase } = makeUseCase();

    await useCase.execute({ email: 'dup@example.com', password: 'password123', name: 'User' });

    await expect(
      useCase.execute({ email: 'dup@example.com', password: 'other123', name: 'Other' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should store a hashed password (not plaintext)', async () => {
    const { useCase, userRepository } = makeUseCase();

    await useCase.execute({ email: 'hash@example.com', password: 'plaintext', name: 'User' });

    const user = await userRepository.findByEmail('hash@example.com');
    expect(user?.passwordHash).not.toBe('plaintext');
    expect(user?.passwordHash).toMatch(/^\$2b\$/);
  });
});
