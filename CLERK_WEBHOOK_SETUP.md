# Clerk Webhook Setup Guide

This guide will help you set up Clerk webhooks to automatically sync users between Clerk and MongoDB.

---

## 📦 Step 1: Install Required Package

Run this command to install the Svix package (for webhook signature verification):

```bash
npm install
```

The `svix` package has been added to your `package.json`.

---

## 🔧 Step 2: Add Webhook Secret to Environment Variables

You need to add the Clerk webhook secret to your `.env` file.

### Get the Webhook Secret:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint** (we'll configure this in Step 3)
5. You'll get a **Signing Secret** - copy it

### Add to `.env` file:

Open your `.env` file (in the root directory) and add:

```env
# Existing variables
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173

# Add this new line
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🌐 Step 3: Expose Your Local Server (For Development)

Clerk needs to send webhooks to your server. For local development, you need to expose your localhost to the internet.

### Option A: Using ngrok (Recommended)

1. **Install ngrok**:
   - Download from [ngrok.com](https://ngrok.com/)
   - Or install via npm: `npm install -g ngrok`

2. **Start your server**:
   ```bash
   npm run dev
   ```

3. **In a new terminal, run ngrok**:
   ```bash
   ngrok http 5000
   ```

4. **Copy the HTTPS URL** from ngrok output:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:5000
   ```
   
   Your webhook URL will be: `https://abc123.ngrok.io/api/webhooks/clerk`

### Option B: Using Cloudflare Tunnel

```bash
# Install cloudflared
# Then run:
cloudflared tunnel --url http://localhost:5000
```

### Option C: Deploy to Production

If you have a production server, use your production URL:
```
https://your-domain.com/api/webhooks/clerk
```

---

## ⚙️ Step 4: Configure Webhook in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**

### Configure the Endpoint:

**Endpoint URL**:
```
https://your-ngrok-url.ngrok.io/api/webhooks/clerk
```
(Replace with your actual ngrok URL or production URL)

**Subscribe to Events**:
Select these events:
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `user.deleted`

**Description** (optional):
```
Sync users to MongoDB
```

5. Click **Create**

6. **Copy the Signing Secret** and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

---

## 🧪 Step 5: Test the Webhook

### Test 1: Create New User

1. Go to your application: `http://localhost:5173`
2. Click "Sign In / Sign Up"
3. Create a new account
4. Check your server terminal logs - you should see:
   ```
   👤 User created event received: user_xxxxx
   ✅ User created in MongoDB: 507f1f77bcf86cd799439011
   ```

5. Verify in MongoDB:
   ```javascript
   db.users.findOne({ clerkId: "user_xxxxx" })
   ```

### Test 2: Update User

1. In Clerk Dashboard, go to **Users**
2. Select a user
3. Update their name or email
4. Check server logs:
   ```
   🔄 User updated event received: user_xxxxx
   ✅ User updated in MongoDB
   ```

### Test 3: Delete User

1. In Clerk Dashboard, delete a test user
2. Check server logs:
   ```
   🗑️ User deleted event received: user_xxxxx
   ✅ User deleted from MongoDB
   ```

---

## 🔍 Step 6: Debug Webhook Issues

### Check if Webhook is Receiving Requests

In Clerk Dashboard:
1. Go to **Webhooks**
2. Click on your endpoint
3. Check the **Message Attempts** tab
4. You'll see all webhook deliveries with status codes

### Common Issues:

#### Issue 1: 400 Bad Request - Missing Svix Headers

**Cause**: Webhook signature verification failed

**Solution**:
- Verify `CLERK_WEBHOOK_SECRET` is correct in `.env`
- Restart your server after adding the secret
- Check that webhook route is using `express.raw()` middleware

#### Issue 2: 500 Internal Server Error

**Cause**: Error in webhook handler

**Solution**:
- Check server terminal for error logs
- Verify MongoDB connection is working
- Check User model is imported correctly

#### Issue 3: Webhook Not Reaching Server

**Cause**: ngrok URL expired or server not running

**Solution**:
- Verify ngrok is still running
- Check if ngrok URL changed (it changes on restart)
- Update webhook URL in Clerk Dashboard if needed
- Ensure server is running on port 5000

#### Issue 4: User Already Exists

**Log**: "User already exists in database"

**Explanation**: This is normal if:
- User was created via `/api/auth/me` endpoint first
- Webhook is being retried
- No action needed, webhook will skip creation

---

## 🔄 How the Sync Works

### New User Flow:

```
User Signs Up in Clerk
    ↓
Clerk sends webhook: user.created
    ↓
Your server receives webhook at /api/webhooks/clerk
    ↓
Verifies signature using Svix
    ↓
Creates user in MongoDB with:
    - clerkId
    - name, email, phone (from Clerk)
    - roles: [] (empty initially)
    ↓
User redirected to dashboard
    ↓
RoleSelectionModal appears
    ↓
User selects role
    ↓
POST /api/auth/my-role updates MongoDB and Clerk
    ↓
Clerk sends webhook: user.updated
    ↓
MongoDB user.roles updated again (already done, but ensures sync)
```

