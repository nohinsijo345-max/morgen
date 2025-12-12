const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Vehicle = require('../models/Vehicle');

const seedVehicles = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log('🗑️ Cleared existing vehicles\n');

    const vehicles = [
      {
        name: 'Premium Truck',
        type: 'truck',
        icon: '🚛',
        priceOptions: [
          {
            capacity: 'Small Load (1-2 tons)',
            pricePerKm: 15,
            basePrice: 200,
            description: 'Perfect for small crop loads'
          },
          {
            capacity: 'Medium Load (3-5 tons)',
            pricePerKm: 25,
            basePrice: 350,
            description: 'Ideal for medium-sized harvests'
          },
          {
            capacity: 'Large Load (6-10 tons)',
            pricePerKm: 40,
            basePrice: 500,
            description: 'Best for bulk transportation'
          }
        ],
        availability: true
      },
      {
        name: 'Mini Truck',
        type: 'mini-truck',
        icon: '🚚',
        priceOptions: [
          {
            capacity: 'Compact Load (500kg-1 ton)',
            pricePerKm: 8,
            basePrice: 120,
            description: 'Quick delivery for small quantities'
          },
          {
            capacity: 'Standard Load (1-2 tons)',
            pricePerKm: 12,
            basePrice: 180,
            description: 'Regular transport needs'
          }
        ],
        availability: true
      },
      {
        name: 'Tractor with Trailer',
        type: 'tractor',
        icon: '🚜',
        priceOptions: [
          {
            capacity: 'Farm Load (2-4 tons)',
            pricePerKm: 18,
            basePrice: 250,
            description: 'Direct from farm transport'
          },
          {
            capacity: 'Heavy Farm Load (4-8 tons)',
            pricePerKm: 30,
            basePrice: 400,
            description: 'Large farm produce transport'
          }
        ],
        availability: true
      },
      {
        name: 'Auto Rickshaw',
        type: 'autorickshaw',
        icon: '🛺',
        priceOptions: [
          {
            capacity: 'Light Load (50-200kg)',
            pricePerKm: 5,
            basePrice: 50,
            description: 'Quick local delivery'
          },
          {
            capacity: 'Standard Load (200-500kg)',
            pricePerKm: 8,
            basePrice: 80,
            description: 'Local market transport'
          }
        ],
        availability: true
      },
      {
        name: 'Jeep/SUV',
        type: 'jeep',
        icon: '🚙',
        priceOptions: [
          {
            capacity: 'Personal + Light Cargo',
            pricePerKm: 10,
            basePrice: 150,
            description: 'Farmer + small produce transport'
          }
        ],
        availability: true
      },
      {
        name: 'Pickup Truck',
        type: 'car',
        icon: '🛻',
        priceOptions: [
          {
            capacity: 'Medium Load (500kg-1.5 tons)',
            pricePerKm: 12,
            basePrice: 160,
            description: 'Versatile transport solution'
          }
        ],
        availability: true
      },
      {
        name: 'Motorcycle',
        type: 'bike',
        icon: '🏍️',
        priceOptions: [
          {
            capacity: 'Small Items (10-50kg)',
            pricePerKm: 3,
            basePrice: 30,
            description: 'Quick delivery for documents/samples'
          }
        ],
        availability: true
      },
      {
        name: 'Bicycle',
        type: 'cycle',
        icon: '🚲',
        priceOptions: [
          {
            capacity: 'Very Light Load (5-20kg)',
            pricePerKm: 2,
            basePrice: 20,
            description: 'Eco-friendly local delivery'
          }
        ],
        availability: true
      }
    ];

    const createdVehicles = await Vehicle.insertMany(vehicles);
    console.log(`✅ Created ${createdVehicles.length} vehicles:`);
    
    createdVehicles.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.name} (${vehicle.type})`);
      console.log(`   Price options: ${vehicle.priceOptions.length}`);
      console.log(`   Lowest price: ₹${Math.min(...vehicle.priceOptions.map(p => p.basePrice))}`);
      console.log('');
    });

    console.log('🎉 Vehicle seeding completed successfully!');
    
  } catch (err) {
    console.error('❌ Error seeding vehicles:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedVehicles();