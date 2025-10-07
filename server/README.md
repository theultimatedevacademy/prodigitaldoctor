# Server Setup and Testing Guide

## Testing Database Connection

The `server/index.js` file includes test endpoints to verify your MongoDB connection and collection creation.

## Running the Server

### Option 1: Development Mode (with auto-restart)
```bash
npm run server
```

### Option 2: Production Mode
```bash
npm start
```

### Option 3: Run Both Server and Client
```bash
npm run dev
```

## Test Endpoints

Once the server is running, you can test the following endpoints:

### 1. Basic Health Check
```bash
# Browser or curl
http://localhost:5000
```

**Expected Response:**
```json
{
  "message": "ProDigitalDoctor API is running"
}
```

### 2. Test Database Connection
```bash
# Browser or curl
http://localhost:5000/api/test-db
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "collections": {
    "users": 0,
    "clinics": 0,
    "patients": 0,
    "medications": 0,
    "compositions": 0
  }
}
```


## Test Users Data

The application includes 5 predefined test users in `server/data/users.js` with different roles for development and testing:

| Role | Name | Email | Clerk ID | Specialization |
|------|------|-------|----------|----------------|
| **Patient** | John Patient | patient@test.com | user_patient_test_001 | - |
| **Staff (Assistant)** | Sarah Assistant | assistant@test.com | user_staff_test_002 | - |
| **Doctor** | Dr. Rajesh Kumar | doctor@test.com | user_doctor_test_003 | General Medicine, Internal Medicine |
| **Doctor + Clinic Owner** | Dr. Priya Sharma | doctor.owner@test.com | user_doctor_owner_test_004 | General Surgery, Laparoscopic Surgery |
| **Admin** | Admin User | admin@test.com | user_admin_test_005 | - |

### Additional Details

**Dr. Rajesh Kumar (Doctor)**
- Qualifications: MBBS, MD (Medicine)
- HPR ID: HPR-DOC-12345678
- Phone: +91-9876543212

**Dr. Priya Sharma (Doctor + Clinic Owner)**
- Qualifications: MBBS, MS (Surgery), FACS
- HPR ID: HPR-DOC-87654321
- Phone: +91-9876543213

### Seeding Test Users

To import these test users into your database, run the seeder script:

```bash
npm run seed:users
```

**What the seeder does:**
1. Connects to your MongoDB database
2. Removes any existing test users (by clerkId)
3. Inserts all 5 test users
4. Displays confirmation with user details

**Example output:**
```
✅ Connected to MongoDB
🗑️  Removed 5 existing test users
✨ Successfully seeded 5 test users:
   - John Patient (patient) - patient@test.com
   - Sarah Assistant (assistant) - assistant@test.com
   - Dr. Rajesh Kumar (doctor) - doctor@test.com
   - Dr. Priya Sharma (doctor, clinic_owner) - doctor.owner@test.com
   - Admin User (admin) - admin@test.com

🎉 User seeding completed successfully!
```

## Verifying Collections in MongoDB

You can verify your database and collections:

1. **Check MongoDB Atlas Dashboard** - Navigate to your cluster and view the `prodigitaldoctor` database
2. **Visit `/api/test-db`** - Check document counts for each collection
3. **Use MongoDB Compass** - Connect using your MONGO_URI and explore collections

## What the Server Does

1. ✅ Loads environment variables from `.env`
2. ✅ Connects to MongoDB using the `MONGO_URI`
3. ✅ Imports all Mongoose models
4. ✅ Creates Express server with JSON middleware
5. ✅ Provides test endpoints for validation
6. ✅ Logs helpful startup information

## Troubleshooting

### Connection Failed
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB Atlas IP whitelist (should include your IP or 0.0.0.0/0)
- Ensure database user credentials are correct

### Model/Import Errors
- All models use ES6 `export default` syntax
- All imports include `.js` extensions
- Project has `"type": "module"` in package.json

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000
