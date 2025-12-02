const mongoose = require('mongoose');
require('dotenv').config();

const Settings = require('../models/Settings');

const seedLoginImage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin');
    console.log('✅ Connected to MongoDB\n');
    
    // Set default login page image
    const defaultImage = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop';
    
    const setting = await Settings.findOneAndUpdate(
      { key: 'loginPageImage' },
      {
        key: 'loginPageImage',
        value: defaultImage,
        description: 'Login page right side image',
        updatedBy: 'system',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Login page image setting created/updated');
    console.log(`📷 Image URL: ${setting.value}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedLoginImage();
