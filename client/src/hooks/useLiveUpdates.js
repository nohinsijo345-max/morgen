import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useLiveUpdates = (endpoint, options = {}) => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    dependencies = [],
    onUpdate = null,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !endpoint) {
      console.log('🚫 Fetch skipped:', { enabled, endpoint });
      return;
    }

    try {
      console.log('🔄 Fetching data from:', endpoint);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const fullUrl = `${API_URL}${endpoint}`;
      console.log('📡 Full URL:', fullUrl);
      
      const response = await axios.get(fullUrl);
      console.log('✅ Response received:', response.data);
      
      if (mountedRef.current) {
        const newData = response.data;
        setData(newData);
        setError(null);
        setLastUpdated(new Date());
        
        if (onUpdate) {
          onUpdate(newData);
        }
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      if (mountedRef.current) {
        console.error('Live update error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch data';
        setError(errorMessage);
        
        if (onError) {
          onError(err);
        }
      }
    } finally {
      if (mountedRef.current) {
        console.log('✅ Setting loading to false');
        setLoading(false);
      }
    }
  }, [endpoint, enabled, onUpdate, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }
  }, [fetchData, enabled, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled) {
        refresh();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, refresh, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling
  };
};

export default useLiveUpdates;