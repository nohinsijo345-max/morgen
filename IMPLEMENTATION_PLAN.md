# 🚀 Comprehensive Implementation Plan

## Phase 1: Critical Fixes (PRIORITY)

### A. Login/Register Page Fixes
- [x] Copy logo to public folder
- [ ] Add logo to Login page (top left)
- [ ] Add logo to Register page (top left)
- [ ] Add "Create Account" title on register page
- [ ] Add subtitle "Fill in your details to get started"
- [ ] Fix login button disabled state after registration redirect
- [ ] Add scroll-to-top on registration error
- [ ] Add government subsidy checkbox to registration

### B. Farmer Dashboard Fixes
- [ ] Fetch and display actual farmer email in header
- [ ] Reduce Account/Customers button size
- [ ] Make all animations more subtle
- [ ] Enhance Weather card with animated illustrations
- [ ] Reposition weather icon (top right)
- [ ] Reposition temperature (left aligned below icon)

## Phase 2: Admin Panel (COMPREHENSIVE)

### A. Admin Layout
- [ ] Create Admin Dashboard layout
- [ ] Add header with logo (top left) and logout (top right)
- [ ] Create sidebar navigation
- [ ] Implement card-based UI

### B. Sidebar Options
1. **Dashboard** (default)
   - Most commonly used features
   - Quick stats
   - Recent activities

2. **Login** (Image Management)
   - User Login Page Image (right side)
   - User Register Page Image (left side)
   - User Forgot Password Image
   - Image picker from Assets folder

3. **Farmer Dashboard** (Settings)
   - Edit dashboard components
   - Manage features

4. **Users** (User Management)
   - **Farmers Section**
     - List all farmers
     - Columns: Username, Phone, Email, Registered Date, Last Login, Actions
     - Yellow dot for subsidy users
     - Delete button with confirmation
     - Send Update button (opens popup)
   - **Public Section** (future)
   - **Gov Section** (future)

### C. Backend Requirements
- [ ] Track last login time
- [ ] Store subsidy status
- [ ] Admin updates system
- [ ] Image upload/selection API
- [ ] User deletion API

## Phase 3: Forgot Password

### A. Forgot Password Page
- [ ] Create ForgotPassword.jsx
- [ ] Add logo (top left)
- [ ] Add right-side image (editable from admin)
- [ ] Form fields:
  - Farmer ID
  - Phone Number
  - Email
  - Username
- [ ] Verify all fields match DB
- [ ] New password input (2x)
- [ ] Password match validation
- [ ] Link to "Sign In"
- [ ] "Need more help?" popup with help@morgen.com

### B. Backend
- [ ] Password reset verification endpoint
- [ ] Password update endpoint

## Phase 4: Backend Enhancements

### A. User Model Updates
```javascript
{
  lastLogin: Date,
  subsidyStatus: Boolean,
  subsidyApprovedBy: String,
  subsidyApprovedDate: Date
}
```

### B. New Models
- AdminUpdate model
- ImageSettings model

### C. New API Endpoints
- POST /api/admin/send-update
- GET /api/admin/users
- DELETE /api/admin/users/:id
- POST /api/admin/upload-image
- GET /api/admin/images
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/track-login

## Design System

### Colors
- Background: `#fbfbef`
- Text: `#082829`
- Primary: Emerald 500 → Teal 600
- Accent: Use family colors as needed

### Animations
- Subtle
- Clean
- Minimal
- Smooth transitions

### UI Components
- Cards with glassmorphism
- Rounded corners
- Soft shadows
- Consistent spacing

## Implementation Order

1. ✅ Logo setup
2. 🔄 Login/Register fixes (CURRENT)
3. ⏳ Dashboard fixes
4. ⏳ Admin Panel structure
5. ⏳ Admin User Management
6. ⏳ Forgot Password
7. ⏳ Backend integration
8. ⏳ Testing & refinement

---

**Status**: Starting Phase 1A - Login/Register Fixes
