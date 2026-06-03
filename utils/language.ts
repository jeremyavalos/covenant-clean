import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language =
  | 'es'
  | 'en';

const LANGUAGE_KEY =
  'covenant_language';

export async function saveLanguage(
  language: Language
) {

  await AsyncStorage.setItem(
    LANGUAGE_KEY,
    language
  );

}

export async function getLanguage():
Promise<Language> {

  try {

    const language =
      await AsyncStorage.getItem(
        LANGUAGE_KEY
      );

    if (
      language === 'en'
    ) {
      return 'en';
    }

    return 'es';

  } catch {

    return 'es';

  }

}

export async function getSavedLanguage():
Promise<Language | null> {

  try {

    const language =
      await AsyncStorage.getItem(
        LANGUAGE_KEY
      );

    if (
      language === 'en' ||
      language === 'es'
    ) {
      return language;
    }

    return null;

  } catch {

    return null;

  }

}
