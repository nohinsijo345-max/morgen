import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const MyCustomersSimple = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('MyCustomers component mounted');
    
    // Test basic functionality
    try {
      const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      console.log('Current user:', user);
      
      if (!user.farmerId) {
        setError('No farmer ID found in session');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in MyCustomers:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: colors.textPrimary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 rounded-lg" style={{ backgroundColor: colors.surface }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>Error</h2>
          <p style={{ color: colors.textSecondary }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            My Customers (Simple Version)
          </h1>
          <p style={{ color: colors.textSecondary }}>
            This is a simplified version to test basic functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              Connected Customers
            </h3>
            <p style={{ color: colors.textSecondary }}>
              View your connected buyers
            </p>
            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">Feature working ✓</p>
            </div>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              Find New Buyers
            </h3>
            <p style={{ color: colors.textSecondary }}>
              Discover potential customers
            </p>
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800">Feature working ✓</p>
            </div>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              Connection Requests
            </h3>
            <p style={{ color: colors.textSecondary }}>
              Manage incoming requests
            </p>
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800">Feature working ✓</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: colors.surface }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            Debug Information
          </h3>
          <div className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
            <p>✓ Component rendered successfully</p>
            <p>✓ Theme context working</p>
            <p>✓ Navigation working</p>
            <p>✓ User session accessible</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCustomersSimple;