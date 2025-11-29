# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

**Server:**
```bash
cd server
cp .env.example .env
# Edit .env and add your MongoDB URI
```

**Client:**
```bash
cd client
cp .env.example .env
# Default settings should work
```

### Step 3: Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

**Terminal 3 - Seed Test User (Optional):**
```bash
cd server
npm run seed
```

## 🎯 Test Login

After seeding, use these credentials:
- **Farmer ID:** `FAR-1001`
- **PIN:** `1234`

## 📱 Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5050

## ✅ What's Fixed

- ✅ React Router with Login/Dashboard navigation
- ✅ Authentication flow with localStorage persistence
- ✅ Protected routes
- ✅ Environment variables for both client and server
- ✅ Password hashing with bcrypt
- ✅ Loading and error states
- ✅ Logout functionality
- ✅ .gitignore for sensitive files
- ✅ Axios and React Router dependencies installed
- ✅ Removed unused variables
- ✅ Complete documentation

## 🔧 Troubleshooting

**MongoDB Connection Issues:**
- Make sure your MongoDB URI is correct in `server/.env`
- Check if your IP is whitelisted in MongoDB Atlas
- The dashboard will still work with mock data even without DB

**Port Already in Use:**
- Change `PORT` in `server/.env`
- Change `VITE_API_URL` in `client/.env` accordingly

**Login Not Working:**
- Run `npm run seed` to create test user
- Or register a new user via API: `POST http://localhost:5050/api/auth/register`
