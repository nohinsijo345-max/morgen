import { useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import translateService from '../services/translateService';

/**
 * Hook for live page translation functionality
 * Provides methods to translate entire page content in real-time
 */
export const useLivePageTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('idle'); // idle, translating, success, error
  const [lastTranslated, setLastTranslated] = useState(null);
  const [translatedCount, setTranslatedCount] = useState(0);
  const { language } = useLanguage();

  /**
   * Translate all visible text content on the current page
   */
  const translatePage = useCallback(async () => {
    console.log('🔄 translatePage called with language:', language);
    
    if (language === 'en') {
      console.log('⚠️ English selected, no translation needed');
      setTranslationStatus('success');
      setTimeout(() => setTranslationStatus('idle'), 2000);
      return { success: true, message: 'English is already selected', count: 0 };
    }

    setIsTranslating(true);
    setTranslationStatus('translating');
    setTranslatedCount(0);

    try {
      // Get all text elements that might need translation - Enhanced detection
      const textSelectors = [
        'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'button:not(.google-translate-button button)', 
        'label', 'a', 'td', 'th', 'li', 'div',
        '[data-translatable="true"]',
        // Additional selectors for better coverage
        '.text-sm', '.text-xs', '.text-lg', '.text-xl',
        '.font-medium', '.font-semibold', '.font-bold',
        '[class*="text-"]', // Any element with text-related classes
        'input[placeholder]', 'textarea[placeholder]' // Placeholder text
      ];

      const textElements = document.querySelectorAll(textSelectors.join(', '));
      const textsToTranslate = [];
      const elementsMap = new Map();

      console.log(`🔍 Found ${textElements.length} potential elements to check`);

      // Enhanced filter and collect translatable text
      textElements.forEach((element) => {
        let text = '';
        
        // Handle different types of text content
        if (element.tagName === 'INPUT' && element.placeholder) {
          text = element.placeholder.trim();
        } else if (element.tagName === 'TEXTAREA' && element.placeholder) {
          text = element.placeholder.trim();
        } else {
          text = element.textContent?.trim();
        }
        
        // Skip if:
        // - No text or too short
        // - Only numbers/symbols/dates
        // - Already translated
        // - In excluded areas
        if (!text || 
            text.length < 1 || // Reduced minimum length to catch more text
            /^[\d\s°%:.,/-]+$/.test(text) || // Skip numbers, dates, percentages
            element.hasAttribute('data-translated') ||
            element.closest('[data-no-translate]') ||
            element.closest('.language-selector') ||
            element.closest('.google-translate-button')) {
          return;
        }

        // Enhanced parent-child duplication check
        const allowedParentTags = ['BUTTON', 'A', 'LABEL', 'TH', 'TD', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        const hasTextChildren = Array.from(element.children).some(child => {
          const childText = child.textContent?.trim();
          return childText && childText.length > 1 && /[a-zA-Z]/.test(childText);
        });
        
        if (hasTextChildren && element.children.length > 0 && !allowedParentTags.includes(element.tagName)) {
          return;
        }

        // Enhanced English text detection
        if (!/[a-zA-Z]/.test(text)) return;

        // Skip very common UI elements that shouldn't be translated
        const skipTexts = ['GT', 'OK', 'ID', 'API', 'URL', 'HTTP', 'CSS', 'JS', 'USD', 'INR', 'KG', 'GM', 'AQI', 'UV'];
        if (skipTexts.includes(text.toUpperCase())) return;

        // Enhanced English detection - more comprehensive word list and patterns
        const englishWords = [
          'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
          'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
          'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
          'this', 'that', 'these', 'those', 'a', 'an', 'some', 'any', 'all', 'no', 'not',
          'you', 'your', 'we', 'our', 'they', 'their', 'he', 'his', 'she', 'her', 'it', 'its',
          'from', 'up', 'out', 'down', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
          'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom',
          'more', 'most', 'other', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
          'just', 'now', 'each', 'few', 'many', 'much', 'new', 'old', 'first', 'last', 'long',
          'good', 'great', 'little', 'right', 'big', 'high', 'different', 'small', 'large',
          'next', 'early', 'young', 'important', 'public', 'bad', 'same', 'able'
        ];
        
        const hasEnglishWords = englishWords.some(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'i');
          return regex.test(text);
        });
        
        // Specific crop names and farming terms
        const cropNames = ['Rice', 'Wheat', 'Coffee', 'Corn', 'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato', 'Chili'];
        const isCropName = cropNames.some(crop => text.toLowerCase().includes(crop.toLowerCase()));
        
        // Weather conditions
        const weatherTerms = ['Mist', 'Fog', 'Haze', 'Drizzle', 'Showers', 'Thunderstorm', 'Snow', 'Sleet', 'Partly Cloudy', 'Mostly Cloudy', 'Overcast', 'Clear Sky', 'Fair'];
        const isWeatherTerm = weatherTerms.some(term => text.toLowerCase().includes(term.toLowerCase()));
        
        // Dashboard terms
        const dashboardTerms = ['Leaderboard', 'Top performers', 'No sales data yet', 'Track your crops', 'Unable to fetch live data'];
        const isDashboardTerm = dashboardTerms.some(term => text.toLowerCase().includes(term.toLowerCase()));
        
        // More flexible English text detection
        const isLikelyEnglish = hasEnglishWords || 
                               isCropName ||
                               isWeatherTerm ||
                               isDashboardTerm ||
                               /^[a-zA-Z\s\-'.,!?()]+$/.test(text) ||
                               /\b(Loading|Error|Success|Warning|Information|Home|Back|Close|Save|Cancel|Submit|Delete|Edit|View|Search|Filter|Refresh|Try|Again|Retry|Failed|Please|Update|Data|Available|Expected|Recommended|Conditions|Today|Yesterday|Tomorrow|Morning|Evening|Night|Day|Week|Month|Year|High|Low|Moderate|Current|Next|Last|First|Second|Third|New|Old|Good|Bad|Best|Better|Worse|More|Less|All|None|Some|Any|Every|Each|Other|Another|Same|Different|Big|Small|Large|Little|Long|Short|Fast|Slow|Hot|Cold|Warm|Cool|Dry|Wet|Light|Dark|Bright|Clear|Cloudy|Sunny|Rainy|Windy|Calm|Strong|Weak|Heavy|Light|Full|Empty|Open|Closed|Start|Stop|Begin|End|Finish|Complete|Continue|Pause|Play|Record|Live|Dead|Active|Inactive|Online|Offline|Connected|Disconnected|Available|Unavailable|Ready|Busy|Free|Paid|Premium|Basic|Standard|Advanced|Simple|Complex|Easy|Hard|Quick|Slow|Fast|Instant|Immediate|Delayed|Pending|Processing|Complete|Incomplete|Successful|Failed|Cancelled|Approved|Rejected|Accepted|Declined|Confirmed|Unconfirmed|Valid|Invalid|Correct|Incorrect|True|False|Yes|No|Maybe|Perhaps|Probably|Definitely|Certainly|Possibly|Likely|Unlikely|Sure|Unsure|Known|Unknown|Public|Private|Personal|Professional|Business|Commercial|Industrial|Agricultural|Medical|Educational|Scientific|Technical|Manual|Automatic|Digital|Analog|Electronic|Mechanical|Chemical|Physical|Biological|Natural|Artificial|Real|Virtual|Actual|Potential|Possible|Impossible|Probable|Improbable|Certain|Uncertain|Definite|Indefinite|Specific|General|Particular|Universal|Individual|Collective|Single|Multiple|Unique|Common|Rare|Frequent|Occasional|Regular|Irregular|Normal|Abnormal|Standard|Custom|Default|Optional|Required|Mandatory|Voluntary|Automatic|Manual|Semi|Auto|Full|Partial|Half|Quarter|Third|Double|Triple|Quadruple|Primary|Secondary|Tertiary|Main|Sub|Super|Ultra|Extra|Over|Under|Pre|Post|Anti|Pro|Multi|Uni|Bi|Tri|Quad|Penta|Hexa|Hepta|Octa|Nona|Deca|Rice|Wheat|Coffee|Corn|Cotton|Sugarcane|Tomato|Onion|Potato|Chili|Leaderboard|Mist|Fog|Haze|Drizzle|Showers|Thunderstorm|Snow|Sleet|Unable|fetch|live|data|showing|estimated|prices|based|typical|market|rates|performers|sales|track|crops)\b/i.test(text);

        if (isLikelyEnglish) {
          textsToTranslate.push(text);
          if (!elementsMap.has(text)) {
            elementsMap.set(text, []);
          }
          elementsMap.get(text).push(element);
        }
      });

      console.log(`📝 Collected ${textsToTranslate.length} unique texts to translate:`, textsToTranslate.slice(0, 10));

      if (textsToTranslate.length === 0) {
        setTranslationStatus('success');
        setLastTranslated(new Date());
        return { success: true, message: 'No content to translate', count: 0 };
      }

      console.log(`🔄 Starting live translation for ${textsToTranslate.length} unique texts`);

      // Translate in batches for better performance
      const batchSize = 10; // Reduced batch size for better reliability
      const batches = [];
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        batches.push(textsToTranslate.slice(i, i + batchSize));
      }

      let totalTranslated = 0;
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        try {
          const translatedBatch = await translateService.translateMultiple(batch, language);
          
          batch.forEach((originalText, index) => {
            const translatedText = translatedBatch[index];
            const elements = elementsMap.get(originalText);
            
            if (elements && translatedText && translatedText !== originalText) {
              elements.forEach((element) => {
                // Double-check the element still contains the original text
                if (element.textContent?.trim() === originalText) {
                  element.textContent = translatedText;
                  element.setAttribute('data-translated', 'true');
                  element.setAttribute('data-original-text', originalText);
                  element.setAttribute('data-translated-to', language);
                  totalTranslated++;
                }
              });
            }
          });

          // Update progress
          setTranslatedCount(totalTranslated);
          
          // Small delay between batches to avoid overwhelming the API
          if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
          }
          
        } catch (batchError) {
          console.warn(`Batch ${batchIndex + 1} translation failed:`, batchError);
          // Continue with next batch even if one fails
        }
      }

      // Second pass: Enhanced detection for dynamic content
      setTimeout(async () => {
        console.log('🔄 Second pass translation for dynamic content...');
        const remainingElements = document.querySelectorAll('*:not([data-translated])');
        const remainingTexts = [];
        const remainingMap = new Map();

        remainingElements.forEach((element) => {
          let text = '';
          
          // Handle different types of text content
          if (element.tagName === 'INPUT' && element.placeholder) {
            text = element.placeholder.trim();
          } else if (element.tagName === 'TEXTAREA' && element.placeholder) {
            text = element.placeholder.trim();
          } else {
            text = element.textContent?.trim();
          }
          
          if (text && 
              text.length > 0 && // Even single characters might be important
              /[a-zA-Z]/.test(text) && 
              !element.closest('[data-no-translate]') &&
              !element.children.length &&
              !element.closest('.language-selector') &&
              !element.closest('.google-translate-button')) {
            
            // Enhanced English detection for second pass
            const commonEnglishPatterns = [
              /\b(Loading|Error|Success|Warning|Information|Home|Back|Close|Save|Cancel|Submit|Delete|Edit|View|Search|Filter|Refresh|Try|Again|Retry|Failed|Please|Update|Data|Available|Expected|Recommended|Conditions|Today|Yesterday|Tomorrow|Morning|Evening|Night|Day|Week|Month|Year|High|Low|Moderate|Current|Next|Last|First|Second|Third|New|Old|Good|Bad|Best|Better|Worse|More|Less|All|None|Some|Any|Every|Each|Other|Another|Same|Different)\b/i,
              /\b(the|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|be|been|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|this|that|these|those|a|an|some|any|all|no|not|you|your|we|our|they|their|he|his|she|her|it|its)\b/i,
              /\b(Rice|Wheat|Coffee|Corn|Cotton|Sugarcane|Tomato|Onion|Potato|Chili)\b/i,
              /\b(Leaderboard|Top|performers|No|sales|data|yet|Track|your|crops)\b/i,
              /\b(Unable|fetch|live|data|showing|estimated|prices|based|typical|market|rates)\b/i,
              /\b(Mist|Fog|Haze|Drizzle|Showers|Thunderstorm|Snow|Sleet|Partly|Cloudy|Mostly|Overcast|Clear|Sky|Fair)\b/i,
              /^[a-zA-Z\s\-'.,!?()]+$/
            ];
            
            const isLikelyEnglish = commonEnglishPatterns.some(pattern => pattern.test(text));
            
            if (isLikelyEnglish) {
              remainingTexts.push(text);
              if (!remainingMap.has(text)) {
                remainingMap.set(text, []);
              }
              remainingMap.get(text).push(element);
            }
          }
        });

        if (remainingTexts.length > 0) {
          console.log(`🔄 Found ${remainingTexts.length} additional texts to translate:`, remainingTexts.slice(0, 10));
          try {
            // Process in smaller batches for better reliability
            const batchSize = 5;
            for (let i = 0; i < remainingTexts.length && i < 50; i += batchSize) {
              const batch = remainingTexts.slice(i, i + batchSize);
              const translatedBatch = await translateService.translateMultiple(batch, language);
              
              batch.forEach((originalText, index) => {
                const translatedText = translatedBatch[index];
                const elements = remainingMap.get(originalText);
                
                if (elements && translatedText && translatedText !== originalText) {
                  elements.forEach((element) => {
                    if (element.tagName === 'INPUT' && element.placeholder === originalText) {
                      element.placeholder = translatedText;
                      element.setAttribute('data-translated', 'true');
                      element.setAttribute('data-original-text', originalText);
                      element.setAttribute('data-translated-to', language);
                      totalTranslated++;
                    } else if (element.tagName === 'TEXTAREA' && element.placeholder === originalText) {
                      element.placeholder = translatedText;
                      element.setAttribute('data-translated', 'true');
                      element.setAttribute('data-original-text', originalText);
                      element.setAttribute('data-translated-to', language);
                      totalTranslated++;
                    } else if (element.textContent?.trim() === originalText) {
                      element.textContent = translatedText;
                      element.setAttribute('data-translated', 'true');
                      element.setAttribute('data-original-text', originalText);
                      element.setAttribute('data-translated-to', language);
                      totalTranslated++;
                    }
                  });
                }
              });
              
              // Small delay between batches
              if (i + batchSize < remainingTexts.length && i + batchSize < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
            
            setTranslatedCount(totalTranslated);
          } catch (error) {
            console.warn('Second pass translation failed:', error);
          }
        }
      }, 1000); // Wait 1 second for dynamic content to load

      console.log(`✅ Live translation completed: ${totalTranslated} elements translated`);
      
      setTranslationStatus('success');
      setLastTranslated(new Date());
      setTranslatedCount(totalTranslated);

      return { 
        success: true, 
        message: `Translated ${totalTranslated} elements`, 
        count: totalTranslated 
      };

    } catch (error) {
      console.error('❌ Live translation failed:', error);
      setTranslationStatus('error');
      return { 
        success: false, 
        message: 'Translation failed', 
        error: error.message 
      };
    } finally {
      setIsTranslating(false);
      // Reset status after 5 seconds
      setTimeout(() => {
        setTranslationStatus('idle');
        setTranslatedCount(0);
      }, 5000);
    }
  }, [language]);

  /**
   * Reset translation status and clear translated elements
   */
  const resetTranslation = useCallback(() => {
    // Find all translated elements and restore original text
    const translatedElements = document.querySelectorAll('[data-translated="true"]');
    translatedElements.forEach(element => {
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        // Handle different types of elements
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
          element.placeholder = originalText;
        } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('placeholder')) {
          element.placeholder = originalText;
        } else {
          element.textContent = originalText;
        }
      }
      element.removeAttribute('data-translated');
      element.removeAttribute('data-original-text');
      element.removeAttribute('data-translated-to');
    });

    setTranslationStatus('idle');
    setLastTranslated(null);
    setTranslatedCount(0);
  }, []);

  /**
   * Check if current page has translated content
   */
  const hasTranslatedContent = useCallback(() => {
    return document.querySelectorAll('[data-translated="true"]').length > 0;
  }, []);

  return {
    translatePage,
    resetTranslation,
    hasTranslatedContent,
    isTranslating,
    translationStatus,
    lastTranslated,
    translatedCount,
    canTranslate: language !== 'en'
  };
};

export default useLivePageTranslation;