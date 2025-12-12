import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  User, 
  Plus, 
  X, 
  Check,
  AlertCircle,
  Search
} from 'lucide-react';
import axios from 'axios';

const VehicleAssignment = ({ isOpen, onClose, driver, onAssignmentUpdate }) => {
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && driver) {
      fetchVehicles();
    }
  }, [isOpen, driver]);

  const fetchVehicles = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Fetch available vehicles
      const availableResponse = await axios.get(`${API_URL}/api/admin/transport/available-vehicles`);
      setAvailableVehicles(availableResponse.data);
      
      // Fetch assigned vehicles for this driver
      const assignedResponse = await axios.get(`${API_URL}/api/driver/vehicles/${driver.driverId}`);
      setAssignedVehicles(assignedResponse.data);
      
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignVehicle = async (vehicleId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/transport/assign-vehicle`, {
        vehicleId,
        driverId: driver.driverId
      });
      
      fetchVehicles();
      onAssignmentUpdate();
    } catch (error) {
      console.error('Failed to assign vehicle:', error);
      alert('Failed to assign vehicle');
    }
  };

  const unassignVehicle = async (vehicleId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/transport/unassign-vehicle`, {
        vehicleId
      });
      
      fetchVehicles();
      onAssignmentUpdate();
    } catch (error) {
      console.error('Failed to unassign vehicle:', error);
      alert('Failed to unassign vehicle');
    }
  };

  const getVehicleIcon = (type) => {
    // Return appropriate icon based on vehicle type
    return <Truck className="w-5 h-5" />;
  };

  const filteredAvailableVehicles = availableVehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C5F7C]">Vehicle Assignment</h3>
                <p className="text-[#4A7C99]">Manage vehicles for {driver?.name}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-[#5B9FBF] border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              {/* Assigned Vehicles */}
              <div>
                <h4 className="text-lg font-semibold text-[#2C5F7C] mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Assigned Vehicles ({assignedVehicles.length})
                </h4>
                
                {assignedVehicles.length === 0 ? (
                  <div className="text-center py-8 text-[#4A7C99]">
                    <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No vehicles assigned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedVehicles.map((vehicle) => (
                      <motion.div
                        key={vehicle._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            {getVehicleIcon(vehicle.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#2C5F7C]">{vehicle.name}</div>
                            <div className="text-sm text-[#4A7C99] capitalize">{vehicle.type}</div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => unassignVehicle(vehicle._id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Vehicles */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-[#2C5F7C] flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Available Vehicles ({filteredAvailableVehicles.length})
                  </h4>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A7C99] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B9FBF]"
                  />
                </div>
                
                {filteredAvailableVehicles.length === 0 ? (
                  <div className="text-center py-8 text-[#4A7C99]">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No available vehicles</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAvailableVehicles.map((vehicle) => (
                      <motion.div
                        key={vehicle._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {getVehicleIcon(vehicle.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#2C5F7C]">{vehicle.name}</div>
                            <div className="text-sm text-[#4A7C99] capitalize">{vehicle.type}</div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => assignVehicle(vehicle._id)}
                          className="bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white p-2 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white py-3 rounded-xl transition-colors"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VehicleAssignment;