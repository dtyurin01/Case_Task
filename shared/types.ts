export type Frequency = "hourly" | "daily";

export interface Weather {
  temperature: number;
  humidity: number;
  description: string;
}
export interface SubscriptionPayload {
  email: string;
  city: string;
  frequency: Frequency;
}

export interface SubscriptionResponse {
  error: string;
  message: string;
  unsubscribeToken: string;
}
export interface UnsubscribeResponse {
  message: string;
}
