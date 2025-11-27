# ✅ Web.config Error Fixed

## What Was Fixed

The HTTP Error 500.19 was caused by URL Rewrite rules in `web.config` when the URL Rewrite Module wasn't installed. I've:

1. ✅ **Removed the problematic rewrite section** - The site should now load
2. ✅ **Rebuilt the frontend** - Updated build with fixed configuration
3. ✅ **Restarted the application pool** - Changes are active

## 🌐 Access Your Application

**Try accessing again:**
- **http://localhost**
- **http://localhost/login**

The site should now load without the 500.19 error.

## ⚠️ Current Limitations

Without URL Rewrite Module installed:

1. **SPA Routing:** Direct URL access (like `/login`) may show 404 errors
   - **Workaround:** Always navigate from the home page (`/`)
   - Or use browser back/forward buttons

2. **API Proxy:** The `/api/graphql` endpoint won't work
   - **Workaround:** The frontend will try to use `/api/graphql` but it will fail
   - You'll need to either:
     - Install URL Rewrite Module (recommended), OR
     - Rebuild with direct API URL (see below)

## 🔧 Option 1: Install URL Rewrite Module (Recommended)

1. **Download:** https://www.iis.net/downloads/microsoft/url-rewrite
2. **Install** the downloaded file
3. **Run the script** to add rewrite rules:
   ```powershell
   .\add-url-rewrite-rules.ps1
   ```
4. **Restart IIS:**
   ```powershell
   iisreset
   ```

After this, both SPA routing and API proxy will work.

## 🔧 Option 2: Use Direct API Connection (Quick Fix)

If you can't install URL Rewrite Module right now:

1. **Set environment variable and rebuild:**
   ```powershell
   $env:REACT_APP_API_URL="http://localhost:4000/graphql"
   npm run build
   ```

2. **Update IIS site** to point to new build (or just restart app pool)

3. **Note:** This may cause CORS errors if your backend doesn't allow cross-origin requests from `http://localhost`

## 📋 Next Steps

1. **Test the site:** Open `http://localhost` - it should load now
2. **Install URL Rewrite Module** for full functionality
3. **Start your backend** on port 4000
4. **Test login** with: `superadmin` / `superadmin@123`

## 🎯 Final URLs (After URL Rewrite Installation)

- **Frontend:** http://localhost
- **API (Proxied):** http://localhost/api/graphql → http://localhost:4000/graphql

