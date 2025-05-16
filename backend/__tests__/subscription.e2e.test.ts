import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app/app'; 

const prisma = new PrismaClient();

describe('Subscription flow', () => {
  let confirmToken: string;
  let unsubscribeToken: string;

  const payload = {
    email: 'test@jest.com',
    city: 'Berlin',
    frequency: 'hourly',
  };

  afterAll(async () => {
    await prisma.subscription.deleteMany({ where: { email: payload.email } });
    await prisma.$disconnect();
  });

  it('should subscribe a user', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send(payload)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const sub = await prisma.subscription.findUnique({
      where: { email: payload.email },
    });

    expect(sub).toBeTruthy();
    confirmToken = sub?.confirmToken!;
    unsubscribeToken = sub?.unsubscribeToken!;
  });

  it('should confirm the subscription', async () => {
    const res = await request(app)
      .get(`/api/confirm/${confirmToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('message');
  });

  it('should unsubscribe the user', async () => {
    const res = await request(app)
      .get(`/api/unsubscribe/${unsubscribeToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const check = await prisma.subscription.findUnique({
      where: { email: payload.email },
    });

    expect(check).toBeNull(); // успешно удалён
  });
});
