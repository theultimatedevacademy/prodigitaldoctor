# Webhook Quick Start - 5 Minutes Setup

Follow these steps to get Clerk webhooks working with MongoDB synchronization.

---

## ⚡ Quick Steps

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

This installs the `svix` package needed for webhook verification.

---

### 2. Add Webhook Secret to .env (1 minute)

Open your `.env` file and add this line:

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

**Where to get the secret?** → Continue to step 4 (you'll get it when creating the webhook)

---

### 3. Start ngrok (For Local Development) (1 minute)

**If you don't have ngrok installed:**
```bash
npm install -g ngrok
```

**Start ngrok in a new terminal:**
```bash
ngrok http 5000
```

**Copy the HTTPS URL** from the output:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```

Your webhook URL will be:
```
https://abc123.ngrok-free.app/api/webhooks/clerk
```

---

### 4. Configure Webhook in Clerk Dashboard (2 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Click **Webhooks** in sidebar
4. Click **Add Endpoint**

**Fill in:**

| Field | Value |
|-------|-------|
| **Endpoint URL** | `https://YOUR-NGROK-URL.ngrok-free.app/api/webhooks/clerk` |
| **Events** | ✅ user.created<br>✅ user.updated<br>✅ user.deleted |

5. Click **Create**
6. **Copy the Signing Secret** (starts with `whsec_`)
7. Add it to your `.env` file:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx
   ```

---

### 5. Restart Your Server (30 seconds)

Stop your server (Ctrl+C) and restart:

```bash
npm run dev
```

---

## ✅ Test It Works

### Test: Create New User

1. Go to `http://localhost:5173`
2. Click "Sign In / Sign Up"
3. Create a new test account
4. **Check your server terminal** - you should see:
   ```
   👤 User created event received: user_xxxxx
   ✅ User created in MongoDB: 507f1f77bcf86cd799439011
   ```

### Verify in MongoDB:

```javascript
// In MongoDB Compass or CLI
db.users.find().pretty()

// You should see the new user with clerkId
```

---

## 🎯 That's It!

Your Clerk and MongoDB are now in sync. Every time:
- ✅ User signs up → Automatically created in MongoDB
- ✅ User updates profile → Automatically updated in MongoDB
- ✅ User deleted → Automatically removed from MongoDB
- ✅ User selects role → Synced to both Clerk and MongoDB

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events?

**Check 1: Is ngrok running?**
```bash
# In ngrok terminal, you should see requests coming in
# If not, ngrok might have stopped
```

**Check 2: Is webhook URL correct?**
- Go to Clerk Dashboard → Webhooks
- Click on your endpoint
- Verify URL matches your ngrok URL
- ngrok URLs change when you restart ngrok

**Check 3: Is CLERK_WEBHOOK_SECRET set?**
```bash
# Check your .env file
cat .env | grep CLERK_WEBHOOK_SECRET
```

**Check 4: Did you restart server after adding secret?**
```bash
# Always restart after changing .env
npm run dev
```

### Server Logs Show Errors?

**Error: "Missing Svix headers"**
- Make sure webhook is configured in Clerk
- Verify webhook URL is correct

**Error: "Invalid signature"**
- `CLERK_WEBHOOK_SECRET` is wrong
- Copy the secret again from Clerk Dashboard
- Restart server

**Error: "Webhook secret not configured"**
- `CLERK_WEBHOOK_SECRET` not in .env
- Add it and restart server

---

## 🔄 Production Deployment

When deploying to production:

1. **Update webhook URL** in Clerk Dashboard:
   ```
   https://api.yourdomain.com/api/webhooks/clerk
   ```

2. **Add CLERK_WEBHOOK_SECRET** to production environment variables

3. **Test with a production user creation**

---

## 📚 Full Documentation

For detailed information, see:
- **`CLERK_WEBHOOK_SETUP.md`** - Complete setup guide
- **`server/controllers/webhookController.js`** - Webhook handler code
- **`server/routes/webhook.js`** - Webhook routes

---

## 🎉 Success!

Your users are now automatically synced between Clerk and MongoDB!

**Files Created:**
- ✅ `server/controllers/webhookController.js`
- ✅ `server/routes/webhook.js`
- ✅ Updated `server/index.js` with webhook routes
- ✅ Updated `package.json` with `svix` dependency
