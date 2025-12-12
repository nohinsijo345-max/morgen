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

    // Get weather data for farmer's location using city for accuracy
    const weather = await getWeatherData(farmer.district, farmer.city, farmer.pinCode);
    
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

    // Get upcoming delivery information
    const Booking = require('../models/Booking');
    const upcomingBooking = await Booking.findOne({
      farmerId,
      status: { $in: ['confirmed', 'order_accepted', 'order_processing', 'pickup_started', 'order_picked_up', 'in_transit'] }
    })
      .populate('vehicleId')
      .sort({ expectedDeliveryDate: 1 });

    let upcomingDelivery = null;
    if (upcomingBooking) {
      upcomingDelivery = {
        bookingId: upcomingBooking.bookingId,
        destination: upcomingBooking.toLocation?.city || 'Destination',
        expectedDate: upcomingBooking.expectedDeliveryDate,
        amount: upcomingBooking.finalAmount,
        status: getDeliveryStatus(upcomingBooking.status),
        vehicleType: upcomingBooking.vehicleId?.type || upcomingBooking.vehicleType
      };
    }

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
      upcomingDelivery,
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


// Get weather data using WeatherAPI.com with city-based queries for accuracy
async function getWeatherData(location, city = null, pinCode = null) {
  try {
    // Try to get real weather data from WeatherAPI.com
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (apiKey && apiKey !== 'your_api_key_here') {
      // Build location query prioritizing city over PIN code
      let locationQuery = location;
      
      if (city) {
        // Use city + district for most accurate results
        locationQuery = `${city},${location},India`;
        console.log(`Fetching live weather data for city: ${city}, ${location}`);
      } else if (pinCode) {
        // Fallback to PIN code if city not available
        locationQuery = `${pinCode},India`;
        console.log(`Fetching live weather data for PIN: ${pinCode} (${location})`);
      } else {
        // Fallback to district only
        locationQuery = `${location},India`;
        console.log(`Fetching live weather data for district: ${location}`);
      }
      
      // WeatherAPI.com current weather + forecast + agriculture data
      const [currentResponse, forecastResponse, agricultureResponse] = await Promise.allSettled([
        axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locationQuery}&aqi=yes`, { timeout: 5000 }),
        axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${locationQuery}&days=3&aqi=yes&alerts=yes`, { timeout: 5000 }),
        axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locationQuery}&aqi=yes`, { timeout: 5000 })
      ]);
      
      if (currentResponse.status === 'fulfilled') {
        const current = currentResponse.value.data.current;
        const locationData = currentResponse.value.data.location;
        const forecast = forecastResponse.status === 'fulfilled' ? forecastResponse.value.data.forecast : null;
        const alerts = forecastResponse.status === 'fulfilled' ? forecastResponse.value.data.alerts : null;
        
        // Determine if it's night
        const isNight = current.is_day === 0;
        
        // Map WeatherAPI conditions to our system
        const weatherCode = current.condition.code;
        let condition = 'sunny';
        
        if (weatherCode === 1000) {
          condition = isNight ? 'clear' : 'sunny';
        } else if ([1003, 1006, 1009].includes(weatherCode)) {
          condition = 'cloudy';
        } else if (weatherCode === 1030) {
          // For mist/fog, check if it's actually hazy sunny conditions
          // In tropical areas, "mist" with high temp, low cloud cover, and decent visibility often means hazy sun
          if (current.temp_c > 30 && current.cloud < 20 && current.vis_km > 3) {
            condition = isNight ? 'clear' : 'sunny'; // Treat as hazy sunny (like "partly sunny")
          } else if (current.humidity < 70 && current.vis_km > 2) {
            condition = 'cloudy'; // Light haze/mist
          } else {
            condition = 'foggy'; // Actual dense fog/mist
          }
        } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(weatherCode)) {
          condition = 'rainy';
        } else if ([1087, 1273, 1276, 1279, 1282].includes(weatherCode)) {
          condition = 'thunderstorm';
        } else if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(weatherCode)) {
          condition = 'snowy';
        } else {
          condition = current.cloud > 75 ? 'overcast' : 'cloudy';
        }
        
        // Get today's forecast for additional data
        const todayForecast = forecast?.forecastday?.[0];
        const astro = todayForecast?.astro;
        
        console.log(`Live weather data fetched successfully for ${locationData.name}`);
        
        return {
          location: locationData.name.toUpperCase(),
          temperature: Math.round(current.temp_c),
          condition: condition,
          humidity: current.humidity,
          windSpeed: Math.round(current.wind_kph),
          windDirection: current.wind_dir,
          windDegree: current.wind_degree,
          rainChance: todayForecast?.day?.daily_chance_of_rain || 0,
          snowChance: todayForecast?.day?.daily_chance_of_snow || 0,
          feelsLike: Math.round(current.feelslike_c),
          tempMax: todayForecast ? Math.round(todayForecast.day.maxtemp_c) : Math.round(current.temp_c + 5),
          tempMin: todayForecast ? Math.round(todayForecast.day.mintemp_c) : Math.round(current.temp_c - 5),
          description: condition === 'sunny' && current.condition.text.toLowerCase().includes('mist') ? 'Partly sunny' : current.condition.text,
          icon: current.condition.icon,
          isNight: isNight,
          sunrise: astro?.sunrise || '6:30 AM',
          sunset: astro?.sunset || '6:45 PM',
          moonrise: astro?.moonrise || '7:30 PM',
          moonset: astro?.moonset || '6:00 AM',
          moonPhase: astro?.moon_phase || 'New Moon',
          visibility: current.vis_km,
          pressure: current.pressure_mb,
          uvIndex: current.uv,
          cloudCover: current.cloud,
          dewPoint: Math.round((current.temp_c - ((100 - current.humidity) / 5))), // Approximation
          heatIndex: Math.round(current.feelslike_c),
          
          // Air Quality Index
          aqi: current.air_quality ? {
            co: current.air_quality.co,
            no2: current.air_quality.no2,
            o3: current.air_quality.o3,
            so2: current.air_quality.so2,
            pm2_5: current.air_quality.pm2_5,
            pm10: current.air_quality.pm10,
            usEpaIndex: current.air_quality['us-epa-index'],
            gbDefraIndex: current.air_quality['gb-defra-index']
          } : null,
          
          // Agriculture specific data
          agriculture: todayForecast ? {
            avgTemp: Math.round(todayForecast.day.avgtemp_c),
            maxWind: Math.round(todayForecast.day.maxwind_kph),
            totalPrecipitation: todayForecast.day.totalprecip_mm,
            avgHumidity: todayForecast.day.avghumidity,
            willItRain: todayForecast.day.daily_will_it_rain === 1,
            willItSnow: todayForecast.day.daily_will_it_snow === 1,
            condition: todayForecast.day.condition.text
          } : null,
          
          // Weather alerts
          alerts: alerts?.alert?.map(alert => ({
            headline: alert.headline,
            severity: alert.severity,
            urgency: alert.urgency,
            areas: alert.areas,
            category: alert.category,
            certainty: alert.certainty,
            event: alert.event,
            note: alert.note,
            effective: alert.effective,
            expires: alert.expires,
            description: alert.desc,
            instruction: alert.instruction
          })) || [],
          
          // Hourly forecast for next 24 hours
          hourlyForecast: forecast?.forecastday?.[0]?.hour?.slice(new Date().getHours(), new Date().getHours() + 6).map(hour => ({
            time: hour.time,
            temp: Math.round(hour.temp_c),
            condition: hour.condition.text,
            icon: hour.condition.icon,
            chanceOfRain: hour.chance_of_rain,
            humidity: hour.humidity,
            windSpeed: Math.round(hour.wind_kph)
          })) || [],
          
          lastUpdated: new Date(),
          isLiveData: true
        };
      }
    } else {
      console.log('No WeatherAPI key found, using mock data');
    }
    
    // Fallback to realistic mock data based on time of day and location
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;
    const isDay = !isNight;
    const month = new Date().getMonth(); // 0-11
    
    // Seasonal temperature adjustments for India
    let seasonalAdjustment = 0;
    if (month >= 2 && month <= 5) seasonalAdjustment = 3; // Summer (Mar-Jun)
    else if (month >= 6 && month <= 9) seasonalAdjustment = -2; // Monsoon (Jul-Oct)
    else if (month >= 10 && month <= 1) seasonalAdjustment = -1; // Winter (Nov-Feb)
    
    // More realistic temperature based on time and season
    let baseTemp = 28 + seasonalAdjustment;
    if (hour >= 6 && hour < 10) baseTemp = 24 + seasonalAdjustment;
    else if (hour >= 10 && hour < 14) baseTemp = 30 + seasonalAdjustment;
    else if (hour >= 14 && hour < 18) baseTemp = 32 + seasonalAdjustment;
    else if (hour >= 18 && hour < 22) baseTemp = 27 + seasonalAdjustment;
    else baseTemp = 22 + seasonalAdjustment; // Night time cooler
    
    // Location-based weather patterns
    const locationWeather = {
      'ernakulam': { humid: 75, rainy: true },
      'thiruvananthapuram': { humid: 80, rainy: true },
      'dakshina-kannada': { humid: 70, rainy: true },
      'default': { humid: 65, rainy: false }
    };
    
    const locKey = location?.toLowerCase() || 'default';
    const locWeather = locationWeather[locKey] || locationWeather['default'];
    
    // Monsoon season conditions (June-September)
    const isMonsoon = month >= 5 && month <= 8;
    
    // Day conditions vs night with seasonal variations
    let dayConditions = ['sunny', 'cloudy', 'partly cloudy', 'sunny'];
    let nightConditions = ['clear', 'cloudy', 'clear', 'partly cloudy'];
    
    if (isMonsoon && locWeather.rainy) {
      dayConditions = ['cloudy', 'rainy', 'overcast', 'cloudy'];
      nightConditions = ['cloudy', 'rainy', 'overcast', 'cloudy'];
    }
    
    const conditions = isDay ? dayConditions : nightConditions;
    
    // Use day of year for more stable but varied conditions
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const conditionIndex = (dayOfYear + hour) % conditions.length;
    const currentCondition = conditions[conditionIndex];
    
    // Generate more realistic values
    const tempVariation = Math.floor(Math.random() * 3) - 1;
    const actualTemp = Math.max(15, Math.min(45, baseTemp + tempVariation));
    
    const mockWeather = {
      location: (location || 'Your Location').toUpperCase(),
      temperature: actualTemp,
      condition: currentCondition,
      humidity: Math.max(30, Math.min(95, locWeather.humid + Math.floor(Math.random() * 15) - 7)),
      windSpeed: currentCondition === 'rainy' ? 15 + Math.floor(Math.random() * 10) : 8 + Math.floor(Math.random() * 8),
      rainChance: currentCondition === 'rainy' ? 85 : currentCondition.includes('cloud') ? 45 : 15,
      feelsLike: actualTemp + (locWeather.humid > 70 ? 2 : -1),
      tempMax: actualTemp + 4 + Math.floor(Math.random() * 3),
      tempMin: actualTemp - 6 - Math.floor(Math.random() * 3),
      description: getWeatherDescription(currentCondition, isMonsoon),
      icon: getWeatherIcon(currentCondition, isDay),
      isNight: isNight,
      sunrise: '6:30 AM',
      sunset: '6:45 PM',
      visibility: currentCondition === 'rainy' ? 5 + Math.floor(Math.random() * 3) : 10,
      pressure: 1010 + Math.floor(Math.random() * 10),
      uvIndex: isDay ? (currentCondition === 'sunny' ? 7 : currentCondition.includes('cloud') ? 4 : 2) : 0,
      lastUpdated: new Date(),
      isLiveData: false
    };
    
    return mockWeather;
  } catch (error) {
    console.error('Weather API error:', error.message);
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;
    // Return default weather on error
    return {
      location: (location || 'Your Location').toUpperCase(),
      temperature: 28,
      condition: isNight ? 'clear' : 'sunny',
      humidity: 65,
      windSpeed: 12,
      rainChance: 20,
      feelsLike: 27,
      tempMax: 32,
      tempMin: 22,
      description: isNight ? 'Clear night' : 'Clear sky',
      isNight: isNight,
      sunrise: '6:30 AM',
      sunset: '6:45 PM',
      visibility: 10,
      pressure: 1013,
      uvIndex: isNight ? 0 : 5,
      lastUpdated: new Date(),
      isLiveData: false
    };
  }
}

// Helper function for delivery status
function getDeliveryStatus(status) {
  const statusMap = {
    'confirmed': 'Confirmed',
    'order_accepted': 'Accepted',
    'order_processing': 'Processing',
    'pickup_started': 'Pickup Started',
    'order_picked_up': 'Picked Up',
    'in_transit': 'In Transit'
  };
  return statusMap[status] || status;
}

// Helper functions for mock weather data
function getWeatherDescription(condition, isMonsoon) {
  const descriptions = {
    'sunny': ['Clear sky', 'Bright sunshine', 'Sunny day'],
    'clear': ['Clear night', 'Starry night', 'Clear evening'],
    'cloudy': ['Partly cloudy', 'Few clouds', 'Scattered clouds'],
    'overcast': ['Overcast sky', 'Cloudy', 'Heavy clouds'],
    'rainy': isMonsoon ? ['Monsoon showers', 'Heavy rain', 'Rainy day'] : ['Light rain', 'Drizzle', 'Rain showers'],
    'partly cloudy': ['Partly cloudy', 'Mixed conditions', 'Sun and clouds']
  };
  
  const options = descriptions[condition] || ['Pleasant weather'];
  return options[Math.floor(Math.random() * options.length)];
}

function getWeatherIcon(condition, isDay) {
  const iconMap = {
    'sunny': '01d',
    'clear': '01n',
    'cloudy': isDay ? '02d' : '02n',
    'overcast': isDay ? '04d' : '04n',
    'rainy': isDay ? '10d' : '10n',
    'partly cloudy': isDay ? '03d' : '03n'
  };
  
  return iconMap[condition] || (isDay ? '01d' : '01n');
}

module.exports = router;