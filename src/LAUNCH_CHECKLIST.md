# 🚀 FuelTrakr Launch Checklist

## Pre-Launch Steps

### ✅ Step 1: Set Vercel Environment Variables
Go to your Vercel project → Settings → Environment Variables and add:

```
VITE_DEMO_MODE=false
VITE_SKIP_AUTH=false
VITE_AUTO_LOGIN=false
VITE_REQUIRE_NAPLETON_EMAIL=false
```

**Note:** Start with `VITE_REQUIRE_NAPLETON_EMAIL=false` for initial testing, then change to `true` when ready to restrict signups.

### ✅ Step 2: Enable Domain Restriction (when ready)

**When you're ready to restrict signups to @napleton.com only:**

1. **Update Supabase Edge Function:**
   - Open `/supabase/functions/server/index.tsx`
   - Change line 8: `const ENFORCE_NAPLETON_DOMAIN = false;` → `const ENFORCE_NAPLETON_DOMAIN = true;`
   - Redeploy edge function: `supabase functions deploy make-server-218dc5b7`

2. **Update Vercel:**
   - Change environment variable to: `VITE_REQUIRE_NAPLETON_EMAIL=true`
   - Redeploy frontend

### ✅ Step 3: Test Production

**Test Accounts:**
- Admin: `admin@napleton.com` / `admin123`
- Porter: `porter@napleton.com` / `porter123`

**Test These Features:**
- [ ] Sign in as admin
- [ ] Sign in as porter
- [ ] Submit fuel entry with receipt photo
- [ ] Submit fuel entry with VIN photo
- [ ] VIN decoder works (17-character VIN)
- [ ] View all entries in Admin Panel
- [ ] Export CSV from Admin Panel
- [ ] Camera works on mobile device
- [ ] Photos upload successfully

### ✅ Step 4: Security Review

- [ ] Change demo account passwords in Supabase Auth Dashboard
- [ ] Verify domain restriction is enabled (if desired)
- [ ] Review user list in Supabase Dashboard
- [ ] Confirm private photo storage is working

### ✅ Step 5: Launch!

- [ ] All tests passing
- [ ] Security configured
- [ ] Team has been notified
- [ ] Launch! 🎉

## Current Status

**Your app is currently:**
- ✅ Deployed at: https://escape-plan-two.vercel.app/
- ✅ Code is production-ready
- ✅ Console logs removed
- ✅ Secure defaults configured
- ⚠️ Demo mode will be OFF in production (need to set environment variables)
- ⚠️ Domain restriction is READY but currently DISABLED

## Quick Links

- **Live App:** https://escape-plan-two.vercel.app/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard

## Need Help?

See `DEPLOYMENT.md` for detailed deployment instructions and troubleshooting.
