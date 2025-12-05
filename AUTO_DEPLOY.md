# Automatic Deployment Setup

## Quick Setup (Recommended)

### Option 1: Vercel GitHub Integration (Easiest)

1. **Connect GitHub to Vercel:**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-deploy on every push!

2. **Generate & Deploy:**
   ```bash
   # Generate a new article
   cd /Users/sugsean/.gemini/antigravity/playground/nodal-curie
   python main.py --mode once
   
   # Deploy to production
   cd /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN
   ./auto-deploy.sh
   ```

The `auto-deploy.sh` script will:
- Generate a new article
- Copy it to the website
- Commit and push to GitHub
- Vercel automatically deploys (takes ~1 minute)

---

## Option 2: Manual Deploy

If you don't want GitHub integration:

```bash
# Generate article
cd /Users/sugsean/.gemini/antigravity/playground/nodal-curie
python main.py --mode once

# Deploy
cd /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN
npx vercel --prod
```

---

## Automated Hourly Deployment

To automatically generate and deploy articles every hour:

### Using cron (Mac/Linux):

1. Open crontab:
   ```bash
   crontab -e
   ```

2. Add this line:
   ```
   0 * * * * cd /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN && ./auto-deploy.sh >> /tmp/rflctn-deploy.log 2>&1
   ```

This will:
- Run every hour (at :00)
- Generate a new article
- Deploy to production automatically
- Log output to `/tmp/rflctn-deploy.log`

### Using launchd (Mac):

Create a file at `~/Library/LaunchAgents/com.rflctn.autodeploy.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.rflctn.autodeploy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/auto-deploy.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

Then load it:
```bash
launchctl load ~/Library/LaunchAgents/com.rflctn.autodeploy.plist
```

---

## Current Setup

✅ Website deployed: https://rflctn-lgfbzrf8u-shawns-projects-ee1cb403.vercel.app  
✅ Auto-deploy script created: `auto-deploy.sh`  
✅ GitHub Actions workflow ready: `.github/workflows/deploy.yml`  

## Quick Commands

**Generate & deploy now:**
```bash
cd /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN
./auto-deploy.sh
```

**Just deploy (no new article):**
```bash
npx vercel --prod
```

**Check deployment status:**
```bash
npx vercel ls
```

---

## Troubleshooting

**Articles not showing?**
- Make sure backend is deployed (check `vercel.json`)
- Check API endpoint in `services/articlesService.ts`

**Deployment failed?**
- Check build logs: `npx vercel logs`
- Verify all files are committed: `git status`

**Auto-deploy not working?**
- Check cron logs: `tail -f /tmp/rflctn-deploy.log`
- Verify script permissions: `ls -la auto-deploy.sh`
