import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';

/**
 * Highly detailed Neumorphic (Soft UI) Theme Toggle Component - Admin Version
 * Matches the reference images with proper light source from top-left
 */
const AdminNeumorphicThemeToggle = ({ size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useAdminTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Apply dark class to body for page background changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
      document.body.style.backgroundImage = 'none';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.backgroundImage = 'none';
    }
  }, [isDarkMode]);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 500);
  };

  const sizes = {
    sm: {
      container: 'w-24 h-10',
      knob: 'w-8 h-8',
      icon: 'w-4 h-4',
      slideDistance: '4rem'
    },
    md: {
      container: 'w-28 h-12',
      knob: 'w-10 h-10',
      icon: 'w-5 h-5',
      slideDistance: '4.5rem'
    },
    lg: {
      container: 'w-32 h-14',
      knob: 'w-12 h-12',
      icon: 'w-6 h-6',
      slideDistance: '5rem'
    }
  };

  const { container, knob, icon, slideDistance } = sizes[size] || sizes.md;

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
            ? 'bg-[#0a0f1a]' 
            : 'bg-[#f0f4f8]'
          }
        `}
        style={{
          boxShadow: isDarkMode
            ? 'inset 1px 1px 2px rgba(6, 10, 18, 0.2), inset -1px -1px 2px rgba(14, 20, 34, 0.1)'
            : 'inset 1px 1px 2px rgba(209, 217, 224, 0.2), inset -1px -1px 2px rgba(255, 255, 255, 0.6)'
        }}
        disabled={isAnimating}
      >
        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {/* Sun Icon - Left Side */}
          <Sun 
            className={`
              w-4 h-4
              transition-all 
              duration-500 
              ease-in-out
              ${isDarkMode 
                ? 'opacity-30 text-[#64748b]' 
                : 'opacity-70 text-[#3b82f6]'
              }
            `}
            strokeWidth={2}
          />
          
          {/* Moon Icon - Right Side */}
          <Moon 
            className={`
              w-4 h-4
              transition-all 
              duration-500 
              ease-in-out
              ${isDarkMode 
                ? 'opacity-70 text-[#60a5fa]' 
                : 'opacity-30 text-[#64748b]'
              }
            `}
            strokeWidth={2}
          />
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
              ? 'bg-[#1f2937]' 
              : 'bg-[#f0f4f8]'
            }
          `}
          style={{
            transform: isDarkMode 
              ? `translateX(${slideDistance})` 
              : 'translateX(0)',
            boxShadow: isDarkMode
              ? `
                  1px 1px 2px rgba(6, 10, 18, 0.3),
                  -1px -1px 2px rgba(56, 64, 71, 0.15)
                `
              : `
                  1px 1px 2px rgba(209, 217, 224, 0.3),
                  -1px -1px 2px rgba(255, 255, 255, 0.7)
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
                color: isDarkMode ? '#64748b' : '#3b82f6',
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
                color: isDarkMode ? '#60a5fa' : '#64748b',
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
              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
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

export default AdminNeumorphicThemeToggle;