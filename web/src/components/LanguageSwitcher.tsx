/**
 * LanguageSwitcher - 言語切り替えコンポーネント
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
}) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'ja', label: t('settings.japanese') },
    { code: 'en', label: t('settings.english') },
  ];

  const handleChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  if (variant === 'buttons') {
    return (
      <div className={styles.buttonGroup}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`${styles.button} ${
              i18n.language === lang.code ? styles.active : ''
            }`}
            onClick={() => handleChange(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>{t('settings.language')}</label>
      <select
        value={i18n.language}
        onChange={(e) => handleChange(e.target.value)}
        className={styles.select}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};
