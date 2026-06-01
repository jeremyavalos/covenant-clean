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
  language?: "en" | "es";
};

type EmailPayload = {
  email: string;
  language?: "en" | "es";
};

type ResetPasswordPayload = {
  token: string;
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
  resendVerification: (payload: EmailPayload) => Promise<void>;
  forgotPassword: (payload: EmailPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AUTH_INITIALIZE_TIMEOUT_MS =
  2500;

let authInitializeAttempt =
  0;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePassword(password: string) {
  return password.trim();
}

function normalizeAuthPayload<T extends AuthModePayload>(payload: T): T {
  return {
    ...payload,
    email: normalizeEmail(payload.email),
    password: normalizePassword(payload.password),
  };
}

function normalizeEmailPayload<T extends EmailPayload>(payload: T): T {
  return {
    ...payload,
    email: normalizeEmail(payload.email),
  };
}

function timeoutAfter(
  timeoutMs: number
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Auth initialization timed out.")),
      timeoutMs
    );
  });
}

async function fetchMe() {
  return apiFetch<CovenantUser>("/me");
}

function getUserCacheId(user: CovenantUser) {
  return String(user.id || user.email);
}

async function prepareProgressForUser(
  user: CovenantUser,
  syncRemote = true
) {
  const cacheId = getUserCacheId(user);

  await setProgressUser(cacheId);
  await clearLegacyProgressCache();

  if (syncRemote) {
    await syncProgress();
  } else {
    syncProgress().catch(() => undefined);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  busy: false,
  error: null,

  initializeAuth: async () => {
    const attemptId =
      ++authInitializeAttempt;

    const isCurrentAttempt = () =>
      attemptId === authInitializeAttempt;

    const continueUnauthenticated = () => {
      authInitializeAttempt++;
      setAuthToken(null);

      set({
        token: null,
        user: null,
        loading: false,
      });

      clearAuthToken().catch(() => undefined);
      clearProgressUser().catch(() => undefined);
    };

    const initialize = async () => {
      const token = await getStoredAuthToken();

      if (!isCurrentAttempt()) {
        return;
      }

      if (!token) {
        set({ loading: false });
        return;
      }

      setAuthToken(token);
      const user = await fetchMe();

      if (!isCurrentAttempt()) {
        return;
      }

      await prepareProgressForUser(
        user,
        false
      );

      if (!isCurrentAttempt()) {
        return;
      }

      set({
        token,
        user,
        loading: false,
      });
    };

    try {
      await Promise.race([
        initialize(),
        timeoutAfter(AUTH_INITIALIZE_TIMEOUT_MS),
      ]);
    } catch {
      if (isCurrentAttempt()) {
        continueUnauthenticated();
      }
    }
  },

  login: async (payload) => {
    set({ busy: true, error: null });

    try {
      const normalizedPayload = normalizeAuthPayload(payload);
      const tokenResponse = await apiFetch<TokenResponse>("/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify(normalizedPayload),
      });

      await saveAuthToken(tokenResponse.access_token);
      const user = await fetchMe();

      await prepareProgressForUser(user);

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
      const normalizedPayload = normalizeAuthPayload(payload);

      await apiFetch("/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify(normalizedPayload),
      });

      set({
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

  resendVerification: async (payload) => {
    set({ busy: true, error: null });

    try {
      const normalizedPayload = normalizeEmailPayload(payload);

      await apiFetch("/auth/send-verification", {
        method: "POST",
        auth: false,
        body: JSON.stringify(normalizedPayload),
      });

      set({ busy: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not resend verification email",
        busy: false,
      });

      throw error;
    }
  },

  forgotPassword: async (payload) => {
    set({ busy: true, error: null });

    try {
      const normalizedPayload = normalizeEmailPayload(payload);

      await apiFetch("/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: JSON.stringify(normalizedPayload),
      });

      set({ busy: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not send reset instructions",
        busy: false,
      });

      throw error;
    }
  },

  resetPassword: async (payload) => {
    set({ busy: true, error: null });

    try {
      const normalizedPayload = {
        ...payload,
        password: normalizePassword(payload.password),
      };

      await apiFetch("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: JSON.stringify(normalizedPayload),
      });

      set({ busy: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not reset password",
        busy: false,
      });

      throw error;
    }
  },

  deleteAccount: async (password) => {
    set({ busy: true, error: null });

    try {
      await apiFetch("/account", {
        method: "DELETE",
        body: JSON.stringify({
          password: normalizePassword(password),
        }),
      });

      await clearAuthToken();
      await clearProgressUser();

      set({
        token: null,
        user: null,
        busy: false,
        error: null,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not delete account",
        busy: false,
      });

      throw error;
    }
  },

  logout: async () => {
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
