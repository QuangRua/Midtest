import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import en from './en';
import vi from './vi';

const translations = { en, vi };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en'); // Default to English per requirement 4.5
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (stored && (stored === 'en' || stored === 'vi')) {
        setLocale(stored);
      }
    } catch (e) {
      console.warn('Failed to load stored language', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const changeLanguage = async (newLocale) => {
    if (newLocale !== 'en' && newLocale !== 'vi') return;
    setLocale(newLocale);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLocale);
    } catch (e) {
      console.warn('Failed to persist language', e);
    }
  };

  const toggleLanguage = () => {
    const next = locale === 'en' ? 'vi' : 'en';
    changeLanguage(next);
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLanguage, toggleLanguage, t, isLoaded }}>
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
