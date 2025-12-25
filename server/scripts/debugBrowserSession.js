// This script helps debug browser session issues
// Run this in the browser console to check session state

console.log('🔍 Debugging Browser Session State...');

// Check all possible session keys
const sessionKeys = ['farmerUser', 'buyerUser', 'adminUser', 'driverUser'];

console.log('\n📋 LocalStorage Sessions:');
sessionKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`✅ ${key}:`, {
        user: parsed.user?.name || 'Unknown',
        userId: parsed.user?.farmerId || parsed.user?.buyerId || 'Unknown',
        expiresAt: new Date(parsed.expiresAt),
        isExpired: Date.now() > parsed.expiresAt
      });
    } catch (e) {
      console.log(`❌ ${key}: Invalid JSON`);
    }
  } else {
    console.log(`⚠️ ${key}: Not found`);
  }
});

console.log('\n📋 SessionStorage Sessions:');
sessionKeys.forEach(key => {
  const data = sessionStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`✅ ${key}:`, {
        user: parsed.user?.name || 'Unknown',
        userId: parsed.user?.farmerId || parsed.user?.buyerId || 'Unknown',
        expiresAt: new Date(parsed.expiresAt),
        isExpired: Date.now() > parsed.expiresAt
      });
    } catch (e) {
      console.log(`❌ ${key}: Invalid JSON`);
    }
  } else {
    console.log(`⚠️ ${key}: Not found`);
  }
});

// Test UserSession utility
console.log('\n🔧 Testing UserSession Utility:');
if (window.UserSession) {
  console.log('Buyer session:', window.UserSession.getCurrentUser('buyer'));
  console.log('Farmer session:', window.UserSession.getCurrentUser('farmer'));
} else {
  console.log('UserSession utility not available in window');
}

console.log('\n💡 To fix session issues:');
console.log('1. Make sure you logged in properly');
console.log('2. Check if session expired');
console.log('3. Try refreshing the page');
console.log('4. Clear storage and login again');

// Instructions for manual session creation (for testing)
console.log('\n🛠️ Manual Session Creation (for testing):');
console.log(`
// Create a test buyer session:
const testBuyerSession = {
  user: {
    name: 'Test Buyer',
    buyerId: 'MGB002',
    role: 'buyer',
    email: 'test@example.com'
  },
  loginTime: Date.now(),
  expiresAt: Date.now() + (24 * 60 * 60 * 1000)
};
localStorage.setItem('buyerUser', JSON.stringify(testBuyerSession));
sessionStorage.setItem('buyerUser', JSON.stringify(testBuyerSession));
console.log('Test buyer session created!');
`);