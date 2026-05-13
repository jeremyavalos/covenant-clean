import coldShower from '../data/habits/coldShower';
import discipline from '../data/habits/discipline';
import dominateMind from '../data/habits/dominateMind';
import exercise from '../data/habits/exercise';
import gratitude from '../data/habits/gratitude';
import meditation from '../data/habits/meditation';
import mentalStrength from '../data/habits/mentalStrength';
import noVices from '../data/habits/noVices';
import silence from '../data/habits/silence';
import writing from '../data/habits/writing';

import {
  BilingualHabitEntry,
  HabitContentObject,
  HabitEntry,
  localizeHabitEntry,
  parseHabitObject,
} from './parser';

import {
  getLanguage,
  Language,
} from './language';

const parsedHabits:
Record<string, BilingualHabitEntry[]> = {};

const HABIT_DATA:
Record<string, HabitContentObject> = {
  coldShower:
    coldShower as HabitContentObject,

  discipline:
    discipline as HabitContentObject,

  dominateMind:
    dominateMind as HabitContentObject,

  exercise:
    exercise as HabitContentObject,

  gratitude:
    gratitude as HabitContentObject,

  meditation:
    meditation as HabitContentObject,

  mentalStrength:
    mentalStrength as HabitContentObject,

  noVices:
    noVices as HabitContentObject,

  silence:
    silence as HabitContentObject,

  writing:
    writing as HabitContentObject,
};

let selectedLanguage:
Language = 'es';

async function syncSelectedLanguage() {

  selectedLanguage =
    await getLanguage();

}

syncSelectedLanguage();

Object.entries(
  HABIT_DATA
).forEach(([habitKey, habitContent]) => {

  parsedHabits[habitKey] =
    parseHabitObject(
      habitContent
    );

});

function getSelectedLanguage():
Language {

  syncSelectedLanguage();

  return selectedLanguage;

}

function localizeEntries(
  entries: BilingualHabitEntry[]
): HabitEntry[] {

  const language =
    getSelectedLanguage();

  return entries.map((entry) =>
    localizeHabitEntry(
      entry,
      language
    )
  );

}

export function getHabitEntries(
  habitKey: string
): HabitEntry[] {

  return localizeEntries(
    parsedHabits[habitKey] || []
  );

}

export function getHabitEntry(
  habitKey: string,
  day: number,
  period: 'morning' | 'night'
): HabitEntry | null {

  const entries =
    parsedHabits[habitKey] || [];

  const entry =
    entries.find(
      (habitEntry) =>

        habitEntry.day === day &&

        habitEntry.period === period

    );

  return (

    entry
      ? localizeHabitEntry(
        entry,
        getSelectedLanguage()
      )
      : null

  );

}

export function getCurrentPeriod():
'morning' | 'night' {

  const hour =
    new Date().getHours();

  const isNight =
    hour >= 20 || hour <= 4;

  return isNight
    ? 'night'
    : 'morning';

}

export function getTodayHabitEntry(
  habitKey: string,
  currentDay: number
): {
  current: HabitEntry | null;

  morning: HabitEntry | null;

  night: HabitEntry | null;

  period: 'morning' | 'night';
} {

  const period =
    getCurrentPeriod();

  const morning =
    getHabitEntry(
      habitKey,
      currentDay,
      'morning'
    );

  const night =
    getHabitEntry(
      habitKey,
      currentDay,
      'night'
    );

  return {

    current:
      period === 'night'
        ? night
        : morning,

    morning,

    night,

    period,

  };

}
