export interface Weather {
  temperature: number;
  humidity: number;
  description: string;
}

export class WeatherError extends Error {}
export class CityNotFoundError extends WeatherError {}

export async function getCurrentWeather(
  city: string,
  apiKey: string
): Promise<Weather> {
  if (!city) {
    throw new WeatherError("City is required");
  }
  if (!apiKey) {
    throw new WeatherError("Missing WEATHER_API_KEY");
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
    city
  )}`;
  const resp = await fetch(url);

  if (resp.status === 404) {
    throw new CityNotFoundError(`City not found: ${city}`);
  }
  if (!resp.ok) {
    const text = await resp.text();
    throw new WeatherError(`Weather API error: ${text}`);
  }

  const body = await resp.json();
  return {
    temperature: body.current.temp_c,
    humidity: body.current.humidity,
    description: body.current.condition.text,
  };
}
    