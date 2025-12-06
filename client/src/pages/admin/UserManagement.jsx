import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, Search, X, AlertTriangle, Users, ShoppingCart, Globe, Briefcase } from 'lucide-react';
import axios from 'axios';

const UserManagement = () => {
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
          className="w-16 h-16 border-4 border-[#5B9FBF]/20 border-t-[#5B9FBF] rounded-full"
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
        <h1 className="text-3xl font-bold text-[#2C5F7C]">User Management</h1>
        <div className="text-sm text-[#4A7C99]">
          Total Users: <span className="font-bold text-[#2C5F7C]">{users.length}</span>
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
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-[#5B9FBF] text-white border-[#5B9FBF] shadow-lg'
                    : 'bg-white/30 backdrop-blur-xl border-[#5B9FBF]/20 text-[#2C5F7C] hover:bg-white/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : section.color
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{section.label}</div>
                    <div className={`text-sm ${isActive ? 'text-white/90' : 'text-white/50'}`}>
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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A7C99]" />
          <input
            type="text"
            placeholder={`Search ${sections.find(s => s.id === activeSection)?.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/40 backdrop-blur-xl border border-[#5B9FBF]/30 rounded-xl text-[#2C5F7C] placeholder-[#4A7C99]/60 focus:outline-none focus:ring-2 focus:ring-[#5B9FBF]"
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
        <h2 className="text-2xl font-bold text-[#2C5F7C] flex items-center gap-3">
          {(() => {
            const section = sections.find(s => s.id === activeSection);
            const Icon = section?.icon;
            return (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section?.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {section?.label}
                <span className="text-lg text-[#4A7C99]">({section?.count})</span>
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
        className="bg-white/40 backdrop-blur-xl rounded-3xl border border-[#5B9FBF]/20 shadow-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#5B9FBF]/10 border-b border-[#5B9FBF]/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Email</th>
                {activeSection === 'farmers' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">District</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Land Size</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Crops</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Subsidy</th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Registered</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C5F7C]">Last Login</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#2C5F7C]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5B9FBF]/10">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(91, 159, 191, 0.05)' }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.subsidyRequested && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Subsidy Requested" />
                      )}
                      <div>
                        <div className="font-semibold text-[#2C5F7C]">{user.name}</div>
                        <div className="text-xs text-[#4A7C99]">{user.farmerId || user.role || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4A7C99]">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-[#4A7C99]">{user.email || 'N/A'}</td>
                  {activeSection === 'farmers' && (
                    <>
                      <td className="px-6 py-4 text-sm text-[#4A7C99]">{user.district || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-[#4A7C99]">
                        {user.landSize ? `${user.landSize} acres` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4A7C99]">
                        {user.cropTypes && user.cropTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.cropTypes.slice(0, 2).map((crop, i) => (
                              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                {crop}
                              </span>
                            ))}
                            {user.cropTypes.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{user.cropTypes.length - 2}
                              </span>
                            )}
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.subsidyRequested ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            {user.subsidyStatus || 'Pending'}
                          </span>
                        ) : (
                          <span className="text-[#4A7C99]/60">No</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm text-[#4A7C99]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4A7C99]">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setUpdateModal({ show: true, user })}
                        className="p-2 bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white rounded-lg transition-colors"
                        title="Send Update"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteModal({ show: true, user })}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
          <div className="text-center py-12 text-[#4A7C99]">
            No {sections.find(s => s.id === activeSection)?.label.toLowerCase()} found
          </div>
        )}
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
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C5F7C]">Delete User</h2>
              </div>
              
              <p className="text-[#4A7C99] mb-6">
                Are you sure you want to delete <span className="font-bold">{deleteModal.user?.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, user: null })}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-[#2C5F7C] rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.user._id)}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
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
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2C5F7C]">Send Update</h2>
                <button
                  onClick={() => setUpdateModal({ show: false, user: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#2C5F7C]" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-[#4A7C99] mb-2">Sending to:</p>
                <p className="font-semibold text-[#2C5F7C]">{updateModal.user?.name}</p>
                <p className="text-sm text-[#4A7C99]">{updateModal.user?.email}</p>
              </div>

              <textarea
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#2C5F7C] placeholder-[#4A7C99]/60 focus:outline-none focus:ring-2 focus:ring-[#5B9FBF]/50 resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setUpdateModal({ show: false, user: null })}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-[#2C5F7C] rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendUpdate}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
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
