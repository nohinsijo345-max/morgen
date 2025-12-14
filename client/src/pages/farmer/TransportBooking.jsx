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
import { useTheme } from '../../context/ThemeContext';
import FarmerHeader from '../../components/FarmerHeader';
import GlassCard from '../../components/GlassCard';

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
  const { isDarkMode, colors } = useTheme();
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
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 rounded-full"
          style={{ 
            borderColor: `${colors.primary}30`,
            borderTopColor: colors.primary
          }}
        />
      </div>
    );
  }

  const { baseAmount, handlingFee, total } = calculateTotal();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <FarmerHeader 
        title="Book Transport"
        subtitle={`${vehicle?.name} - ${selectedOption?.capacity}`}
        icon={Package}
        onBack={() => window.history.back()}
      />

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* From Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Pickup Location</h3>
            </div>
          
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="State"
                value={bookingData.fromLocation.state}
                onChange={(e) => handleInputChange('fromLocation.state', e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: isDarkMode ? 'rgba(33, 38, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
              />
              <input
                type="text"
                placeholder="District"
                value={bookingData.fromLocation.district}
                onChange={(e) => handleInputChange('fromLocation.district', e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: isDarkMode ? 'rgba(28, 33, 40, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="City"
                value={bookingData.fromLocation.city}
                onChange={(e) => handleInputChange('fromLocation.city', e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={bookingData.fromLocation.pinCode}
                onChange={(e) => handleInputChange('fromLocation.pinCode', e.target.value)}
                maxLength="6"
                pattern="[0-9]{6}"
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
              />
            </div>
            
            <textarea
              placeholder="Detailed Address"
              value={bookingData.fromLocation.address}
              onChange={(e) => handleInputChange('fromLocation.address', e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 h-20 resize-none transition-colors"
              style={{ 
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textPrimary,
                '--tw-ring-color': colors.primary
              }}
            />
          </GlassCard>
        </motion.div>

        {/* To Location */}
        <GlassCard delay={0.2} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Destination</h3>
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
              className="px-3 py-1 rounded-lg text-sm transition-colors"
              style={{ 
                backgroundColor: colors.primaryLight,
                color: colors.primary
              }}
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
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textPrimary,
                '--tw-ring-color': colors.primary
              }}
              required
            />
            <input
              type="text"
              placeholder="District *"
              value={bookingData.toLocation.district}
              onChange={(e) => handleInputChange('toLocation.district', e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textPrimary,
                '--tw-ring-color': colors.primary
              }}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="City *"
              value={bookingData.toLocation.city}
              onChange={(e) => handleInputChange('toLocation.city', e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textPrimary,
                '--tw-ring-color': colors.primary
              }}
              required
            />
            <input
              type="text"
              placeholder="PIN Code *"
              value={bookingData.toLocation.pinCode}
              onChange={(e) => handleInputChange('toLocation.pinCode', e.target.value)}
              maxLength="6"
              pattern="[0-9]{6}"
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textPrimary,
                '--tw-ring-color': colors.primary
              }}
              required
            />
          </div>
          
          <textarea
            placeholder="Detailed Address"
            value={bookingData.toLocation.address}
            onChange={(e) => handleInputChange('toLocation.address', e.target.value)}
            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 h-20 resize-none transition-colors"
            style={{ 
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              '--tw-ring-color': colors.primary
            }}
          />
        </GlassCard>

        {/* Pickup Details */}
        <GlassCard delay={0.3} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Pickup Schedule</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Date *</label>
              <input
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Time *</label>
              <select
                value={bookingData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
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
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  No pickup times available for today. Please select a future date.
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Distance (km) *</label>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="500"
                value={bookingData.distance}
                onChange={(e) => handleInputChange('distance', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                style={{ backgroundColor: colors.border }}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: colors.textSecondary }}>1 km</span>
                <div className="px-3 py-1 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
                  <span className="font-bold" style={{ color: colors.primary }}>{bookingData.distance} km</span>
                </div>
                <span className="text-sm" style={{ color: colors.textSecondary }}>500 km</span>
              </div>
              <input
                type="number"
                placeholder="Or enter exact distance"
                value={bookingData.distance}
                onChange={(e) => handleInputChange('distance', parseInt(e.target.value) || 1)}
                min="1"
                max="500"
                className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 text-center transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  '--tw-ring-color': colors.primary
                }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Cargo Description */}
        <GlassCard delay={0.4} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5" style={{ color: colors.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>What's in this truck? *</h3>
          </div>
          <textarea
            placeholder="Describe what you're transporting (e.g., Rice bags, Vegetables, Farm equipment, etc.)"
            value={bookingData.cargoDescription}
            onChange={(e) => handleInputChange('cargoDescription', e.target.value)}
            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 h-24 resize-none transition-colors"
            style={{ 
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              '--tw-ring-color': colors.primary
            }}
            required
          />
          <div className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
            Please provide details about the items being transported for proper handling and documentation.
          </div>
        </GlassCard>

        {/* Notes */}
        <GlassCard delay={0.45} className="mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Additional Notes</h3>
          <textarea
            placeholder="Any special instructions or requirements..."
            value={bookingData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 h-24 resize-none transition-colors"
            style={{ 
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              '--tw-ring-color': colors.primary
            }}
          />
        </GlassCard>

        {/* Bill Summary */}
        <GlassCard delay={0.5} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5" style={{ color: colors.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Bill Summary</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ color: colors.textSecondary }}>Base Price ({selectedOption?.capacity})</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>₹{selectedOption?.basePrice || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: colors.textSecondary }}>Distance ({bookingData.distance} km × ₹{selectedOption?.pricePerKm || 0})</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>₹{(selectedOption?.pricePerKm || 0) * bookingData.distance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: colors.textSecondary }}>Handling Fee</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>₹{handlingFee}</span>
            </div>
            <div className="pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold" style={{ color: colors.textPrimary }}>Total Amount</span>
                <span className="text-xl font-bold" style={{ color: colors.primary }}>₹{total}</span>
              </div>
            </div>
          </div>
        </GlassCard>



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
            className="w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all"
            style={{
              backgroundColor: isFormValid() && !booking ? colors.primary : colors.textMuted,
              color: isFormValid() && !booking ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textSecondary,
              cursor: isFormValid() && !booking ? 'pointer' : 'not-allowed'
            }}
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