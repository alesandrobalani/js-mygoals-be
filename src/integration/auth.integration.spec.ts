import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { TestAuthModule } from '../modules/auth/test-auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('Auth integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const moduleRef = await Test.createTestingModule({
      imports: [TestAuthModule],
      providers: [
        {
          provide: APP_GUARD,
          useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
          inject: [Reflector],
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user and return tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })
      .expect(201);

    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should login and return tokens', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'login@example.com', password: 'password123', name: 'Login User' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'password123' })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'wrong@example.com', password: 'password123', name: 'User' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('should access /auth/me with valid token', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'me@example.com', password: 'password123', name: 'Me User' });

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${reg.body.accessToken}`)
      .expect(200);

    expect(res.body.email).toBe('me@example.com');
  });

  it('should return 401 on /auth/me without token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('should refresh tokens', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'refresh@example.com', password: 'password123', name: 'Refresh User' });

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: reg.body.refreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(reg.body.refreshToken);
  });

  it('should not allow reuse of a refresh token after rotation', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'rotation@example.com', password: 'password123', name: 'Rotation User' });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: reg.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: reg.body.refreshToken })
      .expect(401);
  });

  it('should logout and invalidate the refresh token', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'logout@example.com', password: 'password123', name: 'Logout User' });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${reg.body.accessToken}`)
      .send({ refreshToken: reg.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: reg.body.refreshToken })
      .expect(401);
  });

  it('should return 409 for duplicate email registration', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@example.com', password: 'password123', name: 'Dup User' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@example.com', password: 'other123', name: 'Other' })
      .expect(409);
  });

  it('should return 400 for invalid register payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: '123', name: '' })
      .expect(400);
  });
});
