import { useState, useEffect, useCallback } from 'react';
import translateService from '../services/translateService';

/**
 * Hook for live translation using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (optional, uses current language)
 * @param {boolean} enabled - Whether translation is enabled
 * @returns {object} - { translatedText, isTranslating, error, translate }
 */
export const useLiveTranslation = (text, targetLanguage = null, enabled = true) => {
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translate = useCallback(async (textToTranslate = text, target = targetLanguage) => {
    if (!enabled || !textToTranslate) {
      setTranslatedText(textToTranslate);
      return textToTranslate;
    }

    const currentLang = target || translateService.getCurrentLanguage();
    
    // If target language is English, return original text
    if (currentLang === 'en') {
      setTranslatedText(textToTranslate);
      return textToTranslate;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateService.translateText(textToTranslate, currentLang);
      setTranslatedText(result);
      return result;
    } catch (err) {
      setError(err.message);
      setTranslatedText(textToTranslate); // Fallback to original text
      return textToTranslate;
    } finally {
      setIsTranslating(false);
    }
  }, [text, targetLanguage, enabled]);

  useEffect(() => {
    if (enabled && text) {
      translate();
    }
  }, [text, targetLanguage, enabled, translate]);

  return {
    translatedText,
    isTranslating,
    error,
    translate
  };
};

/**
 * Hook for translating multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code (optional)
 * @param {boolean} enabled - Whether translation is enabled
 * @returns {object} - { translatedTexts, isTranslating, error, translateAll }
 */
export const useLiveTranslationBatch = (texts, targetLanguage = null, enabled = true) => {
  const [translatedTexts, setTranslatedTexts] = useState(texts);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translateAll = useCallback(async (textsToTranslate = texts, target = targetLanguage) => {
    if (!enabled || !Array.isArray(textsToTranslate)) {
      setTranslatedTexts(textsToTranslate);
      return textsToTranslate;
    }

    const currentLang = target || translateService.getCurrentLanguage();
    
    // If target language is English, return original texts
    if (currentLang === 'en') {
      setTranslatedTexts(textsToTranslate);
      return textsToTranslate;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const results = await translateService.translateMultiple(textsToTranslate, currentLang);
      setTranslatedTexts(results);
      return results;
    } catch (err) {
      setError(err.message);
      setTranslatedTexts(textsToTranslate); // Fallback to original texts
      return textsToTranslate;
    } finally {
      setIsTranslating(false);
    }
  }, [texts, targetLanguage, enabled]);

  useEffect(() => {
    if (enabled && texts && texts.length > 0) {
      translateAll();
    }
  }, [texts, targetLanguage, enabled, translateAll]);

  return {
    translatedTexts,
    isTranslating,
    error,
    translateAll
  };
};

/**
 * Hook for translating object properties
 * @param {object} obj - Object to translate
 * @param {string[]} fieldsToTranslate - Array of field names to translate
 * @param {string} targetLanguage - Target language code (optional)
 * @param {boolean} enabled - Whether translation is enabled
 * @returns {object} - { translatedObject, isTranslating, error, translateObject }
 */
export const useLiveTranslationObject = (obj, fieldsToTranslate = [], targetLanguage = null, enabled = true) => {
  const [translatedObject, setTranslatedObject] = useState(obj);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translateObject = useCallback(async (objectToTranslate = obj, fields = fieldsToTranslate, target = targetLanguage) => {
    if (!enabled || !objectToTranslate) {
      setTranslatedObject(objectToTranslate);
      return objectToTranslate;
    }

    const currentLang = target || translateService.getCurrentLanguage();
    
    // If target language is English, return original object
    if (currentLang === 'en') {
      setTranslatedObject(objectToTranslate);
      return objectToTranslate;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateService.translateObject(objectToTranslate, fields, currentLang);
      setTranslatedObject(result);
      return result;
    } catch (err) {
      setError(err.message);
      setTranslatedObject(objectToTranslate); // Fallback to original object
      return objectToTranslate;
    } finally {
      setIsTranslating(false);
    }
  }, [obj, fieldsToTranslate, targetLanguage, enabled]);

  useEffect(() => {
    if (enabled && obj) {
      translateObject();
    }
  }, [obj, fieldsToTranslate, targetLanguage, enabled, translateObject]);

  return {
    translatedObject,
    isTranslating,
    error,
    translateObject
  };
};

export default useLiveTranslation;