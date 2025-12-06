import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ImageSettings = () => {
  const [images, setImages] = useState({
    loginPage: '',
    registerPage: '',
    forgotPasswordPage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/images`);
      setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/images`, images);
      alert('Images updated successfully!');
    } catch (error) {
      console.error('Failed to save images:', error);
      alert('Failed to save images');
    } finally {
      setSaving(false);
    }
  };

  const imageFields = [
    { 
      key: 'loginPage', 
      label: 'Login Page Image', 
      description: 'Image displayed on the right side of the login page',
      currentUrl: images.loginPage
    },
    { 
      key: 'registerPage', 
      label: 'Register Page Image', 
      description: 'Image displayed on the right side of the registration page',
      currentUrl: images.registerPage
    },
    { 
      key: 'forgotPasswordPage', 
      label: 'Forgot Password Image', 
      description: 'Image displayed on the forgot password page',
      currentUrl: images.forgotPasswordPage
    },
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
        <div>
          <h1 className="text-3xl font-bold text-[#2C5F7C]">Image Settings</h1>
          <p className="text-sm text-[#4A7C99] mt-1">Manage images for login, register, and forgot password pages</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>

      <div className="space-y-6">
        {imageFields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-[#5B9FBF]/20 shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#5B9FBF] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2C5F7C] mb-1">{field.label}</h3>
                <p className="text-sm text-[#4A7C99]">{field.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={images[field.key]}
                  onChange={(e) => setImages({ ...images, [field.key]: e.target.value })}
                  placeholder="Enter image URL (e.g., https://unsplash.com/...)"
                  className="w-full px-4 py-3 bg-white/40 backdrop-blur-xl border border-[#5B9FBF]/30 rounded-xl text-[#2C5F7C] placeholder-[#4A7C99]/60 focus:outline-none focus:ring-2 focus:ring-[#5B9FBF]/50"
                />
              </div>

              {field.currentUrl && (
                <div>
                  <label className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                    Preview
                  </label>
                  <div className="relative w-full h-48 bg-[#5B9FBF]/5 rounded-xl overflow-hidden">
                    <img
                      src={field.currentUrl}
                      alt={field.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center text-[#4A7C99]">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Failed to load image</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-[#5B9FBF]/10 backdrop-blur-xl rounded-3xl p-6 border border-[#5B9FBF]/30"
      >
        <h3 className="text-lg font-bold text-[#2C5F7C] mb-3">📝 Instructions</h3>
        <ul className="space-y-2 text-sm text-[#4A7C99]">
          <li>• Use high-quality images from Unsplash or your Assets folder</li>
          <li>• Recommended image dimensions: 1920x1080 or higher</li>
          <li>• Images should be relevant to farming/agriculture</li>
          <li>• Make sure URLs are publicly accessible</li>
          <li>• Click "Save Changes" after updating URLs</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ImageSettings;
