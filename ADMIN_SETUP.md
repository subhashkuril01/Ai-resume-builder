# Admin Panel Documentation

## Overview
The Admin Panel is a secure, role-based access control (RBAC) system that allows project owners to manage users, resumes, and track AI usage. Only users with `admin` role can access the admin features.

## Features Implemented

### 1. **Role-Based Access Control (RBAC)**
- **User Roles**: `user` (default) and `admin`
- **Database Schema**: Updated `User` model with:
  - `role`: 'user' | 'admin' (default: 'user')
  - `status`: 'active' | 'blocked' (default: 'active')

### 2. **Backend Security**
- **Middleware**: `isAdmin` middleware in `backend/middleware/auth.js`
- **Protection**: All admin routes require:
  1. Valid JWT token via `protect` middleware
  2. Admin role via `isAdmin` middleware
  3. Returns `403 Unauthorized` for non-admin users
  4. Returns `401 Unauthorized` if blocked

### 3. **Admin Routes** (`/api/admin/*`)
```
GET    /api/admin/dashboard           - Dashboard stats
GET    /api/admin/users               - List all users
PATCH  /api/admin/users/:id/status   - Block/Unblock user
PATCH  /api/admin/users/:id/role     - Promote user to admin
DELETE /api/admin/users/:id          - Delete user (and their resumes)

GET    /api/admin/resumes            - List all resumes
DELETE /api/admin/resumes/:id        - Delete resume

GET    /api/admin/analytics          - AI usage analytics
POST   /api/admin/usage-log          - Log AI usage (internal)
```

### 4. **Frontend Admin Pages**
- `/admin` - Dashboard with stats and recent activities
- `/admin/users` - User management (search, filter, block/unblock, promote)
- `/admin/resumes` - Resume management (search, delete)
- `/admin/analytics` - AI usage analytics and trends

### 5. **Database Models**

#### AdminUsageLog Schema
```javascript
{
  userId: ObjectId,
  requestType: 'analyzer' | 'job-match' | 'resume-test' | 'other',
  tokensUsed: Number,
  costEstimate: Number,
  status: 'success' | 'failed' | 'quota-exceeded',
  metadata: { endpoint, method, responseTime },
  createdAt: Date
}
```

## Setup Instructions

### 1. **Promote User to Admin (First Time)**

You need to manually promote the first user to admin via MongoDB:

```bash
# Connect to MongoDB
mongo

# Switch to your database
use your_database_name

# Find your user
db.users.findOne({ email: 'your@email.com' })

# Promote to admin
db.users.updateOne(
  { email: 'your@email.com' },
  { $set: { role: 'admin' } }
)

# Verify
db.users.findOne({ email: 'your@email.com' })
```

Or via the REST API (after promoting yourself):
```bash
PATCH /api/admin/users/:userId/role
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "role": "admin"
}
```

### 2. **Access Admin Panel**
1. Login with admin account
2. Click "Admin" link in navigation (only visible to admins)
3. Navigate to `/admin`

### 3. **Features Usage**

#### Dashboard
- **Stats**: Total users, total resumes, active users (7d), AI requests (7d)
- **AI Usage**: Breakdown by request type with tokens and costs
- **Recent Activities**: Last 5 users and resumes

#### User Management
- **Search**: Find users by name or email
- **Filter**: By status (active/blocked) or role (user/admin)
- **Actions**:
  - Change role: Select from dropdown
  - Block/Unblock: Change status
  - Delete: Permanently remove user and their resumes

#### Resume Management
- **Search**: Find resumes by title
- **Delete**: Remove inappropriate resumes
- **Info**: See resume owner and creation date

#### Analytics
- **Time Range**: Filter by 7, 30, 90 days or 1 year
- **Usage by Type**: Requests, tokens, and costs by request type
- **Daily Trend**: Daily usage chart with bar graph
- **Top Users**: Ranked list of users by AI usage

## Security Measures

✅ **Backend Validation**
- JWT token verification required for all admin routes
- Admin role validation on every request
- Account status check (blocked users denied access)
- Attempt to demote only admin prevented

✅ **Frontend Protection**
- Admin routes hidden from non-admin navigation
- Route guards via `ProtectedAdminRoute` component
- Redirects non-admins to dashboard
- Token stored in localStorage (consider httpOnly for production)

✅ **Data Protection**
- Passwords hashed with bcrypt
- Sensitive data excluded from API responses
- User cannot access own routes if blocked

## Best Practices

### 1. **First Admin Setup**
```bash
# Step 1: Register a new account
POST /api/auth/register
{ "name": "Admin Name", "email": "admin@email.com", "password": "..." }

# Step 2: Promote via MongoDB (first time only)
db.users.updateOne(
  { email: "admin@email.com" },
  { $set: { role: "admin" } }
)

# Step 3: Login and access admin panel
```

### 2. **Managing Admin Users**
- Keep admin count low for security
- Use strong passwords for admin accounts
- Consider implementing 2FA for admin accounts
- Audit admin actions periodically

### 3. **Blocking Users**
- Block instead of delete if unsure
- Blocked users cannot login but data is preserved
- Delete only when certain (permanent action)

### 4. **Usage Monitoring**
- Check analytics regularly for abuse
- Monitor tokens/costs for unusual patterns
- Track top users for load balancing

## Troubleshooting

### Issue: Can't access admin panel
**Solution**:
1. Verify user role: `db.users.findOne({ email: "..." }).role`
2. Check token is valid: Login again
3. Verify account is not blocked: `db.users.findOne({ email: "..." }).status`

### Issue: Admin link not showing
**Solution**:
1. Refresh page after promoting to admin
2. Clear localStorage if needed: `localStorage.clear()`
3. Re-login to refresh user data

### Issue: 403 Unauthorized on admin routes
**Solution**:
1. User role might not be 'admin' - verify in database
2. Account might be blocked - check status in database
3. Token might be expired - re-login

## API Examples

### Get Dashboard Stats
```bash
GET /api/admin/dashboard
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalResumes": 450,
    "activeUsers": 45,
    "aiUsageStats": [
      {
        "_id": "analyzer",
        "count": 1200,
        "tokensUsed": 45000,
        "totalCost": 0.67
      }
    ]
  },
  "recentActivities": { ... }
}
```

### Search Users
```bash
GET /api/admin/users?page=1&limit=10&search=john&status=active&role=user
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

### Block User
```bash
PATCH /api/admin/users/{userId}/status
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "status": "blocked"
}
```

### Delete User
```bash
DELETE /api/admin/users/{userId}
Authorization: Bearer {TOKEN}

Response:
{
  "success": true,
  "message": "User deleted successfully."
}
```

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Notify users when blocked/promoted
   - Send summary reports to admin

2. **Audit Logging**
   - Log all admin actions
   - Track who deleted what and when

3. **2FA for Admins**
   - Add two-factor authentication
   - Protect admin accounts better

4. **CSV Export**
   - Export users list as CSV
   - Export analytics data

5. **Dark Mode**
   - Already implemented in admin UI
   - Toggle in navbar

6. **Advanced Filtering**
   - Filter users by plan type
   - Filter resumes by template

7. **Bulk Actions**
   - Delete multiple users at once
   - Bulk promote/block users

## Support

For issues or questions, refer to:
- Backend: `backend/routes/admin.js`, `backend/controllers/adminController.js`
- Frontend: `frontend/src/pages/Admin*.jsx`, `frontend/src/components/admin/`
- Middleware: `backend/middleware/auth.js`
