import { create } from "zustand";
import {
    getCurrentDay,
    getHonestyScore,
    saveCurrentDay,
    saveHonestyScore,
} from "../utils/storage";

interface AppState {
  currentDay: number;
  honestyScore: number;
  loading: boolean;

  initializeApp: () => Promise<void>;

  setCurrentDay: (day: number) => Promise<void>;

  setHonestyScore: (score: number) => Promise<void>;

  incrementDay: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentDay: 1,
  honestyScore: 50,
  loading: true,

  initializeApp: async () => {
    try {
      const day = await getCurrentDay();
      const honesty = await getHonestyScore();

      set({
        currentDay: day || 1,
        honestyScore: honesty || 50,
        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },

  setCurrentDay: async (day) => {
    try {
      await saveCurrentDay(day);

      set({
        currentDay: day,
      });
    } catch (error) {
      console.log(error);
    }
  },

  setHonestyScore: async (score) => {
    try {
      await saveHonestyScore(score);

      set({
        honestyScore: score,
      });
    } catch (error) {
      console.log(error);
    }
  },

  incrementDay: async () => {
    try {
      const nextDay = get().currentDay + 1;

      await saveCurrentDay(nextDay);

      set({
        currentDay: nextDay,
      });
    } catch (error) {
      console.log(error);
    }
  },
}));