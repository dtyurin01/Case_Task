import "dotenv/config";
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import {
  getCurrentWeather,
  CityNotFoundError,
  WeatherError,
} from "../services/weatherService";
import {
  subscribeUser,
  confirmSubscription,
  unsubscribeUser,
  isEmailConfirmed,
  TokenNotFoundError,
} from "../services/subscriptionService";
import { Frequency } from "@prisma/client";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { sendWeatherEmail } from "../services/emailService";
import cors from "cors";
const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 4000;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const wrap =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void | Response>
  ): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

app.get(
  "/api/weather",
  wrap(async (req: Request, res: Response) => {
    const city = req.query.city as string;
    try {
      const apiKey = process.env.WEATHER_API_KEY!;
      const weather = await getCurrentWeather(city, apiKey);
      return res.json(weather);
    } catch (err) {
      if (err instanceof CityNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof WeatherError) {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  })
);

app.post(
  "/api/subscribe",
  wrap(async (req: Request, res: Response) => {
    const { email, city, frequency } = req.body;

    const sub = await subscribeUser(email, city, frequency as Frequency);
    console.log("[subscribe] subscription record:", sub);

    const confirmLink = `${process.env.APP_URL}/api/confirm/${sub.confirmToken}`;
    console.log("[subscribe] will send email to:", email);
    console.log("[subscribe] confirm link:", confirmLink);

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Confirm your weather subscription",
        text: `Click to confirm: ${confirmLink}`,
        html: `<a href="${confirmLink}">Confirm subscription</a>`,
      });
      console.log("[subscribe] sendMail info:", {
        messageId: info.messageId,
        accepted: info.accepted,
        envelope: info.envelope,
      });
    } catch (err) {
      console.error("[subscribe] sendMail error:", err);
    }

    return res.json({
      message: "Subscription successful. Confirmation email sent.",
      unsubscribeToken: sub.unsubscribeToken,
    });
  })
);
app.get(
  "/api/confirm/:token",
  wrap(async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
      await confirmSubscription(token);
      const sub = await prisma.subscription.findUnique({
        where: { confirmToken: token },
      });
      if (sub) {
        try {
          await sendWeatherEmail(sub.email, sub.city);
        } catch (err) {
          console.error("Error sending initial weather email:", err);
        }
        return res.json({ message: "Subscription confirmed successfully" });
      }
    } catch (err: any) {
      if (err.message === "Token not found") {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === "Already confirmed") {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  })
);

app.get(
  "/api/unsubscribe/:token",
  wrap(async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
      await unsubscribeUser(token);
      return res.json({ message: "Unsubscribed successfully" });
    } catch (err: any) {
      if (err.message.includes("Invalid")) {
        return res.status(404).json({ error: err.message });
      }
      throw err;
    }
  })
);

app.get(
  "/api/status",
  wrap(async (req: Request, res: Response) => {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const confirmed = await isEmailConfirmed(email);
      return res.json({ confirmed });
    } catch (err: any) {
      if (err instanceof TokenNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      throw err;
    }
  })
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
