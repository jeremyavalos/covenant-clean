import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language =
  | 'es'
  | 'en';

const LANGUAGE_KEY =
  'covenant_language';

export async function saveLanguage(
  language: Language
) {

  try {

    await AsyncStorage.setItem(
      LANGUAGE_KEY,
      language
    );

  } catch {

  }

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
