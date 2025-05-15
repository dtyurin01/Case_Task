export interface SubscriptionPayload {
  email: string
  city: string
  frequency: 'hourly' | 'daily'
}

export interface Weather {
  temperature: number
  humidity: number
  description: string
}

/** GET /api/weather?city=… */
export async function fetchWeather(city: string): Promise<Weather> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  return res.json()
}

/** POST /api/subscribe */
export async function subscribe(payload: SubscriptionPayload) {
  const res = await fetch('/api/subscribe', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Subscribe failed: ${res.status}`)
  }
  return res.json()
}
