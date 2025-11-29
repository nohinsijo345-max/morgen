# Troubleshooting Guide

## Issue: Login Page Not Showing Glassmorphic Design

### Current Status
✅ **Server**: Running on http://localhost:5050
✅ **Client**: Running on http://localhost:5173
✅ **Code**: All glassmorphic styles are in Login.jsx

### Steps to Fix

#### 1. Clear Browser Cache (MOST IMPORTANT)
The browser is caching the old design. You MUST clear cache:

**Option A: Hard Refresh**
- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + R`

**Option B: Clear Cache via DevTools**
1. Open DevTools (F12 or Right-click → Inspect)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Use Incognito/Private Window**
1. Open a new Incognito/Private window
2. Go to http://localhost:5173
3. You should see the new design

#### 2. Check the Correct URL
Make sure you're visiting:
- ✅ **http://localhost:5173** (correct)
- ❌ **http://localhost:5174** (old port)

#### 3. Verify Tailwind is Working
Open browser DevTools (F12) → Console tab

If you see errors like:
- "Failed to load module"
- "Cannot find module"
- Tailwind class warnings

Then run:
```bash
cd client
rm -rf node_modules/.vite
npm run dev
```

#### 4. Check for JavaScript Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors

Common errors and fixes:

**Error: "motion is not defined"**
```bash
cd client
npm install framer-motion
```

**Error: "axios is not defined"**
```bash
cd client
npm install axios
```

#### 5. Verify Files Are Correct

Check if Login.jsx has the glassmorphic code:
```bash
grep "bg-gradient-to-br from-violet-600" client/src/pages/Login.jsx
```

Should return a match. If not, the file wasn't saved properly.

#### 6. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests (red)

If you see 404 errors for CSS or JS files, restart Vite:
```bash
# Stop the client (Ctrl+C in terminal)
cd client
npm run dev
```

### What You Should See

When working correctly, you should see:
- 🟣 Purple/violet gradient background
- ✨ Animated floating orbs (pink, cyan, purple)
- 💎 Frosted glass card in the center
- ⭐ Floating white particles
- 🌟 Pulsing glow around the leaf icon
- 🎨 Gradient borders on input focus
- 🎭 Smooth entrance animations

### What You're Probably Seeing (Old Design)

If you see:
- ⬜ White/gray background
- 📦 Simple white card
- 🔲 Basic inputs without effects
- ❌ No animations

Then your browser is showing cached content.

## Issue: Can't Login / Stuck on Login Page

### Possible Causes

#### 1. No Test User Created
**Solution**: Create test user
```bash
cd server
npm run seed
```

This creates:
- Farmer ID: `FAR-1001`
- PIN: `1234`

#### 2. Server Not Running
Check if server is running:
```bash
curl http://localhost:5050/api/dashboard/summary
```

Should return JSON data. If not, start server:
```bash
cd server
npm run dev
```

#### 3. MongoDB Not Connected
Check server terminal output. Should see:
```
Connected to MongoDB
Server listening on port 5050
```

If you see connection errors, check your `.env` file:
```bash
cat server/.env
```

Should have valid `MONGO_URI`.

#### 4. Wrong Credentials
Make sure you're using:
- Farmer ID: `FAR-1001` (uppercase)
- PIN: `1234`

#### 5. CORS Issues
Open browser console (F12). If you see:
```
Access to XMLHttpRequest blocked by CORS policy
```

Check that server has CORS enabled (it should be).

#### 6. API URL Mismatch
Check `client/.env`:
```bash
cat client/.env
```

Should have:
```
VITE_API_URL=http://localhost:5050
```

### Test API Manually

Open browser and visit:
```
http://localhost:5050/api/dashboard/summary
```

Should see JSON response. If not, server isn't working.

## Issue: Dashboard Not Loading After Login

### Possible Causes

#### 1. Routing Issue
Check browser URL after login. Should redirect to:
```
http://localhost:5173/dashboard
```

If it stays on `/login`, check browser console for errors.

#### 2. User Data Not Saved
Open browser DevTools → Application tab → Local Storage

Should see `user` key with JSON data.

If not, login isn't saving data properly.

#### 3. Dashboard Component Error
Check browser console for React errors.

Common fix:
```bash
cd client
npm install framer-motion lucide-react
```

## Quick Diagnostic Commands

Run these to check everything:

```bash
# Check if servers are running
lsof -i :5050  # Should show node process
lsof -i :5173  # Should show vite process

# Check if MongoDB is connected
curl http://localhost:5050/api/dashboard/summary

# Check if test user exists
# (Login with FAR-1001 / 1234)

# Restart everything fresh
cd server && npm run dev &
cd client && npm run dev
```

## Still Not Working?

### Nuclear Option: Complete Reset

```bash
# Stop all processes
pkill -f "node"
pkill -f "vite"

# Clear all caches
cd client
rm -rf node_modules/.vite
rm -rf dist

# Restart
cd ../server
npm run dev &

cd ../client
npm run dev
```

Then:
1. Open **NEW** Incognito window
2. Go to http://localhost:5173
3. Should see glassmorphic design

## Browser-Specific Issues

### Chrome/Edge
- Clear cache: `Cmd/Ctrl + Shift + Delete`
- Disable cache: DevTools → Network tab → Check "Disable cache"

### Firefox
- Clear cache: `Cmd/Ctrl + Shift + Delete`
- Disable cache: DevTools → Network tab → Check "Disable HTTP Cache"

### Safari
- Clear cache: Safari → Clear History
- Disable cache: Develop → Disable Caches

## Contact for Help

If none of this works, provide:
1. Screenshot of what you see
2. Browser console errors (F12 → Console)
3. Network tab errors (F12 → Network)
4. Server terminal output
5. Client terminal output

---

**Most Common Fix**: Clear browser cache or use Incognito window!
