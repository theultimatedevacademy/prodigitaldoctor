# Installation Steps for Role-Based Authentication

## Required Package Installations

### Step 1: Install Server Dependencies

Run this command in the **root directory** of your project:

```bash
npm install @clerk/clerk-sdk-node cors
```

**Packages:**
- `@clerk/clerk-sdk-node` - Clerk SDK for Node.js backend authentication
- `cors` - Enable CORS for cross-origin requests from client

### Step 2: Verify Client Dependencies

The client should already have Clerk React installed. To verify, check `client/package.json` for:
- `@clerk/clerk-react`

If not installed, run this in the **client directory**:

```bash
cd client
npm install @clerk/clerk-react
cd ..
```

## Environment Setup

### Step 3: Create/Update Server Environment File

Create or update `.env` file in the **root directory**:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 4: Create/Update Client Environment File

Create or update `client/.env`:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

## Getting Clerk API Keys

### Step 5: Obtain Clerk Keys

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/
2. **Select or Create Application**
3. **Navigate to**: API Keys (in left sidebar)
4. **Copy Keys**:
   - **Publishable Key** → Use in `client/.env` as `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → Use in root `.env` as `CLERK_SECRET_KEY`

⚠️ **Important**: Never commit these keys to version control. Add `.env` files to `.gitignore`.

## Verify Installation

### Step 6: Check Package Installation

Run these commands to verify packages are installed:

```bash
# Check server packages
npm list @clerk/clerk-sdk-node
npm list cors

# Check client packages
cd client
npm list @clerk/clerk-react
cd ..
```

## Start the Application

### Step 7: Start Development Servers

Open **two terminal windows**:

**Terminal 1 - Start Both Server and Client:**
```bash
npm run dev
```

**OR Start Separately:**

**Terminal 1 - Server Only:**
```bash
npm run server
```

**Terminal 2 - Client Only:**
```bash
npm run client
```

### Expected Output:

**Server:**
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
📍 Test the API at http://localhost:5000
```

**Client:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Initial Testing

### Step 8: Test the Setup

1. **Open Browser**: Navigate to `http://localhost:5173`
2. **Click Sign Up**: Try creating a new account
3. **Complete Signup**: Fill in required information
4. **Check Database**: Verify user was created in MongoDB
5. **Assign Role**: Go to Clerk Dashboard → Users → Select user → Metadata tab → Add to Public Metadata:
   ```json
   {
     "roles": ["doctor"]
   }
   ```
6. **Refresh Page**: Should redirect to Doctor Dashboard

## Troubleshooting

### Issue: Package Installation Fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For client
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Issue: Module Not Found Error

**Solution:**
```bash
# Ensure you're in the root directory
pwd

# Reinstall specific package
npm install @clerk/clerk-sdk-node
```

### Issue: CORS Errors

**Solution:**
- Verify `CLIENT_URL` in `.env` matches your client URL (default: `http://localhost:5173`)
- Check server logs for CORS configuration
- Ensure `cors` package is installed

### Issue: Clerk Authentication Errors

**Solution:**
- Verify both `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` are set
- Check keys are from the same Clerk application
- Ensure no extra spaces in `.env` file
- Restart both servers after changing environment variables

## Quick Reference

### Commands Cheat Sheet

```bash
# Install all dependencies
npm install @clerk/clerk-sdk-node cors

# Start development (both server and client)
npm run dev

# Start server only
npm run server

# Start client only
npm run client

# Check server is running
curl http://localhost:5000

# Check database connection
curl http://localhost:5000/api/test-db

# Check if user endpoint works (requires auth token)
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"
```

### Files Created/Modified

✅ **Created:**
- `client/src/components/RoleBasedDashboard.jsx`
- `server/controllers/authController.js`
- `server/middlewares/clerkAuth.js`
- `server/routes/auth.js`
- `ROLE_BASED_AUTH_SETUP.md`
- `INSTALLATION_STEPS.md` (this file)

✅ **Modified:**
- `client/src/components/ProtectedRoute.jsx`
- `client/src/pages/LandingPage.jsx`
- `client/src/main.jsx`
- `client/src/utils/constants.js`
- `server/index.js`

## Next Steps After Installation

1. ✅ Install packages (`npm install @clerk/clerk-sdk-node cors`)
2. ✅ Configure environment variables (`.env` files)
3. ✅ Get Clerk API keys
4. ✅ Start the application (`npm run dev`)
5. ⏭️ Test user signup/login
6. ⏭️ Assign roles in Clerk Dashboard
7. ⏭️ Verify role-based routing works
8. ⏭️ Customize dashboards for your needs

## Support

If you encounter issues:
1. Check error messages in both terminal windows
2. Review browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running and accessible
5. Check Clerk Dashboard for application status

For detailed information, see `ROLE_BASED_AUTH_SETUP.md`
