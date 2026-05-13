import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'covenant_progress';
const CURRENT_DAY_KEY = 'covenant_current_day';
const HONESTY_SCORE_KEY = 'covenant_honesty_score';

export interface HabitProgress {
  currentDay: number;
  streak: number;
  completedToday: boolean;
  lastCompletedDate: string | null;
}

export type ProgressMap = Record<
  string,
  HabitProgress
>;

function getTodayDate() {
  return new Date()
    .toISOString()
    .split('T')[0];
}

async function getNumberValue(
  key: string,
  fallback: number
): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(key);
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : fallback;
  } catch (error) {
    console.error('Error loading number value:', error);
    return fallback;
  }
}

async function saveNumberValue(
  key: string,
  value: number
) {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch (error) {
    console.error('Error saving number value:', error);
  }
}

export async function getCurrentDay() {
  return getNumberValue(CURRENT_DAY_KEY, 1);
}

export async function saveCurrentDay(day: number) {
  await saveNumberValue(CURRENT_DAY_KEY, day);
}

export async function getHonestyScore() {
  return getNumberValue(HONESTY_SCORE_KEY, 50);
}

export async function saveHonestyScore(score: number) {
  await saveNumberValue(HONESTY_SCORE_KEY, score);
}

export async function getProgress(): Promise<ProgressMap> {
  try {
    const data = await AsyncStorage.getItem(
      PROGRESS_KEY
    );

    if (!data) {
      return {};
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(
      'Error loading progress:',
      error
    );

    return {};
  }
}

export async function saveProgress(
  progress: ProgressMap
) {
  try {
    await AsyncStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.error(
      'Error saving progress:',
      error
    );
  }
}

export async function getHabitProgress(
  habitKey: string
): Promise<HabitProgress> {
  const progress = await getProgress();

  const current =
    progress[habitKey] || {
      currentDay: 1,
      streak: 0,
      completedToday: false,
      lastCompletedDate: null,
    };

  const today = getTodayDate();

  if (
    current.lastCompletedDate !== today
  ) {
    current.completedToday = false;
  }

  return current;
}

export async function completeHabitDay(
  habitKey: string
) {
  const progress = await getProgress();

  const current =
    progress[habitKey] || {
      currentDay: 1,
      streak: 0,
      completedToday: false,
      lastCompletedDate: null,
    };

  const updated: HabitProgress = {
    currentDay: Math.min(
      current.currentDay + 1,
      30
    ),

    streak: current.streak + 1,

    completedToday: true,

    lastCompletedDate:
      getTodayDate(),
  };

  progress[habitKey] = updated;

  await saveProgress(progress);

  return updated;
}

export async function getAllHabitsProgress() {
  return await getProgress();
}
