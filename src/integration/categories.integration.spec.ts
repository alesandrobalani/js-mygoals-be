import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestCategoriesModule } from '../modules/categories/test-categories.module';
import { CategoryEntity } from '../infrastructure/persistence/postgresql/category.entity';

describe('Categories integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestCategoriesModule],
    }).compile();

    app = moduleRef.createNestApplication();
    dataSource = moduleRef.get(DataSource, { strict: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.getRepository(CategoryEntity).clear();
  });

  it('should create a new category and list categories', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/categories')
      .send({
        name: 'Teste Categoria',
        description: 'Categoria criada durante o teste de integraÃ§Ã£o',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: 'Teste Categoria',
      description: 'Categoria criada durante o teste de integraÃ§Ã£o',
    });
    expect(createResponse.body.id).toBeDefined();
    expect(createResponse.body.updatedAt).toBeDefined();

    const listResponse = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((category: any) => category.name === 'Teste Categoria')).toBe(true);
  });
});
