import { getCurrentWeather } from "../services/weatherService";
import sgMail from "../mailTransporter";

export async function sendWeatherEmail(email: string, city: string) {
  const apiKey = process.env.WEATHER_API_KEY!;
  const weather = await getCurrentWeather(city, apiKey);
  const subject = `Weather Update for ${city}`;
  const text = `
Hello ${email},

Here is your latest weather update for ${city}:

• Temperature: ${weather.temperature}°C  
• Humidity: ${weather.humidity}%  
• Conditions: ${weather.description}

Stay safe and have a great day!

– Your Dev Team
  `.trim();

  const html = `
  <div style="font-family:Arial,sans-serif;color:#333;line-height:1.5;">
    <h2 style="color:#1a73e8;">Weather Update for ${city}</h2>
    <ul>
      <li><strong>Temperature:</strong> ${weather.temperature}°C</li>
      <li><strong>Humidity:</strong> ${weather.humidity}%</li>
      <li><strong>Conditions:</strong> ${weather.description}</li>
    </ul>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p>Questions? Reply or email <a href="mailto:support@weatherdashboard.com">support@weatherdashboard.com</a>.</p>
    <p style="margin-top:32px;">Best regards,<br/>Weather Dashboard Team</p>
  </div>
  `.trim();

  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM!,
    subject,
    text,
    html,
  });
  console.log("[sendWeatherEmail] sent update to", email);
}
