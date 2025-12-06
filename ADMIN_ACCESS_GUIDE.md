# Admin Panel Access Guide

## How to Access Admin Panel

The admin panel is accessible at: **http://localhost:5173/admin**

### Admin Login Credentials

To access the admin panel, you need to:

1. **Create an admin user** in the database with `role: 'admin'`
2. **Login with admin credentials** at the login page

### Creating an Admin User

Run this script to create an admin user:

```bash
cd server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hashedPin = await bcrypt.hash('1234', 10);
  const admin = new User({
    name: 'Admin',
    role: 'admin',
    farmerId: 'ADMIN001',
    pin: hashedPin,
    phone: '9999999999',
    email: 'admin@morgen.com',
    district: 'Admin'
  });
  await admin.save();
  console.log('✅ Admin user created: ADMIN001 / PIN: 1234');
  mongoose.connection.close();
})();
"
```

### Admin Login

1. Go to: **http://localhost:5173/login**
2. Enter:
   - **Farmer ID**: ADMIN001
   - **PIN**: 1234
3. You'll be redirected to: **http://localhost:5173/admin**

## Admin Panel Features

- **Dashboard**: View statistics (total users, farmers, buyers, admins)
- **User Management**: View, search, and delete users
- **Image Settings**: Update login page background image
- **Send Updates**: Send notifications to all users

## Direct Access

If you're already logged in as a farmer, logout first, then login with admin credentials.

Or manually navigate to: **http://localhost:5173/admin** (will redirect to login if not authenticated as admin)
