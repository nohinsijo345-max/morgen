const express = require('express');
const router = express.Router();

// In-memory storage for module analytics (in production, use a database)
let moduleAnalytics = {
  farmer: { visits: 0, lastAccessed: null },
  buyer: { visits: 0, lastAccessed: null },
  government: { visits: 0, lastAccessed: null },
  public: { visits: 0, lastAccessed: null },
  driver: { visits: 0, lastAccessed: null }
};

// Track module access
router.post('/track-access', async (req, res) => {
  try {
    const { moduleId, userAgent, timestamp } = req.body;

    if (!moduleId || !moduleAnalytics.hasOwnProperty(moduleId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid module ID' 
      });
    }

    // Update analytics
    moduleAnalytics[moduleId].visits += 1;
    moduleAnalytics[moduleId].lastAccessed = timestamp || new Date().toISOString();

    // Log for debugging
    console.log(`Module access tracked: ${moduleId} - Total visits: ${moduleAnalytics[moduleId].visits}`);

    res.json({
      success: true,
      message: 'Module access tracked successfully',
      data: {
        moduleId,
        totalVisits: moduleAnalytics[moduleId].visits,
        lastAccessed: moduleAnalytics[moduleId].lastAccessed
      }
    });

  } catch (error) {
    console.error('Error tracking module access:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get module analytics
router.get('/analytics', async (req, res) => {
  try {
    // Calculate total visits
    const totalVisits = Object.values(moduleAnalytics).reduce((sum, module) => sum + module.visits, 0);
    
    // Find most popular module
    const mostPopular = Object.entries(moduleAnalytics).reduce((max, [key, value]) => 
      value.visits > max.visits ? { id: key, visits: value.visits } : max, 
      { id: null, visits: 0 }
    );

    res.json({
      success: true,
      data: {
        modules: moduleAnalytics,
        summary: {
          totalVisits,
          mostPopular: mostPopular.id,
          mostPopularVisits: mostPopular.visits
        }
      }
    });

  } catch (error) {
    console.error('Error fetching module analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get module configuration
router.get('/config', async (req, res) => {
  try {
    const moduleConfig = {
      farmer: {
        id: 'farmer',
        name: 'Farmer Portal',
        description: 'Comprehensive farming management system',
        features: ['Crop Management', 'Weather Insights', 'AI Plant Doctor', 'Price Forecasts'],
        route: '/login',
        enabled: true,
        maintenanceMode: false
      },
      buyer: {
        id: 'buyer',
        name: 'Buyer Portal',
        description: 'Marketplace and auction platform',
        features: ['Live Auctions', 'Direct Purchase', 'Quality Assurance', 'Bulk Orders'],
        route: '/buyer/auction',
        enabled: true,
        maintenanceMode: false
      },
      government: {
        id: 'government',
        name: 'Government Portal',
        description: 'Policy and administrative management',
        features: ['Policy Management', 'Subsidy Distribution', 'Data Analytics', 'Compliance'],
        route: '/government/login',
        enabled: true,
        maintenanceMode: false
      },
      public: {
        id: 'public',
        name: 'Public Portal',
        description: 'Public information and resources',
        features: ['Market Prices', 'Educational Content', 'News Updates', 'Resources'],
        route: '/public/dashboard',
        enabled: true,
        maintenanceMode: false
      },
      driver: {
        id: 'driver',
        name: 'Driver Portal',
        description: 'Transport and delivery management',
        features: ['Route Optimization', 'Delivery Tracking', 'Earnings', 'Schedule Management'],
        route: '/driver/login',
        enabled: true,
        maintenanceMode: false
      }
    };

    res.json({
      success: true,
      data: moduleConfig
    });

  } catch (error) {
    console.error('Error fetching module config:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update module status (for admin use)
router.put('/config/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { enabled, maintenanceMode } = req.body;

    if (!moduleAnalytics.hasOwnProperty(moduleId)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Module not found' 
      });
    }

    // In a real application, you would update the database here
    console.log(`Module ${moduleId} status updated:`, { enabled, maintenanceMode });

    res.json({
      success: true,
      message: 'Module status updated successfully',
      data: {
        moduleId,
        enabled,
        maintenanceMode,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating module status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health check for modules
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      farmer: { status: 'healthy', responseTime: Math.random() * 100 + 50 },
      buyer: { status: 'healthy', responseTime: Math.random() * 100 + 50 },
      government: { status: 'healthy', responseTime: Math.random() * 100 + 50 },
      public: { status: 'healthy', responseTime: Math.random() * 100 + 50 },
      driver: { status: 'healthy', responseTime: Math.random() * 100 + 50 }
    };

    res.json({
      success: true,
      data: {
        overall: 'healthy',
        modules: healthStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error checking module health:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;