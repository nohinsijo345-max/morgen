import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Return default values if context is not available
  if (!context) {
    return {
      isDarkMode: true,
      toggleTheme: () => {},
      colors: {
        primary: '#4CAF50',
        primaryLight: '#81C784',
        primaryDark: '#388E3C',
        background: '#1A1A1A',
        surface: '#2D2D2D',
        textPrimary: '#FFFFFF',
        textSecondary: '#B0B0B0',
        border: '#404040',
      }
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('morgen-theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem('morgen-theme', isDarkMode ? 'dark' : 'light');
    // Update document class for global styling
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Color palette based on the design reference
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Dark Theme Colors (from the reference image)
      background: '#0d1117',
      backgroundSecondary: '#161b22',
      backgroundCard: '#1c2128',
      backgroundCardHover: '#21262d',
      surface: '#21262d',
      surfaceHover: '#30363d',
      border: '#30363d',
      borderLight: '#21262d',
      
      // Text colors
      textPrimary: '#f0f6fc',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      
      // Green accent colors (must have)
      primary: '#22c55e',
      primaryHover: '#16a34a',
      primaryLight: '#22c55e20',
      primaryDark: '#15803d',
      accent: '#10b981',
      accentLight: '#10b98120',
      
      // Status colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Card specific
      cardGradientFrom: '#1c2128',
      cardGradientTo: '#161b22',
      cardBorder: '#30363d',
      cardBackground: 'rgba(28, 33, 40, 0.9)',
      
      // Header
      headerBg: '#161b22',
      headerBorder: '#30363d',
      
      // Sidebar
      sidebarBg: '#0d1117',
      sidebarBorder: '#21262d',
      sidebarActive: '#22c55e20',
      
      // Button
      buttonPrimary: '#22c55e',
      buttonPrimaryHover: '#16a34a',
      buttonSecondary: '#21262d',
      buttonSecondaryHover: '#30363d',
    } : {
      // Light Theme Colors
      background: '#f8fafc',
      backgroundSecondary: '#ffffff',
      backgroundCard: '#ffffff',
      backgroundCardHover: '#f1f5f9',
      surface: '#f1f5f9',
      surfaceHover: '#e2e8f0',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      
      // Text colors
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      
      // Green accent colors (must have)
      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryLight: '#22c55e15',
      primaryDark: '#166534',
      accent: '#059669',
      accentLight: '#10b98115',
      
      // Status colors
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
      
      // Card specific
      cardGradientFrom: '#ffffff',
      cardGradientTo: '#f8fafc',
      cardBorder: '#e2e8f0',
      cardBackground: 'rgba(255, 255, 255, 0.95)',
      
      // Header
      headerBg: '#ffffff',
      headerBorder: '#e2e8f0',
      
      // Sidebar
      sidebarBg: '#ffffff',
      sidebarBorder: '#e2e8f0',
      sidebarActive: '#22c55e15',
      
      // Button
      buttonPrimary: '#16a34a',
      buttonPrimaryHover: '#15803d',
      buttonSecondary: '#f1f5f9',
      buttonSecondaryHover: '#e2e8f0',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;