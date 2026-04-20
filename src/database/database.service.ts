import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Optional() private dataSource?: DataSource,
    @Optional() @Inject('UserRepository') private userRepository?: UserRepository,
  ) {}

  async runMigrations(): Promise<void> {
    if (!this.dataSource) {
      this.logger.log('DataSource not available, skipping migrations');
      return;
    }

    try {
      this.logger.log('Running pending migrations...');
      const migrations = await this.dataSource.runMigrations();
      this.logger.log(`Successfully ran ${migrations.length} migration(s)`);
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      throw error;
    }
  }

  async seedInMemoryAdmin(): Promise<void> {
    if (!this.userRepository) return;

    const existing = await this.userRepository.findByEmail('admin@mygoals.com');
    if (existing) return;

    const passwordHash = await bcrypt.hash('Admin@12345', 12);
    await this.userRepository.create(
      new User(randomUUID(), 'admin@mygoals.com', passwordHash, 'Administrador', UserRole.ADMIN, new Date()),
    );
    this.logger.log('Admin padrão criado: admin@mygoals.com', 'DatabaseService');
  }
}
