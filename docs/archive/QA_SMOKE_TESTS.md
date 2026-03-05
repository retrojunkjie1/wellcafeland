# QA Smoke Tests
## WellnessCafe OS Production Readiness Checklist

Run these tests after deployment to verify production readiness.

---

## Test Environment Setup

- **Browser:** Chrome, Firefox, Safari (latest versions)
- **Devices:** Desktop, Mobile (iOS Safari, Chrome Android)
- **Network:** Test on both WiFi and cellular
- **Clear cache:** Use incognito/private mode for first test

---

## 1. Authentication Tests

### 1.1 Login
- [ ] Navigate to `/login`
- [ ] Enter valid email and password
- [ ] Click "Sign in"
- [ ] Verify redirect to home page
- [ ] Verify user email appears in top bar (not "Anonymous")
- [ ] Verify "Guest mode" banner does NOT appear

### 1.2 Logout
- [ ] Click Profile tab
- [ ] Click "Sign out" or logout button
- [ ] Verify redirect to home or login page
- [ ] Verify "Anonymous" badge appears in top bar
- [ ] Verify "Guest mode" banner appears

### 1.3 Session Persistence
- [ ] Login
- [ ] Refresh page (F5 or Cmd+R)
- [ ] Verify still logged in
- [ ] Verify user email still visible
- [ ] Close browser tab, reopen site
- [ ] Verify still logged in (if "Remember me" was used)

### 1.4 Guest Mode
- [ ] Logout (or use incognito)
- [ ] Verify "Anonymous" badge visible
- [ ] Verify "Guest mode" banner visible
- [ ] Verify can navigate all tabs without errors

---

## 2. Navigation Tests

### 2.1 Bottom Navigation Tabs
- [ ] Click "Home" tab → Verify home page loads
- [ ] Click "Explore" tab → Verify explore page loads
- [ ] Click "Assistance" tab → Verify assistance page loads
- [ ] Click "Signals" tab → Verify dashboard/signals page loads
- [ ] Click "Profile" tab → Verify profile page loads
- [ ] Verify active tab is highlighted (amber color)

### 2.2 Back Button Behavior
- [ ] Navigate: Home → Explore → Tools → [specific tool]
- [ ] Click back button in page chrome
- [ ] Verify returns to previous page
- [ ] Click back again
- [ ] Verify returns to Explore
- [ ] Test back button on multiple pages

### 2.3 Deep Linking
- [ ] Navigate to `/tools`
- [ ] Refresh page
- [ ] Verify page loads correctly (no 404)
- [ ] Test direct URL access: `/assistance/workspace`
- [ ] Verify page loads correctly

---

## 3. Tools Tests

### 3.1 Tools Visibility
- [ ] Navigate to Explore or Tools page
- [ ] Verify breathing tools are visible
- [ ] Verify tool cards render correctly
- [ ] Verify tool categories are organized

### 3.2 Open Tool Session
- [ ] Click on a breathing tool (e.g., "Box Breathing")
- [ ] Verify tool session opens
- [ ] Verify tool UI is functional
- [ ] Verify tool controls work (start, pause, reset if applicable)

### 3.3 Exit Tool Session
- [ ] While in tool session, click back button
- [ ] Verify returns to tools list
- [ ] Verify no errors in console
- [ ] Verify can open another tool immediately

### 3.4 Tool Persistence
- [ ] Open a tool
- [ ] Refresh page
- [ ] Verify tool state is preserved OR gracefully resets (expected behavior)

---

## 4. Signals/Dashboard Tests

### 4.1 Tabs Render
- [ ] Navigate to Signals/Dashboard
- [ ] Verify "Moments" tab is visible
- [ ] Verify "Insights" tab is visible
- [ ] Verify "Signals" tab is visible
- [ ] Click each tab
- [ ] Verify content loads for each tab

### 4.2 Scroll Behavior
- [ ] Scroll down on Signals page
- [ ] Verify vertical scrolling works smoothly
- [ ] Verify no horizontal scrollbar appears
- [ ] Verify content doesn't overflow horizontally
- [ ] Test on mobile: swipe up/down works

### 4.3 Content Loading
- [ ] Verify moments/insights/signals data loads
- [ ] Verify loading states appear (if applicable)
- [ ] Verify empty states render correctly (if no data)
- [ ] Verify error states handle gracefully (if applicable)

---

## 5. Support Page Tests

### 5.1 Hotline Cards Visibility
- [ ] Navigate to Support/Assistance page
- [ ] Verify hotline cards are visible
- [ ] Verify cards display:
  - Hotline name
  - Phone number
  - Description/notes
  - Call button or link

