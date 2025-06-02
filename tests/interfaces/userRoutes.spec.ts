import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { prisma } from '@infrastructure/db';
import { Gender } from '@domain/models/account/user';
import { createApp } from '@app';

let app: Awaited<ReturnType<typeof createApp>>;
let createdPkid: number;

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    app = await createApp();
    await app.ready();
    await prisma.mark5_user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /api/users 应创建用户并返回 201', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/users', payload: {
      name: 'APIUser', email: 'api@example.com', birthdate: '2000-01-01', gender: Gender.unknown, height: 170, status: true
    }});
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('pkid');
    createdPkid = body.pkid;
  });

  it('GET /api/users/:pkid 返回用户', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/users/${createdPkid}` });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.pkid).toBe(createdPkid);
  });

  it('GET /api/users 列出用户', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/users' });
    expect(res.statusCode).toBe(200);
    const list = JSON.parse(res.payload);
    expect(Array.isArray(list)).toBe(true);
  });

  it('PUT /api/users/:pkid 更新用户', async () => {
    const res = await app.inject({ method: 'PUT', url: `/api/users/${createdPkid}`, payload: { height: 180 }});
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.height).toBe(180);
  });

  it('DELETE /api/users/:pkid 删除用户', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/users/${createdPkid}` });
    expect(res.statusCode).toBe(204);
  });
});