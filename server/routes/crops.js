const router = require('express').Router();
const Crop = require('../models/Crop');

// Get available crops (for buyers) - MUST BE BEFORE /:farmerId
router.get('/available', async (req, res) => {
  try {
    const { state, district, pinCode, buyerType, buyerId } = req.query;
    
    console.log('🔍 Fetching available crops with filters:', { state, district, pinCode, buyerType, buyerId });
    
    let query = { available: true };
    
    // For public buyers, filter by connected farmers only
    if (buyerType === 'public' && buyerId) {
      const Connection = require('../models/Connection');
      
      // Get connected farmers for this buyer
      const connections = await Connection.find({
        $or: [
          { requesterId: buyerId, targetType: 'farmer', status: 'accepted' },
          { targetId: buyerId, requesterType: 'farmer', status: 'accepted' }
        ]
      });
      
      const connectedFarmerIds = connections.map(conn => 
        conn.requesterId === buyerId ? conn.targetId : conn.requesterId
      );
      
      console.log(`📍 Found ${connectedFarmerIds.length} connected farmers for buyer ${buyerId}`);
      
      if (connectedFarmerIds.length === 0) {
        // No connected farmers, return empty result
        console.log('📍 No connected farmers found, returning empty result');
        return res.json({ crops: [] });
      }
      
      // Filter crops by connected farmers
      query.farmerId = { $in: connectedFarmerIds };
      
      // Additional location filtering for public buyers
      if (pinCode) {
        // First try to find crops from farmers with the same pinCode
        const User = require('../models/User');
        const farmersInSamePinCode = await User.find({ 
          role: 'farmer', 
          pinCode: pinCode,
          farmerId: { $in: connectedFarmerIds } // Only from connected farmers
        }).select('farmerId');
        
        const farmerIds = farmersInSamePinCode.map(farmer => farmer.farmerId);
        
        if (farmerIds.length > 0) {
          query.farmerId = { $in: farmerIds };
          console.log(`📍 Found ${farmerIds.length} connected farmers in pinCode ${pinCode}`);
        } else {
          // Fallback to district-based filtering if no farmers in same pinCode
          console.log(`📍 No connected farmers found in pinCode ${pinCode}, falling back to district filtering`);
          if (state && district) {
            // Use case-insensitive regex matching for location
            query['location.state'] = { $regex: new RegExp(`^${state}$`, 'i') };
            query['location.district'] = { $regex: new RegExp(`^${district}$`, 'i') };
          }
        }
      } else if (state && district) {
        // Fallback to district-based filtering with case-insensitive matching
        query['location.state'] = { $regex: new RegExp(`^${state}$`, 'i') };
        query['location.district'] = { $regex: new RegExp(`^${district}$`, 'i') };
      }
    } else if (buyerType === 'public') {
      // Public buyer without buyerId - use old location-based filtering
      if (pinCode) {
        // First try to find crops from farmers with the same pinCode
        const User = require('../models/User');
        const farmersInSamePinCode = await User.find({ 
          role: 'farmer', 
          pinCode: pinCode 
        }).select('farmerId');
        
        const farmerIds = farmersInSamePinCode.map(farmer => farmer.farmerId);
        
        if (farmerIds.length > 0) {
          query.farmerId = { $in: farmerIds };
          console.log(`📍 Found ${farmerIds.length} farmers in pinCode ${pinCode}`);
        } else {
          // Fallback to district-based filtering if no farmers in same pinCode
          console.log(`📍 No farmers found in pinCode ${pinCode}, falling back to district filtering`);
          if (state && district) {
            // Use case-insensitive regex matching for location
            query['location.state'] = { $regex: new RegExp(`^${state}$`, 'i') };
            query['location.district'] = { $regex: new RegExp(`^${district}$`, 'i') };
          }
        }
      } else if (state && district) {
        // Fallback to district-based filtering with case-insensitive matching
        query['location.state'] = { $regex: new RegExp(`^${state}$`, 'i') };
        query['location.district'] = { $regex: new RegExp(`^${district}$`, 'i') };
      }
    }
    // Commercial buyers see all available crops (no location filtering)
    
    const crops = await Crop.find(query).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${crops.length} available crops`);
    
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

// 2. GET CROPS FOR A SPECIFIC FARMER (Legacy route - keep for backward compatibility)
router.get('/:farmerId', async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.params.farmerId });
    res.status(200).json(crops);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new crop listing
router.post('/create', async (req, res) => {
  try {
    const { 
      farmerId, 
      farmerName,
      cropName, 
      category,
      quantity, 
      unit, 
      pricePerUnit,
      basePrice,
      quality, 
      harvestDate, 
      description,
      location
    } = req.body;
    
    console.log('📝 Creating crop listing:', {
      farmerId,
      farmerName,
      cropName,
      category,
      quantity,
      unit,
      pricePerUnit,
      basePrice,
      quality,
      harvestDate
    });
    
    // Validation
    if (!farmerId || !farmerName || !cropName || !category || !quantity || !pricePerUnit || !harvestDate) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['farmerId', 'farmerName', 'cropName', 'category', 'quantity', 'pricePerUnit', 'harvestDate']
      });
    }
    
    // Get farmer's complete location info including pinCode
    const User = require('../models/User');
    const farmer = await User.findOne({ farmerId, role: 'farmer' });
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    // Use farmer's location data (including pinCode) for better filtering
    const cropLocation = {
      state: farmer.state || location?.state,
      district: farmer.district || location?.district,
      city: farmer.city || location?.city,
      pinCode: farmer.pinCode // Add pinCode for precise location matching
    };
    
    console.log('📍 Using farmer location data:', cropLocation);
    
    const newCrop = new Crop({
      farmerId,
      farmerName,
      name: cropName,
      category,
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      pricePerUnit: parseFloat(pricePerUnit),
      basePrice: parseFloat(basePrice || pricePerUnit),
      quality,
      harvestDate: new Date(harvestDate),
      description: description || '',
      location: cropLocation,
      available: true,
      status: 'listed'
    });
    
    const savedCrop = await newCrop.save();
    
    console.log('✅ Crop listing created successfully:', savedCrop._id);
    
    res.status(201).json({ crop: savedCrop });
  } catch (err) {
    console.error('❌ Error creating crop:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ 
      error: 'Failed to create crop listing',
      details: err.message 
    });
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