# Quick Start Guide

Get the EMR SaaS frontend up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Clerk account (free tier works)
- Backend API running

## Step 1: Install Dependencies

```bash
cd client
npm install
```

## Step 2: Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_BASE_URL=http://localhost:5000
```

## Step 3: Setup Clerk

1. Go to https://clerk.com and create an account
2. Create a new application
3. Copy the Publishable Key
4. Add to `.env.local`
5. In Clerk Dashboard:
   - Go to **Paths** → Set redirect URL to `http://localhost:5173`
   - Go to **User & Authentication** → Enable email/password
   - (Optional) Enable social logins

**Detailed Clerk setup**: See [CLERK_SETUP.md](./CLERK_SETUP.md)

## Step 4: Start Development Server

```bash
npm run dev
```

App will open at http://localhost:5173

## Step 5: Test the Application

### Without Backend (Mock Mode)

Set in `.env.local`:
```env
VITE_MOCK_MODE=true
```

This allows you to test the UI without a running backend.

### With Backend

1. Start your backend server (default: http://localhost:5000)
2. Ensure `.env.local` points to backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_MOCK_MODE=false
   ```
3. Sign up/Sign in via Clerk
4. Backend will create user record on first login

## Common Tasks

### View All Available Pages

- `/` - Landing page (public)
- `/dashboard` - Doctor dashboard (protected)
- `/patients` - Patient list (protected)
- `/patients/new` - Create patient (protected)
- `/patients/:id` - Patient details (protected)
- `/prescriptions/new` - Create prescription (protected)
- `/prescriptions/:id` - View prescription (protected)
- `/meds` - Medication search (protected)

### Create Your First Patient

1. Sign in via Clerk
2. Select or create a clinic
3. Go to `/patients/new`
4. Fill in the form
5. Submit
6. You'll see the patient code in a toast notification

### Create Your First Prescription

1. Navigate to a patient detail page
2. Click "Create Prescription"
3. Search and add medications
4. Enter dosage, frequency, duration
5. Add diagnosis
6. Submit
7. View generated PDF

## Troubleshooting

### "Missing Clerk Publishable Key" Error

**Fix**: Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local`

### API Calls Fail with 401

**Fix**: 
1. Check Clerk session is active
2. Verify backend API is running
3. Check CORS is enabled on backend

### No Clinics Available

**Fix**: 
1. Backend must create at least one clinic
2. Or implement clinic creation page
3. Check API endpoint `/api/clinics`

### Medications Not Loading

**Fix**:
1. Backend must seed medication database
2. Run backend seeder: `npm run seed`
3. Check API endpoint `/api/meds?q=test`

### Build Errors

**Fix**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

## Development Workflow

### Making Changes

1. Edit files in `src/`
2. Vite hot-reloads automatically
3. Check console for errors
4. Run linter: `npm run lint`

### Adding a New Page

1. Create page in `src/pages/MyPage.jsx`
2. Add route in `src/main.jsx`:
   ```jsx
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Add navigation link in `src/layouts/MainLayout.jsx`

### Adding a New Component

1. Create in `src/components/ui/` for reusable UI
2. Or in `src/features/` for feature-specific
3. Export from component file
4. Import and use in pages

### Testing Changes

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run e2e

# Check accessibility
npm run test -- --grep="accessibility"
```

## Production Build

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Test Production Build Locally

```bash
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect GitHub repo to Vercel dashboard for auto-deploy.

## Environment-Specific Configs

### Development
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MOCK_MODE=false
```

### Staging
```env
VITE_API_BASE_URL=https://api-staging.yourdomain.com
VITE_MOCK_MODE=false
```

### Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_MOCK_MODE=false
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Unit tests
npm run test:ui          # Test UI mode
npm run test:coverage    # Coverage report
npm run e2e              # E2E tests
npm run e2e:ui           # E2E UI mode

# Linting
npm run lint             # Run ESLint

# Type Checking (if using TypeScript)
npm run type-check       # Not configured yet
```

## Getting Help

- **Documentation**: See [README.md](./README.md)
- **Components**: See [COMPONENTS.md](./COMPONENTS.md)
- **Build Info**: See [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)
- **Clerk Setup**: See [CLERK_SETUP.md](./CLERK_SETUP.md)

## What's Next?

After getting the app running:

1. ✅ Explore all pages and features
2. ✅ Create test patients and prescriptions
3. ✅ Test DDI warnings with common drug combinations
4. ✅ Upload test files
5. ✅ Try ABDM sharing (if configured)
6. ✅ Test on mobile devices
7. ✅ Run accessibility checks
8. ✅ Deploy to staging environment

## Success Checklist

- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Clerk application created
- [ ] Backend API running
- [ ] Dev server started successfully
- [ ] Can sign in via Clerk
- [ ] Dashboard loads
- [ ] Can create a patient
- [ ] Can search medications
- [ ] Can create a prescription
- [ ] DDI warnings show correctly
- [ ] PDF generation works
- [ ] All pages accessible

## Support

For issues or questions:
- Check [README.md](./README.md) first
- Review [COMPONENTS.md](./COMPONENTS.md) for API reference
- Check browser console for errors
- Verify backend API is responding

---

**Ready to build amazing healthcare software!** 🚀
