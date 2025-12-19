# Module Selector Access Guide 🚀

## How to Access the Module Selector

### 🌐 **Direct URL Access**
- **Main URL**: `http://localhost:5173/` (development) or your deployed URL
- **Always Available**: The module selector is now the default landing page

### 🔒 **Security Features Implemented**

#### **1. Protected Routes**
All internal pages now redirect to the module selector if accessed directly without authentication:

**Farmer Routes** (require farmer login):
- `/dashboard` → Redirects to `/` (module selector)
- `/weather` → Redirects to `/` 
- `/harvest-countdown` → Redirects to `/`
- `/price-forecast` → Redirects to `/`
- `/local-transport` → Redirects to `/`
- `/order-tracking` → Redirects to `/`
- `/ai-doctor` → Redirects to `/`
- All other farmer routes...

**Admin Routes** (require admin login):
- `/admin` → Redirects to `/`
- `/admin-login` → Available (login page)

**Driver Routes** (require driver login):
- `/driver/dashboard` → Redirects to `/`
- `/driver/orders` → Redirects to `/`
- `/driver-login` → Available (login page)

#### **2. 24-Hour Auto-Logout**
- ✅ **Automatic Session Expiry**: All user sessions expire after exactly 24 hours
- ✅ **Session Monitoring**: Background monitoring checks every minute
- ✅ **Expiry Warning**: Users get warned 1 hour before session expires
- ✅ **Session Extension**: Users can extend their session for another 24 hours
- ✅ **Auto-Redirect**: Expired sessions automatically redirect to module selector

### 📱 **How to Use**

#### **Step 1: Access Module Selector**
```
Navigate to: http://localhost:5173/
```

#### **Step 2: Choose Your Portal**
Click on any of the 5 available modules:
1. **Farmer Portal** → `/login`
2. **Buyer Portal** → `/buyer/auction` 
3. **Government Portal** → `/government/login`
4. **Public Portal** → `/public/dashboard`
5. **Driver Portal** → `/driver-login`

#### **Step 3: Login & Access**
- Each module redirects to its respective login page
- After successful login, access the full portal features
- Session automatically expires after 24 hours

### 🛡️ **Security Benefits**

#### **No Direct Access**
```bash
# These URLs now redirect to module selector:
❌ http://localhost:5173/dashboard
❌ http://localhost:5173/weather  
❌ http://localhost:5173/admin
❌ http://localhost:5173/driver/dashboard

# Only these are accessible:
✅ http://localhost:5173/ (module selector)
✅ http://localhost:5173/login (after choosing farmer)
✅ http://localhost:5173/admin-login (after choosing admin)
✅ http://localhost:5173/driver-login (after choosing driver)
```

#### **Session Management**
- **Secure Storage**: Sessions stored with expiry timestamps
- **Auto-Cleanup**: Expired sessions automatically cleared
- **Cross-Tab Sync**: Session state synchronized across browser tabs
- **Memory Efficient**: Old session data automatically purged

### 🎨 **User Experience**

#### **Smooth Redirections**
- **Unauthorized Access**: Seamlessly redirected to module selector
- **Expired Sessions**: Graceful logout with notification
- **Login Success**: Direct access to intended destination
- **Logout**: Clean return to module selector

#### **Visual Feedback**
- **Session Warnings**: Beautiful modal with countdown timer
- **Loading States**: Smooth transitions between pages
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all device sizes

### 🔧 **Development Access**

#### **Start the Application**
```bash
# Backend (Terminal 1)
cd server
npm start

# Frontend (Terminal 2) 
cd client
npm run dev
```

#### **Access Points**
```
Module Selector: http://localhost:5173/
Backend API: http://localhost:5050/api/
```

#### **Test Session Management**
```bash
# Run session tests
cd server
node scripts/testModuleSystem.js
```

### 📊 **Analytics Tracking**

The system now tracks:
- **Module Access**: Which portals users choose
- **Usage Patterns**: Popular modules and access times
- **Session Duration**: How long users stay logged in
- **Redirect Sources**: Where users come from

### 🚀 **Production Deployment**

#### **Environment Variables**
```env
# Frontend (.env)
VITE_API_URL=https://your-api-domain.com

# Backend (.env)
NODE_ENV=production
PORT=5050
```

#### **Security Checklist**
- ✅ All routes protected with authentication
- ✅ Session expiry implemented (24 hours)
- ✅ Automatic logout on expiry
- ✅ Secure session storage
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Error handling and logging

### 🎯 **Key Features**

#### **For Users**
- **Single Entry Point**: One beautiful landing page for all modules
- **Secure Access**: No unauthorized access to internal pages
- **Session Management**: Automatic logout for security
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Theme Support**: Light/dark mode with beautiful animations

#### **For Developers**
- **Centralized Routing**: All access controlled through one system
- **Session Utilities**: Reusable session management functions
- **Analytics Ready**: Built-in usage tracking
- **Scalable Architecture**: Easy to add new modules
- **Type Safety**: Full TypeScript support ready

### 🔄 **Migration from Old System**

#### **What Changed**
- **Old**: Direct access to `/dashboard`, `/admin`, etc.
- **New**: All access through module selector at `/`
- **Security**: 24-hour session expiry added
- **UX**: Beautiful landing page with module selection

#### **Backward Compatibility**
- **Old URLs**: Automatically redirect to module selector
- **Existing Sessions**: Migrated to new session system
- **Bookmarks**: Still work but redirect appropriately
- **API Endpoints**: Unchanged and fully compatible

The Module Selector is now your secure, beautiful gateway to the entire Morgen agricultural platform! 🌟