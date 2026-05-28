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
  "https://covenant-clean-production.up.railway.app";

const REQUEST_TIMEOUT_MS =
  12000;

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
  const controller =
    new AbortController();
  const timeout =
    setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );
  const externalSignal =
    options.signal;

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = await getStoredAuthToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener(
        "abort",
        () => controller.abort(),
        { once: true }
      );
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        data?.detail || data?.message || "Covenant request failed";

      throw new Error(message);
    }

    return data as T;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error("Covenant request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
