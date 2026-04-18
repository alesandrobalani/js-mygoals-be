import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TokenService, TokenPair } from './token.service';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    this.logger.log(`Login attempt: ${input.email}`, 'LoginUseCase');

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens: TokenPair = await this.tokenService.generateTokenPair(user.id, user.email);

    this.logger.log(`User logged in successfully: ${user.id}`, 'LoginUseCase');
    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }
}
