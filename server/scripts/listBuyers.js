const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const listBuyers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const buyers = await User.find({ role: 'buyer' }).select('-pin');
    
    console.log('\n📋 All Buyers:');
    console.log('================');
    
    buyers.forEach(buyer => {
      console.log(`🆔 Buyer ID: ${buyer.buyerId}`);
      console.log(`👤 Name: ${buyer.name}`);
      console.log(`📱 Phone: ${buyer.phone}`);
      console.log(`📧 Email: ${buyer.email || 'Not provided'}`);
      console.log(`📍 Location: ${buyer.city}, ${buyer.district}, ${buyer.state}`);
      console.log(`💰 Max Bid Limit: ₹${buyer.maxBidLimit}`);
      console.log(`📅 Created: ${buyer.createdAt}`);
      console.log('---');
    });

    console.log(`\n✅ Total Buyers: ${buyers.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

listBuyers();