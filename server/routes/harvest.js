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
      status: { $in: ['growing', 'ready', 'listed'] }, // Include 'listed' crops
      harvestDate: { $gte: new Date() }
    })
    .sort({ harvestDate: 1 })
    .limit(3);

    // Calculate days remaining for each and update in database
    const countdowns = [];
    
    for (const crop of crops) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for accurate calculation
      
      const harvest = new Date(crop.harvestDate);
      harvest.setHours(0, 0, 0, 0); // Reset to start of day
      
      const daysLeft = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
      
      // Update the daysToHarvest in database if it's different
      if (crop.daysToHarvest !== daysLeft) {
        crop.daysToHarvest = daysLeft;
        crop.updatedAt = new Date();
        await crop.save();
        console.log(`📅 Updated ${crop.name} countdown: ${daysLeft} days left`);
      }
      
      // Check if crop is ready for harvest (0 days or overdue)
      if (daysLeft <= 0 && (crop.status === 'growing' || crop.status === 'listed')) {
        crop.status = 'ready';
        await crop.save();
        console.log(`🌾 Crop ${crop.name} is now ready for harvest!`);
        
        // Send notification to farmer
        const Update = require('../models/Update');
        const user = await User.findOne({ farmerId: crop.farmerId });
        if (user) {
          const update = new Update({
            userId: user._id,
            title: 'Harvest Ready!',
            message: `Your ${crop.name} crop is ready for harvest! Expected quantity: ${crop.quantity} ${crop.unit}`,
            category: 'harvest',
            isActive: true
          });
          await update.save();
        }
      }
      
      // Auto-notify at 3 days if not already notified
      if (daysLeft === 3 && !crop.autoNotified) {
        crop.autoNotified = true;
        await crop.save();
        
        const Update = require('../models/Update');
        const user = await User.findOne({ farmerId: crop.farmerId });
        if (user) {
          const update = new Update({
            userId: user._id,
            title: 'Harvest Reminder',
            message: `Your ${crop.name} crop will be ready for harvest in 3 days! Prepare for harvesting.`,
            category: 'harvest',
            isActive: true
          });
          await update.save();
        }
        console.log(`🔔 Sent 3-day reminder for ${crop.name}`);
      }
      
      // Calculate total days from planted to harvest
      let totalDays = 90; // Default fallback
      if (crop.plantedDate && crop.harvestDate) {
        const planted = new Date(crop.plantedDate);
        const harvest = new Date(crop.harvestDate);
        totalDays = Math.ceil((harvest - planted) / (1000 * 60 * 60 * 24));
      }
      
      countdowns.push({
        _id: crop._id,
        cropName: crop.name,
        category: crop.category,
        quantity: crop.quantity,
        unit: crop.unit,
        plantedDate: crop.plantedDate,
        harvestDate: crop.harvestDate,
        daysLeft: Math.max(0, daysLeft), // Don't show negative days
        totalDays: Math.max(1, totalDays), // Ensure at least 1 day for progress calculation
        status: crop.status,
        autoNotified: crop.autoNotified,
        lastUpdated: new Date()
      });
    }

    console.log(`📊 Fetched ${countdowns.length} active countdowns for farmer ${farmerId}`);
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
      status: { $in: ['growing', 'ready', 'listed'] }, // Include 'listed' crops
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

