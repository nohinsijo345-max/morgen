# Harvest Countdown Crop Selection Fix

## Issue
Farmers couldn't select crops when creating harvest countdowns because crop changes required admin approval and weren't immediately available in the database.

## Solution
Modified the Account Centre to update `cropTypes` immediately without requiring admin approval, while other profile changes (name, location, land size) still require approval.

## Changes Made

### 1. Client Side (`client/src/pages/AccountCentre.jsx`)
- **Separated cropTypes handling**: CropTypes now update immediately via direct API call
- **Updated approval flow**: Only non-crop changes require approval request
- **Added UI indicator**: "Updates Immediately" label on Crop Types field
- **Success messages**: Different messages for crop-only vs mixed changes

### 2. Backend (`server/routes/harvest.js`)
- **Added logging**: Console logs to debug crop fetching
- **Verified endpoint**: `/api/harvest/crop-preferences/:farmerId` returns `farmer.cropTypes` array

### 3. Frontend (`client/src/pages/farmer/HarvestCountdown.jsx`)
- **Added logging**: Console logs to debug crop fetching and errors
- **Verified dropdown**: Uses `presetCrops` state populated from API

## How It Works Now

1. **Farmer updates crops in Account Centre**:
   - Selects crops from dropdown
   - Clicks "Request Approval for Changes"
   - CropTypes are updated immediately in database
   - Other changes (if any) go through approval process

2. **Farmer creates harvest countdown**:
   - Opens Harvest Countdown page
   - Clicks "New Countdown"
   - Dropdown shows their registered crops (from `cropTypes`)
   - Can immediately select and create countdown

## API Endpoints

### Update Profile (Immediate)
```
PUT /api/auth/profile/:farmerId
Body: { cropTypes: ["Rice (Paddy)", "Wheat"] }
```

### Get Crop Preferences
```
GET /api/harvest/crop-preferences/:farmerId
Returns: ["Rice (Paddy)", "Wheat"]
```

## Testing

Run the test script to verify crops are saved:
```bash
cd server
node scripts/testCropFetch.js
```

## User Flow

1. Go to Account Centre
2. Add crops (e.g., Rice, Wheat) - see "(Updates Immediately)" label
3. Click "Request Approval for Changes"
4. Crops are saved immediately
5. Go to Harvest Countdown
6. Click "New Countdown"
7. Select from registered crops in dropdown
8. Set harvest date and create countdown

## Notes

- CropTypes update immediately without approval
- Other profile fields (name, location, land size) still require approval
- This allows farmers to use harvest countdown feature without waiting for admin approval
- Backend already supported this - just needed frontend changes