### Update User Flow:

```
User updates profile in Clerk
    ↓
Clerk sends webhook: user.updated
    ↓
Your server updates MongoDB user
    ↓
Both systems stay in sync
```

---

## 📝 Webhook Event Data Structure

### user.created Event:

```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123",
    "first_name": "John",
    "last_name": "Doe",
    "email_addresses": [
      {
        "email_address": "john@example.com"
      }
    ],
    "phone_numbers": [
      {
        "phone_number": "+1234567890"
      }
    ],
    "image_url": "https://...",
    "public_metadata": {
      "roles": []
    },
    "username": "johndoe",
    "created_at": 1234567890
  }
}
```

### user.updated Event:

```json
{
  "type": "user.updated",
  "data": {
    "id": "user_2abc123",
    "first_name": "John",
    "last_name": "Smith",  // Changed
    "public_metadata": {
      "roles": ["doctor"]  // Added via role selection
    }
    // ... other fields
  }
}
```

---

## 🔐 Security Features

### Signature Verification:

Every webhook request is verified using Svix:
- **Svix-ID**: Unique message ID
- **Svix-Timestamp**: When message was sent
- **Svix-Signature**: HMAC signature of payload

If verification fails, request is rejected with 400 error.

### Best Practices:

1. ✅ Never disable signature verification
2. ✅ Keep `CLERK_WEBHOOK_SECRET` secure
3. ✅ Use HTTPS in production
4. ✅ Monitor webhook logs for suspicious activity
5. ✅ Set webhook timeout in Clerk (default: 5 seconds)

---

## 🚀 Production Deployment

### When deploying to production:

1. **Update Webhook URL**:
   - Change from ngrok URL to production URL
   - Example: `https://api.yourdomain.com/api/webhooks/clerk`

2. **Environment Variables**:
   - Ensure `CLERK_WEBHOOK_SECRET` is set on server
   - Use secrets manager (AWS Secrets, Railway secrets, etc.)

3. **Test Webhooks**:
   - Create a test user in production
   - Verify user appears in MongoDB
   - Check Clerk Dashboard > Webhooks > Message Attempts

4. **Monitor**:
   - Set up logging for webhook events
   - Monitor failed webhook deliveries
   - Clerk will retry failed webhooks automatically

---

## 📊 Webhook Retry Logic

Clerk automatically retries failed webhooks:
- **Retry Schedule**: 1s, 5s, 30s, 2min, 5min, 10min, 1hr
- **Max Attempts**: 7 attempts
- **Timeout**: 5 seconds per attempt

If webhook keeps failing:
1. Check server logs for errors
2. Verify endpoint is accessible
3. Test with Clerk's "Send Example" feature
4. Check database connectivity

---

## 🛠️ Advanced Configuration

### Custom Webhook Handler:

You can extend `server/controllers/webhookController.js` to handle more events:

```javascript
// Add more cases in handleClerkWebhook
case 'session.created':
  await handleSessionCreated(data);
  break;

case 'organization.created':
  await handleOrganizationCreated(data);
  break;
```

### Logging:

Add comprehensive logging:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'webhooks.log' })
  ]
});

// In webhook handler
logger.info('Webhook received', { type: evt.type, userId: data.id });
```

---

## ✅ Verification Checklist

- [ ] `svix` package installed
- [ ] `CLERK_WEBHOOK_SECRET` added to `.env`
- [ ] Server restarted after adding secret
- [ ] Webhook endpoint created in Clerk Dashboard
- [ ] Subscribed to `user.created`, `user.updated`, `user.deleted`
- [ ] ngrok (or production URL) configured
- [ ] Webhook URL updated in Clerk Dashboard
- [ ] Test user creation successful
- [ ] User appears in MongoDB
- [ ] Server logs show webhook events
- [ ] Clerk Dashboard shows successful deliveries

---

## 📞 Support

**Webhook not working?**
1. Check server logs for errors
2. Check Clerk Dashboard > Webhooks > Message Attempts
3. Verify `CLERK_WEBHOOK_SECRET` is correct
4. Ensure ngrok/server is running
5. Test with "Send Example" in Clerk Dashboard

**Still having issues?**
- Review webhook controller: `server/controllers/webhookController.js`
- Check MongoDB connection
- Verify User model schema
- Check CORS settings don't block webhooks

---

## 🎉 You're All Set!

Your Clerk users and MongoDB are now automatically synced via webhooks. Every time a user signs up, updates their profile, or is deleted, your MongoDB database will be updated automatically.

**Benefits:**
- ✅ Automatic user synchronization
- ✅ No manual user creation needed
- ✅ Profile updates reflected in MongoDB
- ✅ User deletion handled gracefully
- ✅ Role updates synced between systems
