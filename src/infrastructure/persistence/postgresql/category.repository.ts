import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryEntity } from '../postgresql/category.entity';

@Injectable()
export class PostgreSQLCategoryRepository implements CategoryRepository {
  private readonly logger = new Logger(PostgreSQLCategoryRepository.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(category: Category): Promise<Category> {
    this.logger.debug(`Creating category in database: ${category.id}`, 'PostgreSQLCategoryRepository');

    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.description = category.description;
    entity.updatedAt = category.updatedAt || new Date();

    const savedEntity = await this.categoryRepository.save(entity);

    return new Category(
      savedEntity.id,
      savedEntity.name,
      savedEntity.description,
      savedEntity.updatedAt,
    );
  }

  async findAll(): Promise<Category[]> {
    this.logger.debug('Retrieving all categories from database', 'PostgreSQLCategoryRepository');

    const entities = await this.categoryRepository.find();
    return entities.map(entity => new Category(
      entity.id,
      entity.name,
      entity.description,
      entity.updatedAt,
    ));
  }

  async findById(id: string): Promise<Category | null> {
    this.logger.debug(`Retrieving category by ID: ${id}`, 'PostgreSQLCategoryRepository');

    const entity = await this.categoryRepository.findOne({ where: { id } });
    if (!entity) return null;

    return new Category(
      entity.id,
      entity.name,
      entity.description,
      entity.updatedAt,
    );
  }

  async findByName(name: string): Promise<Category | null> {
    this.logger.debug(`Retrieving category by name: ${name}`, 'PostgreSQLCategoryRepository');

    const entity = await this.categoryRepository.findOne({ where: { name } });
    if (!entity) return null;

    return new Category(
      entity.id,
      entity.name,
      entity.description,
      entity.updatedAt,
    );
  }
}