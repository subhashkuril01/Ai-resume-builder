# 🚀 Setup Guide - Local Development & Production

## Local Development Setup

### 1. Backend Configuration

```bash
cd backend

# Copy example to local env
cp .env.example .env.local
# OR on Windows
copy .env.example .env.local

# Edit .env.local and set your values:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cvision_final
JWT_SECRET=your_local_test_secret_key_123
JWT_EXPIRE=7d
OPENAI_API_KEY=mock_mode
FRONTEND_URL=http://localhost:5173

```

### 2. Frontend Configuration

```bash
cd frontend

# Copy example to local env
cp .env.example .env.local
# OR on Windows
copy .env.example .env.local

# Edit .env.local:
VITE_API_URL=http://localhost:5000/api
```

### 3. Create Admin User

```bash
cd backend
node scripts/createAdmin.js
```

### 4. Run Development Server

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# or
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Production Deployment Setup

### 1. Backend Production Configuration

Set environment variables on your hosting platform:

**Option A: Heroku / Railway / Render**
```bash
# Set via CLI
heroku config:set PORT=5000
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
heroku config:set JWT_SECRET=<generate strong random string>
heroku config:set OPENAI_API_KEY=<your actual key>
heroku config:set FRONTEND_URL=https://yourdomain.com
```

**Option B: AWS / Azure / GCP**
- Use Secrets Manager or Key Vault
- Reference secrets in deployment configuration

**Option C: Docker**
```dockerfile
FROM node:18
ENV NODE_ENV=production
ENV PORT=5000
# ... rest of dockerfile
```

### 2. Generate Strong JWT Secret

```bash
# Generate strong random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a7f3d9c2e1b8f4a6c5d9e2f3a8b1c4d5e6f9a0b1c2d3e4f5a6b7c8d9e0f1a

# Use this as JWT_SECRET in production
```

### 3. MongoDB Production Setup

**Option A: MongoDB Atlas (Recommended)**
```
1. Create account at mongodb.com
2. Create cluster
3. Create database user with strong password
4. Get connection string: 
   mongodb+srv://username:password@cluster.mongodb.net/dbname
5. Set as MONGODB_URI
6. Enable IP whitelist (add production server IP)
```

**Option B: Self-hosted MongoDB**
```
1. Use strong authentication
2. Enable SSL/TLS encryption
3. Setup regular backups
4. Use private network if possible
5. Connection string: mongodb://user:pass@host:27017/dbname
```

### 4. Frontend Production Configuration

Set in your frontend build environment:

```bash
# .env.production or build config
VITE_API_URL=https://api.yourdomain.com/api
# or
VITE_API_URL=https://yourdomain.com/api
```

### 5. CORS Configuration for Production

Update `backend/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 6. Create Production Admin User

```bash
# Set environment variables first
export ADMIN_EMAIL=admin@yourdomain.com
export ADMIN_PASSWORD=<strong_password>
export ADMIN_NAME=Admin

# Then run
node scripts/createAdmin.js
```

---

## Security Best Practices

### ✅ Do's

- ✅ Use `.env.local` for local development
- ✅ Never commit `.env` file
- ✅ Use strong passwords (12+ chars, mixed types)
- ✅ Rotate secrets regularly
- ✅ Use HTTPS in production
- ✅ Enable CORS only for your domain
- ✅ Use IP whitelist for MongoDB
- ✅ Enable firewall on production server
- ✅ Monitor API usage and logs
- ✅ Keep dependencies updated

### ❌ Don'ts

- ❌ Commit `.env` files to git
- ❌ Hardcode secrets in source code
- ❌ Share credentials via email/chat
- ❌ Use same secrets for dev/prod
- ❌ Leave default credentials active
- ❌ Expose error details in production
- ❌ Use weak passwords
- ❌ Allow public MongoDB access
- ❌ Skip HTTPS in production
- ❌ Ignore security warnings

---

## Troubleshooting

### "Cannot find .env"
```bash
# Create from example
cp .env.example .env.local

# Edit the file with your values
# Make sure it's in the correct directory
```

### "ADMIN_PASSWORD not set"
```bash
# Make sure ADMIN_PASSWORD is set before running script
export ADMIN_PASSWORD=YourStrongPassword123
node scripts/createAdmin.js
```

### "MongoDB connection failed"
```bash
# Check connection string format
# Local: mongodb://localhost:27017/dbname
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname
# Ensure credentials are URL encoded
```

### "JWT errors in production"
```bash
# Make sure JWT_SECRET is set in production
# Use strong random string (32+ chars)
# Keep same secret across all instances
```

---

## Files Reference

| File | Purpose | Commit | Notes |
|------|---------|--------|-------|
| `.env` | Local config (gitignored) | ❌ NO | Never commit |
| `.env.local` | Local overrides | ❌ NO | Never commit |
| `.env.example` | Example template | ✅ YES | Safe to commit |
| `SECURITY_CHECKLIST.md` | Security guide | ✅ YES | For reference |
| `SETUP_GUIDE.md` | Setup documentation | ✅ YES | For developers |
| `ADMIN_SETUP.md` | Admin panel guide | ✅ YES | For developers |

---

## Quick Start Commands

```bash
# Local development
git clone <repo>
cd project
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local
# Edit both .env.local files with your values

cd backend
node scripts/createAdmin.js
npm run dev

# In another terminal
cd frontend
npm run dev

# Visit http://localhost:5173
# Login with: admin@gmail.com / Admin@123
# Access admin panel at: /admin
```

---

**Need help?** Check:
- `ADMIN_SETUP.md` - Admin panel documentation
- `SECURITY_CHECKLIST.md` - Security verification
- `README.md` - General project info
