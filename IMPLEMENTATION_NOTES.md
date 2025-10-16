# Implementation Notes

This document tracks dummy/placeholder implementations that need to be completed for production.

## 🚧 Incomplete/Dummy Implementations

### 1. Email Service (`server/utils/emailService.js`)

**Status**: Dummy implementation - emails are logged to console only

**What's needed**:
- Configure actual SMTP credentials (SendGrid/AWS SES/Mailgun)
- Update `nodemailer` transporter configuration
- Create proper email templates (HTML/text)
- Uncomment actual sending logic in each function
- Test email delivery

**Environment variables required**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@prodigitaldoctor.com
```

**Files to update**:
- `server/utils/emailService.js` - Remove dummy logging, enable actual sending

---

### 2. ABDM Integration (`server/utils/fhir.js`)

**Status**: Placeholder stubs only

**What's needed**:
- Read ABDM M1/M2 API documentation
- Implement proper FHIR R4 resource mapping
- Add ABHA registration endpoints
- Add consent management endpoints
- Add HIP on-share functionality
- Implement webhook signature verification

**Environment variables required**:
```env
ABDM_CLIENT_ID=your_client_id
ABDM_CLIENT_SECRET=your_client_secret
ABDM_GATEWAY_BASE_URL=https://sandbox.abdm.gov.in
ABDM_WEBHOOK_SECRET=your_webhook_secret
```

**Files to update**:
- `server/utils/fhir.js` - Complete FHIR mapping
- Create `server/controllers/abdmController.js`
- Create `server/routes/abdm.js`
- Update `server/models/consentArtifact.js` as needed

---

### 3. PDF Generation

**Status**: Backend stores structured data only; client-side generation expected

**Current flow**:
1. Backend stores prescription data
2. Client calls `/api/prescriptions/:id/pdf-data` to get structured data
3. Client generates PDF using library (e.g., `jsPDF`, `react-pdf`)
4. Client uploads PDF to S3 via presigned URL
5. Client calls `/api/prescriptions/:id/pdf` to update PDF URL

**Optional backend PDF generation**:
If you want server-side PDF generation:
- Install `puppeteer` or `pdfkit`
- Create `server/utils/pdfGenerator.js`
- Create PDF templates
- Generate PDF on prescription creation

---

### 4. OTP Verification (`server/controllers/patientController.js`)

**Status**: OTP verification skipped in development

**Location**: `linkPatientCode` function (line ~250)

**What's needed**:
- Integrate OTP service (Twilio/AWS SNS/Firebase)
- Store OTP tokens with expiration
- Verify OTP before linking patient code

**Code to update**:
```javascript
// In server/controllers/patientController.js
// TODO: Verify OTP (implement OTP service)
if (process.env.NODE_ENV === 'production' && !otp) {
  return res.status(400).json({ error: 'OTP is required' });
}
// Add actual OTP verification here
```

---

### 5. S3 File Deletion (`server/controllers/uploadController.js`)

**Status**: Not implemented

**What's needed**:
- Import `DeleteObjectCommand` from AWS SDK
- Implement delete functionality
- Add authorization checks (only file owner can delete)

**Code to add**:
```javascript
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const deleteFile = async (req, res) => {
  const { key } = req.query;
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  await s3Client.send(command);
  // ...
};
```

---

### 6. User Soft Delete (`server/controllers/adminController.js`)

**Status**: Fields set dynamically, not in schema

**What's needed**:
- Add `deleted` and `deletedAt` fields to User schema
- Create data retention policy
- Filter deleted users from queries

**Schema update needed**:
```javascript
// In server/models/user.js
const UserSchema = new Schema({
  // ... existing fields
  deleted: { type: Boolean, default: false },
  deletedAt: Date,
  enabled: { type: Boolean, default: true }, // For enable/disable
}, { timestamps: true });
```

---

### 7. Invite Token Storage

**Status**: Tokens generated but not stored in database

**What's needed**:
- Create `InviteToken` model or add to Clinic model
- Store tokens with expiration
- Verify tokens on invite acceptance

**Suggested model**:
```javascript
const InviteTokenSchema = new Schema({
  clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
  email: String,
  token: String,
  role: String,
  expiresAt: Date,
  used: { type: Boolean, default: false },
});
```

---

### 8. Rate Limiting Storage

**Status**: In-memory only (not suitable for multi-instance deployment)

**What's needed for production**:
- Use Redis for rate limit storage
- Install `rate-limit-redis` package
- Configure Redis connection

**Code update**:
```javascript
// In server/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export const apiLimiter = rateLimit({
  store: new RedisStore({ client }),
  // ... rest of config
});
```

---

### 9. Sentry Error Tracking

**Status**: Package installed but not initialized

**What's needed**:
- Get Sentry DSN
- Initialize Sentry in `server/index.js`
- Add Sentry request handler middleware

**Code to add**:
```javascript
// In server/index.js
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
  app.use(Sentry.Handlers.requestHandler());
  // ... routes ...
  app.use(Sentry.Handlers.errorHandler());
}
```

---

### 10. CI/CD Pipeline

**Status**: Not implemented

**What's needed**:
- Create `.github/workflows/ci.yml`
- Set up GitHub Actions
- Configure deployment to chosen platform

**Example workflow** (create as `.github/workflows/ci.yml`):
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

---

### 11. Testing Suite

**Status**: Jest configured but no tests written

**What's needed**:
- Write unit tests for utilities (DDI engine, patient code generator, etc.)
- Write integration tests for API endpoints
- Use `mongodb-memory-server` for test database
- Add test coverage reporting

**Example test structure**:
```
server/
  __tests__/
    unit/
      utils/
        ddiEngine.test.js
        patientCodeGenerator.test.js
    integration/
      api/
        clinics.test.js
        patients.test.js
        prescriptions.test.js
