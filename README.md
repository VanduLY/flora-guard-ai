# FloraGuard AI - Plant Disease Detection Platform

An AI-powered web application for detecting plant diseases and providing personalized care recommendations.

## 🌿 Features

- **AI Plant Disease Detection** - Upload or capture plant images for instant AI analysis
- **Care Planner** - Manage your plant collection with personalized schedules
- **Health Monitoring** - Track plant health and recovery progress
- **Scan History** - Access previous scans and results
- **Weather Alerts** - Get weather-based care recommendations
- **Achievement System** - Track your plant care journey

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Animations**: Framer Motion
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend services)
- Modern web browser with camera support (optional, for live scanning)

## 🛠️ Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VanduLY/flora-guard-ai.git
   cd flora-guard-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then fill in your Supabase credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
   ```

   **Get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the URL and anon/public key

4. **Run development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🌐 Vercel Deployment

### Quick Deploy

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables (see below)
4. Deploy

### ⚠️ CRITICAL: Environment Variables for Vercel

**This is a Vite project, NOT Next.js - use `VITE_` prefix, NOT `NEXT_PUBLIC_`**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

After setting variables, **redeploy** the application.

📖 **Detailed deployment guide**: See [VERCEL_SETUP.md](./VERCEL_SETUP.md)

## 📁 Project Structure

```
flora-guard-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── care-planner/   # Care planner specific components
│   │   └── kan-*.tsx       # Plant detection components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Third-party integrations (Supabase)
│   ├── lib/               # Utility functions
│   ├── pages/             # Route pages
│   └── main.tsx           # App entry point
├── public/                # Static assets
└── supabase/              # Supabase configuration
```

## 🔐 Authentication Setup

The app uses Supabase Auth with email/password authentication.

### Configure Supabase Auth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Configure redirect URLs:
   - Add your Vercel domain: `https://your-app.vercel.app/**`
   - Add localhost for development: `http://localhost:5173/**`

4. **Auto-confirm emails** (recommended for development):
   - Go to Authentication → Settings
   - Enable "Enable email confirmations" → OFF (for dev)
   - OR set up email templates for production

## 🗄️ Database Schema

The app uses these main Supabase tables:

- `profiles` - User profile information
- `plant_scans` - Plant disease detection results
- `user_plants` - User's plant collection
- Storage buckets: `avatars`, `plant-images`

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (if configured)
npx tsc --noEmit

# Linting
npx eslint src
```

## 🐛 Troubleshooting

### Blank screen or infinite loading after Vercel deployment

**Symptoms**: Pages show blank dark screen or spinner never stops

**Causes & Fixes**:

1. **Missing/Wrong Environment Variables** (MOST COMMON)
   - ✅ Check all variables use `VITE_` prefix in Vercel
   - ❌ Do NOT use `NEXT_PUBLIC_` (that's for Next.js only)
   - Verify values match your Supabase project exactly
   - After adding/changing variables, **redeploy**

2. **Check Browser Console**
   - Open DevTools (F12) on the deployed site
   - Look for errors like "Cannot read property 'VITE_SUPABASE_URL'"
   - If you see this, environment variables aren't set correctly

3. **Verify Supabase Connection**
   - Test if Supabase credentials work locally first
   - Check Supabase project is active and accessible
   - Ensure API keys haven't been regenerated

4. **Check Vercel Function Logs**
   - Go to Vercel → Deployments → Latest → View Function Logs
   - Look for runtime errors or timeout issues

### Authentication issues

- **Redirect to localhost**: Update Supabase redirect URLs to include your Vercel domain
- **"Invalid login credentials"**: User profile may not exist, try signing up again
- **Session not persisting**: Clear browser cache and cookies

### Image upload failures

- Verify Supabase storage buckets exist (`avatars`, `plant-images`)
- Check storage policies allow authenticated users to upload
- Ensure images are under 5MB

### Development vs Production Differences

- Local uses `.env` file → Vercel uses Dashboard environment variables
- All `VITE_*` variables must be set in both places
- Vercel requires manual redeploy after changing variables

## 📝 Project Info

**Lovable Project URL**: https://lovable.dev/projects/7fda86d0-3243-4bd8-b8e4-f38a39c4c529

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For deployment issues:
- See detailed [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- Check Troubleshooting section above
- Open an issue on GitHub

## 🌟 Acknowledgments

- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Backend services by [Supabase](https://supabase.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Built with [Lovable](https://lovable.dev/)
