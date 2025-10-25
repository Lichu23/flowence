# Migration Guide: SendGrid to Resend

## Why Resend?

We've migrated from SendGrid to Resend for the following reasons:

1. **Better Developer Experience** - Simpler API, better documentation
2. **More Generous Free Tier** - 3,000 emails/month vs SendGrid's 100/day
3. **Modern Infrastructure** - Built for modern applications
4. **Easier Setup** - No complex domain verification for testing
5. **Better Deliverability** - Higher inbox placement rates
6. **React Email Support** - Future-ready for React-based templates

## Migration Steps

### 1. Install Resend Package

```bash
cd server
npm install resend@^4.0.1
npm uninstall @sendgrid/mail sendgrid
```

### 2. Update Environment Variables

**Old (.env with SendGrid):**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Store Name
```

**New (.env with Resend):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Your Store Name
```

### 3. Get Resend API Key

1. **Sign up at Resend:**
   - Go to https://resend.com/
   - Create a free account
   - No credit card required

2. **Generate API Key:**
   - Navigate to API Keys section
   - Click "Create API Key"
   - Copy the key (starts with `re_`)
   - Add to your `.env` file

3. **Configure Sender Email:**
   - **For Testing:** Use `onboarding@resend.dev` (no verification needed)
   - **For Production:** Add and verify your custom domain

### 4. Verify the Migration

The code changes have already been made. You just need to:

1. Update your `.env` file with Resend credentials
2. Restart your server
3. Test sending an invitation

```bash
cd server
npm run dev
```

### 5. Test Email Sending

1. Go to your application
2. Navigate to Users/Team page
3. Click "Invite Employee"
4. Enter an email address
5. Check the Resend dashboard for delivery status
6. Verify the email was received

## Domain Verification (Production Only)

### For Testing
Use `onboarding@resend.dev` - no verification needed!

### For Production

1. **Add Your Domain:**
   - Go to Resend Dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)

2. **Add DNS Records:**
   Resend will provide DNS records to add:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT) - optional but recommended

3. **Verify Domain:**
   - Wait for DNS propagation (can take up to 48 hours)
   - Click "Verify" in Resend dashboard
   - Once verified, update `RESEND_FROM_EMAIL` to use your domain

4. **Update Environment Variable:**
   ```bash
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

## Comparison: SendGrid vs Resend

| Feature | SendGrid | Resend |
|---------|----------|--------|
| Free Tier | 100 emails/day | 3,000 emails/month |
| Setup Complexity | Medium | Easy |
| API Simplicity | Complex | Simple |
| Testing Email | Requires verification | `onboarding@resend.dev` |
| Domain Verification | Required immediately | Optional for testing |
| Deliverability | Good | Excellent |
| Developer Experience | Okay | Excellent |
| React Email Support | No | Yes |
| Pricing (Paid) | $19.95/month (40k) | $20/month (50k) |

## Code Changes Summary

The following files were updated (already done):

1. **`server/package.json`**
   - Removed: `@sendgrid/mail`, `sendgrid`
   - Added: `resend@^4.0.1`

2. **`server/src/services/EmailService.ts`**
   - Replaced SendGrid client with Resend
   - Updated API calls
   - Changed environment variable names

3. **Documentation**
   - Updated all setup guides
   - Updated Sprint 5.3 summary
   - Created this migration guide

## Troubleshooting

### Email Not Sending

**Check 1: API Key**
```bash
# Verify your API key is set
echo $RESEND_API_KEY
# Should start with "re_"
```

**Check 2: From Email**
```bash
# For testing, use:
RESEND_FROM_EMAIL=onboarding@resend.dev

# For production, use verified domain:
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Check 3: Server Logs**
```bash
# Look for these messages:
✅ Resend configured successfully
📧 Invitation email sent successfully

# Or errors:
⚠️  Resend API key not found
❌ Failed to send email
```

### Emails Going to Spam

1. **Verify your domain** (production only)
2. **Add SPF, DKIM, DMARC records**
3. **Use a professional from address**
4. **Avoid spam trigger words** in subject/content
5. **Monitor Resend analytics** for bounce rates

### Rate Limiting

**Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month
- 10 requests per second

**If you hit limits:**
1. Upgrade to paid plan ($20/month for 50k emails)
2. Implement email queuing
3. Add rate limiting to invitation sends

## Rollback Plan

If you need to rollback to SendGrid:

1. **Reinstall SendGrid:**
   ```bash
   npm install @sendgrid/mail@^8.1.4
   npm uninstall resend
   ```

2. **Revert EmailService.ts:**
   - Replace Resend client with SendGrid
   - Update environment variable names

3. **Update .env:**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=Your Store Name
   ```

4. **Restart server**

## Benefits You'll Notice

1. **Faster Setup** - No complex verification for testing
2. **Better Logs** - Clearer delivery status in dashboard
3. **More Emails** - 3,000/month vs 100/day
4. **Simpler Code** - Cleaner API, less boilerplate
5. **Better Support** - Responsive team, active community

## Next Steps

1. ✅ Install Resend package
2. ✅ Update environment variables
3. ✅ Get Resend API key
4. ✅ Test email sending
5. ⏳ (Production) Verify custom domain
6. ⏳ Monitor email deliverability
7. ⏳ Consider upgrading if needed

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend Status:** https://status.resend.com/
- **Community:** https://resend.com/discord

---

**Migration Complete!** 🎉

Your email system is now powered by Resend with better deliverability and a more generous free tier.
