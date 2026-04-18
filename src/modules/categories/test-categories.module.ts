import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CreateCategoryUseCase } from '../../use-cases/category/create-category.usecase';
import { GetCategoriesUseCase } from '../../use-cases/category/get-categories.usecase';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';

@Module({
  controllers: [CategoriesController],
  providers: [
    InMemoryCategoryRepository,
    {
      provide: 'CategoryRepository',
      useExisting: InMemoryCategoryRepository,
    },
    CreateCategoryUseCase,
    GetCategoriesUseCase,
  ],
})
export class TestCategoriesModule {}