```

---

## ✅ Completed Implementations

### Core Features
- ✅ Clerk authentication and webhook sync
- ✅ User management with role-based access
- ✅ Clinic management (create, invite, accept invites)
- ✅ Patient management with code generation
- ✅ Appointment booking with conflict detection
- ✅ Prescription creation with DDI checking
- ✅ Medication and composition search
- ✅ DDI engine and checking
- ✅ Analytics endpoints (clinic/doctor stats)
- ✅ Admin panel endpoints
- ✅ S3 presigned URL generation for uploads
- ✅ RBAC middleware for clinic-scoped access
- ✅ Audit logging
- ✅ Request validation
- ✅ Error handling
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Structured logging (Pino)

### Database
- ✅ All Mongoose models defined
- ✅ Indexes configured
- ✅ Relationships established
- ✅ User seeder script
- ✅ Medication/composition/DDI seeder script

---

## 📋 Production Checklist

Before deploying to production:

### Security
- [ ] Enable HTTPS/TLS
- [ ] Rotate all secrets and API keys
- [ ] Set strong MongoDB password
- [ ] Configure MongoDB IP whitelist
- [ ] Enable MongoDB encryption at rest
- [ ] Set up AWS IAM roles with minimal permissions
- [ ] Enable S3 bucket encryption
- [ ] Configure S3 bucket policies (private access only)
- [ ] Set up Clerk production instance
- [ ] Enable Clerk MFA options
- [ ] Review and tighten CORS origins

### Infrastructure
- [ ] Set up Redis for rate limiting
- [ ] Configure CDN for static assets
- [ ] Set up database backups (automated)
- [ ] Configure monitoring and alerts
- [ ] Set up log aggregation
- [ ] Configure Sentry error tracking
- [ ] Set up uptime monitoring
- [ ] Configure auto-scaling (if applicable)

### Email & Notifications
- [ ] Configure production email service
- [ ] Create email templates
- [ ] Set up email sending domain
- [ ] Configure SPF/DKIM/DMARC
- [ ] Test email deliverability

### Testing
- [ ] Write comprehensive test suite
- [ ] Perform load testing
- [ ] Perform security testing/audit
- [ ] Test all user flows end-to-end
- [ ] Test error scenarios

### Documentation
- [ ] Create API documentation (Postman/OpenAPI)
- [ ] Document deployment process
- [ ] Create user guides
- [ ] Document troubleshooting steps

### Compliance
- [ ] Review data retention policies
- [ ] Implement GDPR compliance (if applicable)
- [ ] Implement HIPAA compliance (required for healthcare)
- [ ] Set up audit log retention
- [ ] Create privacy policy
- [ ] Create terms of service

---

## 🔄 Update History

- **2024-01-08**: Initial implementation completed
  - Core backend API implemented
  - Database models and seeders created
  - Authentication and RBAC configured
  - Identified dummy implementations for future work

---

## 📞 Support

For questions or issues during implementation:
1. Check this document for known limitations
2. Review code comments marked with `TODO`
3. Check the main README for setup instructions
