import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Languages, Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLivePageTranslation } from '../hooks/useLivePageTranslation';

const GoogleTranslateButton = ({ size = 'md' }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const {
    translatePage,
    resetTranslation,
    hasTranslatedContent,
    isTranslating,
    translationStatus,
    lastTranslated,
    translatedCount,
    canTranslate
  } = useLivePageTranslation();

  const [showTooltip, setShowTooltip] = useState(false);

  // Reset when language changes
  useEffect(() => {
    if (hasTranslatedContent()) {
      resetTranslation();
    }
  }, [language, hasTranslatedContent, resetTranslation]);

  const handleClick = async () => {
    console.log('🔵 Google Translate button clicked!', { 
      language, 
      canTranslate, 
      translationStatus,
      hasTranslatedContent: hasTranslatedContent()
    });
    
    try {
      if (hasTranslatedContent()) {
        console.log('🔄 Resetting translation...');
        resetTranslation();
      } else {
        console.log('🔄 Starting translation...');
        if (language === 'en') {
          alert('Please select a regional language (Hindi, Telugu, Tamil, etc.) first to enable translation.');
          return;
        }
        const result = await translatePage();
        console.log('✅ Translation result:', result);
      }
    } catch (error) {
      console.error('❌ Translation error:', error);
      alert('Translation failed. Please try again.');
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'w-12 h-10'; // Made wider for visibility
      case 'lg': return 'w-14 h-12';
      default: return 'w-12 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-5 h-5'; // Made larger for visibility
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const getStatusIcon = () => {
    if (isTranslating) {
      return <Loader2 className={`${getIconSize()} animate-spin`} />;
    }
    
    if (hasTranslatedContent()) {
      return <RotateCcw className={getIconSize()} />;
    }

    switch (translationStatus) {
      case 'success':
        return <Check className={`${getIconSize()}`} style={{ color: '#10B981' }} />;
      case 'error':
        return <AlertCircle className={`${getIconSize()}`} style={{ color: '#EF4444' }} />;
      default:
        return <Languages className={getIconSize()} />;
    }
  };

  const getButtonColor = () => {
    if (hasTranslatedContent()) {
      return '#F59E0B'; // Orange for reset
    }
    
    switch (translationStatus) {
      case 'success':
        return '#10B981'; // Green for success
      case 'error':
        return '#EF4444'; // Red for error
      case 'translating':
        return '#3B82F6'; // Blue for translating
      default:
        return '#3B82F6'; // Blue by default
    }
  };

  const getTooltipText = () => {
    if (!canTranslate) {
      return t('selectRegionalLanguage');
    }
    
    if (isTranslating) {
      return `${t('translating')} (${translatedCount} ${t('elementsTranslated')})`;
    }
    
    if (hasTranslatedContent()) {
      return t('restoreOriginalText');
    }
    
    switch (translationStatus) {
      case 'success':
        return lastTranslated 
          ? `${t('translationCompleted')} ${translatedCount} ${t('elementsTranslated')} at ${lastTranslated.toLocaleTimeString()}`
          : t('translationCompleted');
      case 'error':
        return t('translationFailed');
      default:
        return t('translatePageContent');
    }
  };

  return (
    <div 
      className="relative google-translate-button flex items-center gap-2" 
      data-no-translate="true"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={isTranslating}
        className={`${getButtonSize()} rounded-xl transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative border-2 font-bold`}
        style={{
          backgroundColor: getButtonColor(),
          color: '#ffffff',
          zIndex: 10,
          borderColor: '#ffffff',
          opacity: canTranslate ? 1 : 0.6,
          minWidth: '48px',
          minHeight: '40px'
        }}
        title={getTooltipText()}
      >
        {getStatusIcon()}
        
        {/* Progress indicator for translation */}
        {isTranslating && translatedCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-black font-bold">
            {translatedCount}
          </div>
        )}
      </motion.button>

      {/* Text label for visibility */}
      <span 
        className="text-xs font-medium"
        style={{ 
          color: colors.textPrimary,
          opacity: canTranslate ? 1 : 0.6
        }}
      >
        GT
      </span>

      {/* Status indicator dot */}
      {(translationStatus !== 'idle' || hasTranslatedContent()) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
          style={{
            backgroundColor: hasTranslatedContent() ? '#F59E0B' :
                           translationStatus === 'success' ? '#10B981' : 
                           translationStatus === 'error' ? '#EF4444' : colors.primary
          }}
        />
      )}

      {/* Enhanced Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div 
            className="px-3 py-2 text-xs rounded-lg whitespace-nowrap shadow-lg max-w-xs"
            style={{ 
              backgroundColor: colors.surface, 
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="font-medium">{getTooltipText()}</div>
            {!canTranslate && (
              <div className="text-xs opacity-75 mt-1">
                {t('selectRegionalLanguage')}
              </div>
            )}
            {canTranslate && !hasTranslatedContent() && (
              <div className="text-xs opacity-75 mt-1">
                {t('translatesVisibleText')} {language.toUpperCase()}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GoogleTranslateButton;