# ProDigitalDoctor Backend - Complete Setup Guide

A production-ready EMR (Electronic Medical Records) SaaS backend built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Database Seeding](#database-seeding)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- ✅ **Authentication**: Clerk-based JWT authentication with webhook sync
- ✅ **Role-Based Access Control**: Patient, Doctor, Assistant, Clinic Owner, Admin
- ✅ **Clinic Management**: Create clinics, invite staff, manage permissions
- ✅ **Patient Management**: Auto-generated patient codes, search, history tracking
- ✅ **Appointment System**: Booking with conflict detection, calendar views
- ✅ **Prescription Management**: DDI checking, FHIR-ready structure
- ✅ **Medication Database**: Search by brand/composition, DDI engine
- ✅ **Analytics**: Clinic/doctor performance metrics
- ✅ **File Uploads**: S3 presigned URLs for secure uploads
- ✅ **Audit Logging**: Track sensitive actions
- ✅ **Admin Panel**: User management, fraud detection, system stats

### Security & Performance
- ✅ Request validation (express-validator)
- ✅ Rate limiting (per endpoint)
- ✅ Security headers (Helmet)
- ✅ Structured logging (Pino)
- ✅ Error handling & monitoring ready (Sentry)
- ✅ CORS configuration
- ✅ Input sanitization

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Database**: MongoDB (Atlas) via Mongoose
- **Authentication**: Clerk
- **File Storage**: AWS S3
- **Validation**: express-validator
- **Logging**: Pino
- **Testing**: Jest + Supertest (configured)

## 📦 Prerequisites

- Node.js 20 or higher
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)
- AWS account (for S3 file storage)
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
cd prodigitaldoctor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and configure the following:

```env
# Required
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/prodigitaldoctor
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your-bucket-name

# Optional
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## ⚙️ Configuration

### MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier works fine)
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### Clerk Setup

1. Create account at https://clerk.com
2. Create a new application
3. Get your Secret Key from API Keys
4. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook signing secret to `.env`

### AWS S3 Setup

1. Create S3 bucket
2. Set bucket to private
3. Create IAM user with S3 permissions
4. Generate access keys
5. Configure bucket CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 🏃 Running the Server

### Development Mode (with auto-restart)

```bash
npm run server
```

### Production Mode

```bash
npm start
```

### Run Both Server and Client

```bash
npm run dev
```

### Check Server Health

Visit http://localhost:5000 - you should see:
```json
{
  "message": "ProDigitalDoctor API is running",
  "version": "1.0.0",
  "environment": "development"
}
```

### Test Database Connection

Visit http://localhost:5000/api/test-db

## 🌱 Database Seeding

### Seed Test Users

```bash
npm run seed:users
```

Creates 5 test users:
- `patient@test.com` - Patient
- `assistant@test.com` - Assistant
- `doctor@test.com` - Doctor
- `doctor.owner@test.com` - Doctor + Clinic Owner
- `admin@test.com` - Admin

### Seed Medications & DDI Rules

```bash
npm run seed:meds
```

Creates:
- 15 common compositions (Paracetamol, Ibuprofen, etc.)
- 15 medications
- 5 DDI (drug interaction) rules

### Seed Everything

```bash
npm run seed:all
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for complete endpoint reference.

### Quick Start

1. Get auth token from Clerk (via frontend login)
2. Use token in Authorization header:
   ```
   Authorization: Bearer <token>
   ```
