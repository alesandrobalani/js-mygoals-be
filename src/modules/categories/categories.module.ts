import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CreateCategoryUseCase } from '../../use-cases/category/create-category.usecase';
import { GetCategoriesUseCase } from '../../use-cases/category/get-categories.usecase';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';
import { DatabaseModule } from '../database/database.module';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [TypeOrmModule.forFeature([CategoryEntity])] : []),
    DatabaseModule,
  ],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryUseCase,
    GetCategoriesUseCase,
  ],
  exports: [CreateCategoryUseCase, GetCategoriesUseCase],
})
export class CategoriesModule {}