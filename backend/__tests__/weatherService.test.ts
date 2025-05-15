import {
  getCurrentWeather,
  WeatherError,
  CityNotFoundError,
  Weather,
} from "../src/services/weatherService";

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("weatherService.getCurrentWeather", () => {
  const fakeKey = "API_KEY";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("throws if city is empty", async () => {
    await expect(getCurrentWeather("", fakeKey)).rejects.toThrow(
      "City is required"
    );
  });

  it("throws if apiKey is empty", async () => {
    await expect(getCurrentWeather("London", "")).rejects.toThrow(
      "Missing WEATHER_API_KEY"
    );
  });

  it("throws CityNotFoundError on 404", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
      text: async () => "Not found",
    } as any);
    await expect(getCurrentWeather("Nowhere", fakeKey)).rejects.toBeInstanceOf(
      CityNotFoundError
    );
  });

  it("throws WeatherError on http error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => "Server down",
    } as any);

    await expect(getCurrentWeather("Berlin", fakeKey)).rejects.toThrow(
      WeatherError
    );
    await expect(getCurrentWeather("Berlin", fakeKey)).rejects.toThrow(
      "Weather API error: Server down"
    );
  });

  it("returns correct Weather object on success", async () => {
    const fakeApiResponse = {
      current: {
        temp_c: 22.5,
        humidity: 70,
        condition: { text: "Sunny" },
      },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeApiResponse,
    } as any);

    const result = await getCurrentWeather("Berlin", fakeKey);
    expect(result).toEqual<Weather>({
      temperature: 22.5,
      humidity: 70,
      description: "Sunny",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`current.json?key=${fakeKey}&q=Berlin`)
    );
  });
});
