import cron from "node-cron";
import { sendWeatherEmail } from "./services/emailService";
import { PrismaClient, Frequency } from "@prisma/client";

const prisma = new PrismaClient();

async function sendBatch(freq: Frequency) {
  const subs = await prisma.subscription.findMany({
    where: { frequency: freq, confirmed: true },
  });
  for (const sub of subs) {
    try {
      await sendWeatherEmail(sub.email, sub.city);
      console.log(`[scheduler] Sent ${freq} email to ${sub.email}`);
    } catch (err) {
      console.error(
        `[scheduler] Error sending ${freq} email to ${sub.email}:`,
        err
      );
    }
  }
}

cron.schedule("0 * * * *", () => sendBatch("hourly"), {
  timezone: "Europe/Berlin",
});

cron.schedule("0 0 * * *", () => sendBatch("daily"), {
  timezone: "Europe/Berlin",
});
