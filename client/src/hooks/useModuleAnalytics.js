import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const useModuleAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track module access
  const trackModuleAccess = async (moduleId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/modules/track-access`, {
        moduleId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (err) {
      console.error('Error tracking module access:', err);
      throw err;
    }
  };

  // Get module analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/modules/analytics`);
      setAnalytics(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get module configuration
  const fetchModuleConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/modules/config`);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching module config:', err);
      throw err;
    }
  };

  // Check module health
  const checkModuleHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/modules/health`);
      return response.data.data;
    } catch (err) {
      console.error('Error checking module health:', err);
      throw err;
    }
  };

  return {
    analytics,
    loading,
    error,
    trackModuleAccess,
    fetchAnalytics,
    fetchModuleConfig,
    checkModuleHealth
  };
};