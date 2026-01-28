const express = require('express');
const router = express.Router();

// Government login - this will be accessible at /api/government/login
router.post('/login', async (req, res) => {
  try {
    const { govId, password } = req.body;
    console.log('🏛️ Government login attempt:', { govId, password: '***' });
    
    // Demo government credentials
    if (govId === 'GOV001' && password === 'admin123') {
      const governmentUser = {
        id: 'gov_001',
        govId: 'GOV001',
        name: 'Agricultural Department',
        department: 'Ministry of Agriculture',
        role: 'Government Official',
        permissions: ['subsidy_approval', 'scheme_management', 'analytics_view']
      };
      
      console.log('✅ Government login successful for:', govId);
      res.json({
        success: true,
        message: 'Government login successful',
        user: governmentUser
      });
    } else {
      console.log('❌ Invalid government credentials:', { govId });
      res.status(401).json({
        success: false,
        message: 'Invalid government credentials'
      });
    }
  } catch (error) {
    console.error('Government login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during government login'
    });
  }
});

// Government dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Demo government dashboard data
    const stats = {
      totalFarmers: 1247,
      pendingSubsidies: 89,
      approvedSubsidies: 234,
      totalSchemes: 15,
      monthlyBudget: 2500000,
      utilizationRate: 78
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Government dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government dashboard data'
    });
  }
});

module.exports = router;