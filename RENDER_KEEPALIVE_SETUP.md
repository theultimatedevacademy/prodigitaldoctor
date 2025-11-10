# Render Keep-Alive Setup Guide

This guide explains how to keep your Render free instance alive using a cron job service.

## Problem

Render's free tier spins down your server after **15 minutes of inactivity**. This causes:

- Slow first request (cold start ~30-60 seconds)
- Potential timeout issues
- Poor user experience

## Solution

Use a free cron job service to ping your health check endpoint every 10 minutes, keeping the server active.

---

## Step 1: Health Check Endpoint ✅

Your backend already has a health check endpoint at:

```
GET https://your-app-name.onrender.com/api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

This endpoint:

- ✅ Returns a simple 200 OK response
- ✅ Bypasses rate limiting (won't get blocked)
- ✅ Minimal server load
- ✅ Fast response time

---

## Step 2: Set Up Cron Job

### Option A: cron-job.org (Recommended)

**Why cron-job.org?**

- ✅ Free forever
- ✅ No account required for basic use
- ✅ Reliable and simple
- ✅ Email notifications on failure

**Setup Steps:**

1. **Go to [cron-job.org](https://cron-job.org)**

2. **Create a free account** (optional but recommended for monitoring)

3. **Click "Create Cronjob"**

4. **Configure the job:**

   **Title:**

   ```
   Ocura360 Keep-Alive
   ```

   **URL:**

   ```
   https://your-app-name.onrender.com/api/health
   ```

   _(Replace `your-app-name` with your actual Render app name)_

   **Schedule:**
   - Select: **Every 10 minutes**
   - Or use cron expression: `*/10 * * * *`

   **Request Method:**
   - Select: **GET**

   **Request Timeout:**
   - Set to: **30 seconds**

   **Expected Response:**
   - HTTP Status Code: **200**

   **Notifications:**
   - Enable: **Email on failure** (if you have an account)

5. **Save and Enable**

6. **Test it:**
   - Click "Execute now" to test immediately
   - Check execution history to verify it works

---

### Option B: UptimeRobot (Alternative)

**Why UptimeRobot?**

- ✅ Free tier includes 50 monitors
- ✅ 5-minute check interval (better than cron-job.org)
- ✅ Status page included
- ✅ Multiple notification channels

**Setup Steps:**

1. **Go to [uptimerobot.com](https://uptimerobot.com)**

2. **Sign up for free account**

3. **Click "Add New Monitor"**

4. **Configure:**

   **Monitor Type:**
   - Select: **HTTP(s)**

   **Friendly Name:**

   ```
   Ocura360 API
   ```

   **URL:**

   ```
   https://your-app-name.onrender.com/api/health
   ```

   **Monitoring Interval:**
   - Select: **Every 5 minutes** (free tier)

   **Monitor Timeout:**
   - Set to: **30 seconds**

   **Alert Contacts:**
   - Add your email for downtime alerts

5. **Create Monitor**

---

### Option C: Easycron (Alternative)

**Setup Steps:**

1. **Go to [easycron.com](https://www.easycron.com)**

2. **Sign up for free account**

3. **Create new cron job:**

   **URL:**

   ```
   https://your-app-name.onrender.com/api/health
   ```

   **Cron Expression:**

   ```
   */10 * * * *
   ```

   _(Every 10 minutes)_

   **HTTP Method:**
   - Select: **GET**

4. **Save and enable**

---

## Step 3: Verify It's Working

### Check Render Logs

1. Go to your Render dashboard
2. Open your service
3. Click "Logs" tab
4. You should see health check requests every 10 minutes:

```
INFO: Incoming request { method: 'GET', path: '/api/health', ip: '...' }
```

### Check Cron Service

- **cron-job.org:** Check "Execution History" tab
- **UptimeRobot:** Check monitor status and uptime percentage
- **Easycron:** Check execution logs

### Expected Behavior

- ✅ Server never spins down
- ✅ Fast response times for all users
- ✅ No cold starts
- ✅ 99%+ uptime

---

## Cron Job Configuration Summary

| Setting              | Value                                           |
| -------------------- | ----------------------------------------------- |
| **URL**              | `https://your-app-name.onrender.com/api/health` |
| **Method**           | GET                                             |
| **Interval**         | Every 10 minutes (`*/10 * * * *`)               |
| **Timeout**          | 30 seconds                                      |
| **Expected Status**  | 200 OK                                          |
| **Retry on Failure** | Yes (2-3 retries)                               |

