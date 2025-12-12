import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Phone,
  Mail,
  MapPin,
  Star,
  Eye,
  Search,
  Filter,
  Truck
} from 'lucide-react';
import axios from 'axios';
import VehicleAssignment from './VehicleAssignment';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showVehicleAssignment, setShowVehicleAssignment] = useState(false);
  const [selectedDriverForVehicles, setSelectedDriverForVehicles] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    driverId: '',
    phone: '',
    email: '',
    licenseNumber: '',
    vehicleType: '',
    district: '',
    pinCode: '',
    password: '',
    isActive: true
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/transport/drivers`);
      setDrivers(response.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedDriver(null);
    setFormData({
      name: '',
      driverId: '',
      phone: '',
      email: '',
      licenseNumber: '',
      vehicleType: '',
      district: '',
      password: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      driverId: driver.driverId,
      phone: driver.phone,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      vehicleType: driver.vehicleType,
      district: driver.district,
      pinCode: driver.pinCode || '',
      password: '',
      isActive: driver.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/admin/transport/drivers/${id}`);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to delete driver:', error);
      alert('Failed to delete driver');
    }
  };

  const handleVehicleAssignment = (driver) => {
    setSelectedDriverForVehicles(driver);
    setShowVehicleAssignment(true);
  };

  const handleAssignmentUpdate = () => {
    // Refresh drivers list to show updated vehicle counts
    fetchDrivers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      if (selectedDriver) {
        // Update existing driver
        await axios.put(`${API_URL}/api/admin/transport/drivers/${selectedDriver._id}`, formData);
      } else {
        // Create new driver
        await axios.post(`${API_URL}/api/admin/transport/drivers`, formData);
      }
      
      setShowModal(false);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to save driver:', error);
      alert('Failed to save driver');
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && driver.isActive) ||
                         (filterStatus === 'inactive' && !driver.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const vehicleTypes = [
    'truck', 'mini-truck', 'tractor', 'autorickshaw', 
    'jeep', 'car', 'bike', 'cycle'
  ];

  const districts = [
    'ernakulam', 'thiruvananthapuram', 'kochi', 'kozhikode', 
    'thrissur', 'kollam', 'alappuzha', 'palakkad'
  ];

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
          <h1 className="text-3xl font-bold text-[#2C5F7C]">Driver Management</h1>
          <p className="text-[#4A7C99] mt-1">Manage driver profiles and information</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Driver
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-[#5B9FBF]/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A7C99] w-5 h-5" />
            <input
              type="text"
              placeholder="Search drivers by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#5B9FBF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A7C99] w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/50 border border-[#5B9FBF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none"
            >
              <option value="all">All Drivers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-[#5B9FBF]/20 shadow-lg hover:shadow-xl transition-all"
          >
            {/* Driver Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#2C5F7C]">{driver.name}</h3>
                <p className="text-sm text-[#4A7C99]">{driver.driverId}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {driver.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Driver Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#4A7C99]">
                <Phone className="w-4 h-4" />
                <span>{driver.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4A7C99]">
                <Mail className="w-4 h-4" />
                <span>{driver.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4A7C99]">
                <MapPin className="w-4 h-4" />
                <div>
                  <div className="capitalize">{driver.district}</div>
                  {driver.pinCode && (
                    <div className="text-xs text-[#4A7C99]/70">PIN: {driver.pinCode}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Type & Rating */}
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-50 px-3 py-1 rounded-lg">
                <span className="text-sm font-medium text-amber-800 capitalize">
                  {driver.vehicleType.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-[#2C5F7C]">
                  {driver.rating || 5.0}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#2C5F7C]">{driver.totalTrips || 0}</div>
                <div className="text-xs text-[#4A7C99]">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#2C5F7C]">
                  {new Date(driver.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-[#4A7C99]">Joined</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEdit(driver)}
                className="flex-1 bg-[#5B9FBF] text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4A8CAF] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVehicleAssignment(driver)}
                className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors"
                title="Assign Vehicles"
              >
                <Truck className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(driver._id)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Users className="w-16 h-16 text-[#4A7C99]/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2C5F7C] mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No drivers found' : 'No drivers registered'}
          </h3>
          <p className="text-[#4A7C99] mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first driver.'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add First Driver
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-[#2C5F7C] mb-6">
              {selectedDriver ? 'Edit Driver' : 'Add New Driver'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    Driver ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driverId}
                    onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="DRV001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    required
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    District *
                  </label>
                  <select
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district} className="capitalize">
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode || ''}
                    onChange={(e) => setFormData({...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                    maxLength="6"
                    placeholder="6-digit PIN code"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                    Password {selectedDriver ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!selectedDriver}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-[#2C5F7C]">
                  Active Driver
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-[#5B9FBF] text-[#5B9FBF] rounded-xl hover:bg-[#5B9FBF]/5 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {selectedDriver ? 'Update Driver' : 'Add Driver'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Vehicle Assignment Modal */}
      <VehicleAssignment
        isOpen={showVehicleAssignment}
        onClose={() => setShowVehicleAssignment(false)}
        driver={selectedDriverForVehicles}
        onAssignmentUpdate={handleAssignmentUpdate}
      />
    </div>
  );
};

export default DriverManagement;