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

const AdminLayout = ({ children, activePage, onNavigate, onLogout, onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  
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
    <div className="min-h-screen bg-gradient-to-br from-[#D4E7F0] via-[#B8D8E8] to-[#A0C4D9]">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(96, 165, 250, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-30 bg-white/40 backdrop-blur-xl border-b border-[#5B9FBF]/20 shadow-lg"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-[#082829]/5 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-[#082829]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#082829]" />
                )}
              </button>

              {onBack && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="p-2 hover:bg-[#082829]/5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#082829]" />
                </motion.button>
              )}
              
              <div className="flex items-center gap-3">
                <img src="/admin-logo.png" alt="Morgen Admin" className="h-10 w-auto rounded-xl shadow-lg" />
                <div>
                  <h1 className="text-xl font-bold text-[#2C5F7C]">Morgen Admin</h1>
                  <p className="text-xs text-[#4A7C99]">Management Panel</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="bg-[#5B9FBF] hover:bg-[#4A8CAF] rounded-xl px-4 py-2 flex items-center gap-2 transition-all shadow-lg"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Logout</span>
            </motion.button>
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
              className="fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/40 backdrop-blur-xl border-r border-[#5B9FBF]/20 shadow-xl z-20 pt-20"
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#5B9FBF] text-white shadow-lg'
                          : 'text-[#2C5F7C] hover:bg-white/30 hover:text-[#1A4A5F]'
                      }`}
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
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-[#2C5F7C] mb-2">
                  Session Timeout Warning
                </h3>
                
                <p className="text-[#4A7C99] mb-4">
                  Your admin session will expire in:
                </p>
                
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">
                    {formatTime(timeoutCountdown)}
                  </span>
                </div>
                
                <p className="text-sm text-[#4A7C99] mb-6">
                  Click "Stay Logged In" to extend your session, or you will be automatically logged out for security.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 border border-[#5B9FBF] text-[#5B9FBF] rounded-xl hover:bg-[#5B9FBF]/5 transition-colors"
                  >
                    Logout Now
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={extendSession}
                    className="flex-1 px-4 py-2 bg-[#5B9FBF] text-white rounded-xl hover:bg-[#4A8CAF] transition-colors"
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
