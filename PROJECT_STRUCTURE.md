# Project Structure - Frontend & Backend Separation

## ✅ Yes, Frontend and Backend are Completely Separate!

Your project follows a **monorepo structure** with clear separation:

```
morgen/
├── client/              ← FRONTEND (React + Vite)
│   ├── src/
│   │   ├── pages/       ← React pages
│   │   ├── components/  ← React components
│   │   ├── services/    ← API calls
│   │   ├── App.jsx      ← Main app
│   │   └── main.jsx     ← Entry point
│   ├── public/          ← Static assets
│   ├── package.json     ← Frontend dependencies
│   ├── vite.config.js   ← Vite configuration
│   └── tailwind.config.js ← Styling
│
├── server/              ← BACKEND (Node.js + Express)
│   ├── models/          ← Database models
│   ├── routes/          ← API endpoints
│   ├── scripts/         ← Utility scripts
│   ├── index.js         ← Server entry point
│   └── package.json     ← Backend dependencies
│
└── docker-compose.yml   ← Orchestrates both
```

## 📊 Separation Details

### 🎨 Frontend (Client)

**Location**: `./client/`

**Technology Stack**:
- React 18
- Vite (build tool)
- TailwindCSS
- Framer Motion
- React Router
- Axios

**Port**: 5173

**Package.json**: `client/package.json`

**Dependencies** (separate from backend):
```json
{
  "react": "^18.3.1",
  "vite": "^5.4.8",
  "tailwindcss": "^3.4.14",
  "framer-motion": "^11.0.0",
  "axios": "^1.6.0",
  "react-router-dom": "^6.20.0"
}
```

**Files**:
- 15+ React components
- 5+ pages
- API service layer
- Styling configurations

### 🔧 Backend (Server)

**Location**: `./server/`

**Technology Stack**:
- Node.js
- Express
- MongoDB + Mongoose
- bcryptjs
- Socket.io

**Port**: 5050

**Package.json**: `server/package.json`

**Dependencies** (separate from frontend):
```json
{
  "express": "^4.19.2",
  "mongoose": "^8.6.0",
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "socket.io": "^4.7.2"
}
```

**Files**:
- 6 database models
- 7 API route files
- Server configuration
- Seed scripts

## 🔗 How They Connect

### Development Mode

**Frontend** (port 5173) → **Backend** (port 5050)

```javascript
// client/src/services/api.js
const API_URL = 'http://localhost:5050';
```

Frontend makes HTTP requests to backend API.

### Docker Mode

**Frontend Container** → **Backend Container** → **MongoDB Container**

```yaml
# docker-compose.yml
services:
  client:    # Port 5173
  server:    # Port 5050
  mongodb:   # Port 27017
```

All containers communicate via Docker network.

### Production Mode

**Nginx** (serves frontend) → **Backend API** (port 5050)

```nginx
# nginx.conf
location /api {
    proxy_pass http://server:5050;
}
```

Nginx serves static frontend files and proxies API requests.

## 📦 Separate Deployments

You can deploy them **independently**:

### Frontend Only
```bash
cd client
npm install
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

### Backend Only
```bash
cd server
npm install
npm start
# Deploy to Heroku, Railway, AWS, etc.
```

### Both Together (Docker)
```bash
docker-compose up
# Deploys both as containers
```

## 🎯 Benefits of Separation

1. ✅ **Independent Development**
   - Frontend team works in `client/`
   - Backend team works in `server/`
   - No conflicts

2. ✅ **Separate Dependencies**
   - Frontend: React, Vite, TailwindCSS
   - Backend: Express, MongoDB, Socket.io
   - No mixing

3. ✅ **Independent Deployment**
   - Deploy frontend to Vercel
   - Deploy backend to Railway
   - Scale independently

4. ✅ **Technology Flexibility**
   - Can replace React with Vue/Angular
   - Can replace Express with NestJS
   - Without affecting the other

5. ✅ **Clear API Contract**
   - Frontend calls `/api/*` endpoints
   - Backend provides REST API
   - Well-defined interface

## 📁 File Count

### Frontend (Client)
- **Total Files**: ~30 files
- **React Components**: 10+
- **Pages**: 5
- **Services**: 1
- **Config Files**: 5

### Backend (Server)
- **Total Files**: ~20 files
- **Models**: 6
- **Routes**: 7
- **Scripts**: 1
- **Config Files**: 2

### Shared
- **Docker Files**: 9
- **Documentation**: 15+

## 🚀 Running Separately

### Run Frontend Only
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

### Run Backend Only
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:5050
```

### Run Both (Docker)
```bash
docker-compose up
# Runs both + MongoDB
```

## 🔍 Key Indicators of Separation

1. ✅ **Separate package.json files**
   - `client/package.json`
   - `server/package.json`

2. ✅ **Separate node_modules**
   - `client/node_modules/`
   - `server/node_modules/`

3. ✅ **Separate Dockerfiles**
   - `Dockerfile.client`
   - `Dockerfile.server`

4. ✅ **Different ports**
   - Client: 5173
   - Server: 5050

5. ✅ **Different technologies**
   - Client: React + Vite
   - Server: Express + MongoDB

## 📊 Communication Flow

```
User Browser
    ↓
Frontend (React)
Port 5173
    ↓ HTTP Requests
Backend (Express)
Port 5050
    ↓ Database Queries
MongoDB
Port 27017
```

## ✅ Conclusion

**Yes, your frontend and backend are completely separate!**

- ✅ Different folders
- ✅ Different dependencies
- ✅ Different technologies
- ✅ Different ports
- ✅ Can be deployed independently
- ✅ Connected via API calls

This is a **best practice** architecture for modern web applications!
