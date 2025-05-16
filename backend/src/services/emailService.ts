import { getCurrentWeather } from "../services/weatherService"; 
import transporter from "../mailTransporter";

export async function sendWeatherEmail(email: string, city: string) {
  const apiKey = process.env.WEATHER_API_KEY!;

  const weather = await getCurrentWeather(city, apiKey);
  const html = `
    <h1>Weather Update for ${city}</h1>
    <p>Temperature: ${weather.temperature}°C</p>
    <p>Humidity: ${weather.humidity}%</p>
    <p>${weather.description}</p>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Weather update for ${city}`,
    html,
  });
}