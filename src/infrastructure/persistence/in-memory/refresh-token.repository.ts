import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private tokens: RefreshToken[] = [];

  async create(token: RefreshToken): Promise<RefreshToken> {
    this.tokens.push(token);
    return token;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.tokens.find(t => t.token === token) ?? null;
  }

  async revoke(id: string): Promise<void> {
    const index = this.tokens.findIndex(t => t.id === id);
    if (index !== -1) {
      const t = this.tokens[index];
      this.tokens[index] = new RefreshToken(t.id, t.token, t.userId, t.expiresAt, new Date(), t.updatedAt);
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    this.tokens = this.tokens.map(t => {
      if (t.userId === userId && !t.revokedAt) {
        return new RefreshToken(t.id, t.token, t.userId, t.expiresAt, new Date(), t.updatedAt);
      }
      return t;
    });
  }
}
