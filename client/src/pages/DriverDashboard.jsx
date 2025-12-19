import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Calendar,
  IndianRupee,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Bell,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';
import axios from 'axios';

const DriverDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCancellationRequests();
    fetchActiveBookings();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/driver/dashboard/${user.driverId}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCancellationRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/driver/cancellation-requests/${user.driverId}`);
      setCancellationRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch cancellation requests:', error);
    }
  };

  const fetchActiveBookings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/driver/bookings/${user.driverId}`);
      // Filter for active bookings (not completed or cancelled)
      const active = response.data.filter(booking => 
        !['completed', 'cancelled'].includes(booking.status)
      );
      setActiveBookings(active);
    } catch (error) {
      console.error('Failed to fetch active bookings:', error);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'bookings':
        setShowBookingsModal(true);
        break;
      case 'status':
        setShowStatusModal(true);
        break;
      case 'vehicles':
        setShowVehiclesModal(true);
        break;
      case 'profile':
        setShowProfileModal(true);
        break;
      case 'cancellations':
        setShowCancellationModal(true);
        break;
      default:
        break;
    }
  };

  const handleCancellationReview = async (bookingId, action, reviewNotes) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/driver/cancellation-requests/${bookingId}/review`, {
        action,
        reviewNotes,
        driverId: user.driverId
      });
      
      alert(`Cancellation request ${action} successfully!`);
      fetchCancellationRequests(); // Refresh the list
      setShowCancellationModal(false);
    } catch (error) {
      console.error('Failed to review cancellation request:', error);
      alert('Failed to review cancellation request');
    }
  };

  const handleStatusUpdate = async (bookingId, step, location, notes) => {
    // Validate inputs
    if (!location || !location.trim()) {
      alert('Please enter a valid location');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log(`🔄 Updating status for booking ${bookingId}:`, { step, location: location.trim(), notes });
      
      const response = await axios.patch(`${API_URL}/api/driver/bookings/${bookingId}/update-status`, {
        step,
        location: location.trim(),
        notes: notes || `${step.replace('_', ' ')} completed`
      });
      
      console.log('✅ Status updated successfully:', response.data);
      
      // Show success message with step details
      const stepNames = {
        'pickup_started': 'Pickup Started',
        'order_picked_up': 'Order Picked Up',
        'in_transit': 'In Transit',
        'delivered': 'Delivered'
      };
      alert(`✅ ${stepNames[step]} - Status updated successfully!`);
      
      // Refresh data
      await fetchActiveBookings();
      await fetchDashboardData();
      setShowStatusModal(false);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update status. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'Invalid request. Please check the order status.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found. Please refresh and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.put(`${API_URL}/api/driver/profile/${user.driverId}`, profileData);
      alert('Profile updated successfully!');
      setShowProfileModal(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const toggleVehicleAvailability = async (vehicleId, currentAvailability) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/driver/vehicles/${vehicleId}/availability`, {
        availability: !currentAvailability
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update vehicle availability:', error);
      alert('Failed to update vehicle availability');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 border-amber-200 border-t-amber-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 bg-amber-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200/30 rounded-full blur-xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/60 backdrop-blur-xl border-b border-amber-200/50 shadow-lg"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Driver Dashboard</h1>
                <p className="text-amber-700">Welcome back, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction('cancellations')}
                className="p-3 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5 text-amber-700" />
                {(dashboardData?.stats?.pendingBookings > 0 || cancellationRequests.length > 0) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {(dashboardData?.stats?.pendingBookings || 0) + cancellationRequests.length}
                    </span>
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">{dashboardData?.stats?.totalTrips || 0}</div>
                <div className="text-sm text-amber-700">Total Trips</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">₹{(dashboardData?.stats?.totalEarnings || 0).toLocaleString()}</div>
                <div className="text-sm text-amber-700">Total Earnings</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">{user.rating || 5.0}</div>
                <div className="text-sm text-amber-700">Rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">{dashboardData?.vehicles?.length || 0}</div>
                <div className="text-sm text-amber-700">My Vehicles</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Driver Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg mb-8"
        >
          <h2 className="text-xl font-bold text-amber-900 mb-4">Driver Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-700 font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-amber-900">{user.name}</div>
                <div className="text-sm text-amber-700">Driver Name</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-amber-900">{user.phone}</div>
                <div className="text-sm text-amber-700">Phone Number</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-amber-900">{user.email}</div>
                <div className="text-sm text-amber-700">Email Address</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-amber-900 capitalize">{user.district}</div>
                {user.pinCode && (
                  <div className="text-xs text-amber-600">PIN: {user.pinCode}</div>
                )}
                <div className="text-sm text-amber-700">Location</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-amber-900">Recent Bookings</h3>
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Clock className="w-4 h-4" />
                <span>Last 7 days</span>
              </div>
            </div>

            <div className="space-y-4">
              {dashboardData?.recentBookings?.length > 0 ? (
                dashboardData.recentBookings.map((booking) => (
                  <div key={booking._id} className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-amber-900">{booking.bookingId}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-amber-700 mb-2">{booking.farmerName}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-600">₹{booking.finalAmount}</span>
                      <span className="text-amber-600">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-amber-700">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent bookings</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* My Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-amber-900">My Vehicles</h3>
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Truck className="w-4 h-4" />
                <span>{dashboardData?.vehicles?.length || 0} vehicles</span>
              </div>
            </div>

            <div className="space-y-4">
              {dashboardData?.vehicles?.length > 0 ? (
                dashboardData.vehicles.map((vehicle) => (
                  <motion.div 
                    key={vehicle._id} 
                    className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/30 cursor-pointer hover:bg-amber-100/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowVehicleDetailsModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-amber-900">{vehicle.name}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="text-sm text-amber-700 mb-2 capitalize">
                      {vehicle.type.replace('-', ' ')}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-amber-600">
                        {vehicle.priceOptions.length} price options
                      </div>
                      <div className="text-xs text-amber-500">
                        Click to view details
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-amber-700">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No vehicles assigned</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg"
        >
          <h3 className="text-xl font-bold text-amber-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/driver/orders')}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
            >
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-900">My Orders</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction('cancellations')}
              className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 text-center hover:shadow-lg transition-all relative"
            >
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-red-900">Cancellation Requests</div>
              {cancellationRequests.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{cancellationRequests.length}</span>
                </div>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction('vehicles')}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
            >
              <Truck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-amber-900">My Vehicles</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction('profile')}
              className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center hover:shadow-lg transition-all"
            >
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-purple-900">Edit Profile</div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bookings Modal */}
      {showBookingsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">My Bookings</h3>
              <button
                onClick={() => setShowBookingsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData?.recentBookings?.length > 0 ? (
                dashboardData.recentBookings.map((booking) => (
                  <div key={booking._id} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-amber-900">{booking.bookingId}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-amber-700">Customer:</span>
                        <div className="font-medium text-amber-900">{booking.farmerName}</div>
                      </div>
                      <div>
                        <span className="text-amber-700">Amount:</span>
                        <div className="font-medium text-amber-900">₹{booking.finalAmount}</div>
                      </div>
                      <div>
                        <span className="text-amber-700">Date:</span>
                        <div className="font-medium text-amber-900">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-amber-700">Pickup:</span>
                        <div className="font-medium text-amber-900">{booking.pickupLocation}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-amber-700">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No bookings found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Vehicles Modal */}
      {showVehiclesModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">My Vehicles</h3>
              <button
                onClick={() => setShowVehiclesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData?.vehicles?.length > 0 ? (
                dashboardData.vehicles.map((vehicle) => (
                  <div key={vehicle._id} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-amber-900">{vehicle.name}</div>
                      <button
                        onClick={() => toggleVehicleAvailability(vehicle._id, vehicle.availability)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          vehicle.availability 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {vehicle.availability ? 'Available' : 'Unavailable'}
                      </button>
                    </div>
                    <div className="text-sm text-amber-700 mb-2 capitalize">
                      {vehicle.type.replace('-', ' ')}
                    </div>
                    <div className="text-sm text-amber-600">
                      {vehicle.priceOptions.length} price options available
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-amber-700">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No vehicles assigned</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
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
              <h3 className="text-2xl font-bold text-amber-900">Edit Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Cancellation Requests Modal */}
      {showCancellationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">Cancellation Requests</h3>
              <button
                onClick={() => setShowCancellationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {cancellationRequests.length > 0 ? (
                cancellationRequests.map((booking) => (
                  <div key={booking._id} className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-red-900">{booking.bookingId}</div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Cancellation Requested
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-red-700">Customer:</span>
                        <div className="font-medium text-red-900">{booking.farmerName}</div>
                      </div>
                      <div>
                        <span className="text-red-700">Amount:</span>
                        <div className="font-medium text-red-900">₹{booking.finalAmount}</div>
                      </div>
                      <div>
                        <span className="text-red-700">Requested:</span>
                        <div className="font-medium text-red-900">
                          {new Date(booking.cancellationRequest.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-red-700">Reason:</span>
                        <div className="font-medium text-red-900">{booking.cancellationRequest.reason}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const reviewNotes = prompt('Enter review notes (optional):');
                          handleCancellationReview(booking.bookingId, 'approved', reviewNotes || '');
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Approve Cancellation
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const reviewNotes = prompt('Enter reason for denial:');
                          if (reviewNotes) {
                            handleCancellationReview(booking.bookingId, 'denied', reviewNotes);
                          }
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Deny Cancellation
                      </motion.button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-amber-700">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No cancellation requests</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">Update Booking Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {activeBookings.length > 0 ? (
                activeBookings.map((booking) => (
                  <div key={booking._id} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-amber-900">{booking.bookingId}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-amber-700">Customer:</span>
                        <div className="font-medium text-amber-900">{booking.farmerName}</div>
                      </div>
                      <div>
                        <span className="text-amber-700">Route:</span>
                        <div className="font-medium text-amber-900">
                          {booking.fromLocation?.city} → {booking.toLocation?.city}
                        </div>
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const location = prompt('Enter pickup location:');
                          if (location && location.trim()) {
                            handleStatusUpdate(booking.bookingId, 'pickup_started', location.trim(), 'Started pickup');
                          }
                        }}
                        disabled={booking.status !== 'order_processing' && booking.status !== 'order_accepted'}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        🚚 Start Pickup
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const location = prompt('Enter pickup location:');
                          if (location && location.trim()) {
                            handleStatusUpdate(booking.bookingId, 'order_picked_up', location.trim(), 'Order picked up');
                          }
                        }}
                        disabled={booking.status !== 'pickup_started'}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        📦 Mark Picked Up
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const location = prompt('Enter current location:');
                          if (location && location.trim()) {
                            handleStatusUpdate(booking.bookingId, 'in_transit', location.trim(), 'In transit');
                          }
                        }}
                        disabled={booking.status !== 'order_picked_up'}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        🚛 In Transit
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const location = prompt('Enter delivery location:');
                          if (location && location.trim()) {
                            handleStatusUpdate(booking.bookingId, 'delivered', location.trim(), 'Delivered successfully');
                          }
                        }}
                        disabled={booking.status !== 'in_transit'}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        ✅ Mark Delivered
                      </motion.button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-amber-700">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No active bookings to update</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Vehicle Details Modal */}
      {showVehicleDetailsModal && selectedVehicle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">Vehicle Details</h3>
              <button
                onClick={() => setShowVehicleDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Vehicle Header */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-amber-900">{selectedVehicle.name}</h4>
                    <p className="text-amber-700 capitalize">{selectedVehicle.type.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedVehicle.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedVehicle.availability ? 'Available for Bookings' : 'Currently Unavailable'}
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleVehicleAvailability(selectedVehicle._id, selectedVehicle.availability)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedVehicle.availability 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {selectedVehicle.availability ? 'Mark Unavailable' : 'Mark Available'}
                  </motion.button>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-3">Vehicle Information</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Vehicle Type:</span>
                    <div className="font-medium text-blue-900 capitalize">{selectedVehicle.type.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Vehicle ID:</span>
                    <div className="font-medium text-blue-900">{selectedVehicle._id.slice(-8).toUpperCase()}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Added On:</span>
                    <div className="font-medium text-blue-900">
                      {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Last Updated:</span>
                    <div className="font-medium text-blue-900">
                      {new Date(selectedVehicle.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Options */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h5 className="font-semibold text-green-900 mb-3">Price Options ({selectedVehicle.priceOptions.length})</h5>
                <div className="space-y-3">
                  {selectedVehicle.priceOptions.map((option, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-green-900">{option.capacity}</div>
                        <div className="text-lg font-bold text-green-900">₹{option.basePrice}</div>
                      </div>
                      <div className="text-sm text-green-700 mb-1">{option.description}</div>
                      <div className="text-xs text-green-600">
                        Base Price: ₹{option.basePrice} + ₹{option.pricePerKm}/km
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Statistics */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-3">Vehicle Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900">
                      {dashboardData?.stats?.totalTrips || 0}
                    </div>
                    <div className="text-purple-700">Total Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900">
                      ₹{(dashboardData?.stats?.totalEarnings || 0).toLocaleString()}
                    </div>
                    <div className="text-purple-700">Total Earnings</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVehicleDetailsModal(false)}
                className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors"
              >
                Close
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Navigate to vehicle management or edit page
                  alert('Vehicle management feature coming soon!');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Manage Vehicle
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DriverDashboard;