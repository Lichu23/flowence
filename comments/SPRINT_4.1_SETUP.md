# Sprint 4.1: Store Configuration - Setup Guide

## Overview
Sprint 4.1 adds comprehensive store configuration capabilities including:
- General settings (name, address, phone, currency, tax rate)
- Regional settings (timezone, date/time formats)
- Appearance customization (logo)
- Receipt customization (header/footer text)

## Database Migration

### Step 1: Run the Migration
Execute the migration to add new columns to the stores table:

```bash
# Navigate to server directory
cd server

# Run the migration using Supabase CLI or your preferred method
# If using Supabase CLI:
supabase db push

# Or manually execute the SQL file:
# Connect to your database and run:
# server/src/database/migrations/014_add_store_settings.sql
```

### Step 2: Verify Migration
Check that the following columns were added to the `stores` table:
- `timezone` (VARCHAR(100), default 'UTC')
- `date_format` (VARCHAR(50), default 'MM/DD/YYYY')
- `time_format` (VARCHAR(20), default '12h')
- `receipt_header` (TEXT)
- `receipt_footer` (TEXT)
- `logo_url` (TEXT)
  
Notes: `primary_color`, `secondary_color`, and a store-level `low_stock_threshold` may exist in the DB for legacy/backward compatibility, but they are not exposed for editing in this sprint.

## Testing the Feature

### 1. Start the Backend Server
```bash
cd server
npm run dev
```

### 2. Start the Frontend
```bash
cd flowence-client
npm run dev
```

### 3. Access Store Settings
1. Log in as a store owner
2. Navigate to "Mis Tiendas" (Stores page)
3. Click the "Configuración" (Settings) button on any store card
4. You should see three tabs:
   - **General**: Basic store info, currency, tax, timezone
   - **Appearance**: Logo
   - **Receipt**: Custom receipt header/footer with preview

### 4. Test Functionality
- Update store name, address, and phone
- Change currency and tax rate
- Set timezone and date/time formats
- Add a logo URL (test with a valid image URL)
- Add receipt header and footer text
- Verify the receipt preview updates in real-time
- Save settings and verify they persist after page reload

Additionally verify app-wide formatting and logo usage:
- Stores grid shows each store `logo_url` if present
- POS header shows current store `logo_url`
- POS totals and change use selected store currency
- Sales table uses store timezone/date/time format and currency
- Products page prices and totals use store currency
- Dashboard cards (Revenue, Inventory Value) use store currency

## Features Implemented

### ✅ General Settings Tab
- Store name (required)
- Address (optional)
- Phone (optional)
- Currency selection (USD, EUR, GBP, JPY, CAD, AUD, MXN)
- Tax rate (percentage)
- Timezone selection (major timezones)
- Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time format (12h/24h)

### ✅ Appearance Tab
- Logo URL input with preview

### ✅ Receipt Tab
- Receipt header text
- Receipt footer text
- Live receipt preview showing:
  - Store name and contact info
  - Sample transaction
  - Tax calculation
  - Custom header/footer

### ✅ Global Formatting & Logo
- Global Settings provider wires currency, timezone, date/time across pages
- Stores grid and POS header display store logos where available

## API Endpoints

### GET /api/stores/:id
Returns store details including all new settings fields.

### PUT /api/stores/:id
Updates store settings. Accepts all fields from the UpdateStoreData interface.

**Example Request:**
```json
{
  "name": "My Store",
  "address": "123 Main St",
  "phone": "+1234567890",
  "currency": "USD",
  "tax_rate": 8.5,
  "timezone": "America/New_York",
  "date_format": "MM/DD/YYYY",
  "time_format": "12h",
  "receipt_header": "Welcome to our store!",
  "receipt_footer": "Thank you for your purchase!",
  "logo_url": "https://example.com/logo.png"
}
```

## File Changes

### Backend
- `server/src/database/migrations/014_add_store_settings.sql` - New migration
- `server/src/types/store.ts` - Updated Store and UpdateStoreData interfaces
- `server/src/controllers/StoreController.ts` - Updated updateStore method
- `server/src/models/StoreModel.ts` - No changes needed (uses generic update)

### Frontend
- `flowence-client/src/types/index.ts` - Updated types (added `Sale`), removed colors from updates
- `flowence-client/src/contexts/SettingsContext.tsx` - New global settings provider and formatters
- `flowence-client/src/app/layout.tsx` - Wrapped app with `SettingsProvider`
- `flowence-client/src/app/stores/[id]/settings/page.tsx` - Settings page with live preview
- `flowence-client/src/app/stores/page.tsx` - Store cards show logo and settings link
- `flowence-client/src/app/pos/page.tsx` - POS header shows logo; currency formatting applied
- `flowence-client/src/app/products/page.tsx` - Currency formatting applied
- `flowence-client/src/app/sales/page.tsx` - Currency and date/time formatting applied, typed `Sale`
- `flowence-client/src/app/dashboard/page.tsx` - Currency formatting applied
- `flowence-client/next.config.js` - Remote images config (for Next.js Image if adopted)

## Security & Permissions
- Only store owners can access the settings page
- Employees attempting to access will see an access denied message
- All updates are validated on the backend
- User authentication is required for all API calls

## Next Steps (Sprint 4.2)
- Responsive design improvements
- Loading states and animations
- Enhanced error handling
- Dashboard with multi-store overview
- Help documentation

## Completion Checklist (Sprint 4.1)
- [ ] Can update General settings and persist after reload
- [ ] Receipt preview reflects timezone/date/time and currency
- [ ] Stores grid shows logos; POS header shows logo
- [ ] POS totals/change show correct currency
- [ ] Sales table shows formatted date/time and currency
- [ ] Products/Dashboard values use store currency
- [ ] Sales types are strongly typed (`Sale` interface)

## Troubleshooting

### Migration Issues
If the migration fails:
1. Check database connection
2. Verify you have ALTER TABLE permissions
3. Check if columns already exist
4. Review Supabase logs for detailed errors

### Settings Not Saving
1. Check browser console for API errors
2. Verify backend server is running
3. Check that you're logged in as a store owner
4. Verify the store ID in the URL is correct

### Preview Not Updating
1. Ensure form data is being updated (check React DevTools)
2. Verify state management is working
3. Check for JavaScript errors in console

## Notes
- Logo upload functionality uses URL input (file upload can be added later)
- Color pickers work in all modern browsers
- Receipt preview is a visual representation only
- Actual receipt generation will use these settings in the POS system
