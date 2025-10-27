# Quick Deployment Guide - TL;DR

Fast track deployment for experienced developers.

## Prerequisites
- Git repo ready
- Supabase project set up
- Resend API key (optional)
- Stripe keys (optional)

---

## 🚀 Step-by-Step (30 minutes)

### 1. Test Builds Locally (5 min)

```bash
# Backend
cd server
npm install
npm run build
npm start
# Should see: "Server running on port 3002"
# Ctrl+C to stop

# Frontend
cd ../flowence-client
npm install
npm run build
npm start
# Should see: "Ready on http://localhost:3000"
# Ctrl+C to stop
```

### 2. Deploy Backend to Railway (10 min)

1. Go to https://railway.app
2. New Project → Deploy from GitHub → Select `flowence` repo
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Add Environment Variables (copy from `.env`):
   ```
   NODE_ENV=production
   PORT=3002
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   JWT_SECRET=your_secret_min_32_chars
   RESEND_API_KEY=your_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   RESEND_FROM_NAME=Flowence
   ```
5. Deploy → Wait 3-5 minutes
6. Copy your Railway URL: `https://xxx.railway.app`

### 3. Deploy Frontend to Vercel (10 min)

1. Go to https://vercel.com
2. New Project → Import `flowence` repo
3. Settings:
   - Root Directory: `flowence-client`
   - Framework: Next.js
   - Build Command: `npm run build`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```
5. Deploy → Wait 3-5 minutes
6. Copy your Vercel URL: `https://xxx.vercel.app`

### 4. Update Backend CORS (5 min)

1. Go back to Railway dashboard
2. Add these variables:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   ```
3. Redeploy (automatic)

### 5. Test Production (5 min)

1. Visit your Vercel URL
2. Register a new user
3. Create a store
4. Add a product
5. Process a sale
6. ✅ Done!

---

## 🔧 Alternative: Deploy to Render + Vercel

### Backend to Render
1. https://render.com → New Web Service
2. Connect GitHub → Select `flowence`
3. Root: `server`, Build: `npm install && npm run build`, Start: `npm start`
4. Add same environment variables as Railway
5. Deploy

### Frontend to Vercel
Same as above

---

## 📋 Environment Variables Quick Reference

### Backend (Railway/Render)
```bash
NODE_ENV=production
PORT=3002
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
JWT_SECRET=your-strong-secret-min-32-characters
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Flowence
ENABLE_EMAIL_INVITES=true
ENABLE_STRIPE_PAYMENTS=false
ENABLE_BARCODE_SCANNER=true
ENABLE_PWA=true
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 🐛 Common Issues

### CORS Error
- Check `CORS_ORIGIN` matches frontend URL exactly
- No trailing slashes
- Redeploy backend after changes

### 502 Bad Gateway
- Check backend logs
- Verify all environment variables are set
- Test Supabase connection

### Build Fails
- Check Node.js version (18+)
- Run `npm install` locally first
- Check build logs for specific errors

---

## 📞 Quick Links

- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com
- Supabase: https://supabase.com/dashboard

---

## ✅ Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] User registration works
- [ ] Login works
- [ ] Can create store
- [ ] Can add products
- [ ] Can process sales
- [ ] No CORS errors in console

---

**Estimated Total Time:** 30-45 minutes

For detailed instructions, see `DEPLOYMENT_GUIDE.md`
