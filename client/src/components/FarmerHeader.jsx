import { motion } from 'framer-motion';
import { LogOut, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import NeumorphicThemeToggle from './NeumorphicThemeToggle';

const FarmerHeader = ({ 
  user, 
  onLogout, 
  title = 'Morgen',
  subtitle = 'Farmer Dashboard',
  showBack = false,
  showHome = false,
  backPath = '/dashboard'
}) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 backdrop-blur-xl border-b shadow-lg sticky top-0"
      style={{
        backgroundColor: isDarkMode ? colors.headerBg : colors.headerBg,
        borderColor: colors.headerBorder
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo/Back */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {showBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(backPath)}
                className="p-2 rounded-xl transition-all"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}

            {/* Home Button */}
            {showHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl transition-all"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary
                }}
              >
                <Home className="w-5 h-5" />
              </motion.button>
            )}

            {/* Logo/Brand */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src="/src/assets/Morgen-logo-main.png" 
                alt="Morgen Logo" 
                className="h-10 w-auto object-contain rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  {title}
                </h1>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {subtitle}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Section - Theme Toggle, User Info & Logout */}
          <div className="flex items-center gap-4">
            {/* Modern Theme Toggle */}
            <NeumorphicThemeToggle size="sm" />

            {/* User Info */}
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {user?.name || 'Farmer'}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {user?.email || 'Loading...'}
                </p>
              </div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="rounded-xl px-4 py-2 flex items-center gap-2 transition-all shadow-lg"
                style={{
                  backgroundColor: colors.primary,
                  color: isDarkMode ? '#0d1117' : '#ffffff'
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-sm">Logout</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default FarmerHeader;