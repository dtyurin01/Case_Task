export interface SubscriptionPayload {
  email: string;
  city: string;
  frequency: "hourly" | "daily";
}

export interface Weather {
  temperature: number;
  humidity: number;
  description: string;
}

export interface SubscriptionResponse {
  error: string;
  message: string;
}

export async function fetchWeather(city: string): Promise<Weather> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Weather API error: ${res.status} — ${err}`);
  }
  return res.json();
}

export async function subscribe(
  payload: SubscriptionPayload
): Promise<SubscriptionResponse> {
  const res = await fetch(`/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: SubscriptionResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Subscribe failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(
      data.error || data.message || `Subscribe failed: ${res.status}`
    );
  }

  return data;
}

export async function confirmSubscription(token: string) {
  const res = await fetch(`/api/confirm?token=${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || data.message || `Confirm failed: ${res.status}`
    );
  return data;
}

export async function checkConfirmationStatus(email: string): Promise<boolean> {
  const res = await fetch(`/api/status?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Status check failed: ${res.status}`);
  }

  const data = await res.json();
  return data.confirmed;
}
