# ✅ Backend IIS Deployment - Complete Setup Guide

## 🎯 Final Configuration

Both frontend and backend are now configured to work together on **port 80**:

- **Frontend:** `http://localhost`
- **Backend API (Proxied):** `http://localhost/api/graphql` → `http://localhost:4000/graphql`

## ✅ What Has Been Done

1. ✅ **Frontend web.config updated** with URL Rewrite proxy rules
2. ✅ **Backend web.config created** (for future iisnode deployment if needed)
3. ✅ **Backend service scripts created** for easy management
4. ✅ **Proxy configuration ready** - API requests will be proxied to backend

## 📋 Required: Install URL Rewrite Module

**CRITICAL:** You must install URL Rewrite Module for the proxy to work:

1. **Download:** https://www.iis.net/downloads/microsoft/url-rewrite
2. **Install** the downloaded file
3. **Restart IIS:**
   ```powershell
   iisreset
   ```

## 🚀 Deployment Steps

### Step 1: Install URL Rewrite Module (Required)

Download and install from: https://www.iis.net/downloads/microsoft/url-rewrite

### Step 2: Start Backend Server

**Option A: Run as Background Process (Recommended)**
```powershell
cd D:\Projects\WeFix\Jehad\Cursor\Backend
.\start-backend-service.ps1
```

**Option B: Run Manually**
```powershell
cd D:\Projects\WeFix\Jehad\Cursor\Backend
$env:NODE_ENV="production"
$env:PORT="4000"
$env:CORS_ORIGINS="http://localhost,http://localhost:80"
npm start
```

**Option C: Run as Windows Service (Advanced)**
- Use NSSM (Non-Sucking Service Manager) or similar tool
- Or use Task Scheduler to run on startup

### Step 3: Verify Backend is Running

Test the backend directly:
```powershell
# Should return GraphQL response
Invoke-WebRequest -Uri "http://localhost:4000/graphql" -Method POST -ContentType "application/json" -Body '{"query":"{ __typename }"}'
```

### Step 4: Restart IIS (After URL Rewrite Installation)

```powershell
iisreset
```

### Step 5: Test Complete Setup

1. **Open browser:** `http://localhost`
2. **Test API proxy:** `http://localhost/api/graphql`
3. **Login:** `superadmin` / `superadmin@123`

## 🌐 Final URLs

After setup, everything works on port 80:

- **Frontend:** `http://localhost`
- **API Endpoint:** `http://localhost/api/graphql` (proxied to backend on port 4000)
- **Backend Direct:** `http://localhost:4000/graphql` (for testing)

## 📝 Configuration Details

### Frontend Configuration
- **Site:** WeFix
- **Path:** `D:\Projects\WeFix\Jehad\Cursor\Frontend\build`
- **Port:** 80
- **Proxy Rule:** `/api/*` → `http://localhost:4000/*`

### Backend Configuration
- **Path:** `D:\Projects\WeFix\Jehad\Cursor\Backend`
- **Port:** 4000 (internal, proxied through IIS)
- **Entry Point:** `dist/server.js`
- **CORS:** Configured to allow `http://localhost`

## 🔧 Backend Management Scripts

### Start Backend
```powershell
cd D:\Projects\WeFix\Jehad\Cursor\Backend
.\start-backend-service.ps1
```

### Stop Backend
```powershell
cd D:\Projects\WeFix\Jehad\Cursor\Backend
.\stop-backend-service.ps1
```

### Check Backend Status
```powershell
Get-Process -Name "node" | Where-Object { $_.Path -like "*Backend*" }
```

## ⚠️ Important Notes

1. **Backend must be running** on port 4000 for the proxy to work
2. **URL Rewrite Module is required** for the proxy functionality
3. **CORS is configured** in backend to allow requests from `http://localhost`
4. **Backend runs as Node.js process** - not directly in IIS (simpler approach)

## 🔄 Alternative: Full IIS Integration (Advanced)

If you want the backend to run directly in IIS (not as a separate process):

1. **Install iisnode:** https://github.com/azure/iisnode
2. **Run:** `.\deploy-backend-to-iis.ps1`
3. This creates an IIS application at `/api` that runs Node.js

**Note:** The proxy approach (current setup) is simpler and recommended.

## 🐛 Troubleshooting

### API calls return 502 Bad Gateway
- **Solution:** Backend is not running on port 4000
- **Fix:** Start backend using `start-backend-service.ps1`

### API calls return 404
- **Solution:** URL Rewrite Module not installed or proxy rule not working
- **Fix:** Install URL Rewrite Module and restart IIS

### CORS errors in browser
- **Solution:** Backend CORS not configured for `http://localhost`
- **Fix:** Set `CORS_ORIGINS` environment variable: `http://localhost,http://localhost:80`

### Backend won't start
- **Check:** Database connection settings in `.env` file
- **Check:** Port 4000 is not already in use
- **Check:** Node.js and dependencies are installed

## ✅ Verification Checklist

- [ ] URL Rewrite Module installed
- [ ] Backend running on port 4000
- [ ] Frontend accessible at `http://localhost`
- [ ] API proxy working at `http://localhost/api/graphql`
- [ ] Login works with `superadmin` / `superadmin@123`
- [ ] No CORS errors in browser console

## 🎉 You're All Set!

Once URL Rewrite Module is installed and backend is running, your complete application will be accessible at **http://localhost** with both frontend and backend working seamlessly!