### 5.2 Hotline Links
- [ ] Click on a hotline card
- [ ] Verify link opens (tel: or external URL)
- [ ] On mobile: Verify phone dialer opens with correct number
- [ ] On desktop: Verify link is clickable (may open default phone app)

### 5.3 Emergency Resources
- [ ] Verify 988 Suicide & Crisis Lifeline is visible
- [ ] Verify SAMHSA National Helpline is visible
- [ ] Verify Crisis Text Line is visible
- [ ] Verify all links are functional

---

## 6. Mobile Safe Areas Tests

### 6.1 Bottom Navigation
- [ ] On mobile device (or mobile viewport)
- [ ] Scroll to bottom of any page
- [ ] Verify bottom navigation is visible
- [ ] Verify bottom nav does NOT cover page content
- [ ] Verify safe area insets work (on iOS devices with notches)

### 6.2 Content Spacing
- [ ] Verify content has padding at bottom (above nav)
- [ ] Verify no content is hidden behind bottom nav
- [ ] Test on iPhone with notch (if available)
- [ ] Test on Android device (if available)

### 6.3 Top Bar
- [ ] Verify top bar is visible
- [ ] Verify top bar doesn't cover page content
- [ ] Verify safe area insets work at top (on devices with notches)

---

## 7. Performance Tests

### 7.1 Initial Load
- [ ] Open site in incognito mode
- [ ] Measure time to first contentful paint
- [ ] Verify page loads within 3 seconds (target)
- [ ] Verify no blocking JavaScript errors

### 7.2 Navigation Speed
- [ ] Click between tabs rapidly
- [ ] Verify navigation is responsive (< 500ms)
- [ ] Verify no lag or stuttering

### 7.3 Image Loading
- [ ] Verify images load progressively
- [ ] Verify no broken image placeholders
- [ ] Verify images are optimized (not too large)

---

## 8. Error Handling Tests

### 8.1 Network Errors
- [ ] Disable network (or use DevTools → Network → Offline)
- [ ] Try to navigate
- [ ] Verify error message appears (if applicable)
- [ ] Verify app doesn't crash
- [ ] Re-enable network
- [ ] Verify app recovers gracefully

### 8.2 Console Errors
- [ ] Open browser DevTools → Console
- [ ] Navigate through all major pages
- [ ] Verify no red errors in console
- [ ] Verify warnings are acceptable (not critical)

### 8.3 404 Handling
- [ ] Navigate to `/nonexistent-page`
- [ ] Verify 404 page renders (or redirects to home)
- [ ] Verify no blank page or crash

---

## 9. Cross-Browser Tests

### 9.1 Chrome
- [ ] Run all tests above in Chrome
- [ ] Verify all features work

### 9.2 Firefox
- [ ] Run all tests above in Firefox
- [ ] Verify all features work

### 9.3 Safari
- [ ] Run all tests above in Safari (if available)
- [ ] Verify all features work
- [ ] Pay special attention to safe areas (iOS)

---

## 10. Production-Specific Tests

### 10.1 Environment Variables
- [ ] Verify Firebase project ID is `wellnesscafelanding` (not `wellnesscafe-os`)
- [ ] Check browser console for any env-related errors
- [ ] Verify API endpoints point to correct backend

### 10.2 Custom Domain (if connected)
- [ ] Verify site loads at `wellnesscafe.net`
- [ ] Verify SSL certificate is active (green lock)
- [ ] Verify no mixed content warnings
- [ ] Test both `www.wellnesscafe.net` and `wellnesscafe.net` (if both configured)

### 10.3 Analytics (if configured)
- [ ] Verify analytics events fire (check Network tab)
- [ ] Verify no analytics errors in console

---

## Test Results Template

```
Date: _______________
Tester: _______________
Environment: Production / Staging
Browser: _______________
Device: _______________

Results:
- Authentication: ✅ / ❌
- Navigation: ✅ / ❌
- Tools: ✅ / ❌
- Signals: ✅ / ❌
- Support: ✅ / ❌
- Mobile Safe Areas: ✅ / ❌
- Performance: ✅ / ❌
- Error Handling: ✅ / ❌
- Cross-Browser: ✅ / ❌
- Production-Specific: ✅ / ❌

Issues Found:
1. _______________
2. _______________

Overall Status: ✅ PASS / ❌ FAIL
```

---

## Critical Issues (Block Go-Live)

- Authentication not working
- Site crashes on load
- Wrong Firebase project connected
- Custom domain not working (if required)
- Critical security vulnerabilities
- Data loss or corruption

---

## Non-Critical Issues (Can Deploy)

- Minor UI glitches
- Performance optimizations needed
- Non-blocking console warnings
- Cosmetic issues

---

## Notes

- Document any issues found during testing
- Take screenshots of errors
- Note browser/device combinations where issues occur
- Report critical issues immediately to development team

