#!/bin/bash

echo "🐳 Starting Morgen with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build containers
echo "🏗️  Building containers..."
docker-compose build

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Seed database
echo ""
echo "🌱 Seeding database..."
docker-compose exec -T server npm run seed

echo ""
echo "✅ Morgen is running!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5050"
echo "   MongoDB:  localhost:27017"
echo ""
echo "🔑 Login credentials:"
echo "   Farmer ID: FAR-1001"
echo "   PIN: 1234"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
