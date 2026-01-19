# Bid Limit Request Testing Guide

## How to Test the Bid Limit Request Feature

### Prerequisites
1. Server must be running on port 5050
2. Client must be running on port 5173
3. You need a commercial buyer account (e.g., MGB002)

### Testing Steps

#### 1. Login as Commercial Buyer
```
1. Go to http://localhost:5173/buyer-login
2. Login with a commercial buyer account:
   - Buyer ID: MGB002
   - PIN: 1234 (or your PIN)
```

#### 2. Navigate to Account Centre
```
1. Click on your profile or navigate to Account Centre
2. Scroll down to "Bid Limit Management" section
3. You should see your current bid limit displayed
```

#### 3. Submit a Bid Limit Request
```
1. Click "Request Bid Limit Increase" button
2. Enter a new bid limit (must be greater than current)
   Example: If current is ₹10,000, enter ₹50,000
3. Enter a reason (minimum 10 characters)
   Example: "Need higher limit for bulk purchases of wheat and rice"
4. Click "Submit Request"
5. You should see a success message
```

#### 4. Check Console Logs
```
Open browser console (F12) and you should see:
📊 Submitting bid limit request: { buyerId, requestedLimit, currentLimit, reason }
✅ Bid limit request submitted successfully: { message, request }
```

#### 5. Check Server Logs
```
In your server terminal, you should see:
📊 Bid Limit Increase Request:
   Buyer: Nohin Sijo (MGB002)
   Current Limit: ₹10000
   Requested Limit: ₹50000
   Reason: Need higher limit for bulk purchases of wheat and rice
```

### Testing with Script

Run the automated test script:
```bash
node server/scripts/testBidLimitRequest.js
```

This will test:
- ✅ Valid request submission
- ✅ Invalid request (limit not greater than current)
- ✅ Invalid request (reason too short)
- ✅ Invalid request (missing fields)
- ✅ Invalid request (non-existent buyer)
- ✅ Buyer profile retrieval

### Expected Behavior

#### Success Case:
- Success message appears in green
- Form resets and collapses
- Request is logged to server console
- Response includes buyer name, limits, reason, status, and timestamp

#### Error Cases:
- "Please enter a valid bid limit amount" - if amount is 0 or negative
- "Requested limit must be greater than current limit of ₹X" - if new limit ≤ current
- "Please provide a detailed reason (at least 10 characters)" - if reason too short
- "All fields are required" - if any field is missing
- "Buyer not found" - if buyer ID doesn't exist
- "Only commercial buyers can request bid limit increases" - if buyer is public type

### Visual Indicators

#### Current Bid Limit Display:
```
┌─────────────────────────────────┐
│ Current Bid Limit:              │
│ ₹10,000                         │
└─────────────────────────────────┘
```

#### Request Form:
```
┌─────────────────────────────────┐
│ Requested Bid Limit (₹)         │
│ [50000                    ]     │
│ Must be greater than ₹10,000    │
├─────────────────────────────────┤
│ Reason for Increase             │
│ [Need higher limit for bulk...] │
│ 45/200 characters               │
├─────────────────────────────────┤
│ [Cancel] [Submit Request]       │
└─────────────────────────────────┘
```

### API Testing with curl

```bash
# Valid request
curl -X POST http://localhost:5050/api/buyer/request-bid-limit-increase \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "MGB002",
    "requestedLimit": 50000,
    "reason": "Need higher limit for bulk purchases",
    "currentLimit": 10000
  }'

# Expected response:
{
  "message": "Bid limit increase request submitted successfully",
  "request": {
    "buyerId": "MGB002",
    "buyerName": "Nohin Sijo",
    "currentLimit": 10000,
    "requestedLimit": 50000,
    "reason": "Need higher limit for bulk purchases",
    "status": "pending",
    "submittedAt": "2026-01-15T11:29:56.511Z"
  }
}
```

### Troubleshooting

#### Issue: "Bid Limit Management" section not visible
- **Solution**: Make sure you're logged in as a commercial buyer (not public)
- Check: `user?.buyerType === 'commercial'`

#### Issue: Request not submitting
- **Solution**: Check browser console for errors
- Verify server is running on port 5050
- Check network tab for API call status

#### Issue: "Buyer not found" error
- **Solution**: Verify buyer exists in database
- Check buyer ID is correct
- Ensure buyer has role: 'buyer'

#### Issue: Form validation errors
- **Solution**: 
  - Requested limit must be > current limit
  - Reason must be ≥ 10 characters
  - All fields are required

### Next Steps After Testing

Once testing is complete and working:
1. Create BidLimitRequest model for database storage
2. Build admin review panel
3. Add email notifications
4. Add request history for buyers
5. Add approval/rejection workflow

### Notes

- Currently, requests are only logged to console
- No database storage yet (future enhancement)
- No admin review panel yet (future enhancement)
- No email notifications yet (future enhancement)
- Public buyers cannot request bid limit increases
- Only commercial buyers see this feature
