# RoomRentKH — Deploy Guide
# Frontend → Cloudflare Pages | Backend → Railway | DB → MongoDB Atlas

```
[Cloudflare Pages]          [Railway]              [MongoDB Atlas]
  React / Vite         →    Node / Express    →    M0 Free Cluster
  roomrentkh.pages.dev      railway.app            cloud.mongodb.com
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 1 — MongoDB Atlas  (database)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. https://cloud.mongodb.com → Sign up (free)
2. Create Organisation → Create Project  → name: "RoomRentKH"
3. Create Cluster → choose M0 FREE → Region: Singapore AP (ap-southeast-1)
4. Security → Database Access → Add new user
     Username : roomrentkh
     Password : generate strong password  ← SAVE THIS
     Role     : Atlas Admin
5. Security → Network Access → Add IP Address → 0.0.0.0/0
   (allows Railway's dynamic IPs to connect)
6. Clusters → Connect → Drivers → Node.js 5.5+
   Copy the URI:
     mongodb+srv://roomrentkh:<password>@cluster0.XXXXX.mongodb.net/
   Edit it to add the database name before "?":
     mongodb+srv://roomrentkh:MyPass@cluster0.XXXXX.mongodb.net/roomrentkh?retryWrites=true&w=majority

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 2 — Backend → Railway
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 2a. Push backend to GitHub

  cd roomrentkh-backend
  git init
  git add .
  git commit -m "feat: initial backend"
  # Create repo on github.com first, then:
  git remote add origin https://github.com/YOUR_USERNAME/roomrentkh-backend.git
  git push -u origin main

### 2b. Deploy on Railway

1. https://railway.app → Login (GitHub)
2. New Project → Deploy from GitHub repo → select your backend repo
3. Railway auto-detects Node.js, reads railway.json, runs `node server.js`
4. Wait for first deploy (green ✓)

### 2c. Set Environment Variables
   Railway Dashboard → your service → Variables → Add

   Variable          Value
   ──────────────    ─────────────────────────────────────────────────────
   NODE_ENV          production
   MONGODB_URI       mongodb+srv://roomrentkh:MyPass@cluster0.XXXXX.mongodb.net/roomrentkh?retryWrites=true&w=majority
   JWT_SECRET        (run locally: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
   JWT_EXPIRES_IN    7d
   FRONTEND_URL      https://roomrentkh.pages.dev   ← fill AFTER Step 3

   Note: Railway provides PORT automatically — do NOT set it manually.

### 2d. Get your Railway URL
   Settings → Networking → Generate Domain
   e.g.  https://roomrentkh-backend-production.up.railway.app

### 2e. Test
   curl https://roomrentkh-backend-production.up.railway.app/api/health
   → {"status":"ok","message":"RoomRentKH API is running 🏠",...}

### 2f. (Optional) Run seed data
   Railway Dashboard → your service → Shell (or Exec tab):
   node src/seed.js
   This creates 2 demo accounts + sample rooms/tenants/invoices.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 3 — Frontend → Cloudflare Pages
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 3a. Push frontend to GitHub

  cd roomrentkh-frontend
  git init
  git add .
  git commit -m "feat: initial frontend"
  git remote add origin https://github.com/YOUR_USERNAME/roomrentkh-frontend.git
  git push -u origin main

### 3b. Create Cloudflare Pages project

1. https://dash.cloudflare.com → Pages → Create a project
2. Connect to Git → Select your frontend repo
3. Build settings:
     Framework preset   : None  (or Vite)
     Build command      : npm run build
     Build output dir   : dist
     Root directory     : (leave empty)

### 3c. Set Environment Variables
   Cloudflare Pages → your project → Settings →
   Environment variables → Add variable
   ⚠️  Set for "Production" AND "Preview" environments

   Variable        Value
   ─────────────   ────────────────────────────────────────────────────────
   VITE_API_URL    https://roomrentkh-backend-production.up.railway.app/api
                   ↑ your Railway URL from Step 2d, with /api at the end

4. Save → Retry deployment (or it auto-triggers)

### 3d. Your site is live at
   https://roomrentkh.pages.dev  (or your custom domain)

### 3e. Go back to Railway → update FRONTEND_URL
   Railway → Variables → FRONTEND_URL = https://roomrentkh.pages.dev
   Railway redeploys automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 4 — Final verification checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅  https://YOUR.up.railway.app/api/health      → {"status":"ok"}
  ✅  https://roomrentkh.pages.dev                → Landing page loads
  ✅  Register a new account                      → Saved to Atlas
  ✅  Login                                       → Dashboard loads with live data
  ✅  Add a Room                                  → Appears in Atlas collection
  ✅  Create Invoice                              → Saved to Atlas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Local Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Terminal 1 — Backend
cd roomrentkh-backend
cp .env.example .env         # edit: add MONGODB_URI, JWT_SECRET
npm install
npm run dev                  # → http://localhost:5000

# Terminal 2 — Frontend
cd roomrentkh-frontend
cp .env.example .env         # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                  # → http://localhost:5173

Vite proxies /api → localhost:5000, so NO CORS issues locally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Troubleshooting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem                            Fix
─────────────────────────────────  ─────────────────────────────────────────
MongoServerError bad auth          Wrong password in MONGODB_URI
Atlas connection timeout           Add 0.0.0.0/0 in Atlas Network Access
CORS blocked on frontend           Set FRONTEND_URL in Railway variables
Login works but page blank         VITE_API_URL missing or wrong in CF Pages
Cloudflare 404 on page refresh     _redirects in public/ missing
Railway crash on start             Check Logs tab in Railway dashboard
VITE_API_URL shows "undefined"     Variable not set as Build variable in CF
