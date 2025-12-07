const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Sale = require('../models/Sale');
const Update = require('../models/Update');
const Customer = require('../models/Customer');
const Crop = require('../models/Crop');
const axios = require('axios');

// Get farmer dashboard data
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Get farmer details
    const farmer = await User.findOne({ farmerId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Get weather data for farmer's location
    const weather = await getWeatherData(farmer.district);
    
    // Get farmer's crops with harvest countdown
    const crops = await Crop.find({ farmerId }).sort({ harvestDate: 1 });
    
    // Get recent updates for this specific farmer
    const updates = await Update.find({ 
      userId: farmer._id,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(4);
    
    // Get farmer's customers count
    const customersCount = await Customer.countDocuments({ farmerId });
    
    // Get farmer's sales this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          farmerId,
          saleDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json({
      farmer: {
        name: farmer.name,
        farmerId: farmer.farmerId,
        email: farmer.email,
        district: farmer.district,
        landSize: farmer.landSize
      },
      weather,
      crops: crops.slice(0, 3), // Next 3 crops to harvest
      updates,
      stats: {
        customersCount,
        monthlySales: monthlySales[0]?.totalSales || 0,
        monthlyOrders: monthlySales[0]?.totalOrders || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leaderboard = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$farmerId',
          farmerName: { $first: '$farmerName' },
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get weather data (mock function - replace with real API)
async function getWeatherData(location) {
  try {
    // Mock weather data - replace with real weather API
    const mockWeather = {
      location,
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      condition: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      rainChance: Math.floor(Math.random() * 100),
      icon: 'sunny',
      lastUpdated: new Date()
    };
    
    return mockWeather;
  } catch (error) {
    return null;
  }
}

module.exports = router;