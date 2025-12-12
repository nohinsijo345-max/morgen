const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkFarmers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const farmers = await User.find({ role: 'farmer' }).limit(5);
    console.log('\nAvailable farmers:');
    farmers.forEach(f => {
      console.log(`- ${f.farmerId}: ${f.name} (${f.district || 'No district'})`);
    });
    
    if (farmers.length > 0) {
      console.log(`\nTesting weather API for farmer: ${farmers[0].farmerId}`);
      const axios = require('axios');
      try {
        const response = await axios.get(`http://localhost:5050/api/dashboard/farmer/${farmers[0].farmerId}`);
        console.log('Weather data:', response.data.weather);
      } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkFarmers();