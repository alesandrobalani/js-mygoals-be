import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TokenService, TokenPair } from './token.service';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface RegisterOutput {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    this.logger.log(`Registering user: ${input.email}`, 'RegisterUseCase');

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException(`Email "${input.email}" already in use`);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = new User(randomUUID(), input.email, passwordHash, input.name, new Date());
    const saved = await this.userRepository.create(user);

    const tokens: TokenPair = await this.tokenService.generateTokenPair(saved.id, saved.email);

    this.logger.log(`User registered successfully: ${saved.id}`, 'RegisterUseCase');
    return {
      user: { id: saved.id, email: saved.email, name: saved.name },
      ...tokens,
    };
  }
}
