import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { UserEntity } from './user.entity';

@Injectable()
export class PostgreSQLUserRepository implements UserRepository {
  private readonly logger = new Logger(PostgreSQLUserRepository.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(user: User): Promise<User> {
    this.logger.debug(`Creating user in database: ${user.email}`, 'PostgreSQLUserRepository');
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.name = user.name;
    entity.role = user.role;

    const saved = await this.userRepository.save(entity);
    return new User(saved.id, saved.email, saved.passwordHash, saved.name, saved.role, saved.updatedAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`, 'PostgreSQLUserRepository');
    const entity = await this.userRepository.findOne({ where: { email } });
    if (!entity) return null;
    return new User(entity.id, entity.email, entity.passwordHash, entity.name, entity.role, entity.updatedAt);
  }

  async findById(id: string): Promise<User | null> {
    this.logger.debug(`Finding user by ID: ${id}`, 'PostgreSQLUserRepository');
    const entity = await this.userRepository.findOne({ where: { id } });
    if (!entity) return null;
    return new User(entity.id, entity.email, entity.passwordHash, entity.name, entity.role, entity.updatedAt);
  }
}
