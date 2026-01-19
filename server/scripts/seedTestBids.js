const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgem', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const generateBidId = async () => {
  try {
    const lastBid = await Bid.findOne({ 
      bidId: { $regex: /^BID\d+$/ } 
    }).sort({ bidId: -1 });
    
    if (!lastBid || !lastBid.bidId) {
      return 'BID001';
    }
    
    const lastNumber = parseInt(lastBid.bidId.replace('BID', ''));
    const nextNumber = lastNumber + 1;
    
    return `BID${String(nextNumber).padStart(3, '0')}`;
  } catch (err) {
    console.error('Error generating bid ID:', err);
    return `BID${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  }
};

const seedTestBids = async () => {
  try {
    console.log('🌱 Seeding test bids for live auction...\n');

    // First, ensure we have test farmers
    const testFarmers = [
      {
        name: 'Ravi Kumar',
        role: 'farmer',
        farmerId: 'MGF001',
        pin: '1234',
        phone: '9876543210',
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        pinCode: '682001'
      },
      {
        name: 'Priya Nair',
        role: 'farmer',
        farmerId: 'MGF002',
        pin: '5678',
        phone: '9876543211',
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        pinCode: '682001'
      },
      {
        name: 'Suresh Menon',
        role: 'farmer',
        farmerId: 'MGF003',
        pin: '9012',
        phone: '9876543212',
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Aluva',
        pinCode: '683101'
      }
    ];

    console.log('👨‍🌾 Ensuring test farmers exist...');
    for (const farmerData of testFarmers) {
      const existingFarmer = await User.findOne({ farmerId: farmerData.farmerId });
      if (!existingFarmer) {
        const farmer = new User(farmerData);
        await farmer.save();
        console.log(`✅ Created farmer: ${farmerData.name}`);
      } else {
        console.log(`✅ Farmer exists: ${farmerData.name}`);
      }
    }

    // Create test bids with future end dates
    const now = new Date();
    const testBids = [
      {
        farmerId: 'MGF001',
        farmerName: 'Ravi Kumar',
        cropName: 'Premium Basmati Rice',
        quantity: 100,
        unit: 'kg',
        quality: 'Premium',
        harvestDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        expiryDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        bidEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        startingPrice: 5000,
        currentPrice: 5000,
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        status: 'active',
        totalBids: 0,
        uniqueBidders: 0,
        bids: []
      },
      {
        farmerId: 'MGF002',
        farmerName: 'Priya Nair',
        cropName: 'Organic Tomatoes',
        quantity: 50,
        unit: 'kg',
        quality: 'Grade A',
        harvestDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        expiryDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        bidEndDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        startingPrice: 3500,
        currentPrice: 4200, // Someone already bid
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        status: 'active',
        totalBids: 3,
        uniqueBidders: 2,
        bids: [
          {
            buyerId: 'MGB001',
            buyerName: 'Commercial Buyer 1',
            bidAmount: 3800,
            bidTime: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            buyerId: 'MGB002',
            buyerName: 'Commercial Buyer 2',
            bidAmount: 4000,
            bidTime: new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago
          },
          {
            buyerId: 'MGB001',
            buyerName: 'Commercial Buyer 1',
            bidAmount: 4200,
            bidTime: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
          }
        ]
      },
      {
        farmerId: 'MGF003',
        farmerName: 'Suresh Menon',
        cropName: 'Fresh Coconuts',
        quantity: 200,
        unit: 'piece',
        quality: 'Grade A',
        harvestDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        bidEndDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startingPrice: 15,
        currentPrice: 18,
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Aluva',
        status: 'active',
        totalBids: 1,
        uniqueBidders: 1,
        bids: [
          {
            buyerId: 'MGB003',
            buyerName: 'Commercial Buyer 3',
            bidAmount: 18,
            bidTime: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
          }
        ]
      },
      {
        farmerId: 'MGF001',
        farmerName: 'Ravi Kumar',
        cropName: 'Organic Wheat',
        quantity: 75,
        unit: 'kg',
        quality: 'Premium',
        harvestDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        expiryDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
        bidEndDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now (ending soon!)
        startingPrice: 4500,
        currentPrice: 5800,
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        status: 'active',
        totalBids: 5,
        uniqueBidders: 3,
        bids: [
          {
            buyerId: 'MGB001',
            buyerName: 'Commercial Buyer 1',
            bidAmount: 4800,
            bidTime: new Date(now.getTime() - 3 * 60 * 60 * 1000)
          },
          {
            buyerId: 'MGB002',
            buyerName: 'Commercial Buyer 2',
            bidAmount: 5200,
            bidTime: new Date(now.getTime() - 2 * 60 * 60 * 1000)
          },
          {
            buyerId: 'MGB004',
            buyerName: 'Commercial Buyer 4',
            bidAmount: 5500,
            bidTime: new Date(now.getTime() - 1 * 60 * 60 * 1000)
          },
          {
            buyerId: 'MGB001',
            buyerName: 'Commercial Buyer 1',
            bidAmount: 5700,
            bidTime: new Date(now.getTime() - 30 * 60 * 1000)
          },
          {
            buyerId: 'MGB002',
            buyerName: 'Commercial Buyer 2',
            bidAmount: 5800,
            bidTime: new Date(now.getTime() - 15 * 60 * 1000)
          }
        ]
      }
    ];

    console.log('\n🏷️ Creating test bids...');
    
    for (const bidData of testBids) {
      // Check if bid already exists
      const existingBid = await Bid.findOne({ 
        farmerId: bidData.farmerId,
        cropName: bidData.cropName 
      });
      
      if (!existingBid) {
        const bidId = await generateBidId();
        const bid = new Bid({
          bidId,
          ...bidData
        });
        await bid.save();
        console.log(`✅ Created bid: ${bidData.cropName} by ${bidData.farmerName} (${bidId})`);
      } else {
        // Update existing bid to ensure it's active and has future end date
        existingBid.status = 'active';
        existingBid.bidEndDate = bidData.bidEndDate;
        existingBid.currentPrice = bidData.currentPrice;
        existingBid.totalBids = bidData.totalBids;
        existingBid.uniqueBidders = bidData.uniqueBidders;
        existingBid.bids = bidData.bids;
        await existingBid.save();
        console.log(`🔄 Updated existing bid: ${bidData.cropName} by ${bidData.farmerName}`);
      }
    }

    // Verify the bids were created
    console.log('\n🔍 Verifying created bids...');
    const activeBids = await Bid.find({ 
      status: 'active',
      bidEndDate: { $gt: new Date() }
    });

    console.log(`✅ Total active bids: ${activeBids.length}`);
    
    activeBids.forEach((bid, index) => {
      const timeLeft = Math.ceil((new Date(bid.bidEndDate) - new Date()) / (1000 * 60 * 60));
      console.log(`${index + 1}. ${bid.cropName} - ₹${bid.currentPrice} (${timeLeft}h left)`);
    });

    console.log('\n🎉 Test bids seeding completed!');
    console.log('💡 You can now test the Live Bidding page with real data.');

  } catch (error) {
    console.error('❌ Error seeding test bids:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedTestBids();