// Translation Service for live translation using Google Translate API
import axios from 'axios';

class TranslateService {
  constructor() {
    this.cache = new Map();
    this.supportedLanguages = {
      'en': 'English',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'ml': 'Malayalam',
      'kn': 'Kannada'
    };
  }

  // Get the current language from localStorage
  getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
  }

  // Check if translation is needed
  needsTranslation(targetLanguage = null) {
    const currentLang = targetLanguage || this.getCurrentLanguage();
    return currentLang !== 'en';
  }

  // Create cache key
  getCacheKey(text, targetLanguage) {
    return `${text}_${targetLanguage}`;
  }

  // Translate text using Google Translate API through backend
  async translateText(text, targetLanguage = null) {
    const target = targetLanguage || this.getCurrentLanguage();
    
    // Return original text if target is English or same as source
    if (target === 'en' || !text || typeof text !== 'string') {
      return text;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, target);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.post(`${API_URL}/api/translate`, {
        text: text,
        targetLanguage: target,
        sourceLanguage: 'en'
      });

      const translatedText = response.data.translatedText || text;
      
      // Cache the result
      this.cache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.warn('Translation failed, returning original text:', error);
      return text;
    }
  }

  // Translate multiple texts at once
  async translateMultiple(texts, targetLanguage = null) {
    const target = targetLanguage || this.getCurrentLanguage();
    
    if (target === 'en' || !Array.isArray(texts)) {
      return texts;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.post(`${API_URL}/api/translate/batch`, {
        texts: texts,
        targetLanguage: target,
        sourceLanguage: 'en'
      });

      const translatedTexts = response.data.translatedTexts || texts;
      
      // Cache the results
      texts.forEach((text, index) => {
        if (translatedTexts[index]) {
          const cacheKey = this.getCacheKey(text, target);
          this.cache.set(cacheKey, translatedTexts[index]);
        }
      });
      
      return translatedTexts;
    } catch (error) {
      console.warn('Batch translation failed, returning original texts:', error);
      return texts;
    }
  }

  // Translate object properties
  async translateObject(obj, fieldsToTranslate = [], targetLanguage = null) {
    const target = targetLanguage || this.getCurrentLanguage();
    
    if (target === 'en' || !obj || typeof obj !== 'object') {
      return obj;
    }

    const translatedObj = { ...obj };
    
    for (const field of fieldsToTranslate) {
      if (obj[field] && typeof obj[field] === 'string') {
        translatedObj[field] = await this.translateText(obj[field], target);
      }
    }

    return translatedObj;
  }

  // Clear translation cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Language code mapping for Google Translate
  getGoogleLanguageCode(langCode) {
    const mapping = {
      'en': 'en',
      'hi': 'hi',
      'te': 'te',
      'ta': 'ta',
      'ml': 'ml',
      'kn': 'kn'
    };
    return mapping[langCode] || 'en';
  }
}

// Create singleton instance
const translateService = new TranslateService();

export default translateService;

// Export individual methods for convenience
export const {
  translateText,
  translateMultiple,
  translateObject,
  needsTranslation,
  getCurrentLanguage,
  clearCache,
  getSupportedLanguages
} = translateService;