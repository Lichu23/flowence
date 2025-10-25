# Flowence Deployment Guide

Complete step-by-step guide to deploy Flowence backend and frontend to production.

## Prerequisites

Before deploying, ensure you have:
- ✅ Git repository with all code committed
- ✅ Supabase account and project set up
- ✅ Resend account for emails (optional but recommended)
- ✅ Stripe account for payments (optional)
- ✅ Node.js 18+ installed locally

---

## Part 1: Backend Deployment (Railway/Render)

### Option A: Deploy to Railway (Recommended)

#### Step 1: Prepare Backend for Deployment

1. **Check your `.env` file has all required variables:**
```bash
cd server
cat .env
```

Required variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `FRONTEND_URL` (will be your Vercel URL)

2. **Test build locally:**
```bash
cd server
npm run build
npm start
```

If successful, you should see: `Server running on port 3002`

#### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `flowence` repository
   - Railway will auto-detect it's a Node.js project

3. **Configure Build Settings:**
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: `3002` (or Railway will auto-assign)

4. **Add Environment Variables:**
   Click "Variables" tab and add:
   ```
   NODE_ENV=production
   PORT=3002
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_strong_random_secret_here
   JWT_EXPIRES_IN=30m
   REFRESH_TOKEN_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   RESEND_FROM_NAME=Flowence
   ENABLE_EMAIL_INVITES=true
   ENABLE_STRIPE_PAYMENTS=false
   ENABLE_BARCODE_SCANNER=true
   ENABLE_PWA=true
   ```

   **Important:** Leave `FRONTEND_URL` and `CORS_ORIGIN` empty for now. We'll add them after deploying the frontend.

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Railway will provide a URL like: `https://flowence-backend-production.up.railway.app`

6. **Test Backend:**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```
   Should return: `{"status":"ok"}`

#### Step 3: Update Backend Environment Variables

After frontend deployment (we'll do this later):
1. Go back to Railway dashboard
2. Add these variables:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
3. Redeploy the backend

---

### Option B: Deploy to Render

#### Step 1: Prepare Backend

Same as Railway Step 1 above.

#### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign in with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `flowence` repo

3. **Configure Service:**
   - Name: `flowence-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free (or paid for better performance)

4. **Add Environment Variables:**
   Same as Railway Step 2 above (in "Environment" tab)

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (3-7 minutes)
   - Render will provide a URL like: `https://flowence-backend.onrender.com`

6. **Test Backend:**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Create production environment file:**
```bash
cd flowence-client
```

Create `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

**Important:** Replace `your-backend-url.railway.app` with your actual backend URL from Part 1.

2. **Test build locally:**
```bash
npm run build
npm start
```

Visit `http://localhost:3000` and verify it works.

### Step 2: Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import your `flowence` repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure Project:**
   - Framework Preset: `Next.js`
   - Root Directory: `flowence-client`
   - Build Command: `npm run build` (remove --turbopack for production)
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   In "Environment Variables" section:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build (3-5 minutes)
   - Vercel will provide a URL like: `https://flowence.vercel.app`

6. **Test Frontend:**
   - Visit your Vercel URL
   - Try to register/login
   - Check if API calls work

### Step 3: Update Backend CORS Settings

Now that frontend is deployed, update backend environment variables:

**On Railway/Render:**
1. Go to your backend service
2. Add/Update these variables:
   ```
   FRONTEND_URL=https://flowence.vercel.app
   CORS_ORIGIN=https://flowence.vercel.app
   ```
3. Redeploy the backend service

### Step 4: Configure Custom Domain (Optional)

**For Frontend (Vercel):**
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `app.flowence.com`)
3. Follow Vercel's DNS configuration instructions

**For Backend (Railway):**
1. Go to Settings → Domains
2. Add custom domain (e.g., `api.flowence.com`)
3. Update DNS records as instructed

**Update Environment Variables:**
- Backend: `FRONTEND_URL=https://app.flowence.com`
- Backend: `CORS_ORIGIN=https://app.flowence.com`
- Frontend: `NEXT_PUBLIC_API_URL=https://api.flowence.com`

---

## Part 3: Database Setup (Supabase)

