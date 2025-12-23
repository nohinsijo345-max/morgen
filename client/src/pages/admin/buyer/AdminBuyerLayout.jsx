import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Package, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Gavel,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminNeumorphicThemeToggle from '../../../components/AdminNeumorphicThemeToggle';

const AdminBuyerLayout = ({ children, currentPage = 'dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { colors, isDarkMode } = useAdminTheme();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/buyer/dashboard',
      icon: BarChart3,
      current: currentPage === 'dashboard'
    },
    {
      name: 'Buyer Management',
      href: '/admin/buyer/management',
      icon: Users,
      current: currentPage === 'management'
    },
    {
      name: 'Profile Requests',
      href: '/admin/buyer/profile-requests',
      icon: UserCheck,
      current: currentPage === 'profile-requests',
      badge: 3
    },
    {
      name: 'Order Management',
      href: '/admin/buyer/orders',
      icon: Package,
      current: currentPage === 'orders'
    },
    {
      name: 'Bidding Analytics',
      href: '/admin/buyer/bidding',
      icon: Gavel,
      current: currentPage === 'bidding'
    },
    {
      name: 'Messages',
      href: '/admin/buyer/messages',
      icon: MessageSquare,
      current: currentPage === 'messages'
    },
    {
      name: 'Settings',
      href: '/admin/buyer/settings',
      icon: Settings,
      current: currentPage === 'settings'
    }
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 z-50 w-64 lg:static lg:translate-x-0 lg:inset-0"
      >
        <div 
          className="flex flex-col h-full border-r shadow-lg"
          style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <img 
                src="/src/assets/Morgen-logo-main.png" 
                alt="Morgen Logo" 
                className="h-8 w-auto rounded-lg"
              />
              <div>
                <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  Buyer Admin
                </h2>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Management Panel
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg"
              style={{ color: colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  item.current ? 'shadow-lg' : ''
                }`}
                style={{
                  backgroundColor: item.current ? colors.primary : 'transparent',
                  color: item.current ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textPrimary
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <div className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                    {item.badge}
                  </div>
                )}
              </motion.a>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-4" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Theme
              </span>
              <AdminNeumorphicThemeToggle size="sm" />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/admin'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Admin</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div 
          className="flex items-center justify-between p-4 border-b lg:hidden"
          style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: colors.textPrimary }}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            Buyer Administration
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminBuyerLayout;