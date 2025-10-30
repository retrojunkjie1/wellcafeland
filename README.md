# Wellcafeland

AI-powered Wellness Café Landing Page  
Built with React + Firebase.

This project is part of the Wellnesscafe AI initiative, created to deliver optimized, AI-driven wellness content and services to a global audience.

## Firebase setup

This project reads Firebase configuration from environment variables (Create React App style). To configure locally:

1. Copy `.env.example` to `.env.local` at the project root.
2. Fill in your Firebase project's values for the `REACT_APP_FIREBASE_...` variables.
3. Restart the dev server (npm start) so the variables are loaded.

Important: never commit `.env.local` with secrets. `.env.local` is already included in `.gitignore`.

## Mobile Preview

To preview your project on a mobile device:

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Find your computer's local IP address:**
   
   Run this helper command:
   ```bash
   npm run ip
   ```
   
   Or find it manually:
   - **macOS:** Open Terminal and run `ipconfig getifaddr en0` (for WiFi) or `ipconfig getifaddr en1` (for Ethernet)
   - **Windows:** Open Command Prompt and run `ipconfig`, look for "IPv4 Address"
   - **Linux:** Run `hostname -I` or `ip addr show`

3. **Access from your mobile device:**
   - Make sure your mobile device is on the same WiFi network as your computer
   - Open your mobile browser and navigate to: `http://YOUR_IP_ADDRESS:3000`
   - For example: `http://192.168.1.100:3000`

4. **Tips:**
   - The dev server is already configured to bind to `0.0.0.0` (all network interfaces) via `.env.local`
   - Check your firewall settings if you can't connect from mobile
   - Use Chrome DevTools' Device Mode for quick responsive testing before testing on actual devices
