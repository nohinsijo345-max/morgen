import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Image, 
  Users, 
  LogOut,
  Menu,
  X,
  MessageSquare,
  UserCog,
  Clock,
  AlertTriangle,
  Truck,
  Headphones,
  ArrowLeft
} from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminNeumorphicThemeToggle from '../../components/AdminNeumorphicThemeToggle';

const AdminLayout = ({ children, activePage, onNavigate, onLogout, onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const { isDarkMode, colors } = useAdminTheme();
  
  // Session timeout settings (in milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  // Add admin-portal class to body to prevent Orkney font
  useEffect(() => {
    document.body.classList.add('admin-portal');
    return () => {
      document.body.classList.remove('admin-portal');
    };
  }, []);

  // Reset session timeout on user activity
  const resetTimeout = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    // Hide warning if showing
    setShowTimeoutWarning(false);
    
    // Set warning timeout (25 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      setTimeoutCountdown(300); // 5 minutes in seconds
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeoutCountdown(prev => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);
    
    // Set logout timeout (30 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    // Clear admin session
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminUser');
    
    // Call parent logout function
    onLogout();
  };

  // Extend session
  const extendSession = () => {
    resetTimeout();
  };

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (Date.now() - lastActivityRef.current > 60000) { // Only reset if more than 1 minute since last activity
        resetTimeout();
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Handle page close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleLogout();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, start a shorter timeout
        setTimeout(() => {
          if (document.hidden) {
            handleLogout();
          }
        }, 5 * 60 * 1000); // 5 minutes when tab is hidden
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'images', label: 'Login Images', icon: Image },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile-requests', label: 'Profile Requests', icon: UserCog },
    { id: 'transport', label: 'Transport', icon: Truck },
    { id: 'customer-support', label: 'Customer Support', icon: Headphones },
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

      {/* Floating orbs with blue tint */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-20 left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${colors.accent}15` }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${colors.primary}15` }}
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
                <img src="/admin-logo.png" alt="Morgen Admin" className="h-10 w-auto rounded-xl shadow-lg" />
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Morgen Admin</h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Management Panel</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Modern Theme Toggle */}
              <AdminNeumorphicThemeToggle size="sm" />

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="rounded-xl px-4 py-2 flex items-center gap-2 transition-all shadow-lg"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: isDarkMode ? '#ffffff' : '#ffffff' 
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
                        backgroundColor: isActive ? colors.primary : 'transparent',
                        color: isActive ? '#ffffff' : colors.textSecondary,
                        boxShadow: isActive ? `0 4px 15px ${colors.primary}40` : 'none'
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

      {/* Session Timeout Warning Modal */}
      <AnimatePresence>
        {showTimeoutWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors duration-300"
              style={{ 
                backgroundColor: colors.backgroundCard,
                border: `1px solid ${colors.error}40`
              }}
            >
              <div className="text-center">
                <div 
                  className="mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: `${colors.error}20` }}
                >
                  <AlertTriangle className="w-8 h-8" style={{ color: colors.error }} />
                </div>
                
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                  Session Timeout Warning
                </h3>
                
                <p className="mb-4" style={{ color: colors.textSecondary }}>
                  Your admin session will expire in:
                </p>
                
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-5 h-5" style={{ color: colors.error }} />
                  <span className="text-2xl font-bold" style={{ color: colors.error }}>
                    {formatTime(timeoutCountdown)}
                  </span>
                </div>
                
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                  Click "Stay Logged In" to extend your session, or you will be automatically logged out for security.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 rounded-xl transition-colors"
                    style={{ 
                      border: `1px solid ${colors.accent}`,
                      color: colors.accent,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Logout Now
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={extendSession}
                    className="flex-1 px-4 py-2 text-white rounded-xl transition-colors"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Stay Logged In
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
