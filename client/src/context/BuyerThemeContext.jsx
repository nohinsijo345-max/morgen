import { createContext, useContext, useState, useEffect } from 'react';

const BuyerThemeContext = createContext();

export const useBuyerTheme = () => {
  const context = useContext(BuyerThemeContext);
  if (!context) {
    throw new Error('useBuyerTheme must be used within a BuyerThemeProvider');
  }
  return context;
};

export const BuyerThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('buyer-theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('buyer-theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Coral/Red Color Palette for Buyers
  const colors = {
    // Primary Colors (Coral/Red Theme)
    primary: isDarkMode ? '#FF6B7A' : '#FF4757',
    primaryLight: isDarkMode ? '#FF8A95' : '#FF6B7A',
    primaryDark: isDarkMode ? '#FF3742' : '#E63946',
    
    // Secondary Colors
    secondary: isDarkMode ? '#FF9AA2' : '#FF8A95',
    accent: isDarkMode ? '#FFB3BA' : '#FFA8B0',
    
    // Background Colors
    background: isDarkMode ? '#1A1A1A' : '#FAFBFC',
    backgroundCard: isDarkMode ? '#2D2D2D' : '#FFFFFF',
    surface: isDarkMode ? '#3A3A3A' : '#F8F9FA',
    
    // Text Colors
    textPrimary: isDarkMode ? '#FFFFFF' : '#2C3E50',
    textSecondary: isDarkMode ? '#B0B0B0' : '#6C757D',
    textMuted: isDarkMode ? '#808080' : '#ADB5BD',
    
    // Border Colors
    border: isDarkMode ? '#404040' : '#E9ECEF',
    cardBorder: isDarkMode ? '#505050' : '#F1F3F4',
    
    // Header Colors
    headerBg: isDarkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    headerBorder: isDarkMode ? '#404040' : '#E9ECEF',
    
    // Status Colors
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    
    // Gradient Colors
    gradientStart: isDarkMode ? '#FF6B7A' : '#FF4757',
    gradientEnd: isDarkMode ? '#FF8A95' : '#FF6B7A',
    
    // Glass Effect Colors
    glassBackground: isDarkMode ? 'rgba(255, 107, 122, 0.1)' : 'rgba(255, 71, 87, 0.05)',
    glassBorder: isDarkMode ? 'rgba(255, 107, 122, 0.2)' : 'rgba(255, 71, 87, 0.15)',
  };

  const value = {
    isDarkMode,
    toggleTheme,
    colors,
  };

  return (
    <BuyerThemeContext.Provider value={value}>
      {children}
    </BuyerThemeContext.Provider>
  );
};

export default BuyerThemeContext;