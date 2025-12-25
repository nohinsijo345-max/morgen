#!/bin/bash

echo "🔄 Restarting Server..."
echo "📍 Current directory: $(pwd)"

# Navigate to server directory
cd server

echo "🛑 Stopping any existing server processes..."
# Kill any existing node processes on port 5050
lsof -ti:5050 | xargs kill -9 2>/dev/null || true

echo "🚀 Starting server..."
npm run dev &

# Wait a moment for server to start
sleep 3

echo "✅ Server restart initiated"
echo "📋 Check server logs above for:"
echo "   - ✅ Connections route loaded successfully"
echo "   - 🌐 Server running on port 5050"

# Test server connectivity
echo "🧪 Testing server connectivity..."
curl -s http://localhost:5050/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is responding"
else
    echo "⚠️  Server may still be starting..."
fi