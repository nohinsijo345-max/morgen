import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import axios from 'axios';

const ImageSettings = () => {
  const [images, setImages] = useState({
    loginPage: '',
    registerPage: '',
    forgotPasswordPage: ''
  });
  const [selectedFiles, setSelectedFiles] = useState({
    loginPage: null,
    registerPage: null,
    forgotPasswordPage: null
  });
  const [previews, setPreviews] = useState({
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
      setPreviews(response.data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (key, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFiles({ ...selectedFiles, [key]: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [key]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (key) => {
    setSelectedFiles({ ...selectedFiles, [key]: null });
    setPreviews({ ...previews, [key]: images[key] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Create a copy of current images
      const updatedImages = { ...images };
      
      // Upload files
      for (const [key, file] of Object.entries(selectedFiles)) {
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('imageType', key);

          const response = await axios.post(`${API_URL}/api/admin/upload-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          updatedImages[key] = response.data.imagePath;
          console.log(`✅ Uploaded ${key}:`, response.data.imagePath);
        }
      }

      console.log('💾 Saving to database:', updatedImages);

      // Save image paths to database
      await axios.post(`${API_URL}/api/admin/images`, updatedImages);
      
      alert('Images updated successfully!');
      setSelectedFiles({
        loginPage: null,
        registerPage: null,
        forgotPasswordPage: null
      });
      fetchImages();
    } catch (error) {
      console.error('Failed to save images:', error);
      alert('Failed to save images: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const imageFields = [
    { 
      key: 'loginPage', 
      label: 'Login Page Image', 
      description: 'Image displayed on the right side of the login page'
    },
    { 
      key: 'registerPage', 
      label: 'Register Page Image', 
      description: 'Image displayed on the right side of the registration page'
    },
    { 
      key: 'forgotPasswordPage', 
      label: 'Forgot Password Image', 
      description: 'Image displayed on the forgot password page'
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
          <p className="text-sm text-[#4A7C99] mt-1">Upload images for login, register, and forgot password pages</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving || !Object.values(selectedFiles).some(f => f !== null)}
          className="bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                  Upload Image
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#5B9FBF]/10 hover:bg-[#5B9FBF]/20 border-2 border-dashed border-[#5B9FBF]/30 rounded-xl transition-all">
                      <Upload className="w-5 h-5 text-[#5B9FBF]" />
                      <span className="text-[#2C5F7C] font-medium">
                        {selectedFiles[field.key] ? selectedFiles[field.key].name : 'Choose Image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(field.key, e)}
                      className="hidden"
                    />
                  </label>
                  {selectedFiles[field.key] && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemoveFile(field.key)}
                      className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
                <p className="text-xs text-[#4A7C99] mt-2">
                  Supported formats: JPG, PNG, WebP • Max size: 5MB
                </p>
              </div>

              {/* Preview */}
              {previews[field.key] && (
                <div>
                  <label className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                    Preview
                  </label>
                  <div className="relative w-full h-64 bg-[#5B9FBF]/5 rounded-xl overflow-hidden">
                    <img
                      src={previews[field.key]}
                      alt={field.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center text-[#4A7C99] bg-[#5B9FBF]/5">
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
          <li>• Select high-quality images from your device</li>
          <li>• Recommended image dimensions: 1920x1080 or higher</li>
          <li>• Images should be relevant to farming/agriculture</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
          <li>• Maximum file size: 5MB per image</li>
          <li>• Click "Save Changes" after selecting images</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ImageSettings;
