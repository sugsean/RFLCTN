# RFLCTN - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** rflctn (or whatever you want)
- **Directory?** ./ (current directory)
- **Override settings?** No

### Step 3: Done!
Vercel will give you a URL like: `https://rflctn.vercel.app`

Your website is now live! 🎉

---

## Alternative: Deploy to Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build the site
```bash
npm run build
```

### Step 3: Deploy
```bash
netlify deploy --prod
```

---

## Important Notes

### Backend API
The backend (article serving) needs to be deployed separately. Options:

1. **Vercel Serverless Functions** (easiest)
   - Already configured in `vercel.json`
   - Will deploy automatically with the frontend

2. **Railway.app** (free tier)
   - Deploy the `backend/` folder separately
   - Update `API_BASE_URL` in `services/articlesService.ts`

3. **Render.com** (free tier)
   - Deploy Python backend
   - Update API URL in frontend

### Article Generation
The article generator (`nodal-curie/`) runs on your computer. To automate:

1. **Run locally** - Keep `python main.py` running on your computer
2. **Deploy to a server** - Use Railway, Render, or a VPS
3. **Use GitHub Actions** - Auto-generate articles on schedule

---

## Updating the Live Site

After making changes:
```bash
vercel --prod
```

Or just push to GitHub and enable auto-deployment!

---

## Environment Variables

If deploying backend separately, set:
- `GEMINI_API_KEY` - Your Google API key

In Vercel: Settings → Environment Variables
