const express = require('express');
const router = express.Router();
const Update = require('../models/Update');

// Get all active updates
router.get('/', async (req, res) => {
  try {
    const updates = await Update.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Create new update (admin only)
router.post('/create', async (req, res) => {
  try {
    const update = new Update(req.body);
    await update.save();
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// Delete update (farmer can delete their own updates)
router.delete('/:updateId', async (req, res) => {
  try {
    const { updateId } = req.params;
    
    const deletedUpdate = await Update.findByIdAndDelete(updateId);
    
    if (!deletedUpdate) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    console.log(`✅ Update deleted: ${updateId}`);
    res.json({ message: 'Update deleted successfully', deletedUpdate });
  } catch (error) {
    console.error('Failed to delete update:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

module.exports = router;