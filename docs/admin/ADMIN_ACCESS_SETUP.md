# Admin Access Control System - Setup Guide

## Overview

The WellnessCafe OS now has a secure admin access control system using **Option A: Admin Access Key** (recommended). This provides:

- ✅ Anonymous user system for all users
- ✅ Secure admin access via secret key
- ✅ Ability to generate sub-keys for team members
- ✅ Protected admin routes
- ✅ Firestore security rules

## Master Admin Key

**Default Master Key:** `wc-admin-master-948234lkjsdf`

You can override this by setting an environment variable:
```bash
VITE_MASTER_ADMIN_KEY=ikukuW2024
```

## How It Works

### 1. Admin Access Service (`src/services/adminAccess.js`)

- `getAdminStatus()` - Checks if current user has admin access
- `getAdminKey()` - Gets stored admin key from localStorage
- `setAdminKey(key)` - Stores admin key
- `clearAdminKey()` - Removes admin key
- `promptAdminKey()` - Prompts user to enter admin key
- `generateSubKey(role)` - Generates sub-keys for team members

### 2. Access Denied Page (`src/apps/auth/AccessDeniedPage.jsx`)

Shows when non-admin users try to access admin routes:
- "Access Restricted" message
- "Enter Admin Key" button
- Returns to home option

### 3. Admin Route Protection (`src/components/AdminRoute.jsx`)

Wraps admin routes to check access before rendering:
```jsx
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminConsolePage />
    </AdminRoute>
  }
/>
```

### 4. Admin Console Management

New section in `/admin`:
- **Current Admin Key** - Show/hide current key
- **Generate Sub-Keys** - Create viewer/editor keys
- **Clear Admin Access** - Log out of admin mode

## Firestore Security Rules

Updated rules protect admin collections:

```
admin_users/{adminId} - Only admins can read/write
admin/{doc} - Only admins can read/write
```

## Usage

### First Time Setup

1. Navigate to `/admin`
2. You'll see "Access Restricted" page
3. Click "Enter Admin Key"
4. Enter: `wc-admin-master-948234lkjsdf`
5. You're now in admin mode

### Generate Sub-Keys

1. Go to `/admin`
2. Scroll to "Admin Access Management"
3. Click "Generate Viewer Key" or "Generate Editor Key"
4. Copy the generated key
5. Share with team members (they can use it the same way)

### Clear Admin Access

1. Go to `/admin`
2. Scroll to "Admin Access Management"
3. Click "Clear Admin Access"
4. You'll be logged out and redirected to home

## Protected Routes

All admin routes are protected:
- `/admin` - Main admin console
- `/admin/theme` - Theme control panel
- `/admin/templates` - Template manager
- `/admin/sessions` - Sessions admin

## Security Notes

- Admin key is stored in localStorage (client-side only)
- No server-side authentication required (for now)
- Firestore rules provide additional protection
- Sub-keys are generated but not yet validated (future enhancement)

## Future Enhancements (Option B)

To implement Firestore-based admin list:

1. Create `admin_users` collection in Firestore
2. Store admin IDs with roles
3. Update `getAdminStatus()` to check Firestore
4. Add admin management UI to add/remove admins

## Testing

1. Open app in incognito mode
2. Navigate to `/admin` - should see access denied
3. Enter admin key - should see admin console
4. Check localStorage for `wc-admin-access-key`
5. Clear admin access - should be logged out

