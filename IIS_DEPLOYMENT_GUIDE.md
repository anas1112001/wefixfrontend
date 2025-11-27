# IIS Deployment Guide for WeFix Frontend and Backend

This guide will help you deploy both the frontend and backend to IIS on port 80.

## Prerequisites

1. **IIS installed** with the following features:
   - IIS Management Console
   - URL Rewrite Module 2.1 (download from: https://www.iis.net/downloads/microsoft/url-rewrite)
   - Application Request Routing (ARR) - Optional, for reverse proxy

2. **Backend running** on `http://localhost:4000/graphql`

3. **Administrator privileges** on Windows

## Deployment Steps

### Step 1: Install URL Rewrite Module

1. Download and install **URL Rewrite Module 2.1** from:
   https://www.iis.net/downloads/microsoft/url-rewrite

2. Restart IIS after installation:
   ```powershell
   iisreset
   ```

### Step 2: Deploy Frontend to IIS

1. **Open IIS Manager** (Run `inetmgr` or search for "IIS Manager")

2. **Create a new website:**
   - Right-click on "Sites" → "Add Website"
   - Site name: `WeFix`
   - Application pool: Create new or use `DefaultAppPool`
   - Physical path: `D:\Projects\WeFix\Jehad\Cursor\Frontend\build`
   - Binding:
     - Type: `http`
     - IP address: `All Unassigned` or your server IP
     - Port: `80`
     - Host name: (leave empty for default site, or enter your domain)

3. **Set Application Pool:**
   - Select the application pool for your site
   - Set .NET CLR Version to "No Managed Code" (since this is a static React app)
   - Set Managed Pipeline Mode to "Integrated"

4. **Verify web.config is in place:**
   - The `web.config` file should already be in the `build` folder
   - It contains URL rewrite rules for SPA routing and API proxying

### Step 3: Configure Backend (If using IIS for backend)

**Option A: Keep Backend Running on Node.js (Port 4000)**
- The web.config already proxies `/api/graphql` to `http://localhost:4000/graphql`
- Make sure your backend is running on port 4000
- This is the recommended approach

**Option B: Deploy Backend to IIS (Advanced)**
- If your backend is Node.js, you'll need IISNode
- If your backend is ASP.NET Core, configure it as a separate application
- Update the proxy URL in web.config if backend is on a different port

### Step 4: Test the Deployment

1. **Start your backend server** (if not already running):
   ```powershell
   # Navigate to your backend directory and start it
   # Example: node server.js or npm start
   ```

2. **Access the application:**
   - Open browser and navigate to: `http://localhost`
   - Or if configured with hostname: `http://your-domain-name`

3. **Test API connectivity:**
   - Open browser DevTools (F12)
   - Check Network tab for API calls to `/api/graphql`
   - Verify they're being proxied correctly

## Final URLs

After deployment, your application will be accessible at:

- **Frontend:** `http://localhost` (or `http://your-server-ip`)
- **API Endpoint:** `http://localhost/api/graphql` (proxied to backend on port 4000)

## Troubleshooting

### Issue: 404 errors on page refresh
**Solution:** Ensure URL Rewrite Module is installed and web.config is in the build folder

### Issue: API calls failing
**Solution:** 
1. Verify backend is running on port 4000
2. Check web.config proxy rule is correct
3. Verify CORS settings in backend allow requests from frontend domain

### Issue: Static assets not loading
**Solution:** Check MIME types in web.config are correct

### Issue: Permission errors
**Solution:** 
1. Grant IIS_IUSRS read permissions to the build folder
2. Check application pool identity has proper permissions

## Security Notes

- The current web.config includes permissive CORS headers (`Access-Control-Allow-Origin: *`)
- For production, restrict CORS to specific domains
- Consider using HTTPS (port 443) for production deployments
- Review and secure your backend API endpoints

## Additional Configuration

### Enable HTTPS (Optional)

1. Install SSL certificate in IIS
2. Add HTTPS binding (port 443) to your site
3. Update web.config to redirect HTTP to HTTPS if needed

### Custom Domain

1. Add hostname binding in IIS site settings
2. Update DNS records to point to your server IP
3. Update CORS settings if needed

## Support

If you encounter issues, check:
- IIS Event Viewer for detailed error logs
- Browser console for client-side errors
- Backend logs for API errors

