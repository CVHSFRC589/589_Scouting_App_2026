# Android Emulator Setup Guide

This guide will help you set up an Android emulator to test the scouting app on your computer.

**Note:** iOS emulation only works on Mac computers. Windows users can only run Android emulators.

## Why Use an Emulator?

- Test the app without a physical phone
- Faster development cycle (instant reload)
- Test different screen sizes and Android versions
- Debug more easily with developer tools

## Installation

### Windows Setup

#### 1. Download and Install Android Studio

1. Go to https://developer.android.com/studio
2. Download Android Studio for Windows
3. Run the installer
4. During installation, make sure these components are selected:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)

#### 2. Set Up Environment Variables

**Option A: Using Windows GUI (Recommended)**

1. Press `Windows key` and search for **"Environment Variables"**
2. Click **"Edit the system environment variables"**
3. Click **"Environment Variables"** button at the bottom
4. Under **"User variables"**, click **"New"**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - Replace `<YourUsername>` with your actual Windows username
5. Find **"Path"** in User variables, click **"Edit"**, then click **"New"** and add these two lines:
   - `C:\Users\<YourUsername>\AppData\Local\Android\Sdk\platform-tools`
   - `C:\Users\<YourUsername>\AppData\Local\Android\Sdk\emulator`
6. Click **"OK"** on all dialogs

**Option B: Using PowerShell**

Open PowerShell as Administrator and run:

```powershell
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\emulator"
```

#### 3. Verify Installation

**Close and reopen VSCode** (or any terminal), then run:

```bash
adb --version
```

**Expected output:**
```
Android Debug Bridge version 1.0.41
```

If you see this, you're ready to create an emulator!

### Mac Setup

#### 1. Download and Install Android Studio

1. Go to https://developer.android.com/studio
2. Download Android Studio for Mac
3. Open the downloaded `.dmg` file
4. Drag Android Studio to your Applications folder
5. Launch Android Studio
6. During setup, make sure these components are selected:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)

#### 2. Set Up Environment Variables

Open Terminal and add these lines to your shell profile:

**For zsh (default on newer Macs):**

```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

**For bash (older Macs):**

```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bash_profile
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bash_profile
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bash_profile
source ~/.bash_profile
```

#### 3. Verify Installation

```bash
adb --version
```

**Expected output:**
```
Android Debug Bridge version 1.0.41
```

## Creating an Android Virtual Device (AVD)

Follow these steps on both Windows and Mac:

### 1. Open Virtual Device Manager

1. Launch **Android Studio**
2. On the welcome screen, click **"More Actions"** → **"Virtual Device Manager"**
   - Or if you have a project open: **Tools** → **Device Manager**

### 2. Create a New Device

1. Click **"Create Device"** button
2. **Select Hardware:**
   - Choose **"Phone"** category
   - Select **"Pixel 5"** (good balance of features and performance)
   - Click **"Next"**

3. **Select System Image:**
   - Choose **"Tiramisu"** (API Level 33) or **"UpsideDownCake"** (API Level 34)
   - If you see a **"Download"** link next to it, click it and wait for download
   - Click **"Next"**

4. **Configure AVD:**
   - Name: `Pixel_5_API_33` (or keep default)
   - Under **"Emulated Performance"**, select **"Hardware - GLES 2.0"**
   - Click **"Show Advanced Settings"** (optional, for better performance):
     - RAM: 4096 MB (if your computer has 8GB+ RAM)
     - VM heap: 512 MB
   - Click **"Finish"**

### 3. Start the Emulator

In the Device Manager, find your new device and click the **▶ (Play)** button.

**Expected result:** An Android phone window should appear and boot up (takes 1-2 minutes first time).

## Using the Emulator with Expo

### 1. Start the Emulator

Before running Expo, start your Android emulator:
- Open **Android Studio** → **Device Manager** → Click **▶** on your AVD

**Or use command line:**

**Windows:**
```bash
cd %LOCALAPPDATA%\Android\Sdk\emulator
emulator -avd Pixel_5_API_33
```

**Mac:**
```bash
cd $ANDROID_HOME/emulator
./emulator -avd Pixel_5_API_33
```

### 2. Verify Device is Detected

```bash
adb devices
```

**Expected output:**
```
List of devices attached
emulator-5554   device
```

### 3. Start Expo

Open VSCode terminal and run:

```bash
cd Frontend_2025_Scouting
npm start
```

### 4. Open App in Emulator

When the Expo menu appears, press **`a`** to open in Android emulator.

**Expected result:** The app should build and open in the emulator automatically.

## Troubleshooting

### Emulator won't start

**"HAXM/WHPX not installed" error (Windows):**
1. Open Android Studio → **Tools** → **SDK Manager**
2. Click **"SDK Tools"** tab
3. Check **"Intel x86 Emulator Accelerator (HAXM installer)"** (Intel CPUs) or enable WHPX (AMD CPUs)
4. Click **"Apply"**

**Mac performance issues:**
1. Enable hardware acceleration in AVD settings
2. Reduce emulator RAM to 2048 MB if your Mac has less than 8GB RAM

### Expo can't find emulator

1. **Start emulator FIRST**, then run `npm start`
2. Verify emulator is running: `adb devices` should show a device
3. Restart Expo dev server (press `r` in terminal)

### "adb: command not found"

Your environment variables aren't set correctly. Repeat the environment variable setup steps and **restart VSCode**.

### Emulator is very slow

1. Close other applications to free up RAM
2. In AVD settings, reduce RAM to 2048 MB
3. Use a lower API level (e.g., API 30 instead of 34)
4. Make sure hardware acceleration is enabled

### Port already in use

Another emulator instance is running:

**Windows:**
```bash
tasklist | findstr emulator
taskkill /IM emulator.exe /F
```

**Mac:**
```bash
ps aux | grep emulator
killall emulator
```

## Emulator Shortcuts

Once the emulator is running:

- **Rotate screen:** `Ctrl+Left/Right Arrow` (Windows) or `Cmd+Left/Right` (Mac)
- **Volume up/down:** `Ctrl+=/-` (Windows) or `Cmd+=/-` (Mac)
- **Back button:** `ESC`
- **Home button:** `Home` key
- **Take screenshot:** Camera icon in emulator toolbar

## Alternative: Physical Android Device

Don't want to use an emulator? You can use a physical Android phone:

1. Install **Expo Go** from Google Play Store
2. Enable **Developer Options** on your phone:
   - Go to **Settings** → **About Phone**
   - Tap **"Build Number"** 7 times
   - Go back to **Settings** → **Developer Options**
   - Enable **"USB Debugging"**
3. Connect phone to computer via USB
4. Run `npm start` and press `a`

Or scan the QR code in the Expo terminal (phone and computer must be on same WiFi).

## Next Steps

Once you have the emulator running:
- Try making code changes and see them reload instantly
- Test different screen sizes by creating multiple AVDs
- Use React Native Debugger for debugging

Happy developing! 🤖
