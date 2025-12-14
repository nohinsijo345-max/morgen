import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, Search, X, AlertTriangle, Users, ShoppingCart, Globe, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminGlassCard from '../../components/AdminGlassCard';

const UserManagement = () => {
  const { colors } = useAdminTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [updateModal, setUpdateModal] = useState({ show: false, user: null });
  const [updateMessage, setUpdateMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeSection, setActiveSection] = useState('farmers');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setDeleteModal({ show: false, user: null });
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSendUpdate = async () => {
    if (!updateMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/send-update`, {
        userId: updateModal.user._id,
        message: updateMessage
      });
      alert('Update sent successfully!');
      setUpdateModal({ show: false, user: null });
      setUpdateMessage('');
    } catch (error) {
      console.error('Failed to send update:', error);
      alert('Failed to send update');
    } finally {
      setSending(false);
    }
  };

  // Categorize users by role
  const farmers = users.filter(user => user.role === 'farmer' || !user.role);
  const buyers = users.filter(user => user.role === 'buyer');
  const publicUsers = users.filter(user => user.role === 'public');
  const admins = users.filter(user => user.role === 'admin');

  // Get current section users
  const getCurrentSectionUsers = () => {
    switch (activeSection) {
      case 'farmers': return farmers;
      case 'buyers': return buyers;
      case 'public': return publicUsers;
      case 'admins': return admins;
      default: return farmers;
    }
  };

  const filteredUsers = getCurrentSectionUsers().filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.farmerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sections = [
    { id: 'farmers', label: 'Farmers', icon: Users, count: farmers.length, color: 'bg-green-500' },
    { id: 'buyers', label: 'Buyers', icon: ShoppingCart, count: buyers.length, color: 'bg-blue-500' },
    { id: 'public', label: 'Public Users', icon: Globe, count: publicUsers.length, color: 'bg-purple-500' },
    { id: 'admins', label: 'Admins', icon: Briefcase, count: admins.length, color: 'bg-red-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ 
            borderColor: `${colors.accent}20`,
            borderTopColor: colors.accent
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>User Management</h1>
        <div className="text-sm" style={{ color: colors.textSecondary }}>
          Total Users: <span className="font-bold" style={{ color: colors.textPrimary }}>{users.length}</span>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className="p-4 rounded-xl border transition-all backdrop-blur-xl"
                style={{
                  backgroundColor: isActive ? colors.primary : colors.glassBackground,
                  borderColor: isActive ? colors.primary : colors.glassBorder,
                  color: isActive ? '#ffffff' : colors.textPrimary,
                  boxShadow: isActive ? `0 4px 15px ${colors.primary}40` : 'none'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : section.color
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{section.label}</div>
                    <div className="text-sm" style={{ opacity: isActive ? 0.9 : 0.6 }}>
                      {section.count} users
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder={`Search ${sections.find(s => s.id === activeSection)?.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 backdrop-blur-xl rounded-xl focus:outline-none focus:ring-2 transition-colors"
            style={{ 
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              '--tw-ring-color': colors.accent
            }}
          />
        </div>
      </motion.div>

      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: colors.textPrimary }}>
          {(() => {
            const section = sections.find(s => s.id === activeSection);
            const Icon = section?.icon;
            return (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section?.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {section?.label}
                <span className="text-lg" style={{ color: colors.textSecondary }}>({section?.count})</span>
              </>
            );
          })()}
        </h2>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AdminGlassCard className="shadow-2xl overflow-hidden" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: `${colors.accent}10`, borderBottom: `1px solid ${colors.glassBorder}` }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Email</th>
                {activeSection === 'farmers' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Land Size</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Crops</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Subsidy</th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Registered</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.textPrimary }}>Last Login</th>
                <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: colors.textPrimary }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: `${colors.glassBorder}` }}>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition-colors"
                  style={{ borderBottom: `1px solid ${colors.glassBorder}` }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.surfaceHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.subsidyRequested && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Subsidy Requested" />
                      )}
                      <div>
                        <div className="font-semibold" style={{ color: colors.textPrimary }}>{user.name}</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>{user.farmerId || user.role || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{user.phone}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{user.email || 'N/A'}</td>
                  {activeSection === 'farmers' && (
                    <>
                      <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>
                        <div>
                          <div>{user.city || 'N/A'}, {user.district || 'N/A'}</div>
                          {user.pinCode && (
                            <div className="text-xs" style={{ color: colors.textMuted }}>PIN: {user.pinCode}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>
                        {user.landSize ? `${user.landSize} acres` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>
                        {user.cropTypes && user.cropTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.cropTypes.slice(0, 2).map((crop, i) => (
                              <span key={i} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>
                                {crop}
                              </span>
                            ))}
                            {user.cropTypes.length > 2 && (
                              <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: colors.surface, color: colors.textMuted }}>
                                +{user.cropTypes.length - 2}
                              </span>
                            )}
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.subsidyRequested ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.warning}20`, color: colors.warning }}>
                            {user.subsidyStatus || 'Pending'}
                          </span>
                        ) : (
                          <span style={{ color: colors.textMuted }}>No</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setUpdateModal({ show: true, user })}
                        className="p-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: colors.accent }}
                        title="Send Update"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteModal({ show: true, user })}
                        className="p-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: colors.error }}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12" style={{ color: colors.textSecondary }}>
              No {sections.find(s => s.id === activeSection)?.label.toLowerCase()} found
            </div>
          )}
        </AdminGlassCard>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ show: false, user: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-8 max-w-md w-full shadow-2xl"
              style={{ 
                backgroundColor: colors.backgroundCard,
                border: `1px solid ${colors.glassBorder}`
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: colors.error }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Delete User</h2>
              </div>
              
              <p className="mb-6" style={{ color: colors.textSecondary }}>
                Are you sure you want to delete <span className="font-bold" style={{ color: colors.textPrimary }}>{deleteModal.user?.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, user: null })}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors"
                  style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.user._id)}
                  className="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-colors"
                  style={{ backgroundColor: colors.error }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Update Modal */}
      <AnimatePresence>
        {updateModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setUpdateModal({ show: false, user: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-8 max-w-md w-full shadow-2xl"
              style={{ 
                backgroundColor: colors.backgroundCard,
                border: `1px solid ${colors.glassBorder}`
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Send Update</h2>
                <button
                  onClick={() => setUpdateModal({ show: false, user: null })}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.textPrimary }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>Sending to:</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>{updateModal.user?.name}</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{updateModal.user?.email}</p>
              </div>

              <textarea
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 resize-none mb-4"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.accent
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setUpdateModal({ show: false, user: null })}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors"
                  style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendUpdate}
                  disabled={sending}
                  className="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
