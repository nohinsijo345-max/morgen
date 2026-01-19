import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  Trash2, 
  User, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import { UserSession } from '../utils/userSession';

const ProfileImageCard = ({ user, onImageUpdate }) => {
  const location = useLocation();
  const isBuyerRoute = location.pathname.startsWith('/buyer');
  
  // Get the appropriate theme based on route
  const farmerTheme = useTheme();
  const buyerTheme = useBuyerTheme();
  const { colors, isDarkMode } = isBuyerRoute ? buyerTheme : farmerTheme;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Get user session data based on route
      let userId = null;
      
      if (isBuyerRoute) {
        const buyerUser = UserSession.getCurrentUser('buyer');
        userId = buyerUser?.buyerId;
      } else {
        const farmerUser = UserSession.getCurrentUser('farmer');
        userId = farmerUser?.farmerId;
      }
      
      if (!userId) {
        setError('No user session found. Please login again.');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', file);

      console.log('📤 Uploading image for userId:', userId);

      const response = await axios.post(
        `${API_URL}/api/auth/profile-image/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('✅ Image upload response:', response.data);

      setSuccess('Profile image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Call parent callback to update user data
      if (onImageUpdate) {
        onImageUpdate(response.data.profileImage);
      }

    } catch (err) {
      console.error('❌ Image upload error:', err);
      
      let errorMessage = 'Failed to upload image';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout - please try again';
      } else if (err.response?.status === 413) {
        errorMessage = 'File too large - please choose a smaller image';
      } else if (err.response?.status === 404) {
        errorMessage = 'Upload endpoint not found - please contact support';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageDelete = async () => {
    setError('');
    setUploading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Get user session data based on route
      let userId = null;
      
      if (isBuyerRoute) {
        const buyerUser = UserSession.getCurrentUser('buyer');
        userId = buyerUser?.buyerId;
      } else {
        const farmerUser = UserSession.getCurrentUser('farmer');
        userId = farmerUser?.farmerId;
      }
      
      if (!userId) {
        setError('No user session found. Please login again.');
        setUploading(false);
        return;
      }

      await axios.delete(`${API_URL}/api/auth/profile-image/${userId}`);

      setSuccess('Profile image deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteConfirm(false);
      
      // Call parent callback to update user data
      if (onImageUpdate) {
        onImageUpdate(null);
      }

    } catch (err) {
      console.error('Image deletion error:', err);
      setError(err.response?.data?.error || 'Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    return user.profileImage.startsWith('http') 
      ? user.profileImage 
      : `${API_URL}${user.profileImage}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden mb-12"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: `0 8px 32px ${colors.primary}20`,
        minHeight: '320px' // Increased height further
      }}
    >
      {/* Edge Glass Reflection */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatDelay: 5,
          ease: "easeInOut" 
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.primary}20 50%, transparent 100%)`,
          transform: 'skewX(-20deg)',
          zIndex: 1
        }}
      />
      {/* Edge Glass Reflection */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatDelay: 5,
          ease: "easeInOut" 
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.primary}20 50%, transparent 100%)`,
          transform: 'skewX(-20deg)',
          zIndex: 1
        }}
      />

      <div className="relative z-10 p-8">
        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

      <div className="relative z-10 -m-8">
        {/* Profile Image with Overlay Text */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative w-full aspect-[16/9] overflow-hidden"
            style={{ 
              borderRadius: '24px', // Match parent border radius exactly
            }}
          >
            {getProfileImageUrl() ? (
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="w-full h-full object-cover"
                style={{ 
                  objectPosition: 'center',
                  borderRadius: '24px' // Ensure image fills exactly to card edges
                }}
                onError={(e) => {
                  console.error('Image load error:', e);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback Avatar - Only show when no image */}
            <div 
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ 
                display: getProfileImageUrl() ? 'none' : 'flex',
                backgroundColor: `${colors.primary}20`,
                borderRadius: '24px'
              }}
            >
              <User className="w-16 h-16 mb-4" style={{ color: colors.primary }} />
              <p className="text-lg font-medium mb-4" style={{ color: colors.textSecondary }}>
                No profile image
              </p>
              
              {/* Upload button - Only show when no image */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: isDarkMode ? '#0d1117' : '#ffffff' 
                }}
              >
                <Upload className="w-5 h-5" />
                Upload Photo
              </motion.button>
            </div>

            {/* Enhanced Blur Gradient - Stronger blur effect */}
            {getProfileImageUrl() && (
              <div 
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '45%', // Slightly increased coverage
                  borderRadius: '0 0 24px 24px',
                  background: `
                    linear-gradient(to top, 
                      rgba(0,0,0,0.98) 0%, 
                      rgba(0,0,0,0.96) 6%, 
                      rgba(0,0,0,0.94) 12%, 
                      rgba(0,0,0,0.90) 18%, 
                      rgba(0,0,0,0.85) 24%, 
                      rgba(0,0,0,0.78) 30%, 
                      rgba(0,0,0,0.70) 36%, 
                      rgba(0,0,0,0.60) 42%, 
                      rgba(0,0,0,0.48) 48%, 
                      rgba(0,0,0,0.35) 54%, 
                      rgba(0,0,0,0.22) 60%, 
                      rgba(0,0,0,0.12) 66%, 
                      rgba(0,0,0,0.06) 72%, 
                      rgba(0,0,0,0.02) 78%, 
                      rgba(0,0,0,0.008) 84%, 
                      rgba(0,0,0,0.002) 90%, 
                      transparent 100%
                    )`,
                  backdropFilter: 'blur(2px)', // Added backdrop blur for extra effect
                  WebkitBackdropFilter: 'blur(2px)'
                }}
              />
            )}

            {/* Text Overlay - Only when image exists */}
            {getProfileImageUrl() && (
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">
                  {user?.name || 'User Name'}
                </h3>
                <div className="space-y-1 text-lg">
                  <p className="font-semibold drop-shadow-md">
                    {user?.city || 'City'}, {user?.district || 'District'}
                  </p>
                  <p className="font-semibold drop-shadow-md">
                    {user?.phone || 'Phone Number'}
                  </p>
                  {/* Only show crops for farmers */}
                  {!isBuyerRoute && (
                    <p className="font-semibold drop-shadow-md">
                      {user?.cropTypes?.length > 0 
                        ? user.cropTypes.slice(0, 2).join(', ') + (user.cropTypes.length > 2 ? '...' : '')
                        : 'No crops added'
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upload Overlay - Only when image exists */}
            {getProfileImageUrl() && (
              <motion.div
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 transition-opacity cursor-pointer"
                style={{ borderRadius: '24px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center text-white">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Change Photo</p>
                </div>
              </motion.div>
            )}

            {/* Upload Status Indicator */}
            {uploading && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              </div>
            )}

            {/* Action Buttons - Bottom Right with smooth edges - Only when image exists */}
            {getProfileImageUrl() && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={uploading}
                  className="w-10 h-10 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff'
                  }}
                  title="Delete Photo"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              style={{ backgroundColor: colors.backgroundCard }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
                  Delete Profile Image?
                </h3>
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                  This action cannot be undone. Your profile image will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-xl font-medium text-sm border transition-all"
                    style={{ 
                      backgroundColor: colors.surface, 
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImageDelete}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 rounded-xl font-medium text-sm bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {uploading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileImageCard;