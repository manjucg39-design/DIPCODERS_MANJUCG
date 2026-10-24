import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGES, translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: typeof translations.en;
  availableLanguages: typeof LANGUAGES;
}

const STORAGE_KEY = 'localfix_preferred_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'kn' || saved === 'en' || saved === 'hi' || saved === 'ta' || saved === 'te')) {
        return saved as SupportedLanguage;
      }
    } catch {
      // Fallback
    }
    // Default to Kannada (ಕನ್ನಡ) for Mysuru as requested in prompt!
    return 'kn';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
