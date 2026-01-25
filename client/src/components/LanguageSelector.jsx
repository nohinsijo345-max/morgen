import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_LANGUAGES } from '../data/languages';
import { useTheme } from '../context/ThemeContext';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const { colors } = useTheme();
  const dropdownRef = useRef(null);

  const currentLang = INDIAN_LANGUAGES.find(lang => lang.code === language) || INDIAN_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          border: `1px solid ${colors.border}`
        }}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLang.nativeName}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            <div 
              className="max-h-96 overflow-y-auto custom-scrollbar"
              style={{
                backgroundColor: colors.surface
              }}
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ backgroundColor: colors.glassBackground }}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full px-4 py-3 flex items-center justify-between transition-all"
                  style={{
                    color: colors.textPrimary,
                    borderBottom: `1px solid ${colors.border}`
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{lang.nativeName}</span>
                    <span className="text-xs" style={{ color: colors.textMuted }}>
                      {lang.name}
                    </span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5" style={{ color: colors.primary }} />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.background};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.primaryHover || colors.primary};
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
