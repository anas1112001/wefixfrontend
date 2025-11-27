# Quick IIS Deployment - Final URLs

## ✅ What Has Been Done

1. ✅ Frontend built for production (in `build` folder)
2. ✅ API configuration updated for IIS deployment
3. ✅ `web.config` created with URL rewrite rules
4. ✅ Deployment script created

## 🚀 Final URLs After Deployment

Once IIS is configured, your application will be accessible at:

- **Frontend Application:** `http://localhost`
- **API Endpoint (proxied):** `http://localhost/api/graphql`

## 📋 Quick Setup Steps

### Step 1: Install URL Rewrite Module (Required)

1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Install the downloaded file
3. Restart IIS: Open PowerShell as Admin and run `iisreset`

### Step 2: Deploy to IIS

**Option A: Use the PowerShell Script (Recommended)**
```powershell
# Run PowerShell as Administrator
cd D:\Projects\WeFix\Jehad\Cursor\Frontend
.\deploy-to-iis.ps1
```

**Option B: Manual Setup in IIS Manager**

1. Open IIS Manager (`inetmgr`)
2. Right-click "Sites" → "Add Website"
3. Configure:
   - **Site name:** `WeFix`
   - **Physical path:** `D:\Projects\WeFix\Jehad\Cursor\Frontend\build`
   - **Binding:** Port `80`, IP `All Unassigned`
4. Select the site → "Basic Settings" → Set Application Pool
   - Create new pool: `WeFixAppPool`
   - Set .NET CLR Version to "No Managed Code"
5. Start the website

### Step 3: Start Your Backend

Make sure your backend GraphQL server is running on port 4000:
```powershell
# In your backend directory
npm start
# or
node server.js
```

The frontend will automatically proxy `/api/graphql` requests to `http://localhost:4000/graphql`

## 🌐 Access Your Application

After completing the steps above:

**Open your browser and navigate to:**
```
http://localhost
```

**Login Credentials:**
- Username: `superadmin`
- Password: `superadmin@123`

## 🔧 Troubleshooting

### If you see 404 errors:
- Ensure URL Rewrite Module is installed
- Verify `web.config` exists in the `build` folder
- Check IIS logs: `C:\inetpub\logs\LogFiles`

### If API calls fail:
- Verify backend is running on port 4000
- Check browser console (F12) for CORS errors
- Verify web.config proxy rule is working

### If you see permission errors:
- Grant `IIS_IUSRS` read permissions to the `build` folder
- Check application pool identity

## 📝 Notes

- The frontend is configured to use `/api/graphql` in production mode
- This endpoint is proxied to your backend on port 4000
- All React routes will work correctly thanks to URL rewrite rules
- Static assets (CSS, JS, images) are served directly by IIS

