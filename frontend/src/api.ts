import type {
  SubscriptionPayload,
  Weather,
  SubscriptionResponse,
  UnsubscribeResponse,
} from "../../shared/types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function fetchWeather(city: string): Promise<Weather> {
  const res = await fetch(
    `${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Weather API error: ${res.status} — ${err}`);
  }
  return res.json();
}

export async function subscribe(
  payload: SubscriptionPayload
): Promise<SubscriptionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
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
  const res = await fetch(
    `${API_BASE_URL}/api/confirm/${encodeURIComponent(token)}`
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || data.message || `Confirm failed: ${res.status}`
    );
  return data;
}

export async function checkConfirmationStatus(email: string): Promise<boolean> {
  const res = await fetch(
    `${API_BASE_URL}/api/status?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Status check failed: ${res.status}`);
  }

  const data = await res.json();
  return data.confirmed;
}

export async function unsubscribe(token: string): Promise<UnsubscribeResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/unsubscribe/${encodeURIComponent(token)}`,
    {
      method: "GET",
    }
  );
  const data: UnsubscribeResponse = await res.json();

  if (!res.ok) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).error || data.message || `Unsubscribe failed: ${res.status}`
    );
  }

  return data;
}