---

## Copy-Paste Configurations

### For cron-job.org

```
Title: Ocura360 Keep-Alive
URL: https://your-app-name.onrender.com/api/health
Schedule: */10 * * * *
Method: GET
Timeout: 30s
Expected Status: 200
```

### For UptimeRobot

```
Monitor Type: HTTP(s)
Friendly Name: Ocura360 API
URL: https://your-app-name.onrender.com/api/health
Interval: 5 minutes
Timeout: 30 seconds
```

### For curl (if you want to test manually)

```bash
curl -X GET https://your-app-name.onrender.com/api/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## Cost Analysis

| Service          | Free Tier   | Interval | Requests/Day | Requests/Month |
| ---------------- | ----------- | -------- | ------------ | -------------- |
| **cron-job.org** | Unlimited   | 10 min   | 144          | ~4,320         |
| **UptimeRobot**  | 50 monitors | 5 min    | 288          | ~8,640         |
| **Easycron**     | 100 tasks   | 10 min   | 144          | ~4,320         |

All options are **100% free** and sufficient for keeping Render alive.

---

## Troubleshooting

### Problem: Cron job fails with timeout

**Solution:**

- Increase timeout to 60 seconds
- Check if Render instance is actually running
- Verify URL is correct (no typos)

### Problem: Server still spins down

**Solution:**

- Verify cron job is enabled and running
- Check execution history for failures
- Ensure interval is less than 15 minutes
- Try reducing interval to 5 minutes (UptimeRobot)

### Problem: Too many requests / rate limiting

**Solution:**

- The `/api/health` endpoint bypasses rate limiting
- If issues persist, increase interval to 14 minutes

### Problem: Render shows "Service Unavailable"

**Solution:**

- This is expected during cold start (first 30-60 seconds)
- Cron job will retry automatically
- Once warmed up, subsequent requests will be fast

---

## Best Practices

1. **Use 10-minute interval** - Balances server uptime with request volume
2. **Enable failure notifications** - Get alerted if server goes down
3. **Monitor uptime percentage** - Should be 99%+ after setup
4. **Test after deployment** - Verify health check works after each deploy
5. **Use UptimeRobot for production** - Better monitoring and 5-min interval

---

## Alternative: Upgrade to Render Paid Plan

If you need guaranteed uptime without workarounds:

- **Render Starter Plan:** $7/month
  - No spin-down
  - Better performance
  - More resources

**When to upgrade:**

- Production app with paying customers
- Need guaranteed uptime SLA
- High traffic volume
- Want to avoid cold starts completely

---

## Summary

✅ **Health check endpoint created:** `/api/health`  
✅ **Returns simple OK response**  
✅ **Bypasses rate limiting**  
✅ **Ready for cron job setup**

**Next Steps:**

1. Get your Render app URL
2. Sign up for cron-job.org or UptimeRobot
3. Create cron job with the URL above
4. Verify it's working in logs
5. Enjoy 24/7 uptime! 🎉

---

## Your Render App URL

Replace `your-app-name` with your actual Render service name:

```
https://your-app-name.onrender.com/api/health
```

To find your Render app name:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service
3. Copy the URL from the top (e.g., `https://ocura360-api.onrender.com`)

---

**Questions?** Contact: hello@ocura360.com
