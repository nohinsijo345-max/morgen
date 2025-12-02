# Docker Setup Guide for Morgen

## 📦 What's Included

This Docker setup includes:
- **MongoDB** - Database container
- **Server** - Node.js/Express backend
- **Client** - React/Vite frontend
- **Nginx** - Production web server (prod only)

## 🚀 Quick Start (Development)

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Start All Services

```bash
# Start all containers
docker-compose up

# Or run in background
docker-compose up -d
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5050
- **MongoDB**: localhost:27017

### Stop All Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 🏗️ Development Workflow

### Build Containers

```bash
# Build all containers
docker-compose build

# Build specific service
docker-compose build server
docker-compose build client
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### Execute Commands in Containers

```bash
# Access server container
docker-compose exec server sh

# Access client container
docker-compose exec client sh

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p morgen123
```

### Seed Database

```bash
# Run seed script
docker-compose exec server npm run seed
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart server
```

## 🏭 Production Deployment

### Build for Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up -d
```

### Production URLs
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5050
- **HTTPS**: https://localhost (port 443)

### Environment Variables

Create `.env` file in root:

```env
# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password

# Server
NODE_ENV=production
PORT=5050

# Client
VITE_API_URL=http://your-domain.com:5050
```

## 📊 Container Management

### Check Container Status

```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats
```

### Remove Everything

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5173
lsof -i :5050
lsof -i :27017

# Kill process
kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild container
docker-compose build --no-cache <service-name>
docker-compose up <service-name>
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Test connection
docker-compose exec mongodb mongosh -u admin -p morgen123

# Check server logs
docker-compose logs server
```

### Clear Everything and Start Fresh

```bash
# Stop everything
docker-compose down -v

# Remove all Docker data
docker system prune -a --volumes

# Rebuild and start
docker-compose build
docker-compose up
```

## 📁 File Structure

```
morgen/
├── docker-compose.yml           # Development setup
├── docker-compose.prod.yml      # Production setup
├── Dockerfile.client            # Client dev image
├── Dockerfile.server            # Server dev image
├── Dockerfile.client.prod       # Client prod image
├── Dockerfile.server.prod       # Server prod image
├── nginx.conf                   # Nginx configuration
├── .dockerignore               # Docker ignore rules
└── DOCKER_GUIDE.md             # This file
```

## 🎯 Common Commands

### Development

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down
```

### Production

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Database

```bash
# Backup
docker-compose exec mongodb mongodump --out /data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup

# Access shell
docker-compose exec mongodb mongosh -u admin -p morgen123
```

## 🔐 Security Notes

### Development
- Default credentials are used (admin/morgen123)
- Ports are exposed for easy access
- Hot reload enabled

### Production
- Change default passwords
- Use environment variables
- Enable HTTPS
- Restrict port access
- Use secrets management

## 📈 Performance Tips

### Optimize Build Time

```bash
# Use build cache
docker-compose build

# Parallel builds
docker-compose build --parallel
```

### Reduce Image Size

- Multi-stage builds (already implemented)
- Use Alpine Linux base images
- Remove dev dependencies in production

### Monitor Resources

```bash
# Real-time stats
docker stats

# Container inspect
docker inspect <container-name>
```

## 🚢 Deployment Platforms

### Deploy to:
- **AWS ECS** - Elastic Container Service
- **Google Cloud Run** - Serverless containers
- **Azure Container Instances** - Managed containers
- **DigitalOcean App Platform** - PaaS
- **Heroku** - Container registry
- **Railway** - Docker support
- **Render** - Docker deployment

## 📝 Next Steps

1. ✅ Start containers: `docker-compose up`
2. ✅ Seed database: `docker-compose exec server npm run seed`
3. ✅ Access app: http://localhost:5173
4. ✅ Login: FAR-1001 / 1234
5. ✅ Test features

## 🆘 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify containers: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Clean rebuild: `docker-compose down -v && docker-compose up --build`

---

**Docker setup complete!** 🐳
