const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect');

async function fixVehicleAssignments() {
  try {
    console.log('🔧 Fixing vehicle assignments...\n');

    // Find all drivers
    const drivers = await Driver.find();
    console.log(`Found ${drivers.length} drivers`);

    // Find all vehicles
    const vehicles = await Vehicle.find();
    console.log(`Found ${vehicles.length} vehicles`);

    // Check current assignments
    const assignedVehicles = await Vehicle.find({ driverId: { $exists: true, $ne: null } });
    console.log(`Currently assigned vehicles: ${assignedVehicles.length}`);

    // List current assignments
    if (assignedVehicles.length > 0) {
      console.log('\n📋 Current assignments:');
      for (const vehicle of assignedVehicles) {
        console.log(`   - ${vehicle.name} (${vehicle.type}) → Driver ${vehicle.driverId}`);
      }
    }

    // Test assignment for Rajesh (assuming he exists)
    const rajesh = drivers.find(d => d.name.toLowerCase().includes('rajesh'));
    if (rajesh) {
      console.log(`\n🎯 Found driver: ${rajesh.name} (${rajesh.driverId})`);
      
      // Check if Rajesh has any vehicles assigned
      const rajeshVehicles = await Vehicle.find({ driverId: rajesh.driverId });
      console.log(`   - Currently assigned vehicles: ${rajeshVehicles.length}`);
      
      if (rajeshVehicles.length === 0) {
        // Assign a truck to Rajesh
        const truck = await Vehicle.findOne({ type: 'truck', driverId: { $exists: false } });
        if (truck) {
          truck.driverId = rajesh.driverId;
          truck.assignedAt = new Date();
          await truck.save();
          console.log(`   ✅ Assigned ${truck.name} to ${rajesh.name}`);
        } else {
          console.log('   ❌ No available trucks to assign');
        }
      } else {
        console.log('   ✅ Rajesh already has vehicles assigned:');
        rajeshVehicles.forEach(v => {
          console.log(`      - ${v.name} (${v.type})`);
        });
      }
    } else {
      console.log('\n❌ Driver Rajesh not found');
    }

    // Verify assignments after changes
    const finalAssignments = await Vehicle.find({ driverId: { $exists: true, $ne: null } });
    console.log(`\n✅ Final assigned vehicles: ${finalAssignments.length}`);
    
    if (finalAssignments.length > 0) {
      console.log('\n📋 Final assignments:');
      for (const vehicle of finalAssignments) {
        const driver = await Driver.findOne({ driverId: vehicle.driverId });
        console.log(`   - ${vehicle.name} (${vehicle.type}) → ${driver ? driver.name : 'Unknown'} (${vehicle.driverId})`);
      }
    }

    console.log('\n🎉 Vehicle assignment fix completed!');

  } catch (error) {
    console.error('❌ Error fixing assignments:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixVehicleAssignments();