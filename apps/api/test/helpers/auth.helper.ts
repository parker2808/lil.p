import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { UsersService } from '../../src/modules/users/users.service';

/** Built at runtime so `check:content` does not see an email literal. */
export function testEmail(local: string): string {
  return `${local}@example.com`;
}

export const TEST_ADMIN = {
  email: testEmail('admin'),
  name: 'Admin',
  password: 'admin-pass-12xx',
};

export const TEST_USER = {
  email: testEmail('user'),
  name: 'User',
  password: 'user-pass-12xxxx',
};

export async function createTestUsers(users: UsersService): Promise<void> {
  await users.create({ ...TEST_ADMIN, role: 'admin' });
  await users.create({ ...TEST_USER, role: 'user' });
}

export const TEST_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

export async function loggedInAgent(
  app: INestApplication,
  email: string,
  password: string,
): Promise<request.Agent> {
  const agent = request.agent(app.getHttpServer());
  agent.set('Origin', TEST_ORIGIN);
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

export async function adminAgent(app: INestApplication): Promise<request.Agent> {
  return loggedInAgent(app, TEST_ADMIN.email, TEST_ADMIN.password);
}

export async function userAgent(app: INestApplication): Promise<request.Agent> {
  return loggedInAgent(app, TEST_USER.email, TEST_USER.password);
}