3. Make API calls to:
   - `/api/auth/me` - Get current user
   - `/api/clinics` - Manage clinics
   - `/api/patients` - Manage patients
   - `/api/appointments` - Manage appointments
   - `/api/prescriptions` - Create prescriptions
   - And more...

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm test -- --coverage
```

**Note**: Tests are configured but not yet written. See `IMPLEMENTATION_NOTES.md` for testing roadmap.

## 📁 Project Structure

```
server/
├── config/           # Database connection
├── controllers/      # Route handlers
│   ├── authController.js
│   ├── clinicController.js
│   ├── patientController.js
│   ├── appointmentController.js
│   ├── prescriptionController.js
│   ├── medicationController.js
│   ├── analyticsController.js
│   ├── adminController.js
│   ├── uploadController.js
│   └── webhookController.js
├── middlewares/      # Custom middleware
│   ├── clerkAuth.js        # Clerk JWT verification
│   ├── rbac.js             # Role-based access control
│   ├── errorHandler.js     # Global error handling
│   ├── rateLimiter.js      # Rate limiting configs
│   └── validator.js        # Request validation
├── models/           # Mongoose schemas
│   ├── user.js
│   ├── clinic.js
│   ├── patient.js
│   ├── appointment.js
│   ├── prescription.js
│   ├── medication.js
│   ├── composition.js
│   ├── ddi.js
│   ├── auditLog.js
│   ├── counter.js
│   └── ...
├── routes/           # API routes
│   ├── auth.js
│   ├── clinics.js
│   ├── patients.js
│   ├── appointments.js
│   ├── prescriptions.js
│   ├── medications.js
│   ├── analytics.js
│   ├── admin.js
│   └── ...
├── utils/            # Helper utilities
│   ├── logger.js              # Pino logger
│   ├── s3.js                  # S3 operations
│   ├── ddiEngine.js           # Drug interaction checker
│   ├── patientCodeGenerator.js
│   ├── auditLogger.js
│   ├── emailService.js        # (Dummy - not implemented)
│   └── fhir.js                # (Placeholder for ABDM)
├── seeders/          # Database seeders
│   ├── userSeeder.js
│   ├── medicationSeeder.js
│   └── seedAll.js
├── index.js          # Server entry point
└── README.md
```

## 🔧 Troubleshooting

### Connection Failed

**Problem**: Cannot connect to MongoDB

**Solutions**:
- Verify `MONGO_URI` in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions
- Test connection string in MongoDB Compass

### Authentication Errors

**Problem**: 401 Unauthorized errors

**Solutions**:
- Verify Clerk JWT token is valid
- Check `CLERK_SECRET_KEY` in `.env`
- Ensure token is in `Authorization: Bearer <token>` format
- Check token hasn't expired

### Webhook Errors

**Problem**: Clerk webhooks failing

**Solutions**:
- Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Check webhook URL is publicly accessible
- Review webhook logs in Clerk dashboard
- Test with ngrok for local development:
  ```bash
  ngrok http 5000
  # Use ngrok URL in Clerk webhook settings
  ```

### S3 Upload Issues

**Problem**: Presigned URL errors

**Solutions**:
- Verify AWS credentials in `.env`
- Check S3 bucket exists and is accessible
- Verify bucket CORS configuration
- Check IAM user has S3 permissions

### Port Already in Use

**Problem**: Port 5000 is already in use

**Solutions**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=3000
```

### Import/Module Errors

**Problem**: Cannot find module errors

**Solutions**:
- Ensure `"type": "module"` is in package.json
- All imports must include `.js` extension
- Check file paths are correct
- Run `npm install` again

## 📄 Additional Documentation

- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - Complete API reference
- [IMPLEMENTATION_NOTES.md](../IMPLEMENTATION_NOTES.md) - Incomplete features and TODOs
- [.env.example](../.env.example) - Environment variables reference

## 🔐 Security Notes

### Development
- Never commit `.env` file
- Use test/development API keys
- MongoDB IP whitelist can be open (0.0.0.0/0)

### Production
- Use strong secrets and rotate regularly
- Restrict MongoDB IP whitelist
- Enable MongoDB encryption at rest
- Use IAM roles instead of AWS keys (if on AWS)
- Set `NODE_ENV=production`
- Enable HTTPS/TLS
- Review CORS origins
- Set up monitoring and alerts

## 📞 Support

For issues or questions:
1. Check this README
2. Review [IMPLEMENTATION_NOTES.md](../IMPLEMENTATION_NOTES.md)
3. Check code comments marked with `TODO`
4. Review API documentation

## 📝 License

ISC

---

**Built with ❤️ for ProDigitalDoctor**