// Daily update route - updates all active countdowns
router.post('/update-all-countdowns', async (req, res) => {
  try {
    console.log('🔄 Starting daily countdown update...');
    
    // Find all active crops with harvest dates
    const activeCrops = await Crop.find({
      status: { $in: ['growing', 'ready', 'listed'] }, // Include 'listed' crops
      harvestDate: { $exists: true }
    });
    
    console.log(`📋 Found ${activeCrops.length} active crops to update`);
    
    let updatedCount = 0;
    let readyCount = 0;
    let notificationsSent = 0;
    
    for (const crop of activeCrops) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const harvest = new Date(crop.harvestDate);
      harvest.setHours(0, 0, 0, 0);
      
      const daysLeft = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
      const oldDaysLeft = crop.daysToHarvest;
      
      // Update days to harvest
      crop.daysToHarvest = daysLeft;
      crop.updatedAt = new Date();
      
      // Check if crop is ready for harvest
      if (daysLeft <= 0 && (crop.status === 'growing' || crop.status === 'listed')) {
        crop.status = 'ready';
        readyCount++;
        
        // Send harvest ready notification
        const Update = require('../models/Update');
        const user = await User.findOne({ farmerId: crop.farmerId });
        if (user) {
          const update = new Update({
            userId: user._id,
            title: 'Harvest Ready!',
            message: `Your ${crop.name} crop is ready for harvest! Expected quantity: ${crop.quantity} ${crop.unit}. Don't delay to maintain quality.`,
            category: 'harvest',
            isActive: true
          });
          await update.save();
        }
        notificationsSent++;
        
        console.log(`🌾 ${crop.name} (${crop.farmerId}) is ready for harvest!`);
      }
      
      // Send 3-day reminder if not already sent
      if (daysLeft === 3 && !crop.autoNotified) {
        crop.autoNotified = true;
        
        const Update = require('../models/Update');
        const user = await User.findOne({ farmerId: crop.farmerId });
        if (user) {
          const update = new Update({
            userId: user._id,
            title: 'Harvest Reminder',
            message: `Your ${crop.name} crop will be ready for harvest in 3 days! Start preparing for harvesting operations.`,
            category: 'harvest',
            isActive: true
          });
          await update.save();
        }
        notificationsSent++;
        
        console.log(`🔔 Sent 3-day reminder for ${crop.name} (${crop.farmerId})`);
      }
      
      // Send 1-day reminder
      if (daysLeft === 1 && (crop.status === 'growing' || crop.status === 'listed')) {
        const Update = require('../models/Update');
        const user = await User.findOne({ farmerId: crop.farmerId });
        if (user) {
          const update = new Update({
            userId: user._id,
            title: 'Harvest Tomorrow!',
            message: `Your ${crop.name} crop will be ready for harvest tomorrow! Make sure you have all equipment ready.`,
            category: 'harvest',
            isActive: true
          });
          await update.save();
        }
        notificationsSent++;
        
        console.log(`⏰ Sent 1-day reminder for ${crop.name} (${crop.farmerId})`);
      }
      
      await crop.save();
      
      if (oldDaysLeft !== daysLeft) {
        updatedCount++;
        console.log(`📅 Updated ${crop.name}: ${oldDaysLeft} → ${daysLeft} days`);
      }
    }
    
    const summary = {
      totalCrops: activeCrops.length,
      updatedCount,
      readyCount,
      notificationsSent,
      timestamp: new Date()
    };
    
    console.log('✅ Daily countdown update completed:', summary);
    
    res.json({
      message: 'Daily countdown update completed successfully',
      summary
    });
    
  } catch (error) {
    console.error('❌ Error in daily countdown update:', error);
    res.status(500).json({ error: 'Failed to update countdowns' });
  }
});

// Get countdown statistics
router.get('/stats', async (req, res) => {
  try {
    const totalActive = await Crop.countDocuments({
      status: { $in: ['growing', 'ready', 'listed'] }, // Include 'listed' crops
      harvestDate: { $gte: new Date() }
    });
    
    const readyToHarvest = await Crop.countDocuments({
      status: 'ready',
      harvestDate: { $gte: new Date() }
    });
    
    const dueSoon = await Crop.countDocuments({
      status: { $in: ['growing', 'listed'] }, // Include 'listed' crops
      daysToHarvest: { $lte: 7, $gt: 0 }
    });
    
    const overdue = await Crop.countDocuments({
      status: { $in: ['growing', 'listed'] }, // Include 'listed' crops
      harvestDate: { $lt: new Date() }
    });
    
    res.json({
      totalActive,
      readyToHarvest,
      dueSoon,
      overdue,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching countdown stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
