import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { UsersService } from '../../src/modules/users/users.service';

export const TEST_ADMIN = {
  email: 'admin@example.com',
  name: 'Admin',
  password: 'admin-pass-12xx',
} as const;

export const TEST_USER = {
  email: 'user@example.com',
  name: 'User',
  password: 'user-pass-12xxxx',
} as const;

export async function createTestUsers(users: UsersService): Promise<void> {
  await users.create({ ...TEST_ADMIN, role: 'admin' });
  await users.create({ ...TEST_USER, role: 'user' });
}

export async function loggedInAgent(
  app: INestApplication,
  email: string,
  password: string,
): Promise<request.Agent> {
  const agent = request.agent(app.getHttpServer());
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

export async function adminAgent(app: INestApplication): Promise<request.Agent> {
  return loggedInAgent(app, TEST_ADMIN.email, TEST_ADMIN.password);
}

export async function userAgent(app: INestApplication): Promise<request.Agent> {
  return loggedInAgent(app, TEST_USER.email, TEST_USER.password);
}
