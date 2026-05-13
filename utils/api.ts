import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const AUTH_TOKEN_KEY = "COVENANT_AUTH_TOKEN";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

type ExpoExtra = {
  covenantApiUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

export const API_BASE_URL =
  extra.covenantApiUrl ||
  "http://localhost:8000";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function getStoredAuthToken() {
  if (authToken) {
    return authToken;
  }

  authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  return authToken;
}

export async function saveAuthToken(token: string) {
  authToken = token;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken() {
  authToken = null;
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = await getStoredAuthToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.detail || data?.message || "Covenant request failed";

    throw new Error(message);
  }

  return data as T;
}
