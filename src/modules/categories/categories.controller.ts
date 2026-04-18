import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/create-category.dto';
import { CreateCategoryUseCase } from '../../use-cases/category/create-category.usecase';
import { GetCategoriesUseCase } from '../../use-cases/category/get-categories.usecase';

@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly getCategories: GetCategoriesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateCategoryDto) {
    this.logger.log(`POST /categories - Creating category: ${payload.name}`, 'CategoriesController');

    try {
      const result = await this.createCategory.execute(payload);
      this.logger.log(`Category created successfully: ${result.id}`, 'CategoriesController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create category: ${errorMessage}`, errorStack, 'CategoriesController');
      throw error;
    }
  }

  @Get()
  async findAll() {
    this.logger.log('GET /categories - Retrieving all categories', 'CategoriesController');

    try {
      const categories = await this.getCategories.execute();
      this.logger.log(`Retrieved ${categories.length} categories`, 'CategoriesController');
      return categories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve categories: ${errorMessage}`, errorStack, 'CategoriesController');
      throw error;
    }
  }
}