const router = require('express').Router();
const Crop = require('../models/Crop');
const Alert = require('../models/Alert');
const Scheme = require('../models/Scheme');
const Auction = require('../models/Auction');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET ADMIN BUYER DASHBOARD DATA
router.get('/buyer/dashboard', async (req, res) => {
  try {
    // Get buyer statistics
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const activeBuyers = await User.countDocuments({ role: 'buyer', isActive: true });
    
    // Get recent buyers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBuyers = await User.find({
      role: 'buyer',
      createdAt: { $gte: thirtyDaysAgo }
    })
    .select('name buyerId email city state createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get top buyers by spending
    const topBuyers = await User.find({ role: 'buyer' })
      .select('name buyerId totalSpent totalPurchases')
      .sort({ totalSpent: -1 })
      .limit(10);

    // Calculate total orders and revenue from buyers
    const buyerStats = await User.aggregate([
      { $match: { role: 'buyer' } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: '$totalPurchases' },
          totalRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);

    const stats = buyerStats[0] || { totalOrders: 0, totalRevenue: 0 };

    res.json({
      totalBuyers,
      activeBuyers,
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      pendingApprovals: 0, // Will be implemented with profile change requests
      recentBuyers,
      topBuyers
    });

  } catch (error) {
    console.error('Admin buyer dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin buyer dashboard' });
  }
});

// GET ALL BUYERS
router.get('/buyers', async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' })
      .select('-pin')
      .sort({ createdAt: -1 });
    
    res.json(buyers);
  } catch (error) {
    console.error('Failed to fetch buyers:', error);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// UPDATE BUYER STATUS
router.patch('/buyers/:buyerId/status', async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { isActive } = req.body;

    const buyer = await User.findByIdAndUpdate(
      buyerId,
      { isActive },
      { new: true }
    ).select('-pin');

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json(buyer);
  } catch (error) {
    console.error('Failed to update buyer status:', error);
    res.status(500).json({ error: 'Failed to update buyer status' });
  }
});

// DELETE BUYER
router.delete('/buyers/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;

    const buyer = await User.findByIdAndDelete(buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Failed to delete buyer:', error);
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
});

