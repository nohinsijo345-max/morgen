const router = require('express').Router();
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const bcrypt = require('bcryptjs');

// Get pending change request for a user (farmer or buyer)
router.get('/pending-request/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Determine if it's a farmer or buyer based on ID format
    let user;
    if (userId.startsWith('MGB') || userId.startsWith('MGPB')) {
      // Buyer ID format
      user = await User.findOne({ buyerId: userId });
    } else {
      // Farmer ID format
      user = await User.findOne({ farmerId: userId });
    }
    
    if (!user) {
      // Return 200 with null instead of 404 to avoid console errors
      return res.json({ pendingRequest: null, message: 'User not found' });
    }

    const pendingRequest = await ProfileChangeRequest.findOne({
      userId: user._id,
      status: 'pending'
    });

    // Return 200 with null if no pending request (instead of 404)
    if (!pendingRequest) {
      return res.json({ pendingRequest: null });
    }

    res.json({ pendingRequest });
  } catch (err) {
    console.error('Error fetching pending request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Submit profile change request
router.post('/request-change', async (req, res) => {
  try {
    const { farmerId, buyerId, changes } = req.body;
    
    // Determine user type and find user
    let user;
    let userId;
    if (buyerId) {
      user = await User.findOne({ buyerId });
      userId = buyerId;
    } else if (farmerId) {
      user = await User.findOne({ farmerId });
      userId = farmerId;
    } else {
      return res.status(400).json({ error: 'Either farmerId or buyerId is required' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate changes
    if (!changes || Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    // Remove cropTypes completely - they are handled separately in Account Centre (only for farmers)
    if (changes.cropTypes !== undefined) {
      delete changes.cropTypes;
    }

    // Check if there are still changes after filtering
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No valid changes provided' });
    }

    // City validation - must contain at least one letter
    if (changes.city && !/[a-zA-Z]/.test(changes.city)) {
      return res.status(400).json({ error: 'City name must contain at least one letter' });
    }

    // Check if there's already a pending request
    const existingRequest = await ProfileChangeRequest.findOne({
      userId: user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending change request' });
    }

    console.log(`🔍 Received changes for ${userId}:`, JSON.stringify(changes, null, 2));
    console.log(`🔍 Changes object keys:`, Object.keys(changes));
    console.log(`🔍 Changes pinCode:`, changes.pinCode);

    const changeRequest = new ProfileChangeRequest({
      userId: user._id,
      changes
    });

    console.log(`🔍 Before save - changeRequest.changes:`, JSON.stringify(changeRequest.changes, null, 2));
    
    await changeRequest.save();
    
    console.log(`🔍 After save - changeRequest.changes:`, JSON.stringify(changeRequest.changes, null, 2));
    console.log(`✅ Profile change request submitted for ${userId}`);
    
    res.status(201).json({ 
      message: 'Change request submitted successfully',
      request: changeRequest
    });
  } catch (err) {
    console.error('Failed to submit change request:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
