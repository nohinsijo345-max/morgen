const router = require('express').Router();
const Crop = require('../models/Crop');
const Alert = require('../models/Alert');
const Scheme = require('../models/Scheme');
const Auction = require('../models/Auction');

// Set MSP for a crop category
router.post('/msp/set', async (req, res) => {
  try {
    const { category, msp, adminId } = req.body;
    
    // Update all crops of this category
    await Crop.updateMany(
      { category },
      { $set: { msp } }
    );
    
    res.json({ message: `MSP set to ₹${msp} for ${category}`, category, msp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create emergency alert
router.post('/alert/create', async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    
    // TODO: Trigger real-time notification via Socket.io
    
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market freeze - pause all auctions
router.post('/market/freeze', async (req, res) => {
  try {
    const { adminId, reason } = req.body;
    
    await Auction.updateMany(
      { status: 'active' },
      { $set: { status: 'paused' } }
    );
    
    // Create system alert
    const alert = new Alert({
      title: 'Market Frozen',
      message: `All bidding has been paused. Reason: ${reason}`,
      type: 'system',
      severity: 'critical',
      targetAudience: 'all',
      createdBy: adminId
    });
    await alert.save();
    
    res.json({ message: 'Market frozen successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market unfreeze
router.post('/market/unfreeze', async (req, res) => {
  try {
    await Auction.updateMany(
      { status: 'paused' },
      { $set: { status: 'active' } }
    );
    
    res.json({ message: 'Market unfrozen successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create scheme
router.post('/scheme/create', async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    await scheme.save();
    res.status(201).json(scheme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find({ status: 'active' })
      .sort({ createdAt: -1 });
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject scheme application
router.post('/scheme/:schemeId/application/:applicationId', async (req, res) => {
  try {
    const { schemeId, applicationId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    
    const application = scheme.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.status = status;
    await scheme.save();
    
    res.json({ message: `Application ${status}`, application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalFarmers = await require('../models/User').countDocuments({ role: 'farmer' });
    const totalBuyers = await require('../models/User').countDocuments({ role: 'buyer' });
    const activeCrops = await Crop.countDocuments({ status: { $in: ['listed', 'in_auction'] } });
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const totalSchemes = await Scheme.countDocuments({ status: 'active' });
    
    res.json({
      totalFarmers,
      totalBuyers,
      activeCrops,
      activeAuctions,
      totalSchemes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