// Set MSP for a crop category
router.post('/msp/set', async (req, res) => {
  try {
    const { category, msp, adminId } = req.body;
    
    // Update all crops of this category
    await Crop.updateMany(
      { category },
      { $set: { msp } }
    );
    
    // Notify all farmers who grow this crop category
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    const farmers = await User.find({ 
      role: 'farmer',
      cropTypes: { $in: [category] }
    });
    
    for (const farmer of farmers) {
      const update = new Update({
        userId: farmer._id,
        title: 'MSP Updated',
        message: `The Minimum Support Price for ${category} has been updated to ₹${msp}. This new rate is now effective for all your ${category} crops.`,
        category: 'market',
        isActive: true
      });
      await update.save();
    }
    
    console.log(`✅ MSP notification sent to ${farmers.length} farmers growing ${category}`);
    
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
    const { status, reason } = req.body; // 'approved' or 'rejected'
    
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    
    const application = scheme.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.status = status;
    if (reason) application.reviewNotes = reason;
    await scheme.save();
    
    // Send notification to farmer
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    const farmer = await User.findOne({ farmerId: application.farmerId });
    if (farmer) {
      const update = new Update({
        userId: farmer._id,
        title: `Scheme Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: status === 'approved' 
          ? `Your application for "${scheme.title}" has been approved! You will receive further instructions on how to proceed.`
          : `Your application for "${scheme.title}" has been rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
        category: 'government',
        isActive: true
      });
      await update.save();
    }
    
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
      .select('name farmerId buyerId phone email createdAt lastLogin subsidyRequested subsidyStatus role isActive district city state pinCode landSize cropTypes profileImage')
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

// Image settings routes moved below (after multer setup)

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

// Get buyer profile requests count
router.get('/buyer-profile-requests-count', async (req, res) => {
  try {
    const ProfileChangeRequest = require('../models/ProfileChangeRequest');
    const requests = await ProfileChangeRequest.find({ status: 'pending' })
      .populate('userId', 'role');
    
    const buyerRequestsCount = requests.filter(req => req.userId?.role === 'buyer').length;
    
    res.json({ count: buyerRequestsCount });
  } catch (err) {
    console.error('Failed to fetch buyer profile requests count:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all profile change requests
router.get('/profile-requests', async (req, res) => {
  try {
    const ProfileChangeRequest = require('../models/ProfileChangeRequest');
    const requests = await ProfileChangeRequest.find({ status: 'pending' })
      .populate('userId', 'name farmerId buyerId email phone role')
      .sort({ requestedAt: -1 });
    
    // Format response to include user details (farmer or buyer)
    const formattedRequests = requests.map(req => ({
      _id: req._id,
      user: {
        name: req.userId?.name,
        farmerId: req.userId?.farmerId,
        buyerId: req.userId?.buyerId,
        email: req.userId?.email,
        phone: req.userId?.phone,
        role: req.userId?.role
      },
      // Keep backward compatibility with 'farmer' field for existing admin UI
      farmer: {
        name: req.userId?.name,
        farmerId: req.userId?.farmerId || req.userId?.buyerId,
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
    const Update = require('../models/Update');
    const { requestId } = req.params;
    
    const request = await ProfileChangeRequest.findById(requestId).populate('userId');
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
    console.log(`🔍 About to update user profile with changes:`, JSON.stringify(request.changes, null, 2));
    
    // Only update fields that have actual values (not null/undefined/empty)
    const fieldsToUpdate = {};
    Object.keys(request.changes).forEach(field => {
      const value = request.changes[field];
      if (value !== null && value !== undefined && value !== '') {
        fieldsToUpdate[field] = value;
      }
    });
    
    console.log(`🔍 Filtered fields to update:`, JSON.stringify(fieldsToUpdate, null, 2));
    
    await User.findByIdAndUpdate(request.userId, {
      $set: fieldsToUpdate
    });
    
    // Update request status
    request.status = 'approved';
    request.reviewedAt = new Date();
    request.reviewedBy = 'admin';
    await request.save();
    
    // Send notification to farmer - only show originally requested fields
    // Get the original changes from the request (before any modifications)
    const originalChanges = { ...request.changes };
    
    // Filter out empty or undefined values that weren't actually requested
    const actuallyChangedFields = Object.keys(originalChanges).filter(field => {
      const value = originalChanges[field];
      
      // Filter out empty cropTypes arrays
      if (field === 'cropTypes' && Array.isArray(value) && value.length === 0) {
        return false;
      }
      
      // Filter out null, undefined, or empty string values that weren't intentionally set
      if (value === null || value === undefined || value === '') {
        return false;
      }
      
      return true;
    });
    
    const changesList = actuallyChangedFields.map(field => {
      if (field === 'pinCode') return 'PIN Code';
      if (field === 'landSize') return 'Land Size';
      if (field === 'cropTypes') return 'Crop Types';
      return field.charAt(0).toUpperCase() + field.slice(1);
    }).join(', ');
    
    console.log(`🔍 Original changes:`, JSON.stringify(originalChanges, null, 2));
    console.log(`🔍 Actually changed fields:`, actuallyChangedFields);
    console.log(`🔍 Notification will show:`, changesList);
    
    const update = new Update({
      userId: request.userId._id,
      title: 'Profile Changes Approved',
      message: `Your profile change request has been approved! Updated fields: ${changesList}. Your profile information has been updated successfully.`,
      category: 'profile',
      isActive: true
    });
    await update.save();
    
    console.log(`✅ Profile change request approved for user ${request.userId._id}:`, request.changes);
    
    // Determine if this is a buyer or farmer for appropriate messaging
    const userRole = request.userId.role || 'farmer';
    const userIdField = userRole === 'buyer' ? 'buyerId' : 'farmerId';
    const userIdValue = request.userId[userIdField];
    
    // If this is a buyer, also create a buyer-specific notification
    if (userRole === 'buyer') {
      try {
        const axios = require('axios');
        const API_URL = process.env.API_URL || 'http://localhost:5050';
        
        await axios.post(`${API_URL}/api/buyer-notifications/account-notification`, {
          buyerId: userIdValue,
          type: 'profile_updated',
          details: {
            changes: changesList
          }
        });
        
        console.log(`📢 Buyer notification sent to ${userIdValue} about profile approval`);
      } catch (notificationError) {
        console.error('Failed to send buyer notification:', notificationError.message);
        // Don't fail the main request if notification fails
      }
    }
    
    console.log(`📢 Notification sent to ${userRole} ${userIdValue} about profile approval`);
    
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
    const Update = require('../models/Update');
    const { requestId } = req.params;
    const { reason } = req.body;
    
    const request = await ProfileChangeRequest.findById(requestId).populate('userId');
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
    request.reviewNotes = reason || 'Request rejected by admin';
    await request.save();
    
    // Send notification to farmer
    const update = new Update({
      userId: request.userId._id,
      title: 'Profile Changes Rejected',
      message: `Your profile change request has been rejected. ${reason ? `Reason: ${reason}` : 'Please contact support if you have questions.'} You can submit a new request with corrected information.`,
      category: 'profile',
      isActive: true
    });
    await update.save();
    
    console.log(`✅ Profile change request rejected for user ${request.userId._id}`);
    
    // Determine if this is a buyer or farmer for appropriate messaging
    const userRole = request.userId.role || 'farmer';
    const userIdField = userRole === 'buyer' ? 'buyerId' : 'farmerId';
    const userIdValue = request.userId[userIdField];
    
    // If this is a buyer, also create a buyer-specific notification
    if (userRole === 'buyer') {
      try {
        const axios = require('axios');
        const API_URL = process.env.API_URL || 'http://localhost:5050';
        
        await axios.post(`${API_URL}/api/buyer-notifications/account-notification`, {
          buyerId: userIdValue,
          type: 'profile_rejected',
          details: {
            reason: reason || 'Request rejected by admin'
          }
        });
        
        console.log(`📢 Buyer notification sent to ${userIdValue} about profile rejection`);
      } catch (notificationError) {
        console.error('Failed to send buyer notification:', notificationError.message);
        // Don't fail the main request if notification fails
      }
    }
    
    console.log(`📢 Notification sent to ${userRole} ${userIdValue} about profile rejection`);
    
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

    // Use relative path that will work with the static file serving
    const imagePath = `http://localhost:5050/uploads/images/${req.file.filename}`;
    
    console.log('📤 Image uploaded:', imagePath);

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

    console.log('💾 Saving images:', { loginPage, registerPage, forgotPasswordPage });

    // Update or create settings
    if (loginPage) {
      const updated = await Settings.findOneAndUpdate(
        { key: 'loginPageImage' },
        { value: loginPage, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log('✅ Login image saved:', updated);
    }

    if (registerPage) {
      const updated = await Settings.findOneAndUpdate(
        { key: 'registerPageImage' },
        { value: registerPage, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log('✅ Register image saved:', updated);
    }

    if (forgotPasswordPage) {
      const updated = await Settings.findOneAndUpdate(
        { key: 'forgotPasswordPageImage' },
        { value: forgotPasswordPage, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log('✅ Forgot password image saved:', updated);
    }

    res.json({ success: true, message: 'Images updated successfully' });
  } catch (error) {
    console.error('Failed to save images:', error);
    res.status(500).json({ error: 'Failed to save images' });
  }
});

// ============================================
// TRANSPORT MANAGEMENT ROUTES
// ============================================

// Get all vehicles
router.get('/transport/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Create vehicle
router.post('/transport/vehicles', async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Update vehicle
router.put('/transport/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle
router.delete('/transport/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Get all drivers
router.get('/transport/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password').sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// Create driver
router.post('/transport/drivers', async (req, res) => {
  try {
    const { password, ...driverData } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const driver = new Driver({
      ...driverData,
      password: hashedPassword
    });
    
    await driver.save();
    
    // Return driver without password
    const { password: _, ...driverResponse } = driver.toObject();
    res.status(201).json({ message: 'Driver created successfully', driver: driverResponse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// Update driver
router.put('/transport/drivers/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json({ message: 'Driver updated successfully', driver });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// Delete driver
router.delete('/transport/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    // Unassign all vehicles from this driver
    await Vehicle.updateMany(
      { driverId: driver.driverId },
      { $unset: { driverId: 1, assignedAt: 1 } }
    );
    
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

// Assign vehicle to driver
router.post('/transport/assign-vehicle', async (req, res) => {
  try {
    const { vehicleId, driverId } = req.body;
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { 
        driverId,
        assignedAt: new Date()
      },
      { new: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Notify driver about vehicle assignment
    const Update = require('../models/Update');
    const Driver = require('../models/Driver');
    
    const driver = await Driver.findOne({ driverId });
    if (driver) {
      const update = new Update({
        userId: driver._id,
        title: 'Vehicle Assigned',
        message: `A ${vehicle.type} (${vehicle.model}) has been assigned to you. Vehicle ID: ${vehicle.vehicleNumber}. You can now accept bookings for this vehicle.`,
        category: 'transport',
        isActive: true
      });
      await update.save();
    }
    
    res.json({ message: 'Vehicle assigned successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign vehicle' });
  }
});

// Unassign vehicle from driver
router.post('/transport/unassign-vehicle', async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    // Get vehicle info before unassigning
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const previousDriverId = vehicle.driverId;
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { 
        $unset: { driverId: 1, assignedAt: 1 }
      },
      { new: true }
    );
    
    // Notify driver about vehicle unassignment
    if (previousDriverId) {
      const Update = require('../models/Update');
      const Driver = require('../models/Driver');
      
      const driver = await Driver.findOne({ driverId: previousDriverId });
      if (driver) {
        const update = new Update({
          userId: driver._id,
          title: 'Vehicle Unassigned',
          message: `The ${vehicle.type} (${vehicle.model}) has been unassigned from you. Vehicle ID: ${vehicle.vehicleNumber}. Please contact admin if you have questions.`,
          category: 'transport',
          isActive: true
        });
        await update.save();
      }
    }
    
    res.json({ message: 'Vehicle unassigned successfully', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unassign vehicle' });
  }
});

// Get available vehicles for assignment
router.get('/transport/available-vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      $or: [
        { driverId: { $exists: false } },
        { driverId: null }
      ]
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available vehicles' });
  }
});

// Get all bookings
router.get('/transport/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/transport/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Transport dashboard stats
router.get('/transport/stats', async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ availability: true });
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$finalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    res.json({
      totalVehicles,
      activeVehicles,
      totalDrivers,
      activeDrivers,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transport stats' });
  }
});

// ============================================
// CUSTOMER SUPPORT MANAGEMENT ROUTES
// ============================================

const CustomerSupport = require('../models/CustomerSupport');

// Get all support tickets (for admin)
router.get('/support/tickets', async (req, res) => {
  try {
    const tickets = await CustomerSupport.find()
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

// Reply to support ticket
router.post('/support/tickets/:ticketId/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const newMessage = {
      sender: 'admin',
      message,
      timestamp: new Date(),
      isRead: false
    };
    
    ticket.messages.push(newMessage);
    ticket.status = 'in-progress';
    ticket.updatedAt = new Date(); // Force update timestamp
    await ticket.save();
    
    // Get the updated ticket
    const updatedTicket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to specific ticket room
      io.to(`ticket-${req.params.ticketId}`).emit('new-message', {
        ticketId: req.params.ticketId,
        message: newMessage,
        ticket: updatedTicket
      });
      
      // Emit to farmer room
      io.to(`farmer-${ticket.farmerId}`).emit('ticket-updated', {
        ticketId: req.params.ticketId,
        ticket: updatedTicket,
        type: 'admin-reply'
      });
    }
    
    // Send notification to farmer when admin replies
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    const farmer = await User.findOne({ farmerId: ticket.farmerId });
    if (farmer) {
      const update = new Update({
        userId: farmer._id,
        title: 'Support Reply Received',
        message: `You have received a reply to your support ticket "${ticket.subject}". Check your support tickets for the latest update.`,
        category: 'support',
        isActive: true
      });
      await update.save();
    }
    
    res.json({ message: 'Reply sent successfully', ticket: updatedTicket });
  } catch (error) {
    console.error('Failed to send reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Update ticket status
router.patch('/support/tickets/:ticketId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await CustomerSupport.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { 
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// ============================================
// BUYER CUSTOMER SUPPORT MANAGEMENT ROUTES
// ============================================

// Get buyer support tickets only
router.get('/support/buyer-tickets', async (req, res) => {
  try {
    const tickets = await CustomerSupport.find({ userType: 'buyer' })
      .sort({ updatedAt: -1 });
    
    // Populate buyer names from User collection
    const User = require('../models/User');
    const ticketsWithBuyerNames = await Promise.all(
      tickets.map(async (ticket) => {
        const buyer = await User.findOne({ buyerId: ticket.buyerId }).select('name');
        return {
          ...ticket.toObject(),
          buyerName: buyer?.name || ticket.buyerId
        };
      })
    );
    
    res.json(ticketsWithBuyerNames);
  } catch (error) {
    console.error('Failed to fetch buyer support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch buyer support tickets' });
  }
});

// Send bulk message to buyers
router.post('/support/bulk-message-buyers', async (req, res) => {
  try {
    const { message, type } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const User = require('../models/User');
    const Update = require('../models/Update');
    
    // Determine which buyers to target
    let buyerQuery = { role: 'buyer', isActive: true };
    
    if (type === 'active') {
      // Buyers with recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      buyerQuery.lastLogin = { $gte: thirtyDaysAgo };
    } else if (type === 'new') {
      // New buyers (registered in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      buyerQuery.createdAt = { $gte: thirtyDaysAgo };
    }
    // 'all' type uses the base query
    
    const buyers = await User.find(buyerQuery).select('_id buyerId name');
    
    if (buyers.length === 0) {
      return res.status(404).json({ error: 'No buyers found matching the criteria' });
    }
    
    // Create notifications for all matching buyers
    const notifications = buyers.map(buyer => ({
      userId: buyer._id,
      title: 'Important Message from Admin',
      message: message.trim(),
      category: 'system',
      isActive: true,
      createdAt: new Date()
    }));
    
    await Update.insertMany(notifications);
    
    // Also create buyer-specific notifications
    try {
      const axios = require('axios');
      const API_URL = process.env.API_URL || 'http://localhost:5050';
      
      for (const buyer of buyers) {
        await axios.post(`${API_URL}/api/buyer-notifications/system-notification`, {
          buyerId: buyer.buyerId,
          type: 'admin_message',
          details: {
            message: message.trim()
          }
        });
      }
      
      console.log(`📢 Buyer-specific notifications sent to ${buyers.length} buyers`);
    } catch (notificationError) {
      console.error('Failed to send buyer-specific notifications:', notificationError.message);
      // Don't fail the main request if buyer notifications fail
    }
    
    // Emit real-time notification via Socket.IO to all buyers
    const io = req.app.get('io');
    if (io) {
      buyers.forEach(buyer => {
        io.to(`buyer-${buyer.buyerId}`).emit('new-notification', {
          title: 'Important Message from Admin',
          message: message.trim(),
          category: 'system',
          timestamp: new Date()
        });
      });
    }
    
    console.log(`✅ Bulk message sent to ${buyers.length} buyers (type: ${type})`);
    
    res.json({ 
      message: `Bulk message sent successfully to ${buyers.length} buyers`,
      recipientCount: buyers.length,
      type: type
    });
  } catch (error) {
    console.error('Failed to send bulk message to buyers:', error);
    res.status(500).json({ error: 'Failed to send bulk message' });
  }
});

// Save buyer settings
router.post('/buyer/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // Here you would typically save to a settings collection
    // For now, we'll just return success
    console.log('✅ Buyer settings saved:', settings);
    
    res.json({ 
      message: 'Buyer settings saved successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Failed to save buyer settings:', error);
    res.status(500).json({ error: 'Failed to save buyer settings' });
  }
});

// Send bid message to buyers
router.post('/buyer/bid-message', async (req, res) => {
  try {
    const { message, type } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const User = require('../models/User');
    const Update = require('../models/Update');
    
    // Determine which buyers to target based on type
    let buyerQuery = { role: 'buyer', isActive: true };
    
    if (type === 'active') {
      // Active bidders (buyers with recent bids)
      buyerQuery.activeBids = { $gt: 0 };
    } else if (type === 'winners') {
      // Recent winners (buyers who won bids recently)
      buyerQuery.wonBids = { $gt: 0 };
    } else if (type === 'high-value') {
      // High-value buyers (buyers with high total spent)
      buyerQuery.totalSpent = { $gte: 50000 };
    }
    // 'all' type uses the base query
    
    const buyers = await User.find(buyerQuery).select('_id buyerId name totalSpent');
    
    if (buyers.length === 0) {
      return res.status(404).json({ error: 'No buyers found matching the criteria' });
    }
    
    // Create bid-specific notifications
    const notifications = buyers.map(buyer => ({
      userId: buyer._id,
      title: 'New Bidding Opportunity',
      message: message.trim(),
      category: 'bidding',
      isActive: true,
      createdAt: new Date()
    }));
    
    await Update.insertMany(notifications);
    
    // Also create buyer-specific notifications
    try {
      const axios = require('axios');
      const API_URL = process.env.API_URL || 'http://localhost:5050';
      
      for (const buyer of buyers) {
        await axios.post(`${API_URL}/api/buyer-notifications/bidding-notification`, {
          buyerId: buyer.buyerId,
          type: 'bid_opportunity',
          details: {
            message: message.trim(),
            targetType: type
          }
        });
      }
      
      console.log(`📢 Bid notifications sent to ${buyers.length} buyers`);
    } catch (notificationError) {
      console.error('Failed to send buyer bid notifications:', notificationError.message);
      // Don't fail the main request if buyer notifications fail
    }
    
    // Emit real-time notification via Socket.IO to all targeted buyers
    const io = req.app.get('io');
    if (io) {
      buyers.forEach(buyer => {
        io.to(`buyer-${buyer.buyerId}`).emit('new-notification', {
          title: 'New Bidding Opportunity',
          message: message.trim(),
          category: 'bidding',
          timestamp: new Date()
        });
      });
    }
    
    console.log(`✅ Bid message sent to ${buyers.length} buyers (type: ${type})`);
    
    res.json({ 
      message: `Bid message sent successfully to ${buyers.length} buyers`,
      recipientCount: buyers.length,
      type: type
    });
  } catch (error) {
    console.error('Failed to send bid message to buyers:', error);
    res.status(500).json({ error: 'Failed to send bid message' });
  }
});

module.exports = router;
