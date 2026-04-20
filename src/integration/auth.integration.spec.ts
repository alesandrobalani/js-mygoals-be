import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { TestAuthModule } from '../modules/auth/test-auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { InMemoryUserRepository } from '../infrastructure/persistence/in-memory/user.repository';
import { User, UserRole } from '../domain/entities/user.entity';

describe('Auth integration', () => {
  let app: INestApplication;
  let adminToken: string;

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
        {
          provide: APP_GUARD,
          useFactory: (reflector: Reflector) => new RolesGuard(reflector),
          inject: [Reflector],
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const userRepo = moduleRef.get(InMemoryUserRepository);
    const passwordHash = await bcrypt.hash('admin-password', 12);
    await userRepo.create(new User(randomUUID(), 'admin@test.com', passwordHash, 'Admin', UserRole.ADMIN, new Date()));

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin-password' });
    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user and return tokens (admin only)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })
      .expect(201);

    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe(UserRole.USER);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should return 403 when registering without admin token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'noadmin@example.com', password: 'password123', name: 'No Admin' })
      .expect(401);
  });

  it('should return 403 when registering with a non-admin token', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user-for-403@example.com', password: 'password123', name: 'Regular User' });
    const userToken = reg.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'another@example.com', password: 'password123', name: 'Another' })
      .expect(403);
  });

  it('should login and return tokens', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
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
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'wrong@example.com', password: 'password123', name: 'User' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('should access /auth/me with valid token', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
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
      .set('Authorization', `Bearer ${adminToken}`)
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
      .set('Authorization', `Bearer ${adminToken}`)
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
      .set('Authorization', `Bearer ${adminToken}`)
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
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'dup@example.com', password: 'password123', name: 'Dup User' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'dup@example.com', password: 'other123', name: 'Other' })
      .expect(409);
  });

  it('should return 400 for invalid register payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'not-an-email', password: '123', name: '' })
      .expect(400);
  });
});
