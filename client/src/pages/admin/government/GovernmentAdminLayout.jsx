import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building, 
  FileText, 
  BarChart3,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Coins
} from 'lucide-react';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminNeumorphicThemeToggle from '../../../components/AdminNeumorphicThemeToggle';

const GovernmentAdminLayout = ({ children, activePage, onNavigate, onLogout, onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode, colors } = useAdminTheme();
  
  // Add government-portal class to body
  useEffect(() => {
    document.body.classList.add('government-portal');
    return () => {
      document.body.classList.remove('government-portal');
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subsidies', label: 'Subsidy Approvals', icon: Coins },
    { id: 'schemes', label: 'Government Schemes', icon: Building },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.accent} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating orbs with purple government theme */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-20 left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#8b5cf615' }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#7c3aed15' }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-30 backdrop-blur-xl border-b shadow-lg transition-colors duration-300"
        style={{ 
          backgroundColor: colors.glassBackground,
          borderColor: colors.glassBorder
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors"
                style={{ color: colors.textPrimary }}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {onBack && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              )}
              
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Government Portal</h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Agricultural Administration</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <AdminNeumorphicThemeToggle size="sm" />

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="rounded-xl px-4 py-2 flex items-center gap-2 transition-all shadow-lg"
                style={{ 
                  backgroundColor: '#8b5cf6', 
                  color: '#ffffff' 
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed lg:sticky top-0 left-0 h-screen w-64 backdrop-blur-xl shadow-xl z-20 pt-20 transition-colors duration-300"
              style={{ 
                backgroundColor: colors.glassBackground,
                borderRight: `1px solid ${colors.glassBorder}`
              }}
            >
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: isActive ? '#8b5cf6' : 'transparent',
                        color: isActive ? '#ffffff' : colors.textSecondary,
                        boxShadow: isActive ? '0 4px 15px #8b5cf640' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = colors.surfaceHover;
                          e.currentTarget.style.color = colors.textPrimary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.textSecondary;
                        }
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default GovernmentAdminLayout;