import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

@Injectable()
export class PostgreSQLRefreshTokenRepository implements RefreshTokenRepository {
  private readonly logger = new Logger(PostgreSQLRefreshTokenRepository.name);

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  private toEntity(domain: RefreshToken): RefreshTokenEntity {
    const entity = new RefreshTokenEntity();
    entity.id = domain.id;
    entity.token = domain.token;
    entity.userId = domain.userId;
    entity.expiresAt = domain.expiresAt;
    entity.revokedAt = domain.revokedAt ?? null;
    return entity;
  }

  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.token,
      entity.userId,
      entity.expiresAt,
      entity.revokedAt ?? undefined,
      entity.updatedAt,
    );
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    this.logger.debug(`Creating refresh token for user: ${token.userId}`, 'PostgreSQLRefreshTokenRepository');
    const saved = await this.refreshTokenRepository.save(this.toEntity(token));
    const loaded = await this.refreshTokenRepository.findOne({ where: { id: saved.id } });
    return this.toDomain(loaded!);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const entity = await this.refreshTokenRepository.findOne({ where: { token } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async revoke(id: string): Promise<void> {
    this.logger.debug(`Revoking refresh token: ${id}`, 'PostgreSQLRefreshTokenRepository');
    await this.refreshTokenRepository.update(id, { revokedAt: new Date() });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    this.logger.debug(`Revoking all refresh tokens for user: ${userId}`, 'PostgreSQLRefreshTokenRepository');
    await this.refreshTokenRepository.update({ userId, revokedAt: undefined }, { revokedAt: new Date() });
  }
}
