const puppeteer = require('puppeteer');

async function testAdminNavigationFlow() {
  console.log('🧪 Testing Admin Navigation Flow...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless testing
      defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    // Test 1: Navigate to module selector and find admin link
    console.log('📍 Test 1: Checking admin link in module selector...');
    await page.goto('http://localhost:5173');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for admin button (it should be visible on hover)
    const adminButton = await page.$('button[title="Admin Access"]');
    if (adminButton) {
      console.log('✅ Admin access button found in module selector');
      
      // Click admin button
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're on admin login page
      const currentUrl = page.url();
      if (currentUrl.includes('admin-login')) {
        console.log('✅ Admin link redirects to admin login page');
      } else {
        console.log('❌ Admin link does not redirect to admin login page');
        console.log('Current URL:', currentUrl);
      }
    } else {
      console.log('❌ Admin access button not found in module selector');
    }
    
    // Test 2: Test admin login flow
    console.log('\n📍 Test 2: Testing admin login...');
    await page.goto('http://localhost:5173/admin-login');
    await page.waitForTimeout(2000);
    
    // Fill in admin credentials (using test admin)
    await page.type('input[type="text"]', 'ADMIN001');
    await page.type('input[type="password"]', '1234');
    
    // Click login button
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check if we're redirected to admin module selector
    const adminUrl = page.url();
    if (adminUrl.includes('/admin') && !adminUrl.includes('admin-login')) {
      console.log('✅ Admin login successful, redirected to admin panel');
      
      // Check if module selector is shown
      const moduleCards = await page.$$('.cursor-pointer');
      if (moduleCards.length > 0) {
        console.log('✅ Admin module selector is displayed');
        
        // Test 3: Test module selection
        console.log('\n📍 Test 3: Testing module selection...');
        
        // Click on farmer module
        const farmerModule = await page.$('text=Farmer Module');
        if (farmerModule) {
          await farmerModule.click();
          await page.waitForTimeout(2000);
          
          // Check if we're in farmer admin
          const farmerAdminTitle = await page.$('text=Morgen Admin');
          if (farmerAdminTitle) {
            console.log('✅ Farmer module selection works');
            
            // Test 4: Test back to modules
            console.log('\n📍 Test 4: Testing back to modules...');
            const backButton = await page.$('button[title*="back" i], button:has-text("Back")');
            if (backButton) {
              await backButton.click();
              await page.waitForTimeout(2000);
              
              // Check if we're back to module selector
              const moduleSelector = await page.$('text=Morgen Admin Portal');
              if (moduleSelector) {
                console.log('✅ Back to modules navigation works');
              } else {
                console.log('❌ Back to modules navigation failed');
              }
            } else {
              console.log('❌ Back button not found');
            }
          } else {
            console.log('❌ Farmer module selection failed');
          }
        } else {
          console.log('❌ Farmer module not found');
        }
        
        // Test 5: Test logout
        console.log('\n📍 Test 5: Testing admin logout...');
        const logoutButton = await page.$('button:has-text("Logout")');
        if (logoutButton) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
          
          // Check if we're redirected to admin login
          const logoutUrl = page.url();
          if (logoutUrl.includes('admin-login')) {
            console.log('✅ Admin logout redirects to admin login page');
          } else {
            console.log('❌ Admin logout does not redirect to admin login page');
            console.log('Current URL:', logoutUrl);
          }
        } else {
          console.log('❌ Logout button not found');
        }
        
      } else {
        console.log('❌ Admin module selector not displayed');
      }
    } else {
      console.log('❌ Admin login failed or incorrect redirect');
      console.log('Current URL:', adminUrl);
    }
    
    console.log('\n🎉 Admin Navigation Flow Test Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  console.log('📝 Note: This test requires puppeteer and a running frontend (npm run dev)');
  console.log('📝 Make sure both frontend (port 5173) and backend (port 5050) are running');
  console.log('📝 Test will open a browser window to test the navigation flow\n');
  
  // Uncomment the line below to run the test
  // testAdminNavigationFlow();
  
  console.log('💡 To run this test, uncomment the last line in the script');
  
} catch (error) {
  console.log('📝 Manual Testing Guide for Admin Navigation:');
  console.log('');
  console.log('1. 🌐 Go to http://localhost:5173');
  console.log('2. 👀 Look for a subtle "Admin" button in the top-right (visible on hover)');
  console.log('3. 🖱️  Click the Admin button');
  console.log('4. ✅ Should redirect to /admin-login');
  console.log('5. 🔐 Login with admin credentials (ADMIN001 / 1234)');
  console.log('6. ✅ Should redirect to /admin and show module selector');
  console.log('7. 🖱️  Click on any module (Farmer, Buyer, Driver)');
  console.log('8. ✅ Should enter the selected admin module');
  console.log('9. ⬅️  Click "Back to Modules" button');
  console.log('10. ✅ Should return to admin module selector');
  console.log('11. 🚪 Click "Logout" button');
  console.log('12. ✅ Should redirect back to /admin-login');
  console.log('');
  console.log('🎯 All steps should work without redirecting to module selector');
}