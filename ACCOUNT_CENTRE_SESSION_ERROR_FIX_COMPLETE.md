# Account Centre Session Error Fix - COMPLETE ✅

## Issue Summary
The Account Centre page was hardcoded to only work with farmer sessions, causing errors when buyers tried to access their profile settings.

## Root Cause Analysis
1. **AccountCentre.jsx** was only checking for farmer sessions (`UserSession.getCurrentUser('farmer')`)
2. **Backend routes** had farmer-specific endpoints that didn't support buyer IDs
3. **Route conflicts** between farmer-specific and generic profile endpoints
4. **Duplicate route definitions** in `server/routes/auth.js`

## Solution Implemented

### 1. Frontend Changes (`client/src/pages/AccountCentre.jsx`)
- ✅ Updated to support both buyer and farmer sessions
- ✅ Added logic to check both `UserSession.getCurrentUser('buyer')` and `UserSession.getCurrentUser('farmer')`
- ✅ Dynamic dashboard URL routing based on user type
- ✅ Conditional crop types display (only for farmers)
- ✅ Generic API calls that work for both user types

### 2. Backend Route Fixes (`server/routes/auth.js`)
- ✅ **Replaced farmer-specific routes with generic ones**:
  - `GET /profile/:farmerId` → `GET /profile/:userId` (supports both MGB* and MGN* IDs)
  - `PUT /profile/:farmerId` → `PUT /profile/:userId` (supports both user types)
  - `POST /change-password` → Updated to accept both `farmerId` and `buyerId`
- ✅ **Removed duplicate route definitions** (lines 705+ were duplicates)
- ✅ **Fixed route logic** to detect user type based on ID format:
  - IDs starting with `MGB` → Buyer lookup
  - Other IDs → Farmer lookup

### 3. Profile Route Updates (`server/routes/profile.js`)
- ✅ Updated to support both buyer and farmer sessions
- ✅ Generic user lookup based on ID format
- ✅ Proper error handling for both user types

## Technical Details

### Route Resolution Logic
```javascript
// Determine user type based on ID format
if (userId.startsWith('MGB')) {
  // Buyer ID format (MGB001, MGB002, etc.)
  user = await User.findOne({ buyerId: userId });
} else {
  // Farmer ID format (MGN001, FAR-123, etc.)
  user = await User.findOne({ farmerId: userId });
}
```

### Session Management
```javascript
// Check both buyer and farmer sessions
let userData = UserSession.getCurrentUser('buyer');
let userId = userData?.buyerId;
let userType = 'buyer';

if (!userData) {
  userData = UserSession.getCurrentUser('farmer');
  userId = userData?.farmerId;
  userType = 'farmer';
}
```

## Testing Results

### Backend API Tests ✅
- ✅ Buyer profile fetch: `GET /api/auth/profile/MGB002`
- ✅ Buyer profile update: `PUT /api/auth/profile/MGB002`
- ✅ Buyer password change: `POST /api/auth/change-password`
- ✅ Pending request check: `GET /api/profile/pending-request/MGB002`
- ✅ Buyer login: `POST /api/auth/buyer/login`

### Frontend Integration ✅
- ✅ Account Centre loads for both buyers and farmers
- ✅ Profile data displays correctly
- ✅ Instant updates (email/phone) work
- ✅ Approval requests work
- ✅ Password change functionality works
- ✅ Proper dashboard navigation

## User Experience Improvements

### For Buyers
- ✅ Can now access Account Centre without errors
- ✅ Can update email and phone instantly
- ✅ Can request approval for profile changes
- ✅ Can change their PIN/password
- ✅ Proper navigation back to buyer dashboard

### For Farmers
- ✅ All existing functionality preserved
- ✅ No breaking changes to farmer workflows
- ✅ Crop types management still available
- ✅ Same approval process for profile changes

## Files Modified

### Frontend
- `client/src/pages/AccountCentre.jsx` - Updated for dual user type support

### Backend
- `server/routes/auth.js` - Fixed route conflicts and added generic endpoints
- `server/routes/profile.js` - Updated for dual user type support

### Test Scripts
- `server/scripts/testAccountCentreFlow.js` - Comprehensive flow testing
- `server/scripts/debugProfileEndpoint.js` - Route debugging
- `server/scripts/testRoutes.js` - Route validation

## Verification Steps

1. **Login as Buyer** (MGB002 with PIN 1234)
2. **Navigate to Account Centre** from buyer dashboard
3. **Verify profile data loads** correctly
4. **Test instant updates** (email/phone)
5. **Test approval requests** (name, location, etc.)
6. **Test password change** functionality
7. **Verify navigation** back to buyer dashboard

## Status: COMPLETE ✅

The Account Centre session error has been completely resolved. Both buyers and farmers can now access and use all Account Centre functionality without any session-related errors.

### Next Steps
- Monitor for any edge cases in production
- Consider adding user type indicators in the UI
- Potential future enhancement: Role-specific Account Centre layouts

---
**Fix completed on:** December 25, 2025  
**Tested with:** Buyer MGB002 and existing farmer accounts  
**Status:** Production Ready ✅