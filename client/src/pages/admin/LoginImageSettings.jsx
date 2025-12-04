import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, Eye } from 'lucide-react';
import axios from 'axios';

const LoginImageSettings = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/settings/login-image`);
      setCurrentImage(response.data.imageUrl);
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Failed to fetch image:', error);
    }
  };

  const handleUpdate = async () => {
    if (!imageUrl.trim()) {
      setMessage('Please enter an image URL');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.put(`${API_URL}/api/settings/login-image`, {
        imageUrl: imageUrl.trim(),
        adminId: 'admin' // Replace with actual admin ID from auth
      });

      setCurrentImage(imageUrl.trim());
      setMessage('Login image updated successfully!');
    } catch (error) {
      setMessage('Failed to update image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Login Page Image</h1>
            <p className="text-gray-500">Manage the image displayed on the login page</p>
          </div>
        </div>

        {/* Current Image Preview */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current Image
          </label>
          <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Login page"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <ImageIcon className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* Image URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter a direct URL to an image (JPG, PNG, WebP)
          </p>
        </div>

        {/* Preview New Image */}
        {imageUrl && imageUrl !== currentImage && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preview New Image
            </label>
            <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleUpdate}
            disabled={loading || !imageUrl.trim() || imageUrl === currentImage}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Updating...' : 'Update Image'}
          </button>
          
          <button
            onClick={() => window.open('/login', '_blank')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Preview Login Page
          </button>
        </div>

        {/* Suggested Images */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Suggested Images</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              'https://unsplash.com/photos/black-farming-harvesting-machine-FJGZFxtQWko',
              'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070',
              ''
            ].map((url, index) => (
              <div
                key={index}
                onClick={() => setImageUrl(url)}
                className="relative h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
              >
                <img src={url} alt={`Suggestion ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginImageSettings;
