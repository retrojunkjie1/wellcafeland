# Troubleshooting: Page Won't Load

## Quick Fix Steps

### 1. **Use the Correct URL**
Make sure you're using the correct port. Check your terminal running `npm run dev`:

```
➜  Local:   http://localhost:5175/
```

Then visit:
- **Assistance Hub**: `http://localhost:5175/assistance`
- **Real Help Workspace**: `http://localhost:5175/workspace/real-help`

### 2. **Hard Refresh the Browser**
```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

Or:
```
Mac: Cmd + Option + E (Clear cache) then Cmd + R (Refresh)
Windows/Linux: Ctrl + Shift + Delete (Clear cache) then Ctrl + R (Refresh)
```

### 3. **Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

### 4. **Check Browser Console**
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for red error messages
4. Take a screenshot and share

### 5. **Restart Dev Server**
```bash
# Stop the current server (Ctrl + C)
npm run dev
```

### 6. **Try a Different Browser**
- Chrome
- Firefox  
- Safari
- Edge

### 7. **Check if Server is Running**
Look at your terminal. You should see:
```
VITE v7.2.2  ready in XXXms

➜  Local:   http://localhost:XXXX/
```

If you don't see this, the server isn't running.

---

## Common Issues

### Issue: "Something went wrong" Error
**Cause**: React error boundary caught an error  
**Fix**: 
1. Check browser console (F12)
2. Hard refresh (Cmd/Ctrl + Shift + R)
3. Clear cache and reload

### Issue: Port 5176 but server on 5175
**Cause**: Port mismatch  
**Fix**: Use the port shown in your terminal (check the `Local:` line)

### Issue: Blank white screen
**Cause**: JavaScript error  
**Fix**: 
1. Open console (F12)
2. Look for error messages
3. Hard refresh

### Issue: Old content showing
**Cause**: Browser cache  
**Fix**: Hard refresh or clear cache

---

## Verified Working URLs

Assuming your server is on port 5175 (check your terminal):

1. **Home/Chat**: http://localhost:5175/
2. **Assistance Hub**: http://localhost:5175/assistance
3. **Real Help Workspace**: http://localhost:5175/workspace/real-help
4. **Admin Seed**: http://localhost:5175/admin/seed
5. **Tools**: http://localhost:5175/tools
6. **Recovery**: http://localhost:5175/recovery

---

## Still Not Working?

### Run This Command:
```bash
cd /Users/mouthcouture/wellnesscafe-os
npm run lint
```

This will show any code errors.

### Check Dev Server Output:
Look at the terminal running `npm run dev`. Any errors will be shown there.

### Try The Real Help Workspace Directly:
Instead of going through `/assistance`, try directly:
```
http://localhost:5175/workspace/real-help
```

This bypasses the Assistance Hub and goes straight to the Real Help Workspace.

---

## Contact Information

If none of these work:
1. Take a screenshot of the error
2. Copy the browser console errors (F12 → Console tab)
3. Copy the terminal output where `npm run dev` is running
4. Share all three

This will help diagnose the exact issue.

