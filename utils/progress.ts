import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiFetch, getStoredAuthToken } from "./api";

const LEGACY_STORAGE_KEY =
  "COVENANT_PROGRESS";

const STORAGE_PREFIX =
  "COVENANT_PROGRESS";

const CURRENT_USER_KEY =
  "COVENANT_PROGRESS_USER";

export interface HabitProgress {
  streak: number;
  completedDays: number;
  lastCompleted: string | null;
  completionDates: string[];
  totalProgress: number;
  sessions: number;
  isPro?: boolean;
}

type ServerProgress = {
  id: number;
  habit_key: string;
  completed_days: number;
  streak: number;
  last_completed: string | null;
  completion_dates?: string[] | string | null;
  total_progress?: number;
  sessions?: number;
  is_pro?: boolean;
  data?: string | null;
};

export type ProgressData = Record<
  string,
  HabitProgress
>;

let lastSyncAt = 0;
let syncRequest: Promise<ProgressData> | null = null;
let currentUserKey: string | null = null;
let currentUserLabel: string | null = null;

function sanitizeUserKey(
  userIdOrEmail: string
) {
  return userIdOrEmail
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_");
}

function getProgressStorageKey(
  userIdOrEmail: string
) {
  return `${STORAGE_PREFIX}:${sanitizeUserKey(userIdOrEmail)}`;
}

async function getActiveStorageKey() {
  if (currentUserKey) {
    return currentUserKey;
  }

  currentUserKey =
    await AsyncStorage.getItem(
      CURRENT_USER_KEY
    );

  return currentUserKey;
}

function parseCompletionDates(
  value: ServerProgress["completion_dates"]
) {
  if (Array.isArray(value)) {
    return value.filter(
      (date): date is string =>
        typeof date === "string"
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(
          (date): date is string =>
            typeof date === "string"
        )
      : [];
  } catch {
    return [];
  }
}

export async function setProgressUser(
  userIdOrEmail: string
) {
  currentUserLabel =
    sanitizeUserKey(userIdOrEmail);
  currentUserKey =
    getProgressStorageKey(
      userIdOrEmail
    );

  lastSyncAt = 0;
  syncRequest = null;

  await AsyncStorage.setItem(
    CURRENT_USER_KEY,
    currentUserKey
  );

}

export async function clearProgressUser() {
  currentUserKey = null;
  currentUserLabel = null;
  lastSyncAt = 0;
  syncRequest = null;

  await AsyncStorage.removeItem(
    CURRENT_USER_KEY
  );
}

function today() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function fromServerProgress(
  progress: ServerProgress
): HabitProgress {
  const completedDays =
    progress.completed_days || 0;

  return {
    streak: progress.streak,
    completedDays,
    lastCompleted: progress.last_completed,
    completionDates:
      parseCompletionDates(
        progress.completion_dates
      ),
    totalProgress:
      progress.total_progress ??
      Math.min(
        Math.round(
          (completedDays / 30) * 100
        ),
        100
      ),
    sessions:
      progress.sessions || 0,
    isPro:
      progress.is_pro,
  };
}

function toServerProgress(
  habit: string,
  progress: HabitProgress
) {
  const normalized =
    normalizeProgress(progress);

  return {
    habit_key: habit,
    streak: normalized.streak,
    completed_days: normalized.completedDays,
    last_completed: normalized.lastCompleted,
    completion_dates:
      normalized.completionDates,
    total_progress:
      normalized.totalProgress,
    sessions:
      normalized.sessions,
  };
}

function emptyProgress(): HabitProgress {
  return {
    streak: 0,
    completedDays: 0,
    lastCompleted: null,
    completionDates: [],
    totalProgress: 0,
    sessions: 0,
  };
}

function normalizeProgress(
  progress: Partial<HabitProgress> | undefined
): HabitProgress {
  const completedDays =
    progress?.completedDays || 0;

  return {
    ...emptyProgress(),
    ...progress,
    completedDays,
    completionDates:
      progress?.completionDates || [],
    totalProgress:
      progress?.totalProgress ??
      Math.min(
        Math.round(
          (completedDays / 30) * 100
        ),
        100
      ),
    sessions:
      progress?.sessions ||
      completedDays,
  };
}

async function withRetry<T>(
  label: string,
  request: () => Promise<T>,
  retries = 1
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 650)
    );

    return withRetry(
      label,
      request,
      retries - 1
    );
  }
}

async function saveLocalProgress(
  progress: ProgressData
) {
  const storageKey =
    await getActiveStorageKey();

  if (!storageKey) {
    return;
  }

  await AsyncStorage.setItem(
    storageKey,
    JSON.stringify(progress)
  );

}

