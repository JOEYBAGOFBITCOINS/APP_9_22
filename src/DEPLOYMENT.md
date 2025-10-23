# FuelTrakr Production Deployment Guide

## Current Status
✅ Code is production-ready
✅ Console logging removed from production builds
✅ Demo mode disabled by default in production
✅ Domain validation ready to enable (currently disabled)
✅ Secure defaults configured for all environment variables

## 🚀 Pre-Launch Checklist

### 1. Vercel Environment Variables
Set these environment variables in your Vercel project settings:

**Required for Production:**
```
VITE_DEMO_MODE=false
VITE_SKIP_AUTH=false
VITE_AUTO_LOGIN=false
```

**Security Settings:**
```
VITE_REQUIRE_NAPLETON_EMAIL=true   # Enable domain restriction
```

**Optional (already have secure defaults):**
```
VITE_DEBUG_MODE=false
VITE_CONSOLE_LOGGING=false
VITE_DEFAULT_USER_ROLE=porter
```

### 2. Enable Email Domain Restriction
When ready to restrict signups to @napleton.com only:

**Backend (Supabase Edge Function):**
- Navigate to `/supabase/functions/server/index.tsx`
- Change line 8 from:
  ```typescript
  const ENFORCE_NAPLETON_DOMAIN = false;
  ```
  to:
  ```typescript
  const ENFORCE_NAPLETON_DOMAIN = true;
  ```
- Redeploy the edge function to Supabase

**Frontend:**
- Set the Vercel environment variable:
  ```
  VITE_REQUIRE_NAPLETON_EMAIL=true
  ```
- Redeploy the frontend

### 3. Test User Accounts
Two demo accounts are automatically created on first deployment:

**Admin Account:**
- Email: `admin@napleton.com`
- Password: `admin123`
- Role: Admin (can view all entries, export CSV)

**Porter Account:**
- Email: `porter@napleton.com`
- Password: `porter123`
- Role: Porter (can submit fuel entries)

**IMPORTANT:** Change these passwords in production by:
1. Signing in with the accounts
2. Using Supabase Auth Dashboard to update passwords
3. Or create new admin/porter accounts and delete the demo ones

### 4. Supabase Configuration
Ensure these are configured in your Supabase project:

**Authentication:**
- Email provider enabled
- Email confirmation OFF (set to auto-confirm via backend)
- Sign-ups allowed

**Storage:**
- Bucket `make-218dc5b7-fueltrakr-photos` is auto-created on first deployment
- Private bucket (signed URLs generated for 7-day access)

**Edge Functions:**
- Deploy `/supabase/functions/server/index.tsx` to `make-server-218dc5b7` function
- Ensure environment variables are set in Supabase dashboard

### 5. Security Considerations

**Current Security Features:**
- ✅ CORS headers configured
- ✅ XSS protection enabled
- ✅ Content Security Policy headers
- ✅ Frame protection (X-Frame-Options: DENY)
- ✅ HTTPS enforced (Vercel default)
- ✅ Private photo storage with signed URLs
- ✅ Authentication required for all sensitive endpoints
- ✅ Role-based access control (Admin vs Porter)

**To Enable Before Launch:**
- [ ] Email domain restriction (see step 2)
- [ ] Change default demo passwords
- [ ] Review user access in Supabase Dashboard

### 6. Pre-Launch Testing

**Test these features:**
1. Sign up with @napleton.com email (when domain restriction enabled)
2. Sign in as admin@napleton.com
3. Sign in as porter@napleton.com
4. Submit a fuel entry with receipt photo
5. Submit a fuel entry with VIN photo
6. Verify VIN decoding works (uses NHTSA API)
7. View entries in Admin Panel
8. Export CSV from Admin Panel
9. Test camera permissions on mobile device
10. Test photo uploads on mobile device

### 7. Known Configuration

**Demo Mode:**
- Disabled in production (requires environment variable to enable)
- When disabled, requires real Supabase authentication
- Demo credentials won't work when disabled

**Splash Screen:**
- 10-second loading animation (by design)
- Shows FuelTrakr branding

**GPS Location:**
- Completely removed for employee privacy

**Features Enabled:**
- ✅ Camera for receipt photos
- ✅ Camera for VIN photos
- ✅ VIN decoder (NHTSA API)
- ✅ Photo storage (Supabase Storage)
- ✅ CSV export
- ✅ Daily reporting
- ✅ Stock number tracking
- ✅ Mileage tracking
- ✅ Fuel price/gallons tracking

## 📱 Deployment Steps

### Step 1: Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables (see section 1)
4. Deploy

### Step 2: Deploy Supabase Edge Function
1. Install Supabase CLI: `npm install -g supabase`
2. Link project: `supabase link --project-ref YOUR_PROJECT_ID`
3. Deploy function: `supabase functions deploy make-server-218dc5b7`

### Step 3: Enable Domain Restriction (when ready)
1. Update `/supabase/functions/server/index.tsx` line 8
2. Set `VITE_REQUIRE_NAPLETON_EMAIL=true` in Vercel
3. Redeploy both frontend and backend

### Step 4: Test Production
1. Visit your Vercel URL
2. Create a test account with @napleton.com email
3. Submit test fuel entries
4. Verify admin panel access
5. Test CSV export

## 🎯 Launch!

Once all checklist items are complete, your app is ready for production use.

**Live URL:** https://escape-plan-two.vercel.app/

**Post-Launch:**
- Monitor Vercel Analytics for errors
- Check Supabase logs for backend issues
- Gather user feedback
- Plan feature updates

## 🔧 Troubleshooting

**"Demo mode enabled" error:**
- Set `VITE_DEMO_MODE=false` in Vercel environment variables

**"Only Napleton emails allowed" error:**
- This is expected when domain restriction is enabled
- Only @napleton.com emails can sign up

**"Invalid login credentials":**
- User may not exist in database
- Check Supabase Auth Dashboard
- Verify email/password are correct

**Photos not uploading:**
- Check Supabase Storage bucket exists
- Verify edge function is deployed
- Check browser console for errors

**VIN decoder not working:**
- NHTSA API may be down (external service)
- VIN must be 17 characters
- Check Supabase function logs
