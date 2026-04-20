import { RefreshToken } from '../entities/refresh-token.entity';

export interface RefreshTokenRepository {
  create(token: RefreshToken): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
