import { PrismaClient, Frequency } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function subscribeUser(
  email: string,
  city: string,
  frequency: Frequency
) {
  const exists = await prisma.subscription.findUnique({ where: { email } });
  if (exists) throw new Error("Email already subscribed");

  return prisma.subscription.create({
    data: {
      email,
      city,
      frequency,
      confirmed: false,
      confirmToken: uuidv4(),
      unsubscribeToken: uuidv4(),
    },
  });
}

export async function confirmSubscription(token: string) {
  const sub = await prisma.subscription.findUnique({
    where: { confirmToken: token },
  });
  if (!sub) throw new Error("Token not found");
  if (sub.confirmed) throw new Error("Already confirmed");

  return prisma.subscription.update({
    where: { id: sub.id },
    data: { confirmed: true },
  });
}

export async function unsubscribeUser(token: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({
    where: { unsubscribeToken: token },
  });
  if (!sub) {
    throw new Error("Invalid or expired unsubscribe token");
  }

  await prisma.subscription.delete({ where: { id: sub.id } });
}

export async function getSubscriptionByEmail(email: string) {
  return prisma.subscription.findUnique({ where: { email } });
}

export async function getSubscriptionByToken(token: string) {
  return prisma.subscription.findUnique({
    where: { unsubscribeToken: token },
  });
}

export async function getAllSubscriptions() {
  return prisma.subscription.findMany();
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
