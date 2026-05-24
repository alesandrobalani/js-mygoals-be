import { Module } from '@nestjs/common';
import { SqliteDatabaseModule } from '../../test-utils/sqlite-database.module';
import { CategoriesController } from './categories.controller';
import { CreateCategoryUseCase } from '../../use-cases/category/create-category.usecase';
import { GetCategoriesUseCase } from '../../use-cases/category/get-categories.usecase';

@Module({
  imports: [SqliteDatabaseModule],
  controllers: [CategoriesController],
  providers: [CreateCategoryUseCase, GetCategoriesUseCase],
})
export class TestCategoriesModule {}
