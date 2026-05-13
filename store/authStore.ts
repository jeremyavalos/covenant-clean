import { create } from "zustand";

import {
  apiFetch,
  clearAuthToken,
  getStoredAuthToken,
  saveAuthToken,
  setAuthToken,
} from "../utils/api";

import {
  clearLegacyProgressCache,
  clearProgressUser,
  setProgressUser,
  syncProgress,
} from "../utils/progress";

type AuthModePayload = {
  email: string;
  password: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type CovenantUser = {
  id: number;
  email: string;
  is_verified: boolean;
  is_pro: boolean;
};

type AuthState = {
  token: string | null;
  user: CovenantUser | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (payload: AuthModePayload) => Promise<void>;
  register: (payload: AuthModePayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

async function fetchMe() {
  return apiFetch<CovenantUser>("/me");
}

function getUserCacheId(user: CovenantUser) {
  return String(user.id || user.email);
}

async function prepareProgressForUser(
  user: CovenantUser,
  label: string
) {
  const cacheId = getUserCacheId(user);

  console.log(
    `[Covenant auth] ${label}: preparing progress for user ${cacheId}.`
  );

  await setProgressUser(cacheId);
  await clearLegacyProgressCache();
  await syncProgress();
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  busy: false,
  error: null,

  initializeAuth: async () => {
    try {
      const token = await getStoredAuthToken();

      if (!token) {
        set({ loading: false });
        return;
      }

      setAuthToken(token);
      const user = await fetchMe();

      await prepareProgressForUser(
        user,
        "startup"
      );

      set({
        token,
        user,
        loading: false,
      });
    } catch {
      await clearAuthToken();
      await clearProgressUser();

      set({
        token: null,
        user: null,
        loading: false,
      });
    }
  },

  login: async (payload) => {
    set({ busy: true, error: null });

    try {
      const tokenResponse = await apiFetch<TokenResponse>("/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      });

      await saveAuthToken(tokenResponse.access_token);
      const user = await fetchMe();

      await prepareProgressForUser(
        user,
        "login"
      );

      set({
        token: tokenResponse.access_token,
        user,
        busy: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Could not log in",
        busy: false,
      });

      throw error;
    }
  },

  register: async (payload) => {
    set({ busy: true, error: null });

    try {
      const tokenResponse = await apiFetch<TokenResponse>("/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      });

      await saveAuthToken(tokenResponse.access_token);
      const user = await fetchMe();

      await prepareProgressForUser(
        user,
        "register"
      );

      set({
        token: tokenResponse.access_token,
        user,
        busy: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Could not register",
        busy: false,
      });

      throw error;
    }
  },

  logout: async () => {
    console.log(
      "[Covenant auth] Logout: clearing auth token and active progress user."
    );

    await clearAuthToken();
    await clearProgressUser();

    set({
      token: null,
      user: null,
      error: null,
    });
  },

  refreshMe: async () => {
    const user = await fetchMe();
    set({ user });
  },
}));
