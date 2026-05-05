/**
 * i18n 設定
 * React Native 多言語対応のための設定ファイル
 */
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import ja from './locales/ja.json';
import en from './locales/en.json';

const resources = {
  ja: {translation: ja},
  en: {translation: en},
};

// デバイスの言語を取得
const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const languageCode = locales[0].languageCode;
    // サポートしている言語のみ返す
    if (languageCode === 'ja' || languageCode === 'en') {
      return languageCode;
    }
  }
  return 'ja'; // デフォルトは日本語
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'ja',
  supportedLngs: ['ja', 'en'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
