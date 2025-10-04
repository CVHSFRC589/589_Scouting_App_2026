# Physical Device Testing Guide

This guide will help you set up your personal iPhone or Android phone to test the scouting app using Expo Go.

**Why test on a physical device?**
- See how the app performs on real hardware
- Test touch interactions and gestures naturally
- No need to install emulators/simulators
- Works on Windows, Mac, and Linux computers

## Quick Start (Recommended Method)

**TL;DR:**
1. Install **Expo Go** app on your phone
2. Create a free Expo account at https://expo.dev/signup
3. Login to Expo: `npx expo login`
4. Run `npm start --tunnel` in the project
5. Scan the QR code with your phone in Expo Go

**Why this method?** It works reliably regardless of network configuration, firewall settings, or router restrictions.

## Installation

### iPhone (iOS)

1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Install the app (it's free)
4. Open Expo Go to verify it works

### Android Phone

1. Open the **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install the app (it's free)
4. Open Expo Go to verify it works

## Running the App on Your Phone

### Method 1: Expo Account with Tunnel (Recommended - Most Reliable)

This method works regardless of WiFi network, firewall, or router settings.

#### Step 1: Create an Expo Account

1. Go to https://expo.dev/signup
2. Sign up with your email (it's free)
3. Verify your email

#### Step 2: Login to Expo CLI

In your terminal, run:

```bash
npx expo login
```

Enter your Expo credentials when prompted.

#### Step 3: Start the Dev Server with Tunnel

```bash
cd Frontend_2025_Scouting
npm start --tunnel
```

**Expected output:**
```
› Metro waiting on exp://u-abc123.your-username.exp.direct:80
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

**Note:** Tunnel mode takes 10-15 seconds longer to start than normal mode, but it's worth the reliability.

#### Step 4: Open App in Expo Go

If you're successfully logged into Expo and the tunnel launched correctly, you have two options:

**Option A: From the App List (Easiest)**

1. Open **Expo Go** app on your phone
2. Make sure you're logged in with the same account
3. Look under **"Development servers"** or **"Recently opened"**
4. You should see **"Reefscape Scouting App"** in the list
5. Tap it to launch the app

**Option B: Scan the QR Code**

1. Open **Expo Go** app
2. Tap **"Scan QR code"**
3. Point camera at the QR code in your terminal
4. The app will start loading

#### Step 5: Wait for App to Load

- First time: Takes 30-60 seconds to build and load
- Subsequent times: Loads in 5-10 seconds
- You'll see a loading screen with the Expo logo

**Expected result:** The scouting app should appear on your phone!

---

### Method 2: Local WiFi Connection (Alternative)

**⚠️ Note:** This method often fails due to firewall, router, or network configuration issues. Use Method 1 (Tunnel) if you encounter problems.

#### Step 1: Connect to Same WiFi

Your phone and computer must be on the same WiFi network.

- **Phone:** Settings → WiFi → Connect to your network
- **Computer:** Connect to the same network

**Common issues:**
- ❌ **Won't work:** Phone on mobile data, computer on WiFi
- ❌ **Won't work:** Phone on home WiFi, computer on guest WiFi
- ❌ **Won't work:** Router has AP isolation enabled
- ✅ **Will work:** Both on exact same WiFi network

#### Step 2: Start Expo Without Tunnel

```bash
cd Frontend_2025_Scouting
npm start
```

#### Step 3: Scan QR Code

Use the same scanning method as Method 1 above.

**If this doesn't work:** Use Method 1 (Tunnel) instead.

## Development Workflow

### Making Changes

When you edit code and save:

1. The app will **automatically reload** on your phone (Fast Refresh)
2. You'll see changes appear in 1-2 seconds
3. No need to rescan the QR code

### Reloading the App Manually

If the app gets stuck or doesn't update:

- **iPhone:** Shake your phone, then tap **"Reload"**
- **Android:** Shake your phone, then tap **"Reload"**
- **Alternative:** Press `r` in the terminal where `npm start` is running

### Opening the Developer Menu

Shake your phone to open the Expo developer menu, which allows you to:

- Reload the app
- Toggle performance monitor
- Open debugger
- Toggle element inspector

## Troubleshooting

### "Unable to connect to server" or Network Errors

**✅ Best Solution: Use Tunnel Mode (Method 1)**

If you're experiencing any network connection issues, use the tunnel method:

1. Login to Expo: `npx expo login`
2. Start with tunnel: `npm start --tunnel`
3. Scan the QR code in Expo Go

This bypasses all firewall, router, and network configuration issues.

### QR Code Won't Scan

**If using tunnel mode:**
- Make sure you're logged into Expo: `npx expo login`
- Wait for the tunnel URL to fully load (10-15 seconds)
- The QR code should appear with a URL like `exp://u-abc123...`

**If using local WiFi:**
- Switch to tunnel mode instead: `npm start --tunnel`

### Manual URL Entry (Backup Method)

If QR code scanning fails completely:

1. **Start Expo and note the URL:**
   ```bash
   npm start --tunnel
   ```

2. **Look for the URL in the output:**
   ```
   › Metro waiting on exp://u-abc123.your-username.exp.direct:80
   ```

3. **In Expo Go on your phone:**
   - Open **Expo Go** app
   - Tap **"Enter URL manually"** at the bottom
   - Type the exact URL shown
   - Tap **"Connect"**

### USB Connection (Android Only - Advanced)

If tunnel mode isn't working and you have an Android phone:

1. Enable **Developer Options**:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → System → Developer Options → Enable "USB Debugging"

2. Connect phone to computer via USB

3. Run:
   ```bash
   adb reverse tcp:8081 tcp:8081
   npm start
   ```

4. In Expo Go, manually enter: `exp://localhost:8081`

### App Loads but Shows Error Screen

**"Unable to resolve module" error:**

```bash
# Clear cache and restart
cd Frontend_2025_Scouting
npm start -- --clear
```

**Other errors:**

1. Check the error message in Expo Go
2. Check the terminal for error details
3. Make sure all dependencies are installed:
```bash
npm install
```

### App is Slow or Laggy

- **Development mode is slower** than a production build
- Fast Refresh can cause temporary lag
- Try reloading the app (shake phone → Reload)
- Close other apps on your phone
- Restart the Expo dev server

### Can't Shake Phone to Open Menu

**iPhone:**

- Hardware → Shake (if using Simulator)
- Or tap with 3 fingers simultaneously

**Android:**

- Press the hardware menu button
- Or press `Cmd + M` (Mac) / `Ctrl + M` (Windows) if using emulator

**Alternative:** Press `m` in the terminal where `npm start` is running.

## Why Tunnel Mode is Recommended

**Tunnel mode (`npm start --tunnel`) is now the recommended default method because:**

✅ **Pros:**
- Works across different networks (no WiFi matching needed)
- Works from anywhere with internet
- Bypasses all firewall and router issues
- No complex network configuration required
- Works with corporate/school WiFi

❌ **Cons:**
- Requires Expo account (free)
- Adds 10-15 seconds to startup time
- Slightly slower than local connection (minimal impact)

**When to use local WiFi instead:**
- You're on a trusted home network
- You've verified firewall rules are configured
- Speed is critical for your development workflow

## Tips for Testing

### Test on Multiple Devices

The QR code works for multiple devices simultaneously:

1. Run `npm start` once
2. Scan the same QR code on multiple phones
3. Test on both iPhone and Android at the same time

### Test Different Screen Sizes

- **Small screen:** iPhone SE, older Android phones
- **Large screen:** iPhone Pro Max, Android phablets
- **Tablets:** iPad, Android tablets

### Test in Different Orientations

Rotate your phone to test landscape and portrait modes.

### Test Offline Behavior

1. Load the app with WiFi on
2. Turn off WiFi on your phone
3. See how the app behaves without internet

### Test with Different iOS/Android Versions

Try testing on:
- Newer phones (latest iOS/Android)
- Older phones (iOS 14+, Android 10+)

## Switching Between Physical Device and Emulator

You can use both at the same time!

**Example workflow:**

1. Run `npm start`
2. Press `i` for iOS Simulator (Mac only)
3. Press `a` for Android Emulator
4. Scan QR code with physical phone
5. All devices will run the same app simultaneously

This is great for testing on multiple screen sizes at once.

## Production Testing (Advanced)

For testing the production version (faster, optimized build):

### Create a Development Build

```bash
cd Frontend_2025_Scouting
npx expo install expo-dev-client
npx expo run:android
# or
npx expo run:ios
```

This creates a custom version of Expo Go with your app built in.

### Create a Production Build

For final testing before releasing:

```bash
# Android
eas build --platform android --profile preview

# iOS (requires Mac)
eas build --platform ios --profile preview
```

Requires an Expo account (free). Download the build to your phone to test.

## Comparison: Physical Device vs Emulator

| Feature | Physical Device | Emulator/Simulator |
|---------|----------------|-------------------|
| **Setup** | Easy (install Expo Go) | Medium (install Android Studio/Xcode) |
| **Performance** | Real-world performance | Slower than real device |
| **Touch Gestures** | Natural | Mouse simulation |
| **Sensors** | Real GPS, accelerometer | Simulated |
| **Network** | Real 4G/5G/WiFi | Simulated |
| **Cost** | Free (use your phone) | Free (but requires disk space) |
| **Best For** | Final testing, UX testing | Development, debugging |

**Recommendation:** Use physical device for final testing and user experience validation. Use emulator/simulator for rapid development.

## Next Steps

Once you have the app running on your phone:

- Test the full scouting workflow
- Try different network conditions (WiFi vs mobile data)
- Test with Bluetooth devices if applicable
- Share the QR code with teammates for multi-user testing

## Additional Resources

- [Expo Go Documentation](https://docs.expo.dev/get-started/expo-go/)
- [Expo Development Mode](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

Happy testing! 📱
