import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CreateCategoryUseCase } from '../../use-cases/category/create-category.usecase';
import { GetCategoriesUseCase } from '../../use-cases/category/get-categories.usecase';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [TypeOrmModule.forFeature([CategoryEntity])] : []),
  ],
  controllers: [CategoriesController],
  providers: [
    InMemoryCategoryRepository,
    ...(usePostgres ? [PostgreSQLCategoryRepository] : []),
    {
      provide: 'CategoryRepository',
      useFactory: (
        inMemoryRepo: InMemoryCategoryRepository,
        pgRepo?: PostgreSQLCategoryRepository
      ) => {
        const dbMode = process.env.DB_MODE || 'memory';
        return dbMode === 'postgres' ? pgRepo : inMemoryRepo;
      },
      inject: [
        InMemoryCategoryRepository,
        ...(usePostgres ? [PostgreSQLCategoryRepository] : [])
      ],
    },
    CreateCategoryUseCase,
    GetCategoriesUseCase,
  ],
  exports: [CreateCategoryUseCase, GetCategoriesUseCase],
})
export class CategoriesModule {}