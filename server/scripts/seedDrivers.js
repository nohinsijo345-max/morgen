const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Driver = require('../models/Driver');

const seedDrivers = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing drivers
    await Driver.deleteMany({});
    console.log('🗑️ Cleared existing drivers\n');

    const drivers = [
      {
        driverId: 'DRV001',
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh.driver@morgen.com',
        licenseNumber: 'KL-07-2023-001234',
        vehicleType: 'truck',
        district: 'ernakulam',
        password: 'driver123',
        isActive: true,
        rating: 4.8,
        totalTrips: 45
      },
      {
        driverId: 'DRV002',
        name: 'Suresh Nair',
        phone: '9876543211',
        email: 'suresh.driver@morgen.com',
        licenseNumber: 'KL-07-2023-001235',
        vehicleType: 'mini-truck',
        district: 'thiruvananthapuram',
        password: 'driver123',
        isActive: true,
        rating: 4.6,
        totalTrips: 32
      },
      {
        driverId: 'DRV003',
        name: 'Anil Varma',
        phone: '9876543212',
        email: 'anil.driver@morgen.com',
        licenseNumber: 'KL-07-2023-001236',
        vehicleType: 'tractor',
        district: 'kochi',
        password: 'driver123',
        isActive: true,
        rating: 4.9,
        totalTrips: 67
      },
      {
        driverId: 'DRV004',
        name: 'Mohan Das',
        phone: '9876543213',
        email: 'mohan.driver@morgen.com',
        licenseNumber: 'KL-07-2023-001237',
        vehicleType: 'autorickshaw',
        district: 'ernakulam',
        password: 'driver123',
        isActive: true,
        rating: 4.5,
        totalTrips: 89
      },
      {
        driverId: 'DRV005',
        name: 'Vinod Krishnan',
        phone: '9876543214',
        email: 'vinod.driver@morgen.com',
        licenseNumber: 'KL-07-2023-001238',
        vehicleType: 'jeep',
        district: 'kozhikode',
        password: 'driver123',
        isActive: false,
        rating: 4.2,
        totalTrips: 23
      }
    ];

    // Hash passwords and create drivers
    const driversWithHashedPasswords = await Promise.all(
      drivers.map(async (driver) => ({
        ...driver,
        password: await bcrypt.hash(driver.password, 10)
      }))
    );

    const createdDrivers = await Driver.insertMany(driversWithHashedPasswords);
    console.log(`✅ Created ${createdDrivers.length} drivers:`);
    
    createdDrivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name} (${driver.driverId})`);
      console.log(`   Vehicle: ${driver.vehicleType}`);
      console.log(`   District: ${driver.district}`);
      console.log(`   Status: ${driver.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Rating: ${driver.rating}/5.0`);
      console.log(`   Total Trips: ${driver.totalTrips}`);
      console.log('');
    });

    console.log('🎉 Driver seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Driver ID: DRV001, Password: driver123');
    console.log('Driver ID: DRV002, Password: driver123');
    console.log('Driver ID: DRV003, Password: driver123');
    console.log('Driver ID: DRV004, Password: driver123');
    console.log('Driver ID: DRV005, Password: driver123');
    
  } catch (err) {
    console.error('❌ Error seeding drivers:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDrivers();