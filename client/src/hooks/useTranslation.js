import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../data/translations';
import { useState, useCallback } from 'react';
import translateService from '../services/translateService';

export const useTranslation = () => {
  const { language } = useLanguage();
  const [liveTranslations, setLiveTranslations] = useState({});

  const t = useCallback((key) => {
    // First try to get translation from static translations
    const staticTranslation = getTranslation(language, key);
    
    // If we got a translation (not the key itself), return it
    if (staticTranslation !== key) {
      return staticTranslation;
    }

    // If no static translation found and language is not English, try live translation
    if (language !== 'en' && key !== staticTranslation) {
      // Check if we already have a live translation cached
      const cacheKey = `${key}_${language}`;
      if (liveTranslations[cacheKey]) {
        return liveTranslations[cacheKey];
      }

      // Perform live translation asynchronously
      translateService.translateText(key, language)
        .then(translatedText => {
          if (translatedText !== key) {
            setLiveTranslations(prev => ({
              ...prev,
              [cacheKey]: translatedText
            }));
          }
        })
        .catch(error => {
          console.warn('Live translation failed for key:', key, error);
        });
    }

    // Return the key as fallback (will be replaced by live translation when available)
    return staticTranslation;
  }, [language, liveTranslations]);

  // Function to translate arbitrary text (not just keys)
  const translateText = useCallback(async (text, targetLang = language) => {
    if (targetLang === 'en' || !text) {
      return text;
    }

    try {
      return await translateService.translateText(text, targetLang);
    } catch (error) {
      console.warn('Live text translation failed:', error);
      return text;
    }
  }, [language]);

  // Function to clear live translation cache
  const clearLiveTranslations = useCallback(() => {
    setLiveTranslations({});
    translateService.clearCache();
  }, []);

  return { 
    t, 
    language, 
    translateText, 
    clearLiveTranslations,
    hasLiveTranslations: Object.keys(liveTranslations).length > 0
  };
};
