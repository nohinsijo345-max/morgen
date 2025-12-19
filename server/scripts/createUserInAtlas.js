const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:morgen123@cluster0.qmcd0d4.mongodb.net/morgenDB?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createUser = async () => {
  await connectDB();
  
  try {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Check if user already exists
    const existingUser = await User.findOne({ farmerId: 'FAR-369' });
    if (existingUser) {
      console.log('✅ User already exists, updating...');
    }
    
    // Hash the PIN
    const pin = '1234';
    const hashedPin = await bcrypt.hash(pin, 10);
    
    // Create/update user data
    const userData = {
      name: 'Nohin Sijo',
      farmerId: 'FAR-369',
      email: 'nohinsijo345@gmail.com',
      phone: '8078532484',
      pin: hashedPin,
      role: 'farmer',
      state: 'kerala',
      district: 'ernakulam',
      city: 'Ernakulam',
      pinCode: '683545',
      panchayat: '',
      landSize: 15,
      cropTypes: ['rice', 'wheat', 'sugarcane'],
      subsidyRequested: false,
      subsidyStatus: 'none',
      reputationScore: 0,
      totalSales: 0,
      averageRating: 0,
      badge: 'none',
      totalPurchases: 0,
      maxBidLimit: 10000,
      language: 'english',
      voiceAssist: false,
      notifications: true,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      crops: [],
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Upsert the user
    await User.updateOne(
      { farmerId: 'FAR-369' },
      userData,
      { upsert: true }
    );
    
    console.log('✅ User created/updated successfully in Atlas database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name: ${userData.name}`);
    console.log(`Farmer ID: ${userData.farmerId}`);
    console.log(`Email: ${userData.email}`);
    console.log(`Phone: ${userData.phone}`);
    console.log(`PIN: ${pin} (for login)`);
    console.log(`State: ${userData.state}`);
    console.log(`District: ${userData.district}`);
    console.log(`City: ${userData.city}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 You can now login with:');
    console.log(`   Farmer ID: FAR-369`);
    console.log(`   PIN: 1234`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createUser();