### Step 1: Verify Supabase Tables

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. Select your project
3. Go to "Table Editor"
4. Verify these tables exist:
   - `users`
   - `stores`
   - `user_stores`
   - `products`
   - `sales`
   - `sale_items`
   - `invitations`
   - `stock_movements`

### Step 2: Run Migrations (if needed)

If tables don't exist, run migrations locally:
```bash
cd server
npm run db:migrate
```

Or manually create tables using the SQL scripts in `server/migrations/`.

### Step 3: Enable Row Level Security (RLS)

In Supabase Dashboard → Authentication → Policies:
1. Enable RLS on all tables
2. Add policies for authenticated users
3. Ensure service role can bypass RLS

---

## Part 4: Post-Deployment Checklist

### Backend Health Check
- [ ] `/health` endpoint returns 200 OK
- [ ] `/api/auth/register` accepts new users
- [ ] `/api/auth/login` returns JWT token
- [ ] CORS allows requests from frontend domain
- [ ] Environment variables are set correctly

### Frontend Health Check
- [ ] Homepage loads without errors
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard displays after login
- [ ] API calls reach backend successfully
- [ ] No CORS errors in browser console

### Database Health Check
- [ ] Users can register (creates user in Supabase)
- [ ] Stores can be created
- [ ] Products can be added
- [ ] Sales can be processed
- [ ] Data persists correctly

### Email Service Check (if enabled)
- [ ] Invitation emails are sent
- [ ] Email templates render correctly
- [ ] Links in emails work

### Payment Service Check (if enabled)
- [ ] Stripe checkout works
- [ ] Webhooks are configured
- [ ] Test payments process successfully

---

## Part 5: Monitoring & Maintenance

### Set Up Monitoring

**Railway/Render:**
- Enable logging
- Set up alerts for downtime
- Monitor resource usage

**Vercel:**
- Check Analytics dashboard
- Monitor build times
- Review error logs

**Supabase:**
- Monitor database size
- Check query performance
- Review auth logs

### Regular Maintenance

1. **Weekly:**
   - Check error logs
   - Monitor API response times
   - Review user feedback

2. **Monthly:**
   - Update dependencies
   - Review security alerts
   - Backup database

3. **Quarterly:**
   - Performance optimization
   - Cost analysis
   - Feature planning

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom:** Browser console shows CORS policy errors

**Solution:**
- Verify `CORS_ORIGIN` in backend matches frontend URL exactly
- Check `FRONTEND_URL` is set correctly
- Ensure no trailing slashes in URLs
- Redeploy backend after changes

#### 2. 502 Bad Gateway
**Symptom:** Backend returns 502 error

**Solution:**
- Check backend logs for errors
- Verify environment variables are set
- Ensure Supabase credentials are correct
- Check if backend service is running

#### 3. Build Failures
**Symptom:** Deployment fails during build

**Solution:**
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Test build locally first
- Check Node.js version compatibility

#### 4. Database Connection Issues
**Symptom:** "Could not connect to database" errors

**Solution:**
- Verify Supabase URL and keys
- Check if Supabase project is active
- Ensure service role key has correct permissions
- Test connection with Supabase client

#### 5. Authentication Not Working
**Symptom:** Login/register fails

**Solution:**
- Check JWT_SECRET is set
- Verify Supabase auth is enabled
- Check user table exists
- Review backend auth logs

---

## Environment Variables Reference

### Backend (.env)
```bash
# Required
NODE_ENV=production
PORT=3002
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
JWT_SECRET=your-strong-random-secret-min-32-chars
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app

# Optional
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## Quick Deployment Commands

### First Time Deployment
```bash
# 1. Commit all changes
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Test backend build
cd server
npm run build
npm start

# 3. Test frontend build
cd ../flowence-client
npm run build
npm start

# 4. Deploy via web interfaces (Railway, Vercel)
# Follow steps in Part 1 and Part 2 above
```

### Subsequent Deployments
```bash
# Make changes, then:
git add .
git commit -m "Your changes description"
git push origin main

# Railway/Render/Vercel will auto-deploy
```

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## Security Checklist

Before going live:
- [ ] Change all default secrets and keys
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Enable Supabase RLS policies
- [ ] Use environment variables (never commit secrets)
- [ ] Set up proper CORS restrictions
- [ ] Enable Helmet.js security headers
- [ ] Review and limit API permissions
- [ ] Set up monitoring and alerts

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
