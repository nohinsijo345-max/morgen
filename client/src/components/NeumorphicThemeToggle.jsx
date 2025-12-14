import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Highly detailed Neumorphic (Soft UI) Theme Toggle Component
 * Matches the reference images with proper light source from top-left
 */
const NeumorphicThemeToggle = ({ size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Apply dark class to body for page background changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#2d323b';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#E0E5EC';
    }
  }, [isDarkMode]);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 500);
  };

  const sizes = {
    sm: {
      container: 'w-32 h-12',
      knob: 'w-10 h-10',
      text: 'text-xs',
      icon: 'w-4 h-4',
      slideDistance: '5rem' // 32 - 10 - padding = ~5rem
    },
    md: {
      container: 'w-40 h-14',
      knob: 'w-12 h-12',
      text: 'text-sm',
      icon: 'w-5 h-5',
      slideDistance: '6.5rem' // 40 - 12 - padding = ~6.5rem
    },
    lg: {
      container: 'w-48 h-16',
      knob: 'w-14 h-14',
      text: 'text-base',
      icon: 'w-6 h-6',
      slideDistance: '8rem' // 48 - 14 - padding = ~8rem
    }
  };

  const { container, knob, text, icon, slideDistance } = sizes[size] || sizes.md;

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleToggle}
        className={`
          ${container} 
          relative 
          rounded-full 
          p-1 
          transition-all 
          duration-500 
          ease-in-out
          focus:outline-none
          select-none
          ${isDarkMode 
            ? 'bg-[#2d323b]' 
            : 'bg-[#E0E5EC]'
          }
        `}
        style={{
          boxShadow: isDarkMode
            ? 'inset 8px 8px 16px #1a1e24, inset -8px -8px 16px #404752'
            : 'inset 8px 8px 16px #bec3ca, inset -8px -8px 16px #ffffff'
        }}
        disabled={isAnimating}
      >
        {/* Light Mode Text - Left Side */}
        <div 
          className={`
            absolute 
            left-3 
            top-1/2 
            transform 
            -translate-y-1/2 
            ${text} 
            font-bold 
            tracking-wide
            transition-all 
            duration-500 
            ease-in-out
            pointer-events-none
            select-none
            ${isDarkMode 
              ? 'opacity-30 text-[#6b7280]' 
              : 'opacity-100 text-[#8b949e]'
            }
          `}
        >
          LIGHT
        </div>

        {/* Dark Mode Text - Right Side */}
        <div 
          className={`
            absolute 
            right-3 
            top-1/2 
            transform 
            -translate-y-1/2 
            ${text} 
            font-bold 
            tracking-wide
            transition-all 
            duration-500 
            ease-in-out
            pointer-events-none
            select-none
            ${isDarkMode 
              ? 'opacity-100 text-[#9ca3af]' 
              : 'opacity-30 text-[#6b7280]'
            }
          `}
        >
          DARK
        </div>

        {/* Sliding Knob */}
        <div
          className={`
            ${knob}
            rounded-full
            absolute
            top-1
            left-1
            transition-all
            duration-500
            ease-in-out
            flex
            items-center
            justify-center
            ${isDarkMode 
              ? 'bg-[#374151]' 
              : 'bg-[#E0E5EC]'
            }
          `}
          style={{
            transform: isDarkMode 
              ? `translateX(${slideDistance})` 
              : 'translateX(0)',
            boxShadow: isDarkMode
              ? `
                  8px 8px 16px #1a1e24,
                  -8px -8px 16px #4e5562,
                  inset 2px 2px 4px #4e5562,
                  inset -2px -2px 4px #1a1e24
                `
              : `
                  8px 8px 16px #bec3ca,
                  -8px -8px 16px #ffffff,
                  inset 2px 2px 4px #ffffff,
                  inset -2px -2px 4px #bec3ca
                `
          }}
        >
          {/* Icon Container with Smooth Transition */}
          <div className="relative">
            {/* Sun Icon */}
            <Sun 
              className={`
                ${icon} 
                absolute 
                top-1/2 
                left-1/2 
                transform 
                -translate-x-1/2 
                -translate-y-1/2
                transition-all 
                duration-300 
                ease-in-out
                ${isDarkMode 
                  ? 'opacity-0 rotate-90 scale-75' 
                  : 'opacity-100 rotate-0 scale-100'
                }
              `}
              style={{ 
                color: isDarkMode ? '#6b7280' : '#f59e0b',
                strokeWidth: 2.5
              }}
            />
            
            {/* Moon Icon */}
            <Moon 
              className={`
                ${icon} 
                absolute 
                top-1/2 
                left-1/2 
                transform 
                -translate-x-1/2 
                -translate-y-1/2
                transition-all 
                duration-300 
                ease-in-out
                ${isDarkMode 
                  ? 'opacity-100 rotate-0 scale-100' 
                  : 'opacity-0 rotate-90 scale-75'
                }
              `}
              style={{ 
                color: isDarkMode ? '#fbbf24' : '#6b7280',
                strokeWidth: 2.5
              }}
            />
          </div>
        </div>

        {/* Subtle Inner Glow Effect */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            pointer-events-none
            transition-all 
            duration-500 
            ease-in-out
          `}
          style={{
            background: isDarkMode
              ? 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)'
          }}
        />

        {/* Active State Highlight */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            pointer-events-none
            transition-all 
            duration-200 
            ease-in-out
            opacity-0
            hover:opacity-100
          `}
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)'
          }}
        />
      </button>
    </div>
  );
};

export default NeumorphicThemeToggle;