export async function clearLegacyProgressCache() {
  await AsyncStorage.removeItem(
    LEGACY_STORAGE_KEY
  );
}

export async function clearLocalProgress(
  options: { clearUser?: boolean } = {}
) {
  const storageKey =
    await getActiveStorageKey();

  lastSyncAt = 0;
  syncRequest = null;

  if (storageKey) {
    await AsyncStorage.removeItem(
      storageKey
    );
  }

  await clearLegacyProgressCache();

  if (options.clearUser) {
    await clearProgressUser();
  }
}

function shouldUseRemoteProgress(
  local: HabitProgress | undefined,
  remote: HabitProgress
) {
  if (!local) {
    return true;
  }

  return (
    remote.completedDays >=
    local.completedDays
  );
}

async function pushProgressToServer(
  progress: ProgressData
) {
  const entries =
    Object.entries(progress);

  for (const [habit, item] of entries) {
    if (
      item.completedDays <= 0 &&
      item.streak <= 0 &&
      item.sessions <= 0
    ) {
      continue;
    }

    await withRetry(
      `push ${habit}`,
      () =>
        apiFetch<ServerProgress>(
          "/progress/save",
          {
            method: "POST",
            body: JSON.stringify(
              toServerProgress(
                habit,
                item
              )
            ),
          }
        )
    );
  }
}

export async function getLocalProgress(): Promise<ProgressData> {
  const storageKey =
    await getActiveStorageKey();

  if (!storageKey) {
    return {};
  }

  const raw =
    await AsyncStorage.getItem(
      storageKey
    );

  if (!raw) {
    return {};
  }

  try {
    const parsed =
      JSON.parse(raw) as Record<
        string,
        Partial<HabitProgress>
      >;

    return Object.fromEntries(
      Object.entries(parsed).map(
        ([habit, progress]) => [
          habit,
          normalizeProgress(progress),
        ]
      )
    );
  } catch {
    return {};
  }
}

export async function syncProgress() {
  const now = Date.now();

  if (
    syncRequest &&
    now - lastSyncAt < 3000
  ) {
    return syncRequest;
  }

  if (now - lastSyncAt < 3000) {
    return getLocalProgress();
  }

  const token = await getStoredAuthToken();

  if (!token) {
    return getLocalProgress();
  }

  syncRequest = (async () => {
    const remote =
      await withRetry(
        "load remote progress",
        () =>
          apiFetch<ServerProgress[]>(
            "/progress"
          )
      );

    const progress: ProgressData = {};

    for (const item of remote) {
      const remoteProgress =
        fromServerProgress(item);

      if (
        shouldUseRemoteProgress(
          progress[item.habit_key],
          remoteProgress
        )
      ) {
        progress[item.habit_key] =
          remoteProgress;
      }
    }

    await saveLocalProgress(progress);

    lastSyncAt = Date.now();

    return progress;
  })();

  try {
    return await syncRequest;
  } catch {
    return getLocalProgress();
  } finally {
    syncRequest = null;
  }
}

export async function getProgress() {
  return syncProgress();
}

export async function getHabitProgress(
  habit: string
): Promise<HabitProgress> {

  const progress =
    await getProgress();

  return (
    normalizeProgress(progress[habit])
  );
}

export async function completeHabit(
  habit: string
) {

  const progress =
    await getLocalProgress();

  const current =
    normalizeProgress(progress[habit]);

  const currentDate =
    today();

  if (
    current.lastCompleted ===
    currentDate
  ) {
    return current;
  }

  const completionDates =
    current.completionDates || [];

  const updated = {
    streak:
      current.streak + 1,

    completedDays:
      Math.min(
        current.completedDays + 1,
        30
      ),

    lastCompleted:
      currentDate,

    completionDates:
      completionDates.includes(
        currentDate
      )
        ? completionDates
        : [
            ...completionDates,
            currentDate,
          ],

    totalProgress:
      Math.min(
        Math.round(
          ((current.completedDays + 1) /
            30) *
            100
        ),
        100
      ),

    sessions:
      (current.sessions || 0) + 1,

    isPro:
      current.isPro,
  };

  progress[habit] =
    updated;

  await saveLocalProgress(progress);

  const token = await getStoredAuthToken();

  if (!token) {
    return updated;
  }

  try {
    const remote =
      await withRetry(
        `save ${habit}`,
        () =>
          apiFetch<ServerProgress>(
            "/progress/save",
            {
              method: "POST",
              body: JSON.stringify(
                toServerProgress(
                  habit,
                  updated
                )
              ),
            }
          )
      );

    const synced =
      fromServerProgress(remote);

    progress[habit] = synced;

    await saveLocalProgress(progress);

    return synced;
  } catch {
  }

  return updated;
}
