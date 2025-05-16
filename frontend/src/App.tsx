import { useState, useEffect } from "react";
import {
  checkConfirmationStatus,
  fetchWeather,
  subscribe,
  unsubscribe,
} from "./api";
import type {
  SubscriptionPayload,
  Weather,
  Frequency,
} from "../../shared/types";

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
  const [frequency, setFrequency] = useState<Frequency | "">("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unsubscribeToken, setUnsubscribeToken] = useState<string | null>(null);

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
    if (!frequency) {
      addNotification("Please select a frequency", "error");
      return;
    }
    try {
      const payload: SubscriptionPayload = {
        email,
        city,
        frequency,
      };
      const data = await subscribe(payload);
      console.log("Subscribe response:", data);
      setUnsubscribeToken(data.unsubscribeToken);
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

  const onUnsubscribe = async () => {
    if (!unsubscribeToken) return;
    try {
      const res = await unsubscribe(unsubscribeToken);
      console.log("Unsubscribe response:", res);
      addNotification(res.message || "Unsubscribed successfully", "success");
      setUnsubscribeToken(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log("Unsubscribe error:", e.message);
      addNotification(e.message || "Unsubscribe failed", "error");
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
    if (d.includes("sunny")) return <WiDaySunny />;
    if (d.includes("rain")) return <WiRain />;
    if (d.includes("drizzle")) return <WiSprinkle />;
    if (d.includes("thunderstorm")) return <WiThunderstorm />;
    if (d.includes("cloud")) return <WiCloudy />;
    if (d.includes("snow")) return <WiSnow />;
    if (d.includes("overcast")) return <WiDayCloudy />;
    return <WiNa />;
  };

  const getSubscribeButtonText = () => {
    if (!email) return "Enter email";
    if (!city) return "Enter city";
    if (!frequency) return "Select frequency";
    return "Subscribe";
  };

  const getUnsubscribeButtonText = () => {
    return unsubscribeToken ? "Unsubscribe" : "No token";
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
            <span className="temperature">{weather.temperature}°C</span>
            <span>{weather.humidity}%</span>
            <span className="description">{weather.description}</span>
          </div>
        </div>
      )}

      <div
        className="controls"
        style={{
          display: "flex",
          gap: "10px",
          maxWidth: "320px",
          margin: "0 auto",
          marginTop: "20px",
        }}
      >
        <input
          className="styled-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />
        <button className="styled-button" onClick={load} disabled={!city}>
          {confirmed ? "Get Weather" : "Enter city name"}
        </button>
      </div>

      <hr />

      <div
        className="controls"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "320px",
          margin: "0 auto",
        }}
      >
        <input
          className="styled-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <select
          className="styled-input"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
          required
        >
          <option value="">-- Select frequency --</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
        </select>

        <button
          className="styled-button"
          onClick={onSubscribe}
          disabled={!email || !city || !frequency}
        >
          {getSubscribeButtonText()}
        </button>
        <button className="styled-button" onClick={onCheckStatus}>
          Check Status
        </button>

        <button
          onClick={onUnsubscribe}
          disabled={!unsubscribeToken}
          className="styled-button"
          style={{ backgroundColor: "#e74c3c", color: "#fff" }}
        >
          {getUnsubscribeButtonText()}
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
