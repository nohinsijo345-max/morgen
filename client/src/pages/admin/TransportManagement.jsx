import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Truck, 
  Users, 
  Calendar,
  IndianRupee,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminGlassCard from '../../components/AdminGlassCard';

const TransportManagement = () => {
  const { colors } = useAdminTheme();
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      if (activeTab === 'vehicles') {
        const response = await axios.get(`${API_URL}/api/admin/transport/vehicles`);
        setVehicles(response.data);
      } else if (activeTab === 'drivers') {
        const response = await axios.get(`${API_URL}/api/admin/transport/drivers`);
        setDrivers(response.data);
      } else if (activeTab === 'bookings') {
        const response = await axios.get(`${API_URL}/api/admin/transport/bookings`);
        setBookings(response.data);
      }
      
      // Always fetch stats
      const statsResponse = await axios.get(`${API_URL}/api/admin/transport/stats`);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type) => {
    setModalType(type);
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/admin/transport/${type}/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete item');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/admin/transport/bookings/${bookingId}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#5B9FBF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Transport Management</h1>
          <p className="mt-1" style={{ color: colors.textSecondary }}>Manage vehicles, drivers, and bookings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminGlassCard delay={0}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Truck className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stats.totalVehicles}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Total Vehicles</div>
            </div>
          </div>
        </AdminGlassCard>

        <AdminGlassCard delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Users className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stats.totalDrivers}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Total Drivers</div>
            </div>
          </div>
        </AdminGlassCard>

        <AdminGlassCard delay={0.2}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Calendar className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stats.totalBookings}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Total Bookings</div>
            </div>
          </div>
        </AdminGlassCard>

        <AdminGlassCard delay={0.3}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <IndianRupee className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>₹{stats.totalRevenue?.toLocaleString()}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Total Revenue</div>
            </div>
          </div>
        </AdminGlassCard>
      </div>

      {/* Tabs */}
      <AdminGlassCard noPadding className="p-1">
        <div className="flex space-x-1">
          {['vehicles', 'drivers', 'bookings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-all capitalize"
              style={{
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? colors.background : colors.textSecondary
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </AdminGlassCard>

      {/* Content */}
      <AdminGlassCard key={activeTab} noPadding>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Vehicles</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Name</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Type</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Price Options</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>{vehicle.name}</td>
                      <td className="py-3 px-4 capitalize" style={{ color: colors.textSecondary }}>{vehicle.type.replace('-', ' ')}</td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{vehicle.priceOptions.length} options</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Drivers</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Name</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Driver ID</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Phone</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Vehicle Type</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver._id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>{driver.name}</td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{driver.driverId}</td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{driver.phone}</td>
                      <td className="py-3 px-4 capitalize" style={{ color: colors.textSecondary }}>{driver.vehicleType}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Bookings</h2>
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                <Clock className="w-4 h-4" />
                <span>Pending: {stats.pendingBookings}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Booking ID</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Farmer</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Amount</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Status</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>{booking.bookingId}</td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{booking.farmerName}</td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{booking.vehicleId?.name}</td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>₹{booking.finalAmount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                className="p-1 text-green-500 hover:bg-green-50 rounded"
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'in-progress')}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              title="Start Trip"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'in-progress' && (
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'completed')}
                              className="p-1 text-green-500 hover:bg-green-50 rounded"
                              title="Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </motion.div>
      </AdminGlassCard>

      {/* Modal for Add/Edit */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#2C5F7C]">
                {selectedItem ? 'Edit' : 'Add'} {modalType}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {modalType === 'vehicle' ? 'Vehicle' : modalType === 'driver' ? 'Driver' : 'Item'} Management
              </h4>
              <p className="text-gray-600 mb-6">
                {selectedItem ? 'Edit functionality' : 'Add functionality'} will be implemented in the next update.
                This feature requires detailed form handling for {modalType} data.
              </p>
              
              {selectedItem && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <h5 className="font-medium text-gray-900 mb-2">Current {modalType} details:</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    {modalType === 'vehicle' && (
                      <>
                        <div>Name: {selectedItem.name}</div>
                        <div>Type: {selectedItem.type}</div>
                        <div>Status: {selectedItem.availability ? 'Available' : 'Unavailable'}</div>
                      </>
                    )}
                    {modalType === 'driver' && (
                      <>
                        <div>Name: {selectedItem.name}</div>
                        <div>ID: {selectedItem.driverId}</div>
                        <div>Phone: {selectedItem.phone}</div>
                        <div>Vehicle Type: {selectedItem.vehicleType}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  alert(`${selectedItem ? 'Edit' : 'Add'} ${modalType} functionality will be implemented soon!`);
                  setShowModal(false);
                }}
                className="flex-1 px-6 py-3 bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white rounded-xl transition-colors"
              >
                {selectedItem ? 'Save Changes' : 'Add ' + modalType}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TransportManagement;