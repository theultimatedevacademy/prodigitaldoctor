# Fix Duplicate Emails - Instructions

## Problem

Multiple user documents with the same email can exist in MongoDB because the email field only had an index but not a unique constraint.

## ✅ What Was Fixed

### 1. **User Model Updated**
   - Changed `email` field from `index: true` to `unique: true, sparse: true, lowercase: true`
   - **File**: `server/models/user.js`

### 2. **Webhook Controller Updated**
   - Added duplicate email checking before creating users
   - Handles MongoDB duplicate key error (code 11000)
   - **File**: `server/controllers/webhookController.js`

### 3. **Auth Controller Updated**
   - Added try-catch to handle duplicate email errors
   - Returns existing user if email already exists
   - **File**: `server/controllers/authController.js`

---

## 🚀 How to Apply the Fix

### Step 1: Run the Duplicate Email Fix Script

This script will:
- Find and remove duplicate emails (keeping the oldest)
- Rebuild the email index with unique constraint

**Run:**
```bash
node server/scripts/fixDuplicateEmails.js
```

**Expected Output:**
```
✅ Connected to MongoDB

🔍 Searching for duplicate emails...
⚠️  Found 2 duplicate email(s):

1. Email: test@example.com (2 occurrences)
   ✅ Keep: user_abc123 (created: 2025-10-08...)
   ❌ Remove: user_xyz789 (created: 2025-10-08...)

📝 Removing duplicates (keeping the oldest record)...
   ❌ Deleted user: user_xyz789

✅ Duplicates removed!

🔧 Rebuilding email index...
   🗑️  Dropped old email index
   ✅ Created new unique sparse email index

🔍 Verifying...
   📊 Total users: 10
   📧 Users with email: 10
   ✅ Unique emails: 10

✅ SUCCESS! All emails are now unique.

👋 Done! Database connection closed.
```

### Step 2: Restart Your Server

```bash
npm run dev
```

---

## ✅ What the Changes Do

### Email Field Configuration

```javascript
// Before
email: { type: String, index: true }

// After
email: { type: String, unique: true, sparse: true, lowercase: true }
```

**Benefits:**
- `unique: true` - Prevents duplicate emails
- `sparse: true` - Allows multiple users with null/undefined emails
- `lowercase: true` - Converts all emails to lowercase (test@email.com === TEST@EMAIL.COM)

### Duplicate Email Handling

**In Webhooks** (`webhookController.js`):
- Checks if email exists before creating user
- Catches MongoDB duplicate key error (code 11000)
- Logs warning and skips creation if duplicate

**In Auth API** (`authController.js`):
- Wraps user creation in try-catch
- Returns existing user if email already exists
- Prevents application crash on duplicate

---

## 🧪 Test the Fix

### Test 1: Try Creating Duplicate Email

**From Clerk Dashboard:**
1. Go to Users
2. Try creating a new user with an existing email
3. Webhook should log: `⚠️  User with email xxx already exists. Skipping creation.`

**Result**: Only one user document exists in MongoDB

### Test 2: Verify Database Index

**In MongoDB:**
```javascript
db.users.getIndexes()
```

**Should see:**
```json
{
  "v": 2,
  "key": { "email": 1 },
  "name": "email_unique_sparse",
  "sparse": true,
  "unique": true
}
```

### Test 3: Try Manual Duplicate Insert

**In MongoDB:**
```javascript
// This should fail
db.users.insert({
  clerkId: "test123",
  email: "existing@email.com",  // Email that already exists
  roles: ["patient"]
})
```

**Expected Error:**
```
E11000 duplicate key error collection: prodigitaldoctor.users index: email_unique_sparse dup key: { email: "existing@email.com" }
```

---

## 🔍 How to Check for Duplicates Manually

### Find Duplicate Emails

**In MongoDB:**
```javascript
db.users.aggregate([
  {
    $match: {
      email: { $ne: null, $exists: true }
    }
  },
  {
    $group: {
      _id: "$email",
      count: { $sum: 1 },
      users: { $push: { clerkId: "$clerkId", _id: "$_id" } }
    }
  },
  {
    $match: {
      count: { $gt: 1 }
    }
  }
])
```

**If no duplicates:**
```javascript
// Empty result
```

**If duplicates exist:**
```json
[
  {
    "_id": "duplicate@email.com",
    "count": 2,
    "users": [
      { "clerkId": "user_123", "_id": ObjectId("...") },
      { "clerkId": "user_456", "_id": ObjectId("...") }
    ]
  }
]
```

---

## 🛠️ Manual Cleanup (If Script Fails)

### Option 1: Remove Specific Duplicate

```javascript
// Find the duplicate
db.users.find({ email: "duplicate@email.com" })

// Delete the newer one (keep the oldest)
db.users.deleteOne({ _id: ObjectId("newer_id_here") })
```

### Option 2: Rebuild Index Manually

```javascript
// Drop old index
db.users.dropIndex("email_1")

// Create new unique sparse index
db.users.createIndex(
  { email: 1 }, 
  { 
    unique: true, 
    sparse: true,
    name: "email_unique_sparse"
  }
)
```

---

## ⚠️ Important Notes

### About `sparse: true`

- Allows **multiple users with null/undefined emails**
- Only enforces uniqueness for **non-null values**
- This is important because:
  - Some users might not have emails
  - Clerk allows phone-only signups
  - We don't want to block users without emails

### About `lowercase: true`

- Automatically converts emails to lowercase
- Prevents treating `Test@Email.com` and `test@email.com` as different
- Applied on both save and query

### Edge Cases Handled

1. **User signs up without email** → Allowed (null email)
2. **Two users with same email** → Second blocked, logs warning
3. **User changes email to existing email** → Would be blocked (if you add email update feature)
4. **Case-insensitive emails** → `test@email.com` === `TEST@EMAIL.COM`

---

## 📊 Monitoring

### Check for Duplicate Attempts

**Server logs will show:**
```
⚠️  User with email test@example.com already exists. Skipping creation.
   Existing user: user_abc123
```

Or:

```
⚠️  Duplicate email error - User with this email already exists
   Email: test@example.com
```

### Database Health Check

Run this periodically to ensure no duplicates:

```javascript
// Should return 0
db.users.aggregate([
  { $match: { email: { $ne: null, $exists: true } } },
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } },
  { $count: "duplicates" }
])
```

---

## ✅ Summary

**Changes Made:**
- ✅ User model email field now has unique constraint
- ✅ Email is case-insensitive (lowercase)
- ✅ Allows null emails (sparse index)
- ✅ Webhook handles duplicates gracefully
- ✅ Auth API handles duplicates gracefully
- ✅ Script to fix existing duplicates

**Next Steps:**
1. Run the fix script: `node server/scripts/fixDuplicateEmails.js`
2. Restart server: `npm run dev`
3. Test by trying to create duplicate email
4. Monitor server logs for duplicate warnings

**The email field is now properly unique and will prevent duplicate users!** 🎉
