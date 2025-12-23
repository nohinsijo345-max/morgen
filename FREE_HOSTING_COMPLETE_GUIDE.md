# 🚀 Free Hosting Guide - Complete Setup

## 🎯 **HOSTING STRATEGY**
- **Frontend**: Netlify (Free tier: 100GB bandwidth, custom domain)
- **Backend**: Railway (Free tier: $5 credit monthly, 500 hours)
- **Database**: MongoDB Atlas (Free tier: 512MB storage)

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **🔧 Step 1: Prepare for Deployment**

#### **1.1 Environment Variables Setup**
```bash
# Client .env
VITE_API_URL=https://your-backend-url.railway.app

# Server .env  
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5050
GEMINI_API_KEY=your_gemini_key
WEATHER_API_KEY=your_weather_key
```

#### **1.2 Build Scripts Optimization**
```json
// package.json (client)
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}

// package.json (server)  
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

---

### **🌐 Step 2: Backend Deployment (Railway)**

#### **2.1 Railway Setup**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder as root

#### **2.2 Railway Configuration**
```bash
# railway.json (create in root)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **2.3 Environment Variables (Railway Dashboard)**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/morgenDB
PORT=5050
GEMINI_API_KEY=your_key_here
WEATHER_API_KEY=your_key_here
```

---

### **🎨 Step 3: Frontend Deployment (Netlify)**

#### **3.1 Build Configuration**
```bash
# netlify.toml (create in client folder)
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **3.2 Netlify Deployment**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Select your repository
5. Set build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

#### **3.3 Environment Variables (Netlify)**
```
VITE_API_URL=https://your-railway-backend.railway.app
```

---

### **🗄️ Step 4: Database Setup (MongoDB Atlas)**

#### **4.1 MongoDB Atlas Configuration**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Set up database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string

#### **4.2 Connection String Format**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/morgenDB?retryWrites=true&w=majority
```

---

## 🔧 **DEPLOYMENT COMMANDS**

### **Automated Deployment Script**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment process..."

# Build client
echo "📦 Building client..."
cd client
npm install
npm run build
cd ..

# Deploy to Netlify (using Netlify CLI)
echo "🌐 Deploying to Netlify..."
cd client
npx netlify deploy --prod --dir=dist
cd ..

# Deploy to Railway (using Railway CLI)
echo "🚂 Deploying to Railway..."
cd server
railway login
railway up
cd ..

echo "✅ Deployment complete!"
echo "🌐 Frontend: Check Netlify dashboard for URL"
echo "🚂 Backend: Check Railway dashboard for URL"
```

---

## 📊 **COST BREAKDOWN (FREE TIERS)**

| Service | Free Tier Limits | Cost After Limit |
|---------|------------------|------------------|
| **Netlify** | 100GB bandwidth/month | $19/month |
| **Railway** | $5 credit monthly | $0.000463/GB-hour |
| **MongoDB Atlas** | 512MB storage | $9/month (M2) |
| **Total Monthly** | **$0** | ~$28/month |

---

## 🔍 **MONITORING & MAINTENANCE**

### **Health Check Endpoints**
```javascript
// Add to server/index.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### **Performance Optimization**
```javascript
// Add compression middleware
const compression = require('compression');
app.use(compression());

// Add caching headers
app.use(express.static('uploads', {
  maxAge: '1d',
  etag: false
}));
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **CORS Errors**
```javascript
// server/index.js
const cors = require('cors');
app.use(cors({
  origin: ['https://your-netlify-domain.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

#### **Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### **Environment Variables Not Loading**
```bash
# Check Railway logs
railway logs

# Check Netlify build logs in dashboard
```

---

## 📈 **SCALING CONSIDERATIONS**

### **When to Upgrade**
- **Traffic > 100GB/month**: Upgrade Netlify
- **Backend usage > $5/month**: Consider Railway Pro
- **Database > 512MB**: Upgrade MongoDB Atlas

### **Alternative Free Options**
- **Vercel** (Frontend): 100GB bandwidth
- **Render** (Backend): 750 hours/month
- **Supabase** (Database): 500MB + 2GB bandwidth

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Railway backend deployed
- [ ] Netlify frontend deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Health checks working
- [ ] CORS configured properly
- [ ] File uploads working
- [ ] Database connections stable

---

**🎉 Your Morgen app will be live and accessible worldwide for FREE!**

**Next Steps**: Once hosting is complete, we'll build the Buyer Dashboard with the coral color palette.