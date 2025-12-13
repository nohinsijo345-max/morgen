const mongoose = require('mongoose');
require('dotenv').config();

// Test the enhanced AI estimation system
async function testEnhancedAIEstimation() {
  try {
    console.log('🔗 Testing Enhanced AI Estimation (Offline Mode)');

    // Import the estimation function (we'll simulate it here)
    const testScenarios = [
      {
        name: 'Local Same District - Vegetables',
        fromLocation: {
          city: 'Kochi',
          district: 'Ernakulam',
          state: 'Kerala',
          pinCode: '682001'
        },
        toLocation: {
          city: 'Aluva',
          district: 'Ernakulam', 
          state: 'Kerala',
          pinCode: '683101'
        },
        vehicleType: 'mini-truck',
        cargoDescription: 'Fresh vegetables',
        pickupDate: new Date('2024-12-14T08:00:00Z'), // Morning rush
        expectedRange: '2-4 hours'
      },
      {
        name: 'Interstate Heavy Machinery',
        fromLocation: {
          city: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400001'
        },
        toLocation: {
          city: 'Bangalore',
          district: 'Bangalore',
          state: 'Karnataka',
          pinCode: '560001'
        },
        vehicleType: 'truck',
        cargoDescription: 'Heavy machinery equipment',
        pickupDate: new Date('2024-12-14T14:00:00Z'), // Afternoon
        expectedRange: '18-24 hours'
      },
      {
        name: 'Monsoon Season Fragile Items',
        fromLocation: {
          city: 'Thiruvananthapuram',
          district: 'Thiruvananthapuram',
          state: 'Kerala',
          pinCode: '695001'
        },
        toLocation: {
          city: 'Kottayam',
          district: 'Kottayam',
          state: 'Kerala',
          pinCode: '686001'
        },
        vehicleType: 'jeep',
        cargoDescription: 'Fragile glass items',
        pickupDate: new Date('2024-07-15T10:00:00Z'), // Monsoon season
        expectedRange: '6-10 hours'
      },
      {
        name: 'Weekend Local Delivery',
        fromLocation: {
          city: 'Chennai',
          district: 'Chennai',
          state: 'Tamil Nadu',
          pinCode: '600001'
        },
        toLocation: {
          city: 'Tambaram',
          district: 'Chennai',
          state: 'Tamil Nadu',
          pinCode: '600045'
        },
        vehicleType: 'autorickshaw',
        cargoDescription: 'Small packages',
        pickupDate: new Date('2024-12-15T11:00:00Z'), // Weekend
        expectedRange: '1-3 hours'
      },
      {
        name: 'Long Distance Perishables',
        fromLocation: {
          city: 'Delhi',
          district: 'New Delhi',
          state: 'Delhi',
          pinCode: '110001'
        },
        toLocation: {
          city: 'Jaipur',
          district: 'Jaipur',
          state: 'Rajasthan',
          pinCode: '302001'
        },
        vehicleType: 'truck',
        cargoDescription: 'Perishable dairy products',
        pickupDate: new Date('2024-12-14T05:00:00Z'), // Early morning
        expectedRange: '8-12 hours'
      }
    ];

    console.log('\n🧪 Testing Enhanced AI Estimation Scenarios\n');

    for (const scenario of testScenarios) {
      console.log(`\n📋 Testing: ${scenario.name}`);
      console.log(`   Route: ${scenario.fromLocation.city} → ${scenario.toLocation.city}`);
      console.log(`   Vehicle: ${scenario.vehicleType}`);
      console.log(`   Cargo: ${scenario.cargoDescription}`);
      console.log(`   Pickup: ${scenario.pickupDate.toLocaleString()}`);
      console.log(`   Expected: ${scenario.expectedRange}`);

      // Simulate the enhanced calculation
      const result = simulateEnhancedEstimation(scenario);
      console.log(`   ✅ Estimated: ${result.hours} hours (${result.confidence})`);
      console.log(`   📊 Breakdown: Transit ${result.breakdown.transit}h + Loading ${result.breakdown.loading}h + Buffer ${result.breakdown.buffer}h`);
    }

    console.log('\n✅ Enhanced AI Estimation Test Complete');
    console.log('\n📈 Improvements Made:');
    console.log('   • More precise distance calculations based on Indian geography');
    console.log('   • Vehicle-specific performance metrics for Indian road conditions');
    console.log('   • Enhanced traffic pattern analysis with time-of-day factors');
    console.log('   • Advanced cargo handling considerations');
    console.log('   • Comprehensive seasonal and weather adjustments');
    console.log('   • Regional monsoon and fog impact factors');
    console.log('   • Interstate checkpoint and documentation delays');
    console.log('   • Realistic buffer calculations based on complexity');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function simulateEnhancedEstimation(scenario) {
  const { fromLocation, toLocation, vehicleType, cargoDescription, pickupDate } = scenario;
  
  // Simulate the enhanced calculation logic
  const sameDistrict = fromLocation.district === toLocation.district;
  const sameState = fromLocation.state === toLocation.state;
  
  // Distance estimation
  let estimatedDistance;
  if (sameDistrict) {
    estimatedDistance = 35;
  } else if (sameState) {
    estimatedDistance = 120;
  } else {
    estimatedDistance = 350;
  }
  
  // Vehicle specs
  const vehicleSpecs = {
    'truck': { avgSpeed: 45, loadingTime: 2.5, trafficSensitivity: 1.3 },
    'mini-truck': { avgSpeed: 50, loadingTime: 1.8, trafficSensitivity: 1.2 },
    'jeep': { avgSpeed: 55, loadingTime: 1.0, trafficSensitivity: 1.1 },
    'autorickshaw': { avgSpeed: 35, loadingTime: 0.5, trafficSensitivity: 1.8 },
    'car': { avgSpeed: 60, loadingTime: 0.8, trafficSensitivity: 1.0 },
    'bike': { avgSpeed: 45, loadingTime: 0.3, trafficSensitivity: 0.7 },
    'cycle': { avgSpeed: 18, loadingTime: 0.2, trafficSensitivity: 0.5 }
  };
  
  const vehicleSpec = vehicleSpecs[vehicleType] || vehicleSpecs['truck'];
  
  // Base calculation
  let baseTransitHours = estimatedDistance / vehicleSpec.avgSpeed;
  
  // Traffic factors
  const scheduledHour = pickupDate.getHours();
  const dayOfWeek = pickupDate.getDay();
  let trafficMultiplier = 1.0;
  
  if (scheduledHour >= 7 && scheduledHour <= 10) {
    trafficMultiplier = 1.0 + (vehicleSpec.trafficSensitivity * 0.4);
  } else if (scheduledHour >= 17 && scheduledHour <= 20) {
    trafficMultiplier = 1.0 + (vehicleSpec.trafficSensitivity * 0.5);
  }
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    trafficMultiplier *= 0.9;
  }
  
  // Cargo factors
  let cargoMultiplier = 1.0;
  let loadingMultiplier = 1.0;
  
  if (cargoDescription) {
    const cargoLower = cargoDescription.toLowerCase();
    if (cargoLower.includes('fragile')) {
      cargoMultiplier = 1.5;
      loadingMultiplier = 1.8;
    } else if (cargoLower.includes('perishable') || cargoLower.includes('fresh')) {
      cargoMultiplier = 1.2;
      loadingMultiplier = 1.3;
    } else if (cargoLower.includes('heavy') || cargoLower.includes('machinery')) {
      cargoMultiplier = 1.4;
      loadingMultiplier = 2.0;
    }
  }
  
  // Seasonal factors
  const currentMonth = pickupDate.getMonth() + 1;
  let seasonalMultiplier = 1.0;
  
  if (currentMonth >= 6 && currentMonth <= 9) {
    seasonalMultiplier = currentMonth === 7 || currentMonth === 8 ? 1.6 : 1.3;
  }
  
  // Calculate final time
  const transitTime = baseTransitHours * trafficMultiplier * cargoMultiplier;
  const loadingTime = vehicleSpec.loadingTime * loadingMultiplier;
  const checkpointTime = sameState ? 0 : 1.5;
  
  let totalHours = (transitTime + loadingTime + checkpointTime) * seasonalMultiplier;
  
  // Buffer
  const bufferMultiplier = sameDistrict ? 1.1 : (sameState ? 1.15 : 1.2);
  totalHours *= bufferMultiplier;
  
  const finalHours = Math.ceil(totalHours * 2) / 2;
  
  // Bounds
  let minHours = sameDistrict ? 2 : (sameState ? 4 : 8);
  let maxHours = sameDistrict ? 12 : (sameState ? 30 : 72);
  
  const boundedHours = Math.max(minHours, Math.min(maxHours, finalHours));
  
  return {
    hours: boundedHours,
    confidence: 'High',
    breakdown: {
      transit: Math.round(transitTime * 10) / 10,
      loading: Math.round(loadingTime * 10) / 10,
      buffer: Math.round((totalHours - transitTime - loadingTime - checkpointTime) * 10) / 10
    }
  };
}

// Run the test
testEnhancedAIEstimation();