import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Image, 
  Users, 
  LogOut,
  Menu,
  X,
  MessageSquare,
  UserCog
} from 'lucide-react';

const AdminLayout = ({ children, activePage, onNavigate, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Add admin-portal class to body to prevent Orkney font
  useEffect(() => {
    document.body.classList.add('admin-portal');
    return () => {
      document.body.classList.remove('admin-portal');
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'images', label: 'Login Images', icon: Image },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile-requests', label: 'Profile Requests', icon: UserCog },
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
    </div>
  );
};

export default AdminLayout;
