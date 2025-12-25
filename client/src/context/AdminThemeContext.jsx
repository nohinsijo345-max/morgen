import { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  // Return default values if context is not available
  if (!context) {
    return {
      isDarkMode: true,
      toggleTheme: () => {},
      colors: {
        primary: '#4F46E5',
        primaryLight: '#6366F1',
        primaryDark: '#4338CA',
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

export const AdminThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('morgen-admin-theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem('morgen-admin-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Admin color palette with dark blue tint
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Dark Theme Colors with blue tint
      background: '#0a0f1a',
      backgroundSecondary: '#111827',
      backgroundCard: '#1a2332',
      backgroundCardHover: '#1f2937',
      surface: '#1f2a3c',
      surfaceHover: '#2d3a4f',
      border: '#2d3a4f',
      borderLight: '#1f2a3c',
      
      // Text colors
      textPrimary: '#f0f6fc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      
      // Primary accent - green with blue undertone
      primary: '#14452f',
      primaryHover: '#0f3424',
      primaryLight: '#14452f20',
      primaryDark: '#0a241a',
      
      // Blue accent for admin
      accent: '#3b82f6',
      accentLight: '#3b82f620',
      accentHover: '#2563eb',
      
      // Status colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Card specific
      cardGradientFrom: '#1a2332',
      cardGradientTo: '#111827',
      cardBorder: '#2d3a4f',
      
      // Header
      headerBg: '#111827',
      headerBorder: '#2d3a4f',
      
      // Sidebar
      sidebarBg: '#0a0f1a',
      sidebarBorder: '#1f2a3c',
      sidebarActive: '#14452f30',
      sidebarActiveText: '#22c55e',
      
      // Button
      buttonPrimary: '#14452f',
      buttonPrimaryHover: '#0f3424',
      buttonSecondary: '#1f2a3c',
      buttonSecondaryHover: '#2d3a4f',
      
      // Glass effect
      glassBackground: 'rgba(26, 35, 50, 0.8)',
      glassBorder: 'rgba(45, 58, 79, 0.5)',
    } : {
      // Light Theme Colors with blue tint
      background: '#f0f4f8',
      backgroundSecondary: '#ffffff',
      backgroundCard: '#ffffff',
      backgroundCardHover: '#f1f5f9',
      surface: '#e8f0f8',
      surfaceHover: '#dce8f4',
      border: '#cbd5e1',
      borderLight: '#e2e8f0',
      
      // Text colors
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      
      // Primary accent - green
      primary: '#14452f',
      primaryHover: '#0f3424',
      primaryLight: '#14452f15',
      primaryDark: '#0a241a',
      
      // Blue accent for admin
      accent: '#2563eb',
      accentLight: '#3b82f615',
      accentHover: '#1d4ed8',
      
      // Status colors
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
      
      // Card specific
      cardGradientFrom: '#ffffff',
      cardGradientTo: '#f8fafc',
      cardBorder: '#e2e8f0',
      
      // Header
      headerBg: '#ffffff',
      headerBorder: '#e2e8f0',
      
      // Sidebar
      sidebarBg: '#f8fafc',
      sidebarBorder: '#e2e8f0',
      sidebarActive: '#14452f15',
      sidebarActiveText: '#14452f',
      
      // Button
      buttonPrimary: '#14452f',
      buttonPrimaryHover: '#0f3424',
      buttonSecondary: '#f1f5f9',
      buttonSecondaryHover: '#e2e8f0',
      
      // Glass effect
      glassBackground: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(226, 232, 240, 0.5)',
    }
  };

  return (
    <AdminThemeContext.Provider value={theme}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export default AdminThemeContext;
