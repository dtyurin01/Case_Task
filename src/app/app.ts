import 'dotenv/config';
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient, Frequency } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const prisma = new PrismaClient();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const wrap =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).then(() => undefined).catch(next);

app.get(
  '/api/weather',
  wrap(async (req: Request, res: Response) => {
    const city = req.query.city as string;
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing WEATHER_API_KEY' });
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
      city
    )}`;
    const resp = await fetch(url);
    if (resp.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    if (!resp.ok) {
      const text = await resp.text();
      console.error('WeatherAPI error:', text);
      return res.status(502).json({ error: 'Weather API error' });
    }

    const data = await resp.json();
    return res.json({
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      description: data.current.condition.text,
    });
  })
);

app.post(
  '/api/subscribe',
  wrap(async (req: Request, res: Response) => {
    const { email, city, frequency } = req.body;
    if (!email || !city || !frequency) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    if (!['hourly', 'daily'].includes(frequency)) {
      return res.status(400).json({ error: 'Frequency must be hourly or daily' });
    }

    const exists = await prisma.subscription.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    const confirmToken = uuidv4();
    const unsubscribeToken = uuidv4();
    await prisma.subscription.create({
      data: { email, city, frequency: frequency as Frequency, confirmToken, unsubscribeToken },
    });

    // TODO: отправить письмо с ссылкой `/api/confirm/${confirmToken}`
    return res.json({ message: 'Subscription successful. Confirmation email sent.' });
  })
);

app.get(
  '/api/confirm/:token',
  wrap(async (req: Request, res: Response) => {
    const { token } = req.params;
    const sub = await prisma.subscription.findUnique({ where: { confirmToken: token } });
    if (!sub) {
      return res.status(404).json({ error: 'Token not found' });
    }
    if (sub.confirmed) {
      return res.status(400).json({ error: 'Already confirmed' });
    }
    await prisma.subscription.update({ where: { id: sub.id }, data: { confirmed: true } });
    return res.json({ message: 'Subscription confirmed successfully' });
  })
);

app.get(
  '/api/unsubscribe/:token',
  wrap(async (req: Request, res: Response) => {
    const { token } = req.params;
    const sub = await prisma.subscription.findUnique({ where: { unsubscribeToken: token } });
    if (!sub) {
      return res.status(404).json({ error: 'Token not found' });
    }
    await prisma.subscription.delete({ where: { id: sub.id } });
    return res.json({ message: 'Unsubscribed successfully' });
  })
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
