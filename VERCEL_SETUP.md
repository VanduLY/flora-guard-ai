# Vercel Deployment Setup Guide

## Critical: Environment Variables Configuration

Your FloraGuard app uses **Vite** (not Next.js), so environment variables MUST use the `VITE_` prefix to be accessible in the browser.

### Required Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here
```

**Important Notes:**
- ❌ DO NOT use `NEXT_PUBLIC_` prefix (that's for Next.js only)
- ✅ DO use `VITE_` prefix for all frontend-accessible variables
- Make sure to click "Save" after adding each variable
- Redeploy after saving environment variables

### Optional Variables

If you're using an external API for plant analysis:
```
REACT_APP_API_URL=https://your-external-api.onrender.com
```

## Deployment Steps

1. **Set Environment Variables** (see above)
2. **Verify Build Settings:**
   - Build Command: `npm run build` (default is correct)
   - Output Directory: `dist` (default is correct)
   - Install Command: `npm install` (default is correct)

3. **Redeploy:**
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - OR push a new commit to trigger automatic deployment

## Troubleshooting

### Blank Screen or Loading Forever

If you see blank screens after deployment:

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors about `import.meta.env` being undefined
   - Look for 401/403 errors (means env vars are missing)

2. **Verify Environment Variables:**
   - All variables should start with `VITE_`
   - No spaces before or after the `=` sign
   - Values should not have quotes around them in Vercel UI

3. **Check Function Logs:**
   - Go to Vercel → Deployments → Latest → View Function Logs
   - Look for any runtime errors

### Common Issues

**Issue:** "Cannot read property 'VITE_SUPABASE_URL' of undefined"
**Fix:** Environment variables not set in Vercel. Add them and redeploy.

**Issue:** Pages work locally but not on Vercel
**Fix:** You're using `.env` file locally. Vercel needs variables set in dashboard.

**Issue:** Authentication fails on Vercel
**Fix:** Check that Supabase redirect URLs include your Vercel domain:
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add `https://your-app.vercel.app/**` to Redirect URLs

## Verify Deployment

After deployment, test these routes:
- `/` - Landing page
- `/login` - Login page
- `/dashboard` - Should redirect to login if not authenticated
- `/detect` - Plant detection page
- `/care-planner` - Care planner page

All routes should load without infinite spinners or blank screens.

## Getting Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Project ref (from URL) → `VITE_SUPABASE_PROJECT_ID`
