'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translation } from '../types';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
];

// Import translations
import enTranslations from '../locales/en.json';
import bnTranslations from '../locales/bn.json';

const translations: Record<string, Translation> = {
  en: enTranslations,
  bn: bnTranslations,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    // Load saved language from localStorage
    try {
      const savedLanguage = localStorage.getItem('shekhabo-language');
      if (savedLanguage) {
        const lang = languages.find(l => l.code === savedLanguage);
        if (lang) setCurrentLanguage(lang);
      }
    } catch (error) {
      console.error('Error loading language from localStorage:', error);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('shekhabo-language', language.code);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: Translation | string = translations[currentLanguage.code];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
