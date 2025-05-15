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
} from "../services/subscriptionService";
import { Frequency } from "@prisma/client";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

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
    if (!email || !city || !frequency) {
      return res.status(400).json({ error: "Invalid input" });
    }
    if (!["hourly", "daily"].includes(frequency)) {
      return res
        .status(400)
        .json({ error: "Frequency must be hourly or daily" });
    }

    try {
      const sub = await subscribeUser(email, city, frequency as Frequency);
      // TODO: send confirmation email with sub.confirmToken
      return res.json({
        message: "Subscription successful. Confirmation email sent.",
      });
    } catch (err: any) {
      if (err.message === "Email already subscribed") {
        return res.status(409).json({ error: err.message });
      }
      throw err;
    }
  })
);

app.get(
  "/api/confirm/:token",
  wrap(async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
      await confirmSubscription(token);
      return res.json({ message: "Subscription confirmed successfully" });
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

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
