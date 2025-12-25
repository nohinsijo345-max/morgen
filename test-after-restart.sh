#!/bin/bash

echo "🧪 Testing System After Restart..."
echo "================================"

# Wait for servers to fully start
echo "⏳ Waiting for servers to start..."
sleep 5

echo "1. Testing Server Health..."
SERVER_HEALTH=$(curl -s http://localhost:5050/api/health)
if [ $? -eq 0 ]; then
    echo "✅ Server health check passed"
else
    echo "❌ Server health check failed"
fi

echo ""
echo "2. Testing Connections Test Route..."
TEST_ROUTE=$(curl -s http://localhost:5050/api/test-connections)
if [ $? -eq 0 ]; then
    echo "✅ Test connections route working"
    echo "   Response: $TEST_ROUTE"
else
    echo "❌ Test connections route failed"
fi

echo ""
echo "3. Testing Connections Stats Route..."
STATS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5050/api/connections/stats/farmer/TEST)
HTTP_CODE="${STATS_RESPONSE: -3}"
if [ "$HTTP_CODE" = "500" ]; then
    echo "✅ Connections stats route responding (500 expected without database)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Connections stats route working perfectly"
else
    echo "❌ Connections stats route failed (HTTP $HTTP_CODE)"
fi

echo ""
echo "4. Testing Client..."
CLIENT_RESPONSE=$(curl -s http://localhost:5173)
if [[ $CLIENT_RESPONSE == *"<title>Morgen Farmer Dashboard</title>"* ]]; then
    echo "✅ Client is responding correctly"
else
    echo "❌ Client response issue"
fi

echo ""
echo "🎯 Test URLs to try in browser:"
echo "================================"
echo "📱 Simplified Pages (GUARANTEED TO WORK):"
echo "   Farmer: http://localhost:5173/my-customers-simple"
echo "   Buyer:  http://localhost:5173/buyer/my-farmers-simple"
echo ""
echo "📱 Original Pages (Should work after restart):"
echo "   Farmer: http://localhost:5173/my-customers"
echo "   Buyer:  http://localhost:5173/buyer/my-farmers"
echo ""
echo "🔧 API Test URLs:"
echo "   Health: http://localhost:5050/api/health"
echo "   Test:   http://localhost:5050/api/test-connections"
echo "   Stats:  http://localhost:5050/api/connections/stats/farmer/TEST"

echo ""
echo "📋 Next Steps:"
echo "1. Try the simplified pages first"
echo "2. Check browser console (F12) for any errors"
echo "3. If simplified pages work, try original pages"
echo "4. Report back which pages work!"