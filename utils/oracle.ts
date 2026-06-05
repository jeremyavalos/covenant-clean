import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DAILY_NUMBERS,
  DailyNumber,
  MAJOR_ARCANA,
  TarotCard,
} from "../data/oracle";
import { getLocalDateKey } from "./dates";

export type OracleNumberDraw = DailyNumber & {
  date: string;
};

export type OracleTarotDraw = TarotCard & {
  date: string;
};

type StoredNumberDraw = {
  date: string;
  number: number;
};

type StoredTarotDraw = {
  date: string;
  cardId: string;
};

const NUMBER_PREFIX = "dailyNumberDraw";
const TAROT_PREFIX = "dailyTarotDraw";
const ANONYMOUS_ORACLE_USER_KEY = "COVENANT_ORACLE_ANONYMOUS_USER";

const TAROT_WEIGHTS_BY_HABIT: Record<string, string[]> = {
  coldShower: ["strength", "temperance", "chariot"],
  exercise: ["strength", "chariot", "emperor"],
  dominateMind: ["hermit", "justice", "moon"],
  mentalStrength: ["hermit", "justice", "moon"],
  noVices: ["devil", "death", "temperance"],
  writing: ["magician", "high-priestess", "hermit"],
  gratitude: ["star", "sun", "temperance"],
  silence: ["hermit", "moon", "high-priestess"],
  meditation: ["hermit", "moon", "high-priestess"],
  discipline: ["emperor", "justice", "chariot"],
};

function sanitizeUserKey(userIdOrEmail: string) {
  return userIdOrEmail
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_");
}

export async function getOracleUserKey(userIdOrEmail?: string | null) {
  if (userIdOrEmail?.trim()) {
    return userIdOrEmail;
  }

  const existing =
    await AsyncStorage.getItem(ANONYMOUS_ORACLE_USER_KEY);

  if (existing) {
    return existing;
  }

  const anonymousKey =
    `anonymous_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  await AsyncStorage.setItem(
    ANONYMOUS_ORACLE_USER_KEY,
    anonymousKey
  );

  return anonymousKey;
}

function getNumberStorageKey(userIdOrEmail: string, date: string) {
  return `${NUMBER_PREFIX}:${sanitizeUserKey(userIdOrEmail)}:${date}`;
}

function getTarotStorageKey(userIdOrEmail: string, date: string) {
  return `${TAROT_PREFIX}:${sanitizeUserKey(userIdOrEmail)}:${date}`;
}

function parseStoredDraw<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildWeightedTarotPool(habitSlug: string) {
  const weightedIds = TAROT_WEIGHTS_BY_HABIT[habitSlug] ?? [];
  const weightedCards = weightedIds
    .map((id) => MAJOR_ARCANA.find((card) => card.id === id))
    .filter((card): card is TarotCard => Boolean(card));

  return [...MAJOR_ARCANA, ...weightedCards, ...weightedCards];
}

function resolveNumberDraw(
  stored: StoredNumberDraw | OracleNumberDraw | null,
  date: string
): OracleNumberDraw | null {
  if (!stored) {
    return null;
  }

  const number =
    typeof stored.number === "number"
      ? DAILY_NUMBERS.find((item) => item.number === stored.number)
      : null;

  if (!number) {
    return null;
  }

  return {
    ...number,
    date,
  };
}

function resolveTarotDraw(
  stored: StoredTarotDraw | OracleTarotDraw | null,
  date: string
): OracleTarotDraw | null {
  if (!stored) {
    return null;
  }

  const legacyName =
    "name" in stored && typeof stored.name === "string"
      ? stored.name
      : null;

  const card =
    "cardId" in stored
      ? MAJOR_ARCANA.find((item) => item.id === stored.cardId)
      : legacyName
        ? MAJOR_ARCANA.find((item) => item.name.en === legacyName)
        : "id" in stored
          ? MAJOR_ARCANA.find((item) => item.id === stored.id)
          : null;

  if (!card) {
    return null;
  }

  return {
    ...card,
    date,
  };
}

export async function getDailyNumberDraw(
  userIdOrEmail: string,
  date = getLocalDateKey()
) {
  const raw = await AsyncStorage.getItem(
    getNumberStorageKey(userIdOrEmail, date)
  );

  return resolveNumberDraw(
    parseStoredDraw<StoredNumberDraw | OracleNumberDraw>(raw),
    date
  );
}

export async function revealDailyNumberDraw(
  userIdOrEmail: string,
  date = getLocalDateKey()
) {
  const existing = await getDailyNumberDraw(userIdOrEmail, date);

  if (existing) {
    return existing;
  }

  const number = pickRandom(DAILY_NUMBERS);
  const draw: OracleNumberDraw = {
    ...number,
    date,
  };
  const stored: StoredNumberDraw = {
    date,
    number: number.number,
  };

  await AsyncStorage.setItem(
    getNumberStorageKey(userIdOrEmail, date),
    JSON.stringify(stored)
  );

  return draw;
}

export async function getDailyTarotDraw(
  userIdOrEmail: string,
  date = getLocalDateKey()
) {
  const raw = await AsyncStorage.getItem(
    getTarotStorageKey(userIdOrEmail, date)
  );

  return resolveTarotDraw(
    parseStoredDraw<StoredTarotDraw | OracleTarotDraw>(raw),
    date
  );
}

export async function revealDailyTarotDraw(
  userIdOrEmail: string,
  habitSlug: string,
  date = getLocalDateKey()
) {
  const existing = await getDailyTarotDraw(userIdOrEmail, date);

  if (existing) {
    return existing;
  }

  const card = pickRandom(buildWeightedTarotPool(habitSlug));
  const draw: OracleTarotDraw = {
    ...card,
    date,
  };
  const stored: StoredTarotDraw = {
    date,
    cardId: card.id,
  };

  await AsyncStorage.setItem(
    getTarotStorageKey(userIdOrEmail, date),
    JSON.stringify(stored)
  );

  return draw;
}

export function getHabitTarotReflection(
  card: TarotCard,
  habitTitle: string,
  language: "en" | "es"
) {
  if (language === "es") {
    return `${card.todayReflection.es} Deja que ${habitTitle.toLowerCase()} sea el lugar donde este símbolo se practica hoy.`;
  }

  return `${card.todayReflection.en} Let ${habitTitle.toLowerCase()} become the place where this symbol is practiced today.`;
}
