# Pre-Deployment Checklist

Complete this checklist before deploying to production.

## ✅ Code Preparation

- [ ] All code changes committed to Git
- [ ] No console.log statements in production code
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings reviewed and fixed
- [ ] All tests passing locally

## ✅ Environment Variables

### Backend (.env)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `JWT_SECRET` - Strong random secret (min 32 characters)
- [ ] `RESEND_API_KEY` - Resend API key for emails
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (if using payments)

### Frontend (.env.production)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL (will be set after backend deployment)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (if using payments)

## ✅ Database (Supabase)

- [ ] Supabase project created
- [ ] All tables created and migrated
- [ ] Row Level Security (RLS) policies configured
- [ ] Service role has proper permissions
- [ ] Test data cleared (if any)
- [ ] Backup strategy in place

## ✅ Third-Party Services

### Resend (Email Service)
- [ ] Account created at https://resend.com
- [ ] API key generated
- [ ] Domain verified (optional, for custom email domain)
- [ ] Test email sent successfully

### Stripe (Payment Processing) - Optional
- [ ] Account created at https://stripe.com
- [ ] Live mode API keys obtained
- [ ] Webhook endpoint configured
- [ ] Test payment processed successfully

## ✅ Security

- [ ] All secrets are strong and unique
- [ ] No secrets committed to Git
- [ ] `.env` files are in `.gitignore`
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers enabled
- [ ] HTTPS will be enforced in production

## ✅ Build Tests

### Backend Build Test
```bash
cd server
npm install
npm run build
npm start
# Should start without errors
```

### Frontend Build Test
```bash
cd flowence-client
npm install
npm run build
npm start
# Should build and start without errors
```

## ✅ Functionality Tests

- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Store creation works
- [ ] Product CRUD operations work
- [ ] Sales processing works
- [ ] Barcode scanning works (if enabled)
- [ ] Email invitations work (if enabled)
- [ ] Payment processing works (if enabled)

## ✅ Performance

- [ ] Images optimized
- [ ] Bundle size reasonable (< 500KB for frontend)
- [ ] API response times acceptable (< 500ms)
- [ ] Database queries optimized
- [ ] Caching strategy in place

## ✅ Monitoring & Logging

- [ ] Error tracking set up (e.g., Sentry)
- [ ] Logging configured for production
- [ ] Health check endpoint working (`/health`)
- [ ] Uptime monitoring configured

## ✅ Documentation

- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment guide reviewed

## ✅ Backup & Recovery

- [ ] Database backup strategy defined
- [ ] Rollback plan documented
- [ ] Emergency contacts listed

## ✅ Post-Deployment Plan

- [ ] Smoke tests prepared
- [ ] User acceptance testing plan ready
- [ ] Rollback procedure documented
- [ ] Support team notified

---

## Quick Test Commands

### Test Backend Locally
```bash
cd server
npm run build && npm start
curl http://localhost:3002/health
```

### Test Frontend Locally
```bash
cd flowence-client
npm run build && npm start
# Visit http://localhost:3000
```

### Test Full Stack Locally
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd flowence-client && npm run dev

# Visit http://localhost:3000 and test all features
```

---

## Deployment Order

1. ✅ Complete this checklist
2. 🚀 Deploy Backend (Railway/Render)
3. 🚀 Deploy Frontend (Vercel)
4. 🔄 Update Backend CORS with Frontend URL
5. ✅ Run post-deployment tests
6. 📊 Monitor for 24 hours

---

## Emergency Rollback

If deployment fails:

1. **Backend:** Revert to previous deployment in Railway/Render dashboard
2. **Frontend:** Revert to previous deployment in Vercel dashboard
3. **Database:** Restore from backup if schema changed
4. **Notify team:** Alert all stakeholders

---

**Date Completed:** _______________
**Deployed By:** _______________
**Production URLs:**
- Backend: _______________
- Frontend: _______________
