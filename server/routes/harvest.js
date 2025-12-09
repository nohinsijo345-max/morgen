const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const User = require('../models/User');

// Get all active countdowns for a farmer
router.get('/countdowns/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const crops = await Crop.find({
      farmerId,
      status: { $in: ['growing', 'ready'] },
      harvestDate: { $gte: new Date() }
    })
    .sort({ harvestDate: 1 })
    .limit(3);

    // Calculate days remaining for each
    const countdowns = crops.map(crop => {
      const today = new Date();
      const harvest = new Date(crop.harvestDate);
      const daysLeft = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
      
      return {
        _id: crop._id,
        cropName: crop.name,
        category: crop.category,
        quantity: crop.quantity,
        unit: crop.unit,
        plantedDate: crop.plantedDate,
        harvestDate: crop.harvestDate,
        daysLeft,
        status: crop.status,
        autoNotified: crop.autoNotified
      };
    });

    res.json(countdowns);
  } catch (error) {
    console.error('Error fetching countdowns:', error);
    res.status(500).json({ error: 'Failed to fetch countdowns' });
  }
});

// Create new harvest countdown
router.post('/countdowns', async (req, res) => {
  try {
    const { farmerId, farmerName, cropName, category, quantity, unit, plantedDate, harvestDate } = req.body;

    // Check if farmer already has 3 active countdowns
    const activeCount = await Crop.countDocuments({
      farmerId,
      status: { $in: ['growing', 'ready'] },
      harvestDate: { $gte: new Date() }
    });

    if (activeCount >= 3) {
      return res.status(400).json({ error: 'Maximum 3 active countdowns allowed' });
    }

    const crop = new Crop({
      farmerId,
      farmerName,
      name: cropName,
      category,
      quantity,
      unit: unit || 'kg',
      basePrice: 0, // Will be set later
      plantedDate: plantedDate || new Date(),
      harvestDate: new Date(harvestDate),
      status: 'growing'
    });

    await crop.save();

    const daysLeft = Math.ceil((new Date(harvestDate) - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      message: 'Countdown created successfully',
      countdown: {
        _id: crop._id,
        cropName: crop.name,
        category: crop.category,
        quantity: crop.quantity,
        unit: crop.unit,
        plantedDate: crop.plantedDate,
        harvestDate: crop.harvestDate,
        daysLeft,
        status: crop.status
      }
    });
  } catch (error) {
    console.error('Error creating countdown:', error);
    res.status(500).json({ error: 'Failed to create countdown' });
  }
});

// Update harvest countdown
router.put('/countdowns/:cropId', async (req, res) => {
  try {
    const { cropId } = req.params;
    const { cropName, category, quantity, unit, plantedDate, harvestDate } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Countdown not found' });
    }

    // Update fields
    if (cropName) crop.name = cropName;
    if (category) crop.category = category;
    if (quantity) crop.quantity = quantity;
    if (unit) crop.unit = unit;
    if (plantedDate) crop.plantedDate = new Date(plantedDate);
    if (harvestDate) crop.harvestDate = new Date(harvestDate);

    await crop.save();

    const daysLeft = Math.ceil((new Date(crop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      message: 'Countdown updated successfully',
      countdown: {
        _id: crop._id,
        cropName: crop.name,
        category: crop.category,
        quantity: crop.quantity,
        unit: crop.unit,
        plantedDate: crop.plantedDate,
        harvestDate: crop.harvestDate,
        daysLeft,
        status: crop.status
      }
    });
  } catch (error) {
    console.error('Error updating countdown:', error);
    res.status(500).json({ error: 'Failed to update countdown' });
  }
});

// Delete harvest countdown
router.delete('/countdowns/:cropId', async (req, res) => {
  try {
    const { cropId } = req.params;
    
    const crop = await Crop.findByIdAndDelete(cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Countdown not found' });
    }

    res.json({ message: 'Countdown deleted successfully' });
  } catch (error) {
    console.error('Error deleting countdown:', error);
    res.status(500).json({ error: 'Failed to delete countdown' });
  }
});

// Get farmer's crop preferences (from registration/account)
router.get('/crop-preferences/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    console.log('🔍 Fetching crop preferences for farmerId:', farmerId);
    console.log('🔍 Query:', { farmerId });
    
    const farmer = await User.findOne({ farmerId });
    console.log('🔍 Farmer found:', farmer ? 'YES' : 'NO');
    
    if (!farmer) {
      console.log('❌ Farmer not found with farmerId:', farmerId);
      
      // Try to find by other fields to debug
      const byName = await User.findOne({ name: 'Nohin Sijo', role: 'farmer' });
      if (byName) {
        console.log('✅ Found farmer by name:', byName.name, 'with farmerId:', byName.farmerId);
        console.log('✅ Crops:', byName.cropTypes);
      }
      
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Return cropTypes array (string array of crop names)
    const crops = farmer.cropTypes || [];
    console.log('✅ Found crops for farmer:', crops);
    res.json(crops);
  } catch (error) {
    console.error('❌ Error fetching crop preferences:', error);
    res.status(500).json({ error: 'Failed to fetch crop preferences' });
  }
});

module.exports = router;
