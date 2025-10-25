# Sprint 5.3 Setup Guide

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

This will install:
- `bwip-js` - Barcode generation
- `resend` - Email service

**Frontend:**
No new dependencies needed (uses existing components)

### 2. Environment Configuration

Add to `server/.env`:

```bash
# Resend Configuration (Optional but recommended)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Flowence

# Frontend URL for invitation links
FRONTEND_URL=http://localhost:3000
```

### 3. Resend Setup (Optional)

If you want email invitations to work:

1. **Create Resend Account:**
   - Go to https://resend.com/
   - Sign up for free account (100 emails/day free, 3,000/month)

2. **Generate API Key:**
   - Navigate to API Keys section
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Verify Domain (Optional):**
   - For production, add your domain
   - For testing, use `onboarding@resend.dev`
   - Follow DNS verification steps if using custom domain

4. **Test Email:**
   ```bash
   # Send a test invitation from the app
   # Check Resend dashboard for delivery status
   ```

### 4. Testing the Features

#### Test Barcode on Receipts

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd flowence-client
   npm run dev
   ```

3. Create a sale through the POS
4. Go to Sales page
5. Click "PDF" to download receipt
6. Open PDF and verify barcode is visible

#### Test Barcode Scanner

1. On Sales page, click "📷 Escanear" button
2. Allow camera permissions
3. Point camera at receipt barcode
4. Should auto-navigate to sale details

#### Test Manual Search

1. On Sales page, enter receipt number in search box
2. Click "Buscar" or press Enter
3. Should navigate to sale details

#### Test Email Invitations

1. Configure Resend (see above)
2. Go to Users page
3. Click "Invite Employee"
4. Enter email and submit
5. Check recipient's inbox
6. Verify email looks professional
7. Click invitation link
8. Complete registration

## Feature Flags

The system works with or without Resend:

**With Resend:**
- ✅ Emails sent automatically
- ✅ Professional templates
- ✅ Delivery tracking
- ✅ Better deliverability

**Without Resend:**
- ⚠️ Emails not sent
- ✅ Invitation URLs still generated
- ✅ URLs can be shared manually
- ✅ Console shows what would be sent

## Troubleshooting

### Barcode Not Showing on PDF

**Problem:** PDF downloads but no barcode visible

**Solutions:**
1. Check server logs for barcode generation errors
2. Verify `bwip-js` is installed: `npm list bwip-js`
3. Check PDF viewer supports images
4. Try different PDF viewer

### Scanner Not Working

**Problem:** Camera doesn't start or barcode not detected

**Solutions:**
1. Ensure HTTPS in production (camera requires secure context)
2. Check browser camera permissions
3. Try different browser (Chrome recommended)
4. Ensure good lighting and focus
5. Check console for QuaggaJS errors

### Email Not Received

**Problem:** Invitation email not arriving

**Solutions:**
1. Verify Resend API key is correct
2. Check Resend dashboard for delivery status
3. Look in spam/junk folder
4. Verify sender email/domain is configured
5. Check server logs for email errors
6. Ensure `RESEND_FROM_EMAIL` is valid

### Search Not Finding Sales

**Problem:** Search returns "Sale not found"

**Solutions:**
1. Verify receipt number is correct
2. Check if sale belongs to current store
3. Ensure user has permission to view sale
4. Check server logs for errors
5. Verify sale exists in database

## Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
# Required
DATABASE_URL=your_production_db
JWT_SECRET=your_production_secret
FRONTEND_URL=https://yourdomain.com

# Optional but recommended
RESEND_API_KEY=re_production_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your Store Name
```

### HTTPS Requirement

⚠️ **Important:** Barcode scanner requires HTTPS in production
- Camera API only works on secure origins
- Use SSL certificate (Let's Encrypt recommended)
- Configure reverse proxy (Nginx/Apache)

### Resend Production

For production email sending:
1. Upgrade Resend plan if needed (>3,000 emails/month)
2. Add and verify your custom domain
3. Set up domain authentication (SPF/DKIM)
4. Configure webhook for delivery tracking
5. Monitor email reputation and deliverability

## Security Checklist

- [x] Barcode data (sale ID) is not sensitive
- [x] Invitation tokens are cryptographically secure
- [x] Email invitations expire after 7 days
- [x] Role-based access on all endpoints
- [x] HTTPS required for camera access
- [x] Resend API key stored in environment variables
- [x] No sensitive data in email templates

## Performance Optimization

### Barcode Generation
- Cached barcode images (future enhancement)
- Async PDF generation
- Minimal impact on response time

### Email Sending
- Non-blocking async operation
- Continues even if email fails
- No impact on invitation creation

### Scanner Performance
- Client-side processing
- No server load
- Optimized for mobile devices

## Monitoring

### Metrics to Track
1. **Barcode Usage:**
   - Number of receipts with barcodes
   - Scanner success rate
   - Search vs manual navigation

2. **Email Delivery:**
   - Resend delivery rate
   - Bounce rate
   - Open rate (if tracking enabled)

3. **Invitation Acceptance:**
   - Time to accept
   - Acceptance rate
   - Expired invitations

### Logs to Monitor
```bash
# Server logs
✅ Invitation created successfully
📧 Invitation email sent successfully
⚠️  Failed to send invitation email

# Scanner logs (browser console)
🔍 Barcode detected: [sale-id]
❌ Scanner error: [error message]
```

## Support

### Common Questions

**Q: Can I use without Resend?**  
A: Yes! Invitation URLs are still generated. Share them manually.

**Q: Does barcode work on all receipt printers?**  
A: Barcodes are in PDF. Print quality depends on printer.

**Q: Can employees scan their own sales?**  
A: Yes, employees can scan any sale in their store.

**Q: How long are invitation links valid?**  
A: 7 days by default. Configurable in code.

**Q: Can I customize email templates?**  
A: Yes, edit `EmailService.ts` templates.

### Getting Help

1. Check server logs for errors
2. Review browser console for client errors
3. Verify environment variables
4. Test with minimal configuration
5. Check Resend dashboard for email issues

## Next Steps

After Sprint 5.3 setup:
1. Test all features thoroughly
2. Configure production environment
3. Set up monitoring
4. Train users on new features
5. Prepare for Sprint 5.4 (Deployment)

---

**Setup Complete!** 🎉

Your Flowence installation now includes:
- ✅ Barcode generation on receipts
- ✅ Barcode scanning for sales
- ✅ Search by ticket number
- ✅ Professional email invitations
