import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestCategoriesModule } from '../../../src/modules/categories/test-categories.module';

describe('Categories e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestCategoriesModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and list categories', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send({
        name: 'Categoria E2E',
        description: 'Categoria criada pelo teste e2e',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Categoria E2E',
      description: 'Categoria criada pelo teste e2e',
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();

    const listResponse = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((category: any) => category.name === 'Categoria E2E')).toBe(true);
  });
});
