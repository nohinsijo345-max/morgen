# Farmer Module Translation Implementation Guide

## Overview
This guide provides the complete implementation for adding translation support to ALL farmer module pages.

## Translation System Setup ✅
- ✅ LanguageContext created at `client/src/context/LanguageContext.jsx`
- ✅ useTranslation hook created at `client/src/hooks/useTranslation.js`
- ✅ Translations file with 166 keys at `client/src/data/translations.js`
- ✅ Language selector component available

## Translation Keys Available (166 total)
All keys are available in 6 languages: English, Hindi, Tamil, Telugu, Malayalam, Kannada

### Navigation & Dashboard
- dashboard, welcome, totalCrops, activeBids, totalSales, revenue
- sellCrops, myBids, createBid, orders, transport, localTransport
- weather, priceForecast, aiDoctor, harvestCountdown, myCustomers
- customerSupport, accountCentre, logout, orderTracking, orderHistory
- bidHistory, transportBooking, vehicleDetails, back, home

### Common Actions
- save, cancel, submit, delete, edit, view, search, filter
- loading, noData, add, manage, create, update, refresh
- close, confirm, tryAgain

### Crop & Bidding
- cropName, quantity, quality, price, pricePerUnit, harvestDate
- expiryDate, category, unit, description
- startingPrice, currentPrice, bidEndDate, placeBid, bidAmount
- totalBids, highestBid, createNewBid, endBid, bidDetails
- noBidsYet, createFirstBid, manageBidListings, listCropForBidding
- bidCreatedSuccessfully, buyersWillBeNotified, endBidEarly
- areYouSureEndBid, highestBidderWins, noBidsNoWinner

### Status & Messages
- active, pending, completed, cancelled, delivered, approved
- rejected, inProgress, success, error, warning, info

### Forms & Labels
- required, optional, vegetables, fruits, grains, spices, other
- premium, gradeA, gradeB, gradeC, standard
- kilograms, quintal, ton

### Transport
- vehicle, driver, booking, route, distance, duration
- bookTransport, viewVehicles, bookingHistory, trackBooking
- vehicleType, capacity, availability, bookNow

### Orders
- orderDetails, trackOrder, orderStatus, orderId, orderDate
- deliveryDate, buyer, seller, totalAmount, paymentStatus
- noOrdersYet, viewAllOrders

### Customer Support
- supportTickets, createTicket, ticketId, subject, message
- sendMessage, chatWithSupport

### AI Plant Doctor
- askDoctor, plantHealth, diagnosis, treatment
- uploadImage, analyzeImage

### Harvest & Pricing
- daysUntilHarvest, readyToHarvest, upcomingHarvests
- forecastedPrice, marketTrends, priceAnalysis

### Validation
- fieldRequired, invalidEmail, invalidPhone, invalidDate
- dateMustBeFuture, quantityMustBePositive, priceMustBePositive

## Implementation Pattern

### Step 1: Add Import
```javascript
import { useTranslation } from '../../hooks/useTranslation';
// or for root pages:
import { useTranslation } from '../hooks/useTranslation';
```

### Step 2: Add Hook
```javascript
const ComponentName = () => {
  const { t } = useTranslation();
  // ... rest of component
```

### Step 3: Replace Text
```javascript
// Before:
<h1>Sell Crops</h1>

// After:
<h1>{t('sellCrops')}</h1>
```

## Pages Status

### ✅ Partially Updated
1. **FarmerDashboard.jsx** - Has some translations
2. **SellCrops.jsx** - Started updating (in progress)

### 🔄 Need Full Translation
3. CreateBid.jsx
4. MyBids.jsx
5. Orders.jsx
6. BidHistory.jsx
7. LocalTransport.jsx
8. TransportBooking.jsx
9. VehicleDetails.jsx
10. OrderTracking.jsx
11. OrderHistory.jsx
12. MyCustomers.jsx
13. CustomerSupport.jsx
14. AIPlantDoctor.jsx
15. HarvestCountdown.jsx
16. PriceForecast.jsx

## Quick Reference: Common Replacements

```javascript
// Titles
"Sell Crops" → {t('sellCrops')}
"My Bids" → {t('myBids')}
"Create Bid" → {t('createBid')}
"Orders" → {t('orders')}
"Transport" → {t('transport')}

// Buttons
"Add Listing" → {t('addListing')}
"Create" → {t('create')}
"Save" → {t('save')}
"Cancel" → {t('cancel')}
"Submit" → {t('submit')}
"Delete" → {t('delete')}
"Edit" → {t('edit')}

// Form Labels
"Crop Name" → {t('cropName')}
"Quantity" → {t('quantity')}
"Quality" → {t('quality')}
"Price" → {t('price')}
"Harvest Date" → {t('harvestDate')}

// Messages
"Loading..." → {t('loading')}
"No data available" → {t('noData')}
"Success" → {t('success')}
"Error" → {t('error')}

// Status
"Active" → {t('active')}
"Pending" → {t('pending')}
"Completed" → {t('completed')}
"Cancelled" → {t('cancelled')}
```

## Testing
1. Open any farmer page
2. Use the language selector in the header
3. Switch between languages (EN, HI, TA, TE, ML, KN)
4. Verify all text changes to the selected language

## Next Steps
1. Complete SellCrops.jsx translation
2. Update CreateBid.jsx
3. Update MyBids.jsx
4. Continue with remaining pages in priority order
5. Test each page after translation

## Notes
- All translation keys are already defined in translations.js
- The system supports 6 languages out of the box
- Language preference is saved in localStorage
- Fallback to English if translation key is missing
