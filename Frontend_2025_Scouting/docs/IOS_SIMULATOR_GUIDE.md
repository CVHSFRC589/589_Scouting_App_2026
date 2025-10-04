# iOS Simulator Setup Guide

This guide will help you set up an iOS Simulator to test the scouting app on your Mac.

**⚠️ IMPORTANT: iOS Simulator ONLY works on Mac computers. Windows and Linux users cannot run iOS Simulator.**

If you're on Windows or Linux, please refer to [ANDROID_EMULATOR_GUIDE.md](./ANDROID_EMULATOR_GUIDE.md) instead.

## Why Use the iOS Simulator?

- Test the app without a physical iPhone or iPad
- Faster development cycle (instant reload)
- Test different iOS versions and device sizes
- Debug more easily with developer tools
- Included free with Xcode (no additional cost)

## Requirements

- **Mac computer** (MacBook, iMac, Mac Mini, or Mac Pro)
- **macOS 13.0 (Ventura) or later** recommended
- **At least 20GB free disk space** for Xcode
- **8GB RAM minimum** (16GB recommended for better performance)

## Installation

### 1. Install Xcode

Xcode includes the iOS Simulator and necessary build tools.

**Option A: Mac App Store (Recommended)**

1. Open the **App Store** on your Mac
2. Search for **"Xcode"**
3. Click **"Get"** or **"Install"**
4. Wait for installation (this can take 30-60 minutes depending on your internet speed)
5. Once installed, open **Xcode** from Applications
6. Accept the license agreement
7. Wait for Xcode to install additional components

**Option B: Direct Download**

1. Go to https://developer.apple.com/xcode/
2. Click **"Download"** or visit https://developer.apple.com/download/
3. Download the latest Xcode `.xip` file
4. Extract and move Xcode to your Applications folder
5. Launch Xcode and complete the setup

### 2. Install Xcode Command Line Tools

Open Terminal and run:

```bash
xcode-select --install
```

Click **"Install"** when the popup appears, then wait for installation to complete.

### 3. Verify Installation

Check that Xcode Command Line Tools are installed:

```bash
xcode-select -p
```

**Expected output:**
```
/Applications/Xcode.app/Contents/Developer
```

Check iOS Simulator is available:

```bash
xcrun simctl list devices
```

**Expected output:** A list of available iOS Simulators

## Using the iOS Simulator

### 1. Start the Simulator

**Option A: Through Xcode**

1. Open **Xcode**
2. Go to **Xcode** menu → **Open Developer Tool** → **Simulator**

**Option B: Through Terminal**

```bash
open -a Simulator
```

**Option C: Through Spotlight**

1. Press `Cmd + Space`
2. Type **"Simulator"**
3. Press `Enter`

### 2. Select a Device

Once Simulator is open:

1. Go to **File** → **Open Simulator** → **iOS 17.x** (or latest version)
2. Choose a device like:
   - **iPhone 15** (current flagship)
   - **iPhone 15 Pro** (latest Pro model)
   - **iPhone SE (3rd generation)** (smaller screen)
   - **iPad (10th generation)** (tablet testing)

**Tip:** Use iPhone 15 for testing as it represents a modern device most users will have.

### 3. Verify Simulator is Running

In Terminal, run:

```bash
xcrun simctl list devices | grep Booted
```

**Expected output:**
```
iPhone 15 (XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX) (Booted)
```

## Using the Simulator with Expo

### 1. Start the Simulator

Before running Expo, start your iOS Simulator using one of the methods above.

**Quick command:**
```bash
open -a Simulator
```

Wait for the device to fully boot (you should see the lock screen or home screen).

### 2. Start Expo

Open Terminal and run:

```bash
cd Frontend_2025_Scouting
npm start
```

### 3. Open App in Simulator

When the Expo menu appears, press **`i`** to open in iOS Simulator.

**Expected result:** The app should build and open in the Simulator automatically.

**Alternative:** Press `Shift + i` to select a specific Simulator if you have multiple running.

## Managing Simulators

### List All Available Simulators

```bash
xcrun simctl list devices available
```

### Create a New Simulator

1. Open **Xcode**
2. Go to **Window** → **Devices and Simulators** (or press `Cmd + Shift + 2`)
3. Click the **Simulators** tab
4. Click the **+** button at the bottom left
5. Fill in:
   - **Simulator Name:** (e.g., "iPhone 15 Pro Test")
   - **Device Type:** Choose from dropdown
   - **OS Version:** Choose iOS version
6. Click **"Create"**

### Delete a Simulator

**Through Xcode:**
1. **Window** → **Devices and Simulators**
2. Select the Simulator
3. Right-click and choose **"Delete"**

**Through Terminal:**
```bash
xcrun simctl delete [SIMULATOR_ID]
```

### Reset a Simulator

To erase all data and return to factory settings:

**Through Simulator:**
1. While Simulator is running, go to **Device** → **Erase All Content and Settings...**

