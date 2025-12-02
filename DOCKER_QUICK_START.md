# 🐳 Docker Quick Start

## ⚡ Fastest Way to Run Morgen

### 1. Make sure Docker Desktop is running

### 2. Run the start script:

```bash
./docker-start.sh
```

That's it! The script will:
- ✅ Build all containers
- ✅ Start MongoDB, Server, and Client
- ✅ Seed the database with test user
- ✅ Show you the URLs

### 3. Access the app:

**Frontend**: http://localhost:5173
**Backend**: http://localhost:5050

**Login**:
- Farmer ID: `FAR-1001`
- PIN: `1234`

---

## 🔧 Manual Setup

If you prefer manual control:

```bash
# Build containers
docker-compose build

# Start all services
docker-compose up -d

# Seed database
docker-compose exec server npm run seed

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## 📊 Check Status

```bash
# See running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs -f server
docker-compose logs -f client
```

---

## 🛑 Stop Everything

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 🔄 Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart server
```

---

## 🐛 Troubleshooting

### Containers won't start?

```bash
# Clean everything and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Port already in use?

```bash
# Stop local servers first
# Then run Docker

# Or change ports in docker-compose.yml
```

### Can't connect to database?

```bash
# Check MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb
```

---

## 📚 Full Documentation

See `DOCKER_GUIDE.md` for complete documentation.

---

**Ready to go!** 🚀
