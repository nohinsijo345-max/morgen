const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get login page image
router.get('/login-image', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'loginPageImage' });
    
    if (!setting) {
      // Return default image if not set
      return res.json({
        imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop'
      });
    }
    
    res.json({ imageUrl: setting.value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login image' });
  }
});

// Update login page image (Admin only)
router.put('/login-image', async (req, res) => {
  try {
    const { imageUrl, adminId } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const setting = await Settings.findOneAndUpdate(
      { key: 'loginPageImage' },
      { 
        value: imageUrl,
        updatedBy: adminId || 'admin',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Login image updated successfully',
      imageUrl: setting.value 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update login image' });
  }
});

// Get all settings (Admin only)
router.get('/all', async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
