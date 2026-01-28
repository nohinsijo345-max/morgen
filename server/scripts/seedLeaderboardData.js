const mongoose = require('mongoose');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Bid = require('../models/Bid');
require('dotenv').config();

const seedLeaderboardData = async () => {
  try {
    console.log('🌱 Seeding leaderboard data...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create sample farmers if they don't exist
    const sampleFarmers = [
      {
        name: 'Rajesh Kumar',
        farmerId: 'FAR001',
        role: 'farmer',
        pin: '1234',
        phone: '9876543210',
        email: 'rajesh@example.com',
        state: 'Karnataka',
        district: 'Bangalore Rural',
        city: 'Doddaballapur',
        pinCode: '561203',
        landSize: 5.5,
        cropTypes: ['Rice', 'Wheat', 'Sugarcane']
      },
      {
        name: 'Priya Sharma',
        farmerId: 'FAR002',
        role: 'farmer',
        pin: '2345',
        phone: '9876543221',
        email: 'priya@example.com',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        city: 'Pollachi',
        pinCode: '642001',
        landSize: 3.2,
        cropTypes: ['Cotton', 'Corn', 'Tomato']
      },
      {
        name: 'Arjun Patel',
        farmerId: 'FAR003',
        role: 'farmer',
        pin: '3456',
        phone: '9876543232',
        email: 'arjun@example.com',
        state: 'Gujarat',
        district: 'Ahmedabad',
        city: 'Sanand',
        pinCode: '382110',
        landSize: 8.0,
        cropTypes: ['Cotton', 'Groundnut', 'Wheat']
      },
      {
        name: 'Meera Reddy',
        farmerId: 'FAR004',
        role: 'farmer',
        pin: '4567',
        phone: '9876543243',
        email: 'meera@example.com',
        state: 'Andhra Pradesh',
        district: 'Krishna',
        city: 'Vijayawada',
        pinCode: '520001',
        landSize: 4.5,
        cropTypes: ['Rice', 'Chili', 'Sugarcane']
      },
      {
        name: 'Suresh Nair',
        farmerId: 'FAR005',
        role: 'farmer',
        pin: '5678',
        phone: '9876543254',
        email: 'suresh@example.com',
        state: 'Kerala',
        district: 'Kottayam',
        city: 'Changanassery',
        pinCode: '686101',
        landSize: 2.8,
        cropTypes: ['Coffee', 'Pepper', 'Cardamom']
      },
      {
        name: 'Lakshmi Devi',
        farmerId: 'FAR006',
        role: 'farmer',
        pin: '6789',
        phone: '9876543265',
        email: 'lakshmi@example.com',
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Khanna',
        pinCode: '141401',
        landSize: 12.0,
        cropTypes: ['Wheat', 'Rice', 'Corn']
      },
      {
        name: 'Vikram Singh',
        farmerId: 'FAR007',
        role: 'farmer',
        pin: '7890',
        phone: '9876543276',
        email: 'vikram@example.com',
        state: 'Haryana',
        district: 'Karnal',
        city: 'Panipat',
        pinCode: '132103',
        landSize: 6.5,
        cropTypes: ['Wheat', 'Mustard', 'Sugarcane']
      },
      {
        name: 'Anita Joshi',
        farmerId: 'FAR008',
        role: 'farmer',
        pin: '8901',
        phone: '9876543287',
        email: 'anita@example.com',
        state: 'Maharashtra',
        district: 'Pune',
        city: 'Baramati',
        pinCode: '413102',
        landSize: 7.2,
        cropTypes: ['Sugarcane', 'Onion', 'Grapes']
      },
      {
        name: 'Ravi Krishnan',
        farmerId: 'FAR009',
        role: 'farmer',
        pin: '9012',
        phone: '9876543298',
        email: 'ravi@example.com',
        state: 'Tamil Nadu',
        district: 'Thanjavur',
        city: 'Kumbakonam',
        pinCode: '612001',
        landSize: 4.8,
        cropTypes: ['Rice', 'Banana', 'Coconut']
      },
      {
        name: 'Sunita Gupta',
        farmerId: 'FAR010',
        role: 'farmer',
        pin: '0123',
        phone: '9876543309',
        email: 'sunita@example.com',
        state: 'Uttar Pradesh',
        district: 'Meerut',
        city: 'Ghaziabad',
        pinCode: '201001',
        landSize: 5.0,
        cropTypes: ['Wheat', 'Potato', 'Sugarcane']
      }
    ];

    // Insert farmers
    for (const farmerData of sampleFarmers) {
      const existingFarmer = await User.findOne({ 
        $or: [
          { farmerId: farmerData.farmerId },
          { phone: farmerData.phone },
          { email: farmerData.email }
        ]
      });
      if (!existingFarmer) {
        await User.create(farmerData);
        console.log(`✅ Created farmer: ${farmerData.name}`);
      } else {
        console.log(`⚠️ Farmer already exists: ${farmerData.name}`);
      }
    }

    // Create sample sales data
    const sampleSales = [
      // Rajesh Kumar - Top performer
      { farmerId: 'FAR001', farmerName: 'Rajesh Kumar', cropName: 'Rice', quantity: 100, pricePerUnit: 25, totalAmount: 2500, rating: 4.8, saleDate: new Date('2024-01-15') },
      { farmerId: 'FAR001', farmerName: 'Rajesh Kumar', cropName: 'Wheat', quantity: 80, pricePerUnit: 22, totalAmount: 1760, rating: 4.9, saleDate: new Date('2024-02-10') },
      { farmerId: 'FAR001', farmerName: 'Rajesh Kumar', cropName: 'Sugarcane', quantity: 200, pricePerUnit: 30, totalAmount: 6000, rating: 4.7, saleDate: new Date('2024-03-05') },
      { farmerId: 'FAR001', farmerName: 'Rajesh Kumar', cropName: 'Rice', quantity: 120, pricePerUnit: 26, totalAmount: 3120, rating: 4.8, saleDate: new Date('2024-04-12') },
      { farmerId: 'FAR001', farmerName: 'Rajesh Kumar', cropName: 'Wheat', quantity: 90, pricePerUnit: 24, totalAmount: 2160, rating: 4.9, saleDate: new Date('2024-05-20') },
      
      // Priya Sharma - Second best
      { farmerId: 'FAR002', farmerName: 'Priya Sharma', cropName: 'Cotton', quantity: 50, pricePerUnit: 45, totalAmount: 2250, rating: 4.6, saleDate: new Date('2024-01-20') },
      { farmerId: 'FAR002', farmerName: 'Priya Sharma', cropName: 'Corn', quantity: 75, pricePerUnit: 18, totalAmount: 1350, rating: 4.5, saleDate: new Date('2024-02-25') },
      { farmerId: 'FAR002', farmerName: 'Priya Sharma', cropName: 'Tomato', quantity: 60, pricePerUnit: 35, totalAmount: 2100, rating: 4.7, saleDate: new Date('2024-03-15') },
      { farmerId: 'FAR002', farmerName: 'Priya Sharma', cropName: 'Cotton', quantity: 55, pricePerUnit: 47, totalAmount: 2585, rating: 4.6, saleDate: new Date('2024-04-18') },
      
      // Arjun Patel - Third best
      { farmerId: 'FAR003', farmerName: 'Arjun Patel', cropName: 'Cotton', quantity: 80, pricePerUnit: 44, totalAmount: 3520, rating: 4.4, saleDate: new Date('2024-01-25') },
      { farmerId: 'FAR003', farmerName: 'Arjun Patel', cropName: 'Groundnut', quantity: 40, pricePerUnit: 55, totalAmount: 2200, rating: 4.3, saleDate: new Date('2024-03-10') },
      { farmerId: 'FAR003', farmerName: 'Arjun Patel', cropName: 'Wheat', quantity: 70, pricePerUnit: 23, totalAmount: 1610, rating: 4.5, saleDate: new Date('2024-04-22') },
      
      // Other farmers with varying performance
      { farmerId: 'FAR004', farmerName: 'Meera Reddy', cropName: 'Rice', quantity: 85, pricePerUnit: 24, totalAmount: 2040, rating: 4.2, saleDate: new Date('2024-02-05') },
      { farmerId: 'FAR004', farmerName: 'Meera Reddy', cropName: 'Chili', quantity: 30, pricePerUnit: 80, totalAmount: 2400, rating: 4.4, saleDate: new Date('2024-03-20') },
      
      { farmerId: 'FAR005', farmerName: 'Suresh Nair', cropName: 'Coffee', quantity: 25, pricePerUnit: 120, totalAmount: 3000, rating: 4.8, saleDate: new Date('2024-01-30') },
      { farmerId: 'FAR005', farmerName: 'Suresh Nair', cropName: 'Pepper', quantity: 15, pricePerUnit: 200, totalAmount: 3000, rating: 4.9, saleDate: new Date('2024-04-05') },
      
      { farmerId: 'FAR006', farmerName: 'Lakshmi Devi', cropName: 'Wheat', quantity: 150, pricePerUnit: 21, totalAmount: 3150, rating: 4.1, saleDate: new Date('2024-02-15') },
      { farmerId: 'FAR006', farmerName: 'Lakshmi Devi', cropName: 'Rice', quantity: 120, pricePerUnit: 25, totalAmount: 3000, rating: 4.3, saleDate: new Date('2024-05-10') },
      
      { farmerId: 'FAR007', farmerName: 'Vikram Singh', cropName: 'Wheat', quantity: 95, pricePerUnit: 22, totalAmount: 2090, rating: 4.0, saleDate: new Date('2024-03-25') },
      
      { farmerId: 'FAR008', farmerName: 'Anita Joshi', cropName: 'Sugarcane', quantity: 180, pricePerUnit: 28, totalAmount: 5040, rating: 4.5, saleDate: new Date('2024-01-10') },
      { farmerId: 'FAR008', farmerName: 'Anita Joshi', cropName: 'Onion', quantity: 50, pricePerUnit: 40, totalAmount: 2000, rating: 4.2, saleDate: new Date('2024-04-15') },
      
      { farmerId: 'FAR009', farmerName: 'Ravi Krishnan', cropName: 'Rice', quantity: 110, pricePerUnit: 26, totalAmount: 2860, rating: 4.6, saleDate: new Date('2024-02-20') },
      
      { farmerId: 'FAR010', farmerName: 'Sunita Gupta', cropName: 'Wheat', quantity: 65, pricePerUnit: 23, totalAmount: 1495, rating: 4.1, saleDate: new Date('2024-03-30') }
    ];

    // Insert sales data
    await Sale.deleteMany({}); // Clear existing sales
    await Sale.insertMany(sampleSales);
    console.log(`✅ Created ${sampleSales.length} sales records`);

    // Create sample bidding data
    const sampleBids = [
      // Active bids
      {
        bidId: 'BID001',
        farmerId: 'FAR001',
        farmerName: 'Rajesh Kumar',
        cropName: 'Rice',
        quantity: 100,
        quality: 'Premium',
        harvestDate: new Date('2024-06-01'),
        expiryDate: new Date('2024-06-15'),
        bidEndDate: new Date('2024-06-10'),
        startingPrice: 2500,
        currentPrice: 2800,
        status: 'completed',
        winnerId: 'BUY001',
        winnerName: 'ABC Traders',
        winningAmount: 2800,
        state: 'Karnataka',
        district: 'Bangalore Rural',
        city: 'Doddaballapur',
        totalBids: 5,
        uniqueBidders: 3,
        bids: [
          { buyerId: 'BUY001', buyerName: 'ABC Traders', bidAmount: 2800, bidTime: new Date('2024-06-09') },
          { buyerId: 'BUY002', buyerName: 'XYZ Corp', bidAmount: 2750, bidTime: new Date('2024-06-08') }
        ]
      },
      {
        bidId: 'BID002',
        farmerId: 'FAR002',
        farmerName: 'Priya Sharma',
        cropName: 'Cotton',
        quantity: 50,
        quality: 'Grade A',
        harvestDate: new Date('2024-05-15'),
        expiryDate: new Date('2024-05-30'),
        bidEndDate: new Date('2024-05-25'),
        startingPrice: 2200,
        currentPrice: 2400,
        status: 'completed',
        winnerId: 'BUY003',
        winnerName: 'Cotton Mills Ltd',
        winningAmount: 2400,
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        city: 'Pollachi',
        totalBids: 3,
        uniqueBidders: 2,
        bids: [
          { buyerId: 'BUY003', buyerName: 'Cotton Mills Ltd', bidAmount: 2400, bidTime: new Date('2024-05-24') }
        ]
      },
      {
        bidId: 'BID003',
        farmerId: 'FAR003',
        farmerName: 'Arjun Patel',
        cropName: 'Groundnut',
        quantity: 40,
        quality: 'Premium',
        harvestDate: new Date('2024-05-20'),
        expiryDate: new Date('2024-06-05'),
        bidEndDate: new Date('2024-05-30'),
        startingPrice: 2000,
        currentPrice: 2200,
        status: 'completed',
        winnerId: 'BUY001',
        winnerName: 'ABC Traders',
        winningAmount: 2200,
        state: 'Gujarat',
        district: 'Ahmedabad',
        city: 'Sanand',
        totalBids: 4,
        uniqueBidders: 2,
        bids: [
          { buyerId: 'BUY001', buyerName: 'ABC Traders', bidAmount: 2200, bidTime: new Date('2024-05-29') }
        ]
      },
      // Active bids (ongoing)
      {
        bidId: 'BID004',
        farmerId: 'FAR004',
        farmerName: 'Meera Reddy',
        cropName: 'Rice',
        quantity: 80,
        quality: 'Grade A',
        harvestDate: new Date('2024-06-15'),
        expiryDate: new Date('2024-06-30'),
        bidEndDate: new Date('2024-06-25'),
        startingPrice: 2000,
        currentPrice: 2150,
        status: 'active',
        state: 'Andhra Pradesh',
        district: 'Krishna',
        city: 'Vijayawada',
        totalBids: 2,
        uniqueBidders: 2,
        bids: [
          { buyerId: 'BUY002', buyerName: 'XYZ Corp', bidAmount: 2150, bidTime: new Date('2024-06-20') },
          { buyerId: 'BUY001', buyerName: 'ABC Traders', bidAmount: 2100, bidTime: new Date('2024-06-19') }
        ]
      },
      {
        bidId: 'BID005',
        farmerId: 'FAR005',
        farmerName: 'Suresh Nair',
        cropName: 'Coffee',
        quantity: 20,
        quality: 'Premium',
        harvestDate: new Date('2024-06-10'),
        expiryDate: new Date('2024-06-25'),
        bidEndDate: new Date('2024-06-22'),
        startingPrice: 2400,
        currentPrice: 2600,
        status: 'active',
        state: 'Kerala',
        district: 'Kottayam',
        city: 'Changanassery',
        totalBids: 3,
        uniqueBidders: 2,
        bids: [
          { buyerId: 'BUY004', buyerName: 'Coffee Exporters', bidAmount: 2600, bidTime: new Date('2024-06-21') }
        ]
      }
    ];

    // Insert bidding data
    await Bid.deleteMany({}); // Clear existing bids
    await Bid.insertMany(sampleBids);
    console.log(`✅ Created ${sampleBids.length} bid records`);

    console.log('🎉 Leaderboard data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Farmers: ${sampleFarmers.length}`);
    console.log(`- Sales: ${sampleSales.length}`);
    console.log(`- Bids: ${sampleBids.length}`);
    console.log('\n🏆 Top performers should be:');
    console.log('1. Rajesh Kumar (FAR001) - 5 sales, high ratings');
    console.log('2. Priya Sharma (FAR002) - 4 sales, good performance');
    console.log('3. Arjun Patel (FAR003) - 3 sales, decent performance');

  } catch (error) {
    console.error('❌ Error seeding leaderboard data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding function
seedLeaderboardData();