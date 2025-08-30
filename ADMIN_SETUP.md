# Admin System Setup

## Overview
This system provides a separate administrative interface for managing user reports and system administration. Only authorized admin users can access this functionality.

## Admin Email Configuration

### 1. Configure Admin Emails
Edit `src/config/admin.ts` to add authorized admin email addresses:

```typescript
export const ADMIN_EMAILS = [
  'admin@mangrove.com',
  'administrator@mangrove.com',
  'superadmin@mangrove.com'
];
```

### 2. Add Your Admin Email
Replace the example emails with your actual admin email addresses.

## How It Works

### Admin Login Flow
1. User navigates to `/admin-login`
2. System checks if email is in `ADMIN_EMAILS` list
3. If authorized, creates admin role in database
4. Redirects to `/admin-dashboard`

### Admin Dashboard Features
- **User Reports Management**: View and manage reports from normal users only
- **AI Validation**: Automatic report validation using AI
- **Coin Rewards**: Award coins to users for approved reports
- **Statistics**: View system statistics and user counts
- **Admin-Only Access**: No regular user functionality available

### Security Features
- Email-based authorization
- Separate admin login page
- Admin role verification
- Automatic role creation for authorized emails
- Redirect protection for non-admin users

## Database Tables Required

### admin_roles
```sql
CREATE TABLE admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  verification_status TEXT DEFAULT 'approved',
  role TEXT DEFAULT 'administrator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### coins
```sql
CREATE TABLE coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### coin_transactions
```sql
CREATE TABLE coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Supabase Edge Functions

### award-coins
- Function to award coins to users
- Updates coin balance
- Logs transactions
- Handles CORS and errors

## Usage

### For Administrators
1. Navigate to `/admin-login`
2. Use your authorized admin email
3. Access admin dashboard at `/admin-dashboard`
4. Manage user reports and system

### For Developers
1. Add admin emails to `src/config/admin.ts`
2. Ensure database tables exist
3. Deploy Supabase functions
4. Test admin access

## Security Notes
- Only emails in `ADMIN_EMAILS` can access admin features
- Admin dashboard is completely separate from user dashboard
- No regular user functionality is available in admin mode
- All admin actions are logged and tracked

