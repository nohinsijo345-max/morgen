const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Settings = require('../models/Settings');

async function initDefaultImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const defaultImages = [
      {
        key: 'loginPageImage',
        value: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
        description: 'Login page background image'
      },
      {
        key: 'registerPageImage',
        value: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200',
        description: 'Register page background image'
      },
      {
        key: 'forgotPasswordPageImage',
        value: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200',
        description: 'Forgot password page background image'
      }
    ];

    console.log('🌱 Initializing default images...\n');

    for (const imageData of defaultImages) {
      const existing = await Settings.findOne({ key: imageData.key });
      
      if (existing) {
        console.log(`⏭️  ${imageData.key} already exists, skipping`);
      } else {
        await Settings.create(imageData);
        console.log(`✅ Created ${imageData.key}`);
      }
    }

    console.log('\n✅ Default images initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initDefaultImages();
