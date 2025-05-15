import { useState } from "react";
import { fetchWeather, subscribe } from "./api";
import type { SubscriptionPayload, Weather } from "./api";
import "./App.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather>();
  const [email, setEmail] = useState("");

  const load = async () => {
    try {
      const w = await fetchWeather(city);
      setWeather(w);
    } catch (e) {
      alert(e);
    }
  };

  const onSubscribe = async () => {
    try {
      const payload: SubscriptionPayload = { email, city, frequency: "hourly" };
      await subscribe(payload);
      alert("You are subscribed!");
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
      />
      <button onClick={load}>Get Weather</button>
      {weather && (
        <div>
          {weather.temperature}°C, {weather.description}
        </div>
      )}
      <hr />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={onSubscribe}>Subscribe</button>
    </div>
  );
}
