import { Sun, Moon } from 'lucide-react';
import { useBuyerTheme } from '../context/BuyerThemeContext';

const BuyerNeumorphicThemeToggle = ({ size = 'md' }) => {
  const { isDarkMode, toggleTheme, colors } = useBuyerTheme();

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const knobSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const translateX = {
    sm: isDarkMode ? 'translateX(20px)' : 'translateX(0)',
    md: isDarkMode ? 'translateX(24px)' : 'translateX(0)',
    lg: isDarkMode ? 'translateX(28px)' : 'translateX(0)'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} relative rounded-full p-1 transition-all duration-300 shadow-inner hover:scale-105 active:scale-95`}
      style={{
        backgroundColor: isDarkMode ? '#2D2D2D' : '#F0F0F0',
        boxShadow: isDarkMode 
          ? 'inset 2px 2px 5px #1a1a1a, inset -2px -2px 5px #404040'
          : 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
      }}
    >
      <div
        className={`${knobSizes[size]} rounded-full flex items-center justify-center transition-all duration-300`}
        style={{
          backgroundColor: colors.primary,
          boxShadow: isDarkMode
            ? '2px 2px 5px #1a1a1a, -2px -2px 5px #404040'
            : '2px 2px 5px #d1d1d1, -2px -2px 5px #ffffff',
          transform: translateX[size]
        }}
      >
        <div className="transition-transform duration-300">
          {isDarkMode ? (
            <Moon className={`${iconSizes[size]} text-white`} />
          ) : (
            <Sun className={`${iconSizes[size]} text-white`} />
          )}
        </div>
      </div>
    </button>
  );
};

export default BuyerNeumorphicThemeToggle;