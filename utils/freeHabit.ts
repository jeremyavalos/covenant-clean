import AsyncStorage from "@react-native-async-storage/async-storage";

const LEGACY_FREE_HABIT_KEY =
  "COVENANT_FREE_HABIT_ACCESS";

const SELECTED_FREE_HABIT_PREFIX =
  "COVENANT_SELECTED_FREE_HABIT";

type LegacyFreeHabitAccess = {
  slug?: string;
};

function sanitizeUserKey(
  userIdOrEmail: string
) {
  return userIdOrEmail
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_");
}

function getSelectedFreeHabitKey(
  userIdOrEmail: string
) {
  return `${SELECTED_FREE_HABIT_PREFIX}:${sanitizeUserKey(userIdOrEmail)}`;
}

async function readLegacyFreeHabit() {
  const raw = await AsyncStorage.getItem(
    LEGACY_FREE_HABIT_KEY
  );

  if (!raw) {
    return null;
  }

  try {
    const access =
      JSON.parse(raw) as LegacyFreeHabitAccess;

    return typeof access.slug === "string"
      ? access.slug
      : null;
  } catch {
    return null;
  }
}

export async function clearLegacyFreeHabit() {
  await AsyncStorage.removeItem(
    LEGACY_FREE_HABIT_KEY
  );
}

export async function getSelectedFreeHabit(
  userIdOrEmail: string
) {
  const key =
    getSelectedFreeHabitKey(
      userIdOrEmail
    );

  const selectedHabit =
    await AsyncStorage.getItem(key);

  if (selectedHabit) {
    console.log(
      `[Covenant free habit] Loaded selected free habit ${selectedHabit} from ${key}.`
    );

    return selectedHabit;
  }

  const legacyHabit =
    await readLegacyFreeHabit();

  if (legacyHabit) {
    await AsyncStorage.setItem(
      key,
      legacyHabit
    );
    await clearLegacyFreeHabit();

    console.log(
      `[Covenant free habit] Migrated legacy selected free habit ${legacyHabit} into ${key}.`
    );

    return legacyHabit;
  }

  console.log(
    `[Covenant free habit] No selected free habit found for ${key}.`
  );

  return null;
}

export async function saveSelectedFreeHabit(
  userIdOrEmail: string,
  slug: string
) {
  const key =
    getSelectedFreeHabitKey(
      userIdOrEmail
    );

  const existing =
    await AsyncStorage.getItem(key);

  if (existing) {
    console.log(
      `[Covenant free habit] Keeping existing selected free habit ${existing}; attempted ${slug}.`
    );

    return existing;
  }

  await AsyncStorage.setItem(key, slug);
  await clearLegacyFreeHabit();

  console.log(
    `[Covenant free habit] Saved selected free habit ${slug} into ${key}.`
  );

  return slug;
}
