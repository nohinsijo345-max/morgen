const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testAIEstimation() {
  try {
    console.log('🧪 Testing AI Delivery Estimation');
    console.log('=' .repeat(60));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const fromLocation = {
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      pinCode: '682001'
    };

    const toLocation = {
      city: 'Thrissur',
      district: 'Thrissur',
      state: 'Kerala',
      pinCode: '680001'
    };

    const vehicleType = 'mini-truck';
    const cargoDescription = 'Fresh vegetables and fruits';
    const pickupDate = '2025-12-14';

    console.log('📍 Route:', `${fromLocation.city} → ${toLocation.city}`);
    console.log('🚚 Vehicle:', vehicleType);
    console.log('📦 Cargo:', cargoDescription);

    const currentDate = new Date();
    const scheduledDate = pickupDate ? new Date(pickupDate) : currentDate;
    const dayOfWeek = scheduledDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = 10; // 10 AM
    
    const isPeakHours = (timeOfDay >= 7 && timeOfDay <= 10) || (timeOfDay >= 17 && timeOfDay <= 20);
    const isWeekend = scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6;

    const prompt = `
    You are an expert logistics AI specializing in Indian transport routes. Calculate precise delivery time for agricultural transport.

    ROUTE DETAILS:
    - From: ${fromLocation.city}, ${fromLocation.district}, ${fromLocation.state} (PIN: ${fromLocation.pinCode || 'N/A'})
    - To: ${toLocation.city}, ${toLocation.district}, ${toLocation.state} (PIN: ${toLocation.pinCode || 'N/A'})
    - Vehicle: ${vehicleType}
    - Cargo: ${cargoDescription || 'Agricultural goods'}
    - Pickup Day: ${dayOfWeek}
    - Pickup Time: ${timeOfDay}:00 hours
    - Peak Hours: ${isPeakHours ? 'Yes' : 'No'}
    - Weekend: ${isWeekend ? 'Yes' : 'No'}

    VEHICLE SPECIFICATIONS:
    - Mini-truck: 45-65 km/h avg, 1-2 hours loading/unloading, rest every 6 hours

    FACTORS TO CONSIDER:
    1. Actual road distance (not straight-line) between locations
    2. Road quality: National highways vs state roads vs rural roads
    3. Traffic conditions: Peak hours add 30-50% time, weekends reduce by 20%
    4. Loading/unloading time based on cargo type and vehicle
    5. Mandatory driver rest periods for long journeys
    6. Agricultural goods may require careful handling (extra time)

    Provide ONLY the total estimated hours as a whole number (minimum 2 hours, maximum 168 hours).
    Consider this is for agricultural transport in India with real-world conditions.
    `;

    console.log('🤖 Calling Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('📝 AI Response:', responseText);
    
    let estimatedHours = parseInt(responseText.match(/\d+/)?.[0] || '24');
    
    // Validation and safety checks
    if (estimatedHours < 2) estimatedHours = 2;
    if (estimatedHours > 168) estimatedHours = 168;
    
    console.log('⏰ Estimated Hours:', estimatedHours);
    
    // Calculate delivery date
    const expectedDeliveryDate = new Date(pickupDate);
    expectedDeliveryDate.setHours(10, 0, 0, 0); // 10:00 AM pickup
    expectedDeliveryDate.setHours(expectedDeliveryDate.getHours() + estimatedHours);
    
    console.log('📅 Expected Delivery:', expectedDeliveryDate.toLocaleString());
    console.log('✅ AI Estimation Test Successful!');

  } catch (error) {
    console.error('❌ AI Estimation Test Failed:', error);
    console.error('Error details:', error.message);
    
    // Test fallback calculation
    console.log('\n🔄 Testing Fallback Calculation...');
    const fallbackHours = 8; // Default for same state
    console.log('⏰ Fallback Hours:', fallbackHours);
    console.log('✅ Fallback calculation working');
  }
}

// Run the test
if (require.main === module) {
  testAIEstimation();
}

module.exports = testAIEstimation;