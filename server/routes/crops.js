const router = require('express').Router();
const Crop = require('../models/Crop');

// 1. ADD A NEW CROP (Farmer Post)
router.post('/add', async (req, res) => {
  try {
    const newCrop = new Crop(req.body);
    const savedCrop = await newCrop.save();
    res.status(200).json(savedCrop);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET CROPS FOR A SPECIFIC FARMER
router.get('/:farmerId', async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.params.farmerId });
    res.status(200).json(crops);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get available crops (for buyers)
router.get('/available', async (req, res) => {
  try {
    const { state, district } = req.query;
    
    let query = { available: true };
    
    // Filter by location if provided (for public buyers)
    if (state && district) {
      query['location.state'] = state;
      query['location.district'] = district;
    }
    
    const crops = await Crop.find(query).sort({ createdAt: -1 });
    
    res.json({ crops });
  } catch (err) {
    console.error('Error fetching available crops:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Get crops for a specific farmer (for sell crops page)
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const crops = await Crop.find({ farmerId }).sort({ createdAt: -1 });
    
    res.json({ crops });
  } catch (err) {
    console.error('Error fetching farmer crops:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Create a new crop listing
router.post('/create', async (req, res) => {
  try {
    const { 
      farmerId, 
      farmerName,
      cropName, 
      quantity, 
      unit, 
      pricePerUnit, 
      quality, 
      harvestDate, 
      description,
      location
    } = req.body;
    
    const newCrop = new Crop({
      farmerId,
      farmerName,
      name: cropName,
      quantity,
      unit,
      pricePerUnit,
      quality,
      harvestDate,
      description,
      location,
      available: true
    });
    
    const savedCrop = await newCrop.save();
    
    res.status(201).json({ crop: savedCrop });
  } catch (err) {
    console.error('Error creating crop:', err);
    res.status(500).json({ error: 'Failed to create crop listing' });
  }
});

// Delete a crop listing
router.delete('/:cropId', async (req, res) => {
  try {
    const { cropId } = req.params;
    
    await Crop.findByIdAndDelete(cropId);
    
    res.json({ message: 'Crop listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting crop:', err);
    res.status(500).json({ error: 'Failed to delete crop listing' });
  }
});

// Purchase a crop (for public buyers)
router.post('/purchase', async (req, res) => {
  try {
    const { cropId, buyerId, quantity, totalAmount } = req.body;
    
    const crop = await Crop.findById(cropId);
    
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    
    if (crop.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }
    
    // Update crop quantity
    crop.quantity -= quantity;
    if (crop.quantity === 0) {
      crop.available = false;
    }
    await crop.save();
    
    // Here you would typically create a purchase record
    // For now, we'll just return success
    
    res.json({ 
      message: 'Purchase successful',
      remainingQuantity: crop.quantity
    });
  } catch (err) {
    console.error('Error processing purchase:', err);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

module.exports = router;