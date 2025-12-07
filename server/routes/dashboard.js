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

// Get weather data using OpenWeatherMap API or fallback to mock
async function getWeatherData(location) {
  try {
    // Try to get real weather data from OpenWeatherMap
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (apiKey) {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${apiKey}&units=metric`
      );
      
      const data = response.data;
      const weatherCondition = data.weather[0].main.toLowerCase();
      
      return {
        location: data.name || location,
        temperature: Math.round(data.main.temp),
        condition: weatherCondition,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        rainChance: data.clouds?.all || 0,
        feelsLike: Math.round(data.main.feels_like),
        tempMax: Math.round(data.main.temp_max),
        tempMin: Math.round(data.main.temp_min),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        lastUpdated: new Date()
      };
    }
    
    // Fallback to realistic mock data based on time of day
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;
    const isDay = !isNight;
    
    // More realistic temperature based on time
    let baseTemp = 28;
    if (hour >= 6 && hour < 10) baseTemp = 24;
    else if (hour >= 10 && hour < 14) baseTemp = 30;
    else if (hour >= 14 && hour < 18) baseTemp = 32;
    else if (hour >= 18 && hour < 22) baseTemp = 27;
    else baseTemp = 22; // Night time cooler
    
    // Day conditions vs night
    const dayConditions = ['sunny', 'cloudy', 'partly cloudy', 'sunny'];
    const nightConditions = ['clear', 'cloudy', 'clear', 'partly cloudy'];
    const conditions = isDay ? dayConditions : nightConditions;
    
    // Use hour to determine condition (more stable than random)
    const conditionIndex = hour % 4;
    const currentCondition = conditions[conditionIndex];
    
    const mockWeather = {
      location: location || 'Your Location',
      temperature: baseTemp + Math.floor(Math.random() * 3) - 1,
      condition: currentCondition,
      humidity: 60 + Math.floor(Math.random() * 25),
      windSpeed: 8 + Math.floor(Math.random() * 10),
      rainChance: currentCondition.includes('cloud') ? 40 : 15,
      feelsLike: baseTemp - 2,
      tempMax: baseTemp + 5,
      tempMin: baseTemp - 7,
      description: currentCondition,
      icon: isDay ? '01d' : '01n',
      isNight: isNight,
      lastUpdated: new Date()
    };
    
    return mockWeather;
  } catch (error) {
    console.error('Weather API error:', error.message);
    // Return default weather on error
    return {
      location: location || 'Your Location',
      temperature: 28,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 12,
      rainChance: 20,
      feelsLike: 27,
      tempMax: 32,
      tempMin: 22,
      description: 'Clear sky',
      lastUpdated: new Date()
    };
  }
}

module.exports = router;