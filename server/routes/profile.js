const router = require('express').Router();
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const bcrypt = require('bcryptjs');

// Get pending change request for a farmer
router.get('/pending-request/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const user = await User.findOne({ farmerId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pendingRequest = await ProfileChangeRequest.findOne({
      userId: user._id,
      status: 'pending'
    });

    if (!pendingRequest) {
      return res.status(404).json({ error: 'No pending request' });
    }

    res.json(pendingRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit profile change request
router.post('/request-change', async (req, res) => {
  try {
    const { farmerId, changes } = req.body;
    
    const user = await User.findOne({ farmerId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate changes
    if (!changes || Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    // Remove cropTypes completely - they are handled separately in Account Centre
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

    console.log(`🔍 Received changes for ${farmerId}:`, JSON.stringify(changes, null, 2));
    console.log(`🔍 Changes object keys:`, Object.keys(changes));
    console.log(`🔍 Changes pinCode:`, changes.pinCode);

    const changeRequest = new ProfileChangeRequest({
      userId: user._id,
      changes
    });

    console.log(`🔍 Before save - changeRequest.changes:`, JSON.stringify(changeRequest.changes, null, 2));
    
    await changeRequest.save();
    
    console.log(`🔍 After save - changeRequest.changes:`, JSON.stringify(changeRequest.changes, null, 2));
    console.log(`✅ Profile change request submitted for ${farmerId}`);
    
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
