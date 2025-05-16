import { useState, useEffect } from "react";
import { checkConfirmationStatus, fetchWeather, subscribe } from "./api";
import type { SubscriptionPayload, Weather } from "./api";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiSprinkle,
  WiThunderstorm,
  WiNa,
  WiDayCloudy,
} from "react-icons/wi";
import "./App.css";

interface Notification {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather>();
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const addNotification = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const load = async () => {
    try {
      const w = await fetchWeather(city);
      setWeather(w);
    } catch {
      addNotification("Failed to fetch weather", "error");
    }
  };

  const onSubscribe = async () => {
    try {
      const payload: SubscriptionPayload = { email, city, frequency: "hourly" };
      const data = await subscribe(payload);
      console.log("Subscribe response:", data);
      addNotification(
        "You are subscribed! Please check your email.",
        "success"
      );
      setConfirmed(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log("Subscribe error:", e.message);
      addNotification(e.message || "Subscription failed", "error");
    }
  };

  const onCheckStatus = async () => {
    try {
      const status = await checkConfirmationStatus(email);
      setConfirmed(status);
      addNotification(
        status ? "Email is confirmed" : "Email is not confirmed",
        status ? "success" : "error"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log("Status check error:", e.message);
      addNotification(e.message || "Status check failed", "error");
    }
  };

  const getWeatherIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes("clear")) return <WiDaySunny />;
    if (d.includes("rain")) return <WiRain />;
    if (d.includes("drizzle")) return <WiSprinkle />;
    if (d.includes("thunderstorm")) return <WiThunderstorm />;
    if (d.includes("cloud")) return <WiCloudy />;
    if (d.includes("snow")) return <WiSnow />;
    if (d.includes("overcast")) return <WiDayCloudy />;
    return <WiNa />;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Weather Dashboard</h1>
      </header>

      {weather && (
        <div className="weather-display">
          <div className="weather-icon">
            {getWeatherIcon(weather.description)}
          </div>
          <div className="weather-info">
            <span>{weather.humidity}%</span>
            <span className="description">{weather.description}</span>
          </div>
        </div>
      )}

      <div className="controls">
        <input
          className="styled-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />
        <button className="styled-button" onClick={load}>
          Get Weather
        </button>
      </div>

      <hr />

      <div className="controls">
        <input
          className="styled-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button className="styled-button" onClick={onSubscribe}>
          Subscribe
        </button>
        <button className="styled-button" onClick={onCheckStatus}>
          Check Status
        </button>
      </div>

      {confirmed !== null && (
        <div className={`status ${confirmed ? "confirmed" : "not-confirmed"}`}>
          {confirmed ? "Email confirmed" : "Email not confirmed"}
        </div>
      )}

      <div className="notification-container">
        {notifications.map((note) => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>
    </div>
  );
}
