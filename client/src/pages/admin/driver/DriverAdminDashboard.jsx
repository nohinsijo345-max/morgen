import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Truck, 
  Calendar,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';

const DriverAdminDashboard = ({ onNavigate }) => {
  const { colors } = useAdminTheme();
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentDrivers, setRecentDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Fetch transport stats
      const statsResponse = await axios.get(`${API_URL}/api/admin/transport/stats`);
      setStats(statsResponse.data);

      // Fetch recent bookings
      const bookingsResponse = await axios.get(`${API_URL}/api/admin/transport/bookings`);
      setRecentBookings(bookingsResponse.data.slice(0, 5));

      // Fetch recent drivers
      const driversResponse = await axios.get(`${API_URL}/api/admin/transport/drivers`);
      setRecentDrivers(driversResponse.data.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2C5F7C]">Driver Admin Dashboard</h1>
          <p className="text-[#4A7C99] mt-1">Manage transport operations and logistics</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('drivers')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Quick Add
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminGlassCard delay={0}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2C5F7C]">{stats.totalDrivers || 0}</div>
              <div className="text-sm text-[#4A7C99]">Total Drivers</div>
              <div className="text-xs text-green-600 font-medium">
                {stats.activeDrivers || 0} active
              </div>
            </div>
          </div>
        </AdminGlassCard>

        <AdminGlassCard delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2C5F7C]">{stats.totalVehicles || 0}</div>
              <div className="text-sm text-[#4A7C99]">Total Vehicles</div>
              <div className="text-xs text-green-600 font-medium">
                {stats.activeVehicles || 0} available
              </div>
            </div>
          </div>
        </AdminGlassCard>

        <AdminGlassCard delay={0.2}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2C5F7C]">{stats.totalBookings || 0}</div>
              <div className="text-sm text-[#4A7C99]">Total Bookings</div>
              <div className="text-xs text-yellow-600 font-medium">
                {stats.pendingBookings || 0} pending
              </div>
            </div>
          </div>
        </AdminGlassCard>

        <AdminGlassCard delay={0.3}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2C5F7C]">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-sm text-[#4A7C99]">Total Revenue</div>
              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% this month
              </div>
            </div>
          </div>
        </AdminGlassCard>
      </div>

      {/* Quick Actions */}
      <AdminGlassCard delay={0.4}>
        <h2 className="text-xl font-semibold text-[#2C5F7C] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('drivers')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
          >
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-900">Add Driver</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('vehicles')}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
          >
            <Truck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-amber-900">Add Vehicle</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('order-details')}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
          >
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-900">Order Details</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('cancellation-requests')}
            className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
          >
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-red-900">Cancellation Requests</div>
          </motion.button>
        </div>
      </AdminGlassCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <AdminGlassCard delay={0.5}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C5F7C]">Recent Bookings</h3>
            <div className="flex items-center gap-2 text-sm text-[#4A7C99]">
              <Clock className="w-4 h-4" />
              <span>Last 24 hours</span>
            </div>
          </div>

          <div className="space-y-3">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm border border-[#5B9FBF]/30 rounded-xl hover:bg-white/30 transition-all">
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{booking.bookingId}</div>
                    <div className="text-xs text-gray-200">{booking.farmerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">₹{booking.finalAmount}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#4A7C99]">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent bookings</p>
              </div>
            )}
          </div>
        </AdminGlassCard>

        {/* Recent Drivers */}
        <AdminGlassCard delay={0.6}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C5F7C]">Recent Drivers</h3>
            <div className="flex items-center gap-2 text-sm text-[#4A7C99]">
              <Users className="w-4 h-4" />
              <span>Latest additions</span>
            </div>
          </div>

          <div className="space-y-3">
            {recentDrivers.length > 0 ? (
              recentDrivers.map((driver) => (
                <div key={driver._id} className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm border border-[#5B9FBF]/30 rounded-xl hover:bg-white/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {driver.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{driver.name}</div>
                      <div className="text-xs text-gray-200">{driver.driverId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-200 capitalize">{driver.vehicleType}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {driver.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#4A7C99]">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No drivers registered</p>
              </div>
            )}
          </div>
        </AdminGlassCard>
      </div>

      {/* Performance Metrics */}
      <AdminGlassCard delay={0.7}>
        <h3 className="text-lg font-semibold text-[#2C5F7C] mb-4">Performance Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#2C5F7C]">{stats.completedBookings || 0}</div>
            <div className="text-sm text-[#4A7C99]">Completed Trips</div>
            <div className="text-xs text-green-600 font-medium mt-1">
              {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}% success rate
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#2C5F7C]">{stats.pendingBookings || 0}</div>
            <div className="text-sm text-[#4A7C99]">Pending Bookings</div>
            <div className="text-xs text-yellow-600 font-medium mt-1">
              Awaiting confirmation
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#2C5F7C]">
              ₹{stats.totalRevenue ? Math.round(stats.totalRevenue / (stats.completedBookings || 1)) : 0}
            </div>
            <div className="text-sm text-[#4A7C99]">Avg. Trip Value</div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Per completed booking
            </div>
          </div>
        </div>
      </AdminGlassCard>
    </div>
  );
};

export default DriverAdminDashboard;