**Through Terminal:**
```bash
xcrun simctl erase [SIMULATOR_ID]
```

Or erase all Simulators:
```bash
xcrun simctl erase all
```

## Troubleshooting

### Simulator won't start

**"Unable to boot device" error:**

1. Quit Simulator completely (`Cmd + Q`)
2. Restart Simulator
3. If still failing, run:
```bash
xcrun simctl shutdown all
xcrun simctl erase all
```
4. Restart your Mac

**Xcode License Agreement error:**

```bash
sudo xcodebuild -license accept
```

### Expo can't find Simulator

1. **Start Simulator FIRST**, then run `npm start`
2. Verify Simulator is booted: `xcrun simctl list devices | grep Booted`
3. Restart Expo dev server (press `r` in terminal)
4. Make sure you have Xcode Command Line Tools installed:
```bash
xcode-select --install
```

### "xcrun: error: unable to find utility "simctl""

Your Xcode Command Line Tools aren't configured properly:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcode-select --reset
```

Then restart your terminal.

### Simulator is very slow

1. **Close other applications** to free up RAM
2. **Reduce graphics quality:**
   - Simulator → **Debug** → **Graphics Quality Override** → **Low Quality**
3. **Disable Metal rendering:**
   - Run with software rendering: `METAL_DEVICE_WRAPPER_TYPE=1 open -a Simulator`
4. **Use an older iOS version** (iOS 15 instead of iOS 17)
5. **Restart your Mac** to free up system resources

### Black screen or app won't load

1. Press `Cmd + Shift + H` (twice quickly) to see app switcher
2. Swipe up on the app to close it
3. Reopen from Expo (press `i` again)
4. If still failing, reset the Simulator:
```bash
xcrun simctl erase booted
```

### Port already in use

Another Simulator instance might be running:

```bash
# Find all Simulator processes
ps aux | grep Simulator

# Kill all Simulator processes
killall Simulator
```

### "No devices found" when pressing 'i' in Expo

1. Make sure Simulator is running and booted
2. Check Watchman is installed (Expo dependency):
```bash
brew install watchman
```
3. Clear Expo cache:
```bash
cd Frontend_2025_Scouting
npx expo start -c
```

## Simulator Shortcuts

Once the Simulator is running:

- **Home button:** `Cmd + Shift + H`
- **Lock screen:** `Cmd + L`
- **Rotate left:** `Cmd + Left Arrow`
- **Rotate right:** `Cmd + Right Arrow`
- **Shake gesture:** `Ctrl + Cmd + Z`
- **Screenshot:** `Cmd + S` (saves to Desktop)
- **Screen recording:** Launch **QuickTime Player** → **File** → **New Screen Recording**
- **Toggle appearance (Light/Dark):** `Cmd + Shift + A`
- **Trigger low battery warning:** Simulator → **Features** → **Battery**
- **Simulate location:** Simulator → **Features** → **Location**

## Simulator Features for Testing

### Test Different iOS Versions

1. Open **Xcode**
2. Go to **Xcode** → **Settings** → **Platforms**
3. Click **+** to download additional iOS versions
4. Create Simulators with different iOS versions

### Test Different Accessibility Features

Simulator → **Settings** → **Accessibility**

- **VoiceOver:** Test screen reader compatibility
- **Larger Text:** Test dynamic type scaling
- **Reduce Motion:** Test animations with reduced motion

### Test Network Conditions

Simulator → **Settings** → **Developer** → **Network Link Conditioner**

- Test on slow 3G, 4G, or LTE connections
- Simulate poor network conditions

### Test in Dark Mode

Simulator → **Features** → **Toggle Appearance**

Or set permanently:
Simulator → **Settings** → **Display & Brightness** → **Dark**

## Alternative: Physical iOS Device

Don't want to use the Simulator? You can use a physical iPhone or iPad:

### Option 1: Expo Go (Easiest)

1. Install **Expo Go** from the App Store on your iPhone
2. Make sure your phone and Mac are on the **same WiFi network**
3. Run `npm start` in the project directory
4. Scan the QR code shown in the terminal with your iPhone camera
5. Tap the notification to open in Expo Go

### Option 2: Development Build (Advanced)

For testing features not supported by Expo Go:

1. Connect your iPhone to your Mac via USB
2. Open **Xcode** → **Settings** → **Accounts**
3. Add your Apple ID
4. In the project:
```bash
cd Frontend_2025_Scouting
npx expo run:ios --device
```

**Note:** This requires an Apple Developer account (free tier works).

## Next Steps

Once you have the Simulator running:

- Try making code changes and see them reload instantly (Fast Refresh)
- Test different device sizes by creating multiple Simulators
- Test in both Light and Dark mode
- Use React Native Debugger or Flipper for debugging
- Test accessibility features like VoiceOver

## Additional Resources

- [Apple's Simulator User Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
- [Expo iOS Simulator Guide](https://docs.expo.dev/workflow/ios-simulator/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup?platform=ios)

Happy developing! 🍎
