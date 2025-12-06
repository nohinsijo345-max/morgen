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
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const subsidyRequests = await User.countDocuments({ subsidyRequested: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const activeCrops = await Crop.countDocuments({ status: { $in: ['listed', 'in_auction'] } });
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const totalSchemes = await Scheme.countDocuments({ status: 'active' });
    
    res.json({
      totalUsers,
      totalFarmers,
      totalBuyers,
      subsidyRequests,
      activeUsers,
      activeCrops,
      activeAuctions,
      totalSchemes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for user management)
router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find()
      .select('name farmerId phone email createdAt lastLogin subsidyRequested subsidyStatus role isActive district landSize cropTypes')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send update to user
router.post('/send-update', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const Update = require('../models/Update');
    
    const update = new Update({
      title: 'Admin Update',
      message,
      targetUsers: [userId],
      createdBy: 'admin'
    });
    
    await update.save();
    res.json({ message: 'Update sent successfully', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get image settings
router.get('/images', async (req, res) => {
  try {
    // For now, return default images
    // In production, store these in a Settings collection
    res.json({
      loginPage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
      registerPage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200',
      forgotPasswordPage: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update image settings
router.post('/images', async (req, res) => {
  try {
    const { loginPage, registerPage, forgotPasswordPage } = req.body;
    
    // In production, save to Settings collection
    // For now, just return success
    res.json({ 
      message: 'Images updated successfully',
      images: { loginPage, registerPage, forgotPasswordPage }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
