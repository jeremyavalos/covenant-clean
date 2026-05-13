import {
  Language,
} from './language';

export type BilingualText = {
  es: string;
  en: string;
};

export type LocalizedText =
  | string
  | BilingualText;

export interface HabitEntry {
  day: number;
  period: 'morning' | 'night';

  quote: string;
  quoteAuthor: string;

  verse: string;
  reference: string;

  evident: string;
  hint: string;
  deep: string;
  reflection: string;
  question?: string;
}

export interface BilingualHabitEntry {
  day: number;
  period: 'morning' | 'night';

  quote: LocalizedText;
  quoteAuthor: LocalizedText;

  verse: LocalizedText;
  reference: LocalizedText;

  evident: LocalizedText;
  hint: LocalizedText;
  deep: LocalizedText;
  reflection: LocalizedText;
  question?: LocalizedText;
}

export type HabitPeriodContent =
  Omit<
    BilingualHabitEntry,
    'day' | 'period'
  >;

export type HabitDayContent = {
  morning?: HabitPeriodContent;
  night?: HabitPeriodContent;
};

export type HabitContentObject =
  Record<string, HabitDayContent>;

export function resolveLocalizedText(
  value: LocalizedText | undefined,
  language: Language
): string {

  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return (
    value[language] ||
    value.es ||
    value.en ||
    ''
  );

}

export function localizeHabitEntry(
  entry: BilingualHabitEntry,
  language: Language
): HabitEntry {

  return {
    day: entry.day,
    period: entry.period,

    quote:
      resolveLocalizedText(
        entry.quote,
        language
      ),

    quoteAuthor:
      resolveLocalizedText(
        entry.quoteAuthor,
        language
      ),

    verse:
      resolveLocalizedText(
        entry.verse,
        language
      ),

    reference:
      resolveLocalizedText(
        entry.reference,
        language
      ),

    evident:
      resolveLocalizedText(
        entry.evident,
        language
      ),

    hint:
      resolveLocalizedText(
        entry.hint,
        language
      ),

    deep:
      resolveLocalizedText(
        entry.deep,
        language
      ),

    reflection:
      resolveLocalizedText(
        entry.reflection,
        language
      ),

    question:
      resolveLocalizedText(
        entry.question,
        language
      ),
  };

}

export function parseHabitObject(
  raw: HabitContentObject
): BilingualHabitEntry[] {

  const entries:
  BilingualHabitEntry[] = [];

  Object.entries(raw).forEach(
    ([dayKey, dayContent]) => {

      const dayMatch =
        dayKey.match(/^day(\d+)$/i);

      if (!dayMatch) return;

      const day =
        parseInt(
          dayMatch[1],
          10
        );

      ([
        'morning',
        'night',
      ] as const).forEach((period) => {

        const periodContent =
          dayContent[period];

        if (!periodContent) return;

        entries.push({
          day,
          period,

          quote:
            periodContent.quote,

          quoteAuthor:
            periodContent.quoteAuthor,

          verse:
            periodContent.verse,

          reference:
            periodContent.reference,

          evident:
            periodContent.evident,

          hint:
            periodContent.hint,

          deep:
            periodContent.deep,

          reflection:
            periodContent.reflection,

          question:
            periodContent.question,
        });

      });

    }
  );

  return entries;
}

export function parseHabitContent(raw: string): HabitEntry[] {
  const entries: HabitEntry[] = [];

  const sections = raw.split('# DAY').slice(1);

  sections.forEach((section) => {
    const lines = section
      .split('\n')
      .map((line) => line.trim());

    const header = lines[0];

    const dayMatch = header.match(/(\d+)\s*-\s*(MORNING|NIGHT)/i);

    if (!dayMatch) return;

    const day = parseInt(dayMatch[1], 10);

    const period =
      dayMatch[2].toLowerCase() === 'morning'
        ? 'morning'
        : 'night';

    const getValue = (key: string) => {
      const index = lines.findIndex((line) =>
        line.toLowerCase() === `${key.toLowerCase()}:`
      );

      if (index === -1) return '';

      return lines[index + 1] || '';
    };

    entries.push({
      day,
      period,

      quote: getValue('quote'),
      quoteAuthor: getValue('quoteAuthor'),

      verse: getValue('verse'),
      reference: getValue('reference'),

      evident: getValue('evident'),
      hint: getValue('hint'),
      deep: getValue('deep'),
      reflection: getValue('reflection'),
      question: getValue('question'),
    });
  });

  return entries;
}
