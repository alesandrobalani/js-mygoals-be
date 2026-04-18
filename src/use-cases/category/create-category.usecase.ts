import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

@Injectable()
export class CreateCategoryUseCase {
  private readonly logger = new Logger(CreateCategoryUseCase.name);

  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    this.logger.log(`Creating category: ${input.name}`, 'CreateCategoryUseCase');

    // Check if category already exists
    const existingCategory = await this.categoryRepository.findByName(input.name);
    if (existingCategory) {
      throw new ConflictException(`Category with name "${input.name}" already exists`);
    }

    const category = new Category(
      randomUUID(),
      input.name,
      input.description,
      new Date(),
    );

    const result = await this.categoryRepository.create(category);
    this.logger.log(`Category created successfully with ID: ${result.id}`, 'CreateCategoryUseCase');

    return result;
  }
}