import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestCategoriesModule } from '../modules/categories/test-categories.module';

describe('Categories integration', () => {
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

  it('should create a new category and list categories', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/categories')
      .send({
        name: 'Teste Categoria',
        description: 'Categoria criada durante o teste de integração',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: 'Teste Categoria',
      description: 'Categoria criada durante o teste de integração',
    });
    expect(createResponse.body.id).toBeDefined();
    expect(createResponse.body.createdAt).toBeDefined();

    const listResponse = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((category: any) => category.name === 'Teste Categoria')).toBe(true);
  });
});
