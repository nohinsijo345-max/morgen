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
      userId: userId, // Store the specific farmer's ID
      title: 'Admin Update',
      message,
      createdBy: 'admin',
      isActive: true
    });
    
    await update.save();
    console.log(`✅ Update sent to user ${userId}`);
    res.json({ message: 'Update sent successfully', update });
  } catch (err) {
    console.error('Failed to send update:', err);
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

// Get all messages sent by admin
router.get('/messages', async (req, res) => {
  try {
    const Update = require('../models/Update');
    const messages = await Update.find()
      .populate('userId', 'name farmerId email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const Update = require('../models/Update');
    const { messageId } = req.params;
    
    const deletedMessage = await Update.findByIdAndDelete(messageId);
    
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    console.log(`✅ Message deleted: ${messageId}`);
    res.json({ message: 'Message deleted successfully', deletedMessage });
  } catch (err) {
    console.error('Failed to delete message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all profile change requests
router.get('/profile-requests', async (req, res) => {
  try {
    const ProfileChangeRequest = require('../models/ProfileChangeRequest');
    const requests = await ProfileChangeRequest.find({ status: 'pending' })
      .populate('userId', 'name farmerId email phone')
      .sort({ requestedAt: -1 });
    
    // Format response to include farmer details
    const formattedRequests = requests.map(req => ({
      _id: req._id,
      farmer: {
        name: req.userId?.name,
        farmerId: req.userId?.farmerId,
        email: req.userId?.email,
        phone: req.userId?.phone
      },
      changes: req.changes,
      status: req.status,
      requestedAt: req.requestedAt
    }));
    
    res.json(formattedRequests);
  } catch (err) {
    console.error('Failed to fetch profile requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Approve profile change request
router.post('/profile-requests/:requestId/approve', async (req, res) => {
  try {
    const ProfileChangeRequest = require('../models/ProfileChangeRequest');
    const User = require('../models/User');
    const { requestId } = req.params;
    
    const request = await ProfileChangeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Validate city if it's being changed
    if (request.changes.city && !/[a-zA-Z]/.test(request.changes.city)) {
      return res.status(400).json({ error: 'City name must contain at least one letter' });
    }
    
    // Update user profile with approved changes
    await User.findByIdAndUpdate(request.userId, {
      $set: request.changes
    });
    
    // Update request status
    request.status = 'approved';
    request.reviewedAt = new Date();
    request.reviewedBy = 'admin';
    await request.save();
    
    console.log(`✅ Profile change request approved for user ${request.userId}:`, request.changes);
    res.json({ message: 'Profile change request approved successfully', request });
  } catch (err) {
    console.error('Failed to approve request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reject profile change request
router.post('/profile-requests/:requestId/reject', async (req, res) => {
  try {
    const ProfileChangeRequest = require('../models/ProfileChangeRequest');
    const { requestId } = req.params;
    
    const request = await ProfileChangeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }
    
    // Update request status
    request.status = 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = 'admin';
    await request.save();
    
    console.log(`✅ Profile change request rejected for user ${request.userId}`);
    res.json({ message: 'Profile change request rejected', request });
  } catch (err) {
    console.error('Failed to reject request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Image Settings Management
const Settings = require('../models/Settings');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Upload image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = `/uploads/images/${req.file.filename}`;

    res.json({ 
      success: true,
      message: 'Image uploaded successfully',
      imagePath: imagePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Get all page images
router.get('/images', async (req, res) => {
  try {
    const loginImage = await Settings.findOne({ key: 'loginPageImage' });
    const registerImage = await Settings.findOne({ key: 'registerPageImage' });
    const forgotPasswordImage = await Settings.findOne({ key: 'forgotPasswordPageImage' });

    res.json({
      loginPage: loginImage?.value || '',
      registerPage: registerImage?.value || '',
      forgotPasswordPage: forgotPasswordImage?.value || ''
    });
  } catch (error) {
    console.error('Failed to fetch images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Save page images
router.post('/images', async (req, res) => {
  try {
    const { loginPage, registerPage, forgotPasswordPage } = req.body;

    // Update or create settings
    if (loginPage) {
      await Settings.findOneAndUpdate(
        { key: 'loginPageImage' },
        { value: loginPage, updatedAt: new Date() },
        { upsert: true }
      );
    }

    if (registerPage) {
      await Settings.findOneAndUpdate(
        { key: 'registerPageImage' },
        { value: registerPage, updatedAt: new Date() },
        { upsert: true }
      );
    }

    if (forgotPasswordPage) {
      await Settings.findOneAndUpdate(
        { key: 'forgotPasswordPageImage' },
        { value: forgotPasswordPage, updatedAt: new Date() },
        { upsert: true }
      );
    }

    res.json({ success: true, message: 'Images updated successfully' });
  } catch (error) {
    console.error('Failed to save images:', error);
    res.status(500).json({ error: 'Failed to save images' });
  }
});

module.exports = router;
