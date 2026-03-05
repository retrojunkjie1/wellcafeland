# Fix: Port Mismatch Issue

## Problem
The error page shows you're accessing `http://localhost:5176/assistance` but the dev server is running on port **5175**.

## Solution

### Option 1: Use the Correct Port (Recommended)
Navigate to the correct URL:
```
http://localhost:5175/assistance
```

Or for the Real Help Workspace:
```
http://localhost:5175/workspace/real-help
```

### Option 2: Restart the Dev Server
If you want to use port 5173 (default):

1. Stop all running dev servers
2. Run: `npm run dev`
3. It will start on port 5173 (if available)

## Current Server Status
According to the terminal, your dev server is running on:
- **Local**: http://localhost:5175/
- **Network**: http://192.168.1.123:5175/

## Quick Links (Correct Port)
- Home: http://localhost:5175/
- Assistance Hub: http://localhost:5175/assistance
- Real Help Workspace: http://localhost:5175/workspace/real-help
- Admin Seed Page: http://localhost:5175/admin/seed

## How to Check Your Port
Look at your terminal running `npm run dev`. You'll see:
```
➜  Local:   http://localhost:XXXX/
```

That XXXX is your port number.

