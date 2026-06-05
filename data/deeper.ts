import { getLocalDateKey } from '../utils/dates';
import { getHabitEntries } from '../utils/habitEngine';
import { HabitEntry } from '../utils/parser';

export type DeeperPeriod = 'morning' | 'night';

export type DeeperEntry = HabitEntry;

export const SAFE_DEEPER_ENTRY: DeeperEntry = {
  day: 1,
  period: 'morning',
  quote: 'What is repeated becomes revealed.',
  quoteAuthor: 'Covenant',
  verse: 'Consider the path of your feet.',
  reference: 'Proverbs 4:26',
  evident:
    'The practice reveals what your intention becomes when it meets resistance.',
  hint:
    'Discipline is not proven by intensity, but by the part of you that returns after negotiation begins.',
  deep:
    'Every habit becomes a mirror. It shows not only what you did, but what still asks to govern you.',
  reflection:
    'Return to one honest action and let it tell the truth without drama.',
  question:
    'What pattern keeps surviving because you still protect it?',
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function withSafeDeeperFields(
  entry: Partial<DeeperEntry> | null | undefined,
  period: DeeperPeriod
): DeeperEntry {
  return {
    ...SAFE_DEEPER_ENTRY,
    ...entry,
    day: entry?.day ?? SAFE_DEEPER_ENTRY.day,
    period,
    quote: entry?.quote || SAFE_DEEPER_ENTRY.quote,
    quoteAuthor: entry?.quoteAuthor || SAFE_DEEPER_ENTRY.quoteAuthor,
    verse: entry?.verse || SAFE_DEEPER_ENTRY.verse,
    reference: entry?.reference || SAFE_DEEPER_ENTRY.reference,
    evident: entry?.evident || SAFE_DEEPER_ENTRY.evident,
    hint: entry?.hint || SAFE_DEEPER_ENTRY.hint,
    deep: entry?.deep || SAFE_DEEPER_ENTRY.deep,
    reflection: entry?.reflection || SAFE_DEEPER_ENTRY.reflection,
    question: entry?.question || SAFE_DEEPER_ENTRY.question,
  };
}

export function getStableDeeperEntry({
  habitSlug,
  requestedDay,
  period,
}: {
  habitSlug: string;
  requestedDay: number;
  period: DeeperPeriod;
}) {
  const entries = getHabitEntries(habitSlug);
  const periodEntries = entries.filter((entry) => entry.period === period);
  const candidates = periodEntries.length > 0 ? periodEntries : entries;

  if (candidates.length === 0) {
    return withSafeDeeperFields(null, period);
  }

  const selector = [
    habitSlug,
    getLocalDateKey(),
    requestedDay,
    period,
  ].join(':');
  const selected = candidates[hashString(selector) % candidates.length];

  return withSafeDeeperFields(selected, period);
}
