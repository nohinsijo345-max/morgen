#!/bin/bash

echo "🔄 Restarting Client..."
echo "📍 Current directory: $(pwd)"

# Navigate to client directory
cd client

echo "🛑 Stopping any existing client processes..."
# Kill any existing processes on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "🚀 Starting client..."
npm run dev &

# Wait a moment for client to start
sleep 3

echo "✅ Client restart initiated"
echo "📋 Client should be available at:"
echo "   🌐 http://localhost:5173"

# Test client connectivity
echo "🧪 Testing client connectivity..."
curl -s http://localhost:5173 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Client is responding"
else
    echo "⚠️  Client may still be starting..."
fi