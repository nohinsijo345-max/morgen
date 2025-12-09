const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const User = require('../models/User');
require('dotenv').config();

const seedSalesData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' }).limit(15);
    
    if (farmers.length === 0) {
      console.log('No farmers found. Please seed users first.');
      process.exit(1);
    }

    console.log(`Found ${farmers.length} farmers`);

    // Clear existing sales
    await Sale.deleteMany({});
    console.log('Cleared existing sales data');

    const crops = ['Rice', 'Wheat', 'Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Corn'];
    const sales = [];

    // Generate random sales for each farmer
    for (const farmer of farmers) {
      // Random number of sales per farmer (1-20)
      const numSales = Math.floor(Math.random() * 20) + 1;
      
      for (let i = 0; i < numSales; i++) {
        const crop = crops[Math.floor(Math.random() * crops.length)];
        const quantity = Math.floor(Math.random() * 500) + 50;
        const pricePerUnit = Math.floor(Math.random() * 50) + 10;
        const totalAmount = quantity * pricePerUnit;
        
        // Random date within last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - daysAgo);

        sales.push({
          farmerId: farmer.farmerId,
          farmerName: farmer.name,
          cropName: crop,
          quantity,
          pricePerUnit,
          totalAmount,
          buyerId: `BUY-${Math.floor(Math.random() * 1000)}`,
          buyerName: `Buyer ${Math.floor(Math.random() * 100)}`,
          saleDate,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          review: 'Great quality produce!'
        });
      }
    }

    // Insert all sales
    await Sale.insertMany(sales);
    console.log(`✅ Successfully seeded ${sales.length} sales records`);

    // Show top 5 farmers
    const topFarmers = await Sale.aggregate([
      {
        $group: {
          _id: '$farmerId',
          name: { $first: '$farmerName' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n📊 Top 5 Farmers:');
    topFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} - ${farmer.totalSales} sales, ₹${farmer.totalRevenue.toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sales data:', error);
    process.exit(1);
  }
};

seedSalesData();
