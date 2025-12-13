import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Clock,
  IndianRupee,
  Calculator,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';
import axios from 'axios';
import BookingSuccessAnimation from '../../components/BookingSuccessAnimation';

const TransportBooking = () => {
  const { vehicleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingData, setBookingData] = useState({
    fromLocation: {
      state: 'Kerala',
      district: 'Ernakulam',
      city: 'Kochi',
      pinCode: '',
      address: ''
    },
    toLocation: {
      state: '',
      district: '',
      city: '',
      pinCode: '',
      address: ''
    },
    pickupDate: '',
    pickupTime: '',
    distance: 10,
    notes: '',
    cargoDescription: ''
  });
  


  useEffect(() => {
    fetchVehicleDetails();
    const optionParam = searchParams.get('option');
    if (optionParam) {
      try {
        setSelectedOption(JSON.parse(decodeURIComponent(optionParam)));
      } catch (error) {
        console.error('Failed to parse option:', error);
      }
    }
  }, [vehicleId, searchParams]);

  // Clear selected time if it becomes invalid when date changes
  useEffect(() => {
    if (bookingData.pickupDate && bookingData.pickupTime) {
      const availableOptions = getAvailableTimeOptions();
      const isTimeStillValid = availableOptions.some(option => option.value === bookingData.pickupTime);
      
      if (!isTimeStillValid) {
        setBookingData(prev => ({
          ...prev,
          pickupTime: ''
        }));
      }
    }
  }, [bookingData.pickupDate]);

  const fetchVehicleDetails = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/vehicles/${vehicleId}`);
      setVehicle(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedOption) return 0;
    const baseAmount = selectedOption.basePrice + (selectedOption.pricePerKm * bookingData.distance);
    const handlingFee = 14;
    return { baseAmount, handlingFee, total: baseAmount + handlingFee };
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBookingData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };

        // Auto-populate delivery address when pickup address changes
        if (parent === 'fromLocation' && (child === 'state' || child === 'district')) {
          // Only auto-populate if delivery fields are empty
          if (!prev.toLocation.state && !prev.toLocation.district) {
            newData.toLocation = {
              ...prev.toLocation,
              state: child === 'state' ? value : prev.fromLocation.state,
              district: child === 'district' ? value : prev.fromLocation.district
            };
          }
        }

        return newData;
      });
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBooking = async () => {
    try {
      setBooking(true);
      const farmerUser = localStorage.getItem('farmerUser');
      if (!farmerUser) {
        alert('Please login to continue');
        return;
      }

      const userData = JSON.parse(farmerUser);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      const bookingPayload = {
        farmerId: userData.farmerId,
        farmerName: userData.name,
        vehicleId,
        vehicleType: vehicle.type,
        priceOption: selectedOption,
        ...bookingData
      };

      console.log('Booking payload:', bookingPayload);

      const response = await axios.post(`${API_URL}/api/transport/bookings`, bookingPayload);
      
      if (response.data.booking) {
        setBookingResult({
          bookingId: response.data.booking.bookingId,
          trackingId: response.data.trackingId,
          expectedDeliveryDate: response.data.expectedDeliveryDate,
          finalAmount: response.data.booking.finalAmount
        });
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Booking failed. Please try again.';
      alert(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  const handleGoToTracking = () => {
    navigate('/order-tracking');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const isFormValid = () => {
    return bookingData.toLocation.state && 
           bookingData.toLocation.district && 
           bookingData.toLocation.city &&
           bookingData.toLocation.pinCode &&
           bookingData.pickupDate && 
           bookingData.pickupTime &&
           bookingData.distance > 0 &&
           bookingData.cargoDescription.trim() !== '';
  };

  const getAvailableTimeOptions = () => {
    const timeOptions = [
      { value: "06:00", label: "6:00 AM" },
      { value: "07:00", label: "7:00 AM" },
      { value: "08:00", label: "8:00 AM" },
      { value: "09:00", label: "9:00 AM" },
      { value: "10:00", label: "10:00 AM" },
      { value: "11:00", label: "11:00 AM" },
      { value: "12:00", label: "12:00 PM" },
      { value: "13:00", label: "1:00 PM" },
      { value: "14:00", label: "2:00 PM" },
      { value: "15:00", label: "3:00 PM" },
      { value: "16:00", label: "4:00 PM" },
      { value: "17:00", label: "5:00 PM" },
      { value: "18:00", label: "6:00 PM" }
    ];

    // If no date is selected, return all options
    if (!bookingData.pickupDate) {
      return timeOptions;
    }

    const selectedDate = new Date(bookingData.pickupDate);
    const today = new Date();
    
    // If selected date is not today, return all options
    if (selectedDate.toDateString() !== today.toDateString()) {
      return timeOptions;
    }

    // If selected date is today, filter out past times
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    return timeOptions.filter(option => {
      const [hour] = option.value.split(':').map(Number);
      // Add 1 hour buffer to current time for practical booking
      return hour > currentHour || (hour === currentHour && currentMinute < 30);
    });
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

  const { baseAmount, handlingFee, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="w-10 h-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-700" />
            </motion.button>
            
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Book Transport</h1>
              <p className="text-sm text-amber-700">{vehicle?.name} - {selectedOption?.capacity}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* From Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-amber-200/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-amber-900">Pickup Location</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="State"
              value={bookingData.fromLocation.state}
              onChange={(e) => handleInputChange('fromLocation.state', e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="text"
              placeholder="District"
              value={bookingData.fromLocation.district}
              onChange={(e) => handleInputChange('fromLocation.district', e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="City"
              value={bookingData.fromLocation.city}
              onChange={(e) => handleInputChange('fromLocation.city', e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="text"
              placeholder="PIN Code"
              value={bookingData.fromLocation.pinCode}
              onChange={(e) => handleInputChange('fromLocation.pinCode', e.target.value)}
              maxLength="6"
              pattern="[0-9]{6}"
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          
          <textarea
            placeholder="Detailed Address"
            value={bookingData.fromLocation.address}
            onChange={(e) => handleInputChange('fromLocation.address', e.target.value)}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 h-20 resize-none"
          />
        </motion.div>

        {/* To Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-amber-200/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-amber-900">Destination</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setBookingData(prev => ({
                  ...prev,
                  toLocation: {
                    ...prev.toLocation,
                    state: prev.fromLocation.state,
                    district: prev.fromLocation.district
                  }
                }));
              }}
              className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm transition-colors"
            >
              Copy from Pickup
            </motion.button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="State *"
              value={bookingData.toLocation.state}
              onChange={(e) => handleInputChange('toLocation.state', e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
            <input
              type="text"
              placeholder="District *"
              value={bookingData.toLocation.district}
              onChange={(e) => handleInputChange('toLocation.district', e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="City *"
              value={bookingData.toLocation.city}
              onChange={(e) => handleInputChange('toLocation.city', e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
            <input
              type="text"
              placeholder="PIN Code *"
              value={bookingData.toLocation.pinCode}
              onChange={(e) => handleInputChange('toLocation.pinCode', e.target.value)}
              maxLength="6"
              pattern="[0-9]{6}"
              className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>
          
          <textarea
            placeholder="Detailed Address"
            value={bookingData.toLocation.address}
            onChange={(e) => handleInputChange('toLocation.address', e.target.value)}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 h-20 resize-none"
          />
        </motion.div>

        {/* Pickup Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-amber-200/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Pickup Schedule</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">Date *</label>
              <input
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">Time *</label>
              <select
                value={bookingData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">
                  {getAvailableTimeOptions().length === 0 ? 'No times available today' : 'Select Time'}
                </option>
                {getAvailableTimeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {bookingData.pickupDate && getAvailableTimeOptions().length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No pickup times available for today. Please select a future date.
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-2">Distance (km) *</label>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="500"
                value={bookingData.distance}
                onChange={(e) => handleInputChange('distance', parseInt(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-700">1 km</span>
                <div className="bg-amber-100 px-3 py-1 rounded-lg">
                  <span className="font-bold text-amber-900">{bookingData.distance} km</span>
                </div>
                <span className="text-sm text-amber-700">500 km</span>
              </div>
              <input
                type="number"
                placeholder="Or enter exact distance"
                value={bookingData.distance}
                onChange={(e) => handleInputChange('distance', parseInt(e.target.value) || 1)}
                min="1"
                max="500"
                className="w-full px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
              />
            </div>
          </div>
        </motion.div>

        {/* Cargo Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-amber-200/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">What's in this truck? *</h3>
          </div>
          <textarea
            placeholder="Describe what you're transporting (e.g., Rice bags, Vegetables, Farm equipment, etc.)"
            value={bookingData.cargoDescription}
            onChange={(e) => handleInputChange('cargoDescription', e.target.value)}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 h-24 resize-none"
            required
          />
          <div className="mt-2 text-sm text-amber-600">
            Please provide details about the items being transported for proper handling and documentation.
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-amber-200/50"
        >
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Additional Notes</h3>
          <textarea
            placeholder="Any special instructions or requirements..."
            value={bookingData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 h-24 resize-none"
          />
        </motion.div>

        {/* Bill Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-amber-200/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Bill Summary</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-amber-700">Base Price ({selectedOption?.capacity})</span>
              <span className="font-semibold text-amber-900">₹{selectedOption?.basePrice || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-700">Distance ({bookingData.distance} km × ₹{selectedOption?.pricePerKm || 0})</span>
              <span className="font-semibold text-amber-900">₹{(selectedOption?.pricePerKm || 0) * bookingData.distance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-700">Handling Fee</span>
              <span className="font-semibold text-amber-900">₹{handlingFee}</span>
            </div>
            <div className="border-t border-amber-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-amber-900">Total Amount</span>
                <span className="text-xl font-bold text-amber-900">₹{total}</span>
              </div>
            </div>
          </div>
        </motion.div>



        {/* Book Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
            onClick={handleBooking}
            disabled={!isFormValid() || booking}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all ${
              isFormValid() && !booking
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {booking ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Processing & Calculating Delivery...</span>
                </>
              ) : isFormValid() ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Book Now - ₹{total}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Complete Required Fields</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>
      </div>



      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && bookingResult && (
          <BookingSuccessAnimation
            bookingData={bookingResult}
            onClose={() => setShowSuccess(false)}
            onGoToTracking={handleGoToTracking}
            onGoToDashboard={handleGoToDashboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransportBooking;