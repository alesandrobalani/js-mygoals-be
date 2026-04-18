import { Inject, Injectable, Logger } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class GetCategoriesUseCase {
  private readonly logger = new Logger(GetCategoriesUseCase.name);

  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(): Promise<Category[]> {
    this.logger.log('Retrieving all categories', 'GetCategoriesUseCase');

    const categories = await this.categoryRepository.findAll();
    this.logger.log(`Retrieved ${categories.length} categories`, 'GetCategoriesUseCase');

    return categories;
  }
}