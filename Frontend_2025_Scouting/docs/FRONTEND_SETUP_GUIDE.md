# Complete Setup Guide - Team 589 Scouting Frontend

**Welcome to Team 589!** This guide will walk you through setting up your development environment from scratch. By the end, you'll have the scouting mobile app running on your laptop and connected to a simulator or physical device.

## Table of Contents
1. [Install Required Software](#step-1-install-required-software)
2. [Set Up Visual Studio Code](#step-2-set-up-visual-studio-code)
3. [Clone the Repository](#step-3-clone-the-repository)
4. [Configure the Application](#step-4-configure-the-application)
5. [Install Project Dependencies](#step-5-install-project-dependencies)
6. [Run the Application](#step-6-run-the-application)
7. [Verify Everything Works](#step-7-verify-everything-works)

---

## Step 1: Install Required Software

### 1.1 Install Node.js (v20 or higher)

Node.js is the runtime environment that powers our React Native development tools.

**For Windows:**
1. Visit: https://nodejs.org/en/download
2. Download the "LTS" (Long Term Support) version for Windows
3. Run the installer (`.msi` file)
4. Follow the installation wizard (accept defaults)
5. Verify installation:
   - Open Command Prompt (search "cmd" in Start menu)
   - Type: `node --version`
   - You should see something like `v20.x.x` or higher

**For Mac:**
1. Visit: https://nodejs.org/en/download
2. Download the "LTS" version for macOS
3. Run the installer (`.pkg` file)
4. Follow the installation wizard
5. Verify installation:
   - Open Terminal (Cmd+Space, type "Terminal")
   - Type: `node --version`
   - You should see something like `v20.x.x` or higher

**Alternative - Using a Version Manager (Recommended for advanced users):**

<details>
<summary>Click to expand: Installing Node.js with nvm (Node Version Manager)</summary>

**For Mac/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then install Node.js
nvm install 20
nvm use 20
```

**For Windows:**
1. Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Install and then:
```bash
nvm install 20
nvm use 20
```
</details>

### 1.2 Install Git

Git is the version control system we use to manage code.

**For Windows:**
1. Visit: https://git-scm.com/download/win
2. Download and run the installer
3. During installation:
   - Select "Use Visual Studio Code as Git's default editor" (if you've installed VS Code)
   - Keep other defaults
4. Verify installation:
   ```bash
   git --version
   ```

**For Mac:**

Git is usually pre-installed on Mac. Verify by opening Terminal and typing:
```bash
git --version
```

If not installed, you'll be prompted to install Xcode Command Line Tools. Click "Install" and follow the prompts.

### 1.3 Install Expo Go Mobile App (For Testing on Physical Devices)

***On your iPhone or Android device:***

**For iOS (iPhone/iPad):**
1. Open the App Store on your device
2. Search for "Expo Go"
3. Install the app
4. You'll use this to test the app on your phone

**For Android:**
1. Open the Google Play Store on your device
2. Search for "Expo Go"
3. Install the app
4. You'll use this to test the app on your phone


<summary><h3>Install Mobile Emulator/Simulator (Optional but Recommended)</h3></summary>
<details>

**For Mac (iOS Simulator):**
1. Install Xcode from the Mac App Store (this is large - 10+ GB)
2. Once installed, open Xcode
3. Go to `Xcode` > `Preferences` > `Components`
4. Install the latest iOS Simulator version
5. The simulator will be available when you run the app

> **NOTE:** Xcode and the iOS emulator is only available for Macs

**For Windows/Mac (Android Emulator):**
1. Visit: https://developer.android.com/studio
2. Download Android Studio
3. Run the installer and follow the setup wizard
4. During setup:
   - Install the Android SDK
   - Install Android SDK Platform
   - Install Android Virtual Device (AVD)
5. After installation:
   - Open Android Studio
   - Click "More Actions" > "Virtual Device Manager"
   - Click "Create Device"
   - Select a device (e.g., Pixel 5)
   - Select a system image (e.g., latest Android version)
   - Finish setup
</details>
---

## Step 2: Set Up Visual Studio Code

### 2.1 Install VS Code

**For Windows:**
1. Visit: https://code.visualstudio.com/download
2. Download the Windows version
3. Run the installer
4. **Important:** Check "Add to PATH" during installation
5. Launch VS Code

**For Mac:**
1. Visit: https://code.visualstudio.com/download
2. Download the Mac version
3. Open the `.zip` file and drag VS Code to Applications folder
4. Launch VS Code from Applications

### 2.2 Install Essential VS Code Extensions

Once VS Code is open:

1. **Open the Extensions view:**
   - Click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X` on Windows, `Cmd+Shift+X` on Mac)

2. **Install these essential extensions** (search for each and click "Install"):

   **Required Extensions:**

   - **ESLint** - JavaScript code quality
     - Search: "ESLint"
     - Publisher: Microsoft

   - **Prettier - Code formatter** - Automatic code formatting
     - Search: "Prettier"
     - Publisher: Prettier

   **Highly Recommended Extensions:**
   - **Claude Code** - AI-powered coding assistant
     - Search: "Claude Code"
     - Publisher: Anthropic
     - Install link: [Claude Code Extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)

   - **React Native Tools** - Essential for React Native development 
     - Search: "React Native Tools"
     - Publisher: Microsoft

   - **ES7+ React/Redux/React-Native snippets** - Code shortcuts for React 
     - Search: "ES7+ React/Redux/React-Native snippets"
     - Publisher: dsznajder

   - **GitLens** - Enhanced Git capabilities
     - Search: "GitLens"
     - Publisher: GitKraken

   - **JavaScript (ES6) code snippets** - Code shortcuts
     - Search: "JavaScript (ES6) code snippets"
     - Publisher: charalampos karypidis

   - **npm Intellisense** - Autocomplete npm modules
     - Search: "npm Intellisense"
     - Publisher: Christian Kohler

   - **Auto Rename Tag** - Automatically rename paired tags 
     - Search: "Auto Rename Tag"
     - Publisher: Jun Han

   - **Expo Tools** - Expo development support
     - Search: "Expo Tools"
     - Publisher: Expo

### 2.3 Configure VS Code Settings (Optional but Recommended)

1. Open Settings: `File` > `Preferences` > `Settings` (Windows) or `Code` > `Preferences` > `Settings` (Mac)
2. Search for these settings and enable them:
   - "Format On Save" - Auto-format your code when you save
   - "Auto Save" - Set to "afterDelay" so you don't lose work

---

## Step 3: Clone the Repository

### 3.1 Choose a Location for Your Code

**For Windows:**
```bash
# Open Command Prompt or PowerShell
# Create a folder for your coding projects (if it doesn't exist)
mkdir C:\Users\YourUsername\Projects\589
cd C:\Users\YourUsername\Projects\589
```

**For Mac:**
```bash
# Open Terminal
# Create a folder for your coding projects (if it doesn't exist)
mkdir ~/Projects/589
cd ~/Projects/589
```

### 3.2 Clone the Repository from GitHub

**Team 589 Scouting Frontend Repository:**

```bash
# Clone the repository (this is a public github project and should be accessible)
git clone https://github.com/CVHSFRC589/589_Scouting_App_2026.git

# Navigate into the frontend project folder
cd 589_Scouting_App_2026/Frontend_2025_Scouting
```

### 3.3 Open the Project in VS Code

**From Command Line/Terminal:**
```bash
# Make sure you're in the Frontend_2025_Scouting project directory
# Windows: cd C:\Users\YourUsername\Projects\589\589_Scouting_App_2026\Frontend_2025_Scouting
# Mac: cd ~/Projects/589/589_Scouting_App_2026/Frontend_2025_Scouting
code .
```

**Or from VS Code:**
1. Open VS Code
2. Click `File` > `Open Folder`
3. Navigate to where you cloned the repository
4. Select the `Frontend_2025_Scouting` folder and click "Open"

---

## Step 4: Configure the Application

### 4.1 About the Backend (aka Database) Connection

Our React Native app connects directly to **Supabase** (a cloud PostgreSQL database with built-in authentication and real-time features) to fetch and submit scouting data.

**Important:** You need to complete the Supabase setup before the app will work. See your team lead for the shared Supabase credentials, or refer to [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) to set up your own Supabase project.

### 4.2 Get Your Supabase Credentials

You need two pieces of information from Supabase:
1. **Project URL** (looks like `https://xxxxx.supabase.co`)
2. **Publishable Key** (starts with `sb_publishable_...`)

**Option A - Use Team Credentials (Recommended for Team Members):**
- Ask your team lead for the shared `.env` file with Supabase credentials
- Copy the `.env` file to the `Frontend_2025_Scouting` directory

**Option B - Set Up Your Own Supabase Project:**
- Follow the [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) to create your own Supabase project
- Get your credentials from the Supabase dashboard (Settings → API Keys)

### 4.3 Create Your Environment Configuration File

The app needs environment variables to connect to Supabase. These are stored in a `.env` file.

1. **In VS Code, open the project folder** (`Frontend_2025_Scouting`)
2. **Check if you already have a `.env` file** from your team lead
   - If yes, skip to Step 5
   - If no, continue to Step 3

3. **Create a `.env` file:**

   **Option A - Using VS Code:**
   - Right-click `.env.example` and select "Copy"
   - Right-click in the file explorer and select "Paste"
   - Rename the copy from `.env.example copy` to `.env`

   **Option B - Using Command Line:**

   **Windows (PowerShell):**
   ```powershell
   Copy-Item .env.example .env
   ```

   **Mac:**
   ```bash
   cp .env.example .env
   ```

4. **Open the `.env` file and add your Supabase credentials:**

   ```env
   # Supabase Configuration (Direct Frontend Access)
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_KEY=sb_publishable_...your_key_here
   ```

   Replace:
   - `https://xxxxx.supabase.co` with your actual **Project URL**
   - `sb_publishable_...your_key_here` with your actual **Publishable Key**

5. **Your `.env` file should look like this:**

   ```env
   # Supabase Configuration (Direct Frontend Access)
   PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   PUBLIC_SUPABASE_KEY=sb_publishable_eyJhb...lots_of_characters_here
   ```

6. **Save the file** (`Ctrl+S` on Windows, `Cmd+S` on Mac)

⚠️ **Security Note:** The `.env` file should be in `.gitignore`, so it won't be committed to GitHub. The publishable key is safe to use in the frontend, but never share your service role key!

⚠️ **Important:** This `.env` file should be shared with all team members who are developing the app. The publishable key is designed to be used in client-side applications and is protected by Row Level Security (RLS) policies in the database.

---

## Step 5: Install Project Dependencies

Now we'll install all the Node.js packages (libraries) that the project needs.

### 5.1 Open the Integrated Terminal in VS Code

1. In VS Code, open the terminal: `Terminal` > `New Terminal` (or press `` Ctrl+` `` on Windows, `` Cmd+` `` on Mac)
2. Make sure you're in the project directory (you should see `Frontend_2025_Scouting` in the path)

### 5.2 Install Dependencies

Run this command:

```bash
npm install --legacy-peer-deps
```

**What's happening?**
- `npm` (Node Package Manager) reads the `package.json` file
- It downloads all required libraries into a `node_modules` folder
- This includes React Native, Expo, and all other dependencies
- This may take 2-5 minutes depending on your internet speed
- The `--legacy-peer-deps` flag may be needed because our project uses React 19 (latest version)

**You should see:**
- Progress bars as packages are downloaded
- Eventually: `added XXX packages` (the number varies, usually 500+)
- No major error messages (warnings are usually okay)

**Common Issues:**

<details>
<summary>Error: "npm not found" or "npm is not recognized"</summary>

**Solution:** Node.js wasn't installed correctly or isn't in your PATH.
- Close and reopen your terminal
- Verify Node.js installation: `node --version`
- If still not working, reinstall Node.js from Step 1.1

</details>

<details>
<summary>Error: "permission denied" or "EACCES"</summary>

**Solution (Mac/Linux):** Don't use `sudo`. If you used sudo to install Node.js, you may need to fix permissions:
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Solution (Windows):** Run your terminal as Administrator and try again.

</details>

<details>
<summary>Error: "peer dependency" warnings or conflicts</summary>

**Solution:** These are usually safe to ignore. React Native projects often have complex dependency trees. If the installation completes, you're good to go.

**If installation fails with peer dependency errors:**
```bash
npm install --legacy-peer-deps
```

This tells npm to use the legacy (npm v6) peer dependency resolution strategy, which is more permissive. Our project uses React 19 (latest) which some packages may not officially support yet, so this flag may be needed.

</details>

---

## Step 6: Run the Application

### 6.1 Start the Expo Development Server

**Recommended: Use the Startup Script**

We've created a helper script that checks for common setup issues before starting the app. This is the **preferred way** to start the application.

**In VS Code, open a Bash terminal:**
1. Click `Terminal` > `New Terminal` (or press `` Ctrl+` ``)
2. In the terminal dropdown (top-right of terminal panel), select **Git Bash** or **Bash**
3. Make sure you're in the `Frontend_2025_Scouting` directory

**Run the startup script:**

```bash
# Normal start (recommended)
./start_app.sh

# If you have connection issues with your phone
./start_app.sh --tunnel

# If you need to clear the cache
./start_app.sh --clear

# Both options together
./start_app.sh --tunnel --clear
```

**What the script does:**
- ✓ Checks that Node.js and npm are installed correctly
- ✓ Verifies you're in the correct directory
- ✓ Confirms your `.env` file exists and is configured
- ✓ Ensures `node_modules` dependencies are installed
- ✓ Checks if port 8081 is available
- ✓ Provides helpful error messages referencing this guide
- ✓ Starts Expo with your chosen options

<details>
<summary><b>Alternative: Manual Start (if you prefer not to use the script)</b></summary>

If you prefer to start Expo manually without the pre-flight checks:

```bash
cd Frontend_2025_Scouting  # if not already in the Frontend_2025_Scouting directory
npm start

# Or with options:
npm start -- --tunnel        # Tunnel mode for connection issues
npm start -- --clear         # Clear cache
npm start -- --tunnel --clear  # Both options
```

</details>

**What's happening?**
- Expo bundler starts and compiles your JavaScript code
- A QR code appears in the terminal
- The Metro bundler runs (this is the JavaScript bundler for React Native)
- The development server runs on port 8081 by default

### 6.2 Success! You Should See:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 6.3 Choose How to Run the App

**Option A - Physical Device (Easiest):**
1. Open the Expo Go app on your phone
2. **iOS:** Open the Camera app and point it at the QR code in the terminal
3. **Android:** In Expo Go, tap "Scan QR Code" and scan the QR code in the terminal
4. The app will load on your phone (may take 30-60 seconds the first time)

⚠️ **Important:** Your phone and computer must be on the same WiFi network!

<details>
<summary>Issue: The application appears to start, but I can't connect my iPhone to run the app</summary>

**Solution:** Try running Expo using a network tunnel, which can help solve many common network issues.

Press Ctrl-C in the terminal window to quit the app, then start over with tunnel mode:

**Using the startup script (recommended):**
```bash
./start_app.sh --tunnel
```

**Or manually:**
```bash
npm start -- --tunnel
```
</details>
<br>

**Option B - iOS Simulator (Mac Only):**
1. Press `i` in the terminal
2. The iOS Simulator will open automatically
3. The app will load in the simulator

**Option C - Android Emulator:**
  1. Start your Android emulator first (from [Android
  Studio](https://developer.android.com/studio) or command line)
2. Press `a` in the terminal
3. The app will load in the emulator

**Option D - Web Browser (Limited functionality):**
1. Press `w` in the terminal
2. The app will open in your default web browser
3. Note: Some mobile-specific features may not work in web mode

### 6.4 Common Startup Errors

<details>
<summary>Error: "Port 8081 is already in use"</summary>

**Solution:**
- Another React Native/Metro bundler instance is running
- Find and stop the other process:
  - **Windows:** Run `netstat -ano | findstr :8081` then `taskkill /PID [PID] /F`
  - **Mac:** Run `lsof -ti:8081 | xargs kill -9`
- Or run Expo on a different port: `npx expo start --port 8082`

</details>

<details>
<summary>Error: "Unable to resolve module..."</summary>

**Solution:**
1. Stop the server (`Ctrl+C`)
2. Clear the cache: `npm start -- --clear`
3. If that doesn't work, delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   npm start -- --clear  # add '--tunnel' also if needed
   ```

</details>

<details>
<summary>Error: "Cannot connect to Metro"</summary>

**Solution:**
- Check that your phone and computer are on the same WiFi network
- Disable any VPN on your computer or phone
- Try using Tunnel mode: `./start_app.sh --tunnel` (slower but works through firewalls)
- Make sure your firewall isn't blocking port 8081

</details>

<details>
<summary>Error: "ngrok tunnel took too long to connect"</summary>

**What this means:**
- Tunnel mode uses a service called ngrok to create a network tunnel
- The connection to ngrok timed out (usually due to network issues or ngrok service problems)

**Solution:**
1. **First, try without tunnel mode** (if on same WiFi network):
   ```bash
   ./start_app.sh
   ```
   Your phone and computer must be on the same WiFi for this to work.

2. **If you need tunnel mode:**
   - Check your internet connection
   - Try again - ngrok service may be temporarily slow
   - Wait a few minutes and retry
   - Check ngrok status: https://status.ngrok.com/

3. **Alternative solution - Use a different connection method:**
   - Use an iOS Simulator (Mac only) - press `i`
   - Use an Android Emulator - press `a`
   - Connect via USB (requires additional setup)

**Note:** Tunnel mode is slower than direct connection and should only be used when you cannot connect your phone to the same WiFi network as your computer.

</details>

<details>
<summary>iOS Simulator doesn't open</summary>

**Solution:**
- Make sure Xcode is installed
- Open Xcode once to accept the license agreement
- Try opening the simulator manually first (search "Simulator" in Spotlight)
- Then press `i` in the Expo terminal

</details>

<details>
<summary>Android Emulator doesn't connect</summary>

**Solution:**
- Make sure the emulator is running before pressing `a`
- Check that Android SDK is installed correctly
- Try: `adb devices` to see if your emulator is detected
- If not detected, restart the emulator

</details>

---

## Step 7: Verify Everything Works

### 7.1 Test the App Interface

Once the app loads on your device/simulator:

1. **Check the Login Screen:**
   - You should see the Team 589 Scouting App login screen
   - The interface should be responsive and look correct
   - `Sign Up` for an account below the `Sign In` button to get started

2. **Test Basic Navigation:**
   - Try navigating through the app screens
   - Check that buttons respond to taps
   - Verify that the UI elements render correctly

3. **Test Backend Connection:**
   - Try logging in or accessing features that require backend data
   - If the backend is running (see Step 7.3), you should be able to:
     - View team lists
     - View match data
     - Submit scouting forms

### 7.2 Test Hot Reload

One of the best features of Expo is hot reload:

1. **Open any `.tsx` file** in the app (e.g., `app/(login)/index.tsx`)
2. **Make a visible change** - maybe change some text or a color
3. **Save the file** (`Ctrl+S` or `Cmd+S`)
4. **Watch your device/simulator** - the app should automatically reload with your changes!

### 7.3 Test Database Connection

The app connects directly to Supabase - no separate backend server needed!

1. **Verify your Supabase credentials are correct:**
   - Check your `.env` file has valid `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_KEY`

2. **Test the connection:**
   - In the mobile app, try to sign up or log in
   - Try navigating to the leaderboard
   - If you loaded test data (Step 6 of SUPABASE_SETUP_GUIDE.md), you should see 5 teams

3. **Check for errors:**
   - If you see connection errors, verify:
     - Your Supabase project is active (not paused)
     - The credentials in `.env` match your Supabase project
     - You're using the publishable key, not the service role key
     - Your device/computer has internet connection

### 7.4 View Logs and Debug

**In the Terminal:**
- The Expo terminal shows all console logs from your app
- Any `console.log()` statements in your code will appear here
- Errors and warnings will also appear here

**In the App:**
- Shake your physical device or press `Cmd+D` (iOS Simulator) or `Cmd+M` (Android Emulator)
- This opens the Developer Menu with options:
  - Reload
  - Debug Remote JS
  - Show Performance Monitor
  - Show Element Inspector

**Using React DevTools (Optional):**
1. Install globally: `npm install -g react-devtools`
2. Run: `react-devtools`
3. It will connect to your running app automatically
4. You can inspect component hierarchy and props

---

## 🎉 Congratulations!

You now have the 589 Scouting Frontend running on your device! Here's what you accomplished:

✅ Installed Node.js, Git, and VS Code
✅ Set up essential development tools and extensions
✅ Installed Expo Go and/or mobile simulators
✅ Cloned the repository from GitHub
✅ Configured the app to connect to the backend
✅ Installed all project dependencies
✅ Started the Expo development server
✅ Loaded the app on your device/simulator
✅ Verified the app is working correctly

---

## Next Steps

### Learn the Codebase

1. **Explore the Project Structure:**
   ```
   Frontend_2025_Scouting/
   ├── app/                        # App screens and routes (Expo Router)
   │   ├── (login)/               # Login flow screens
   │   │   ├── (regional)/        # Regional event screens
   │   │   │   ├── (Scouting)/   # Scouting screens
   │   │   │   └── (TeamInfo)/   # Team info screens
   │   └── index.tsx              # Entry point
   ├── components/                # Reusable UI components
   ├── data/                      # Data processing and utilities
   ├── assets/                    # Images, fonts, icons
   ├── app.json                   # Expo configuration
   ├── package.json              # Project dependencies
   └── .env                       # Environment variables (SECRET!)
   ```

2. **Understand the Technology Stack:**
   - **React Native:** Mobile app framework
   - **Expo:** Development platform and tools
   - **Expo Router:** File-based routing system
   - **TypeScript:** Type-safe JavaScript
   - **React Hooks:** State management

3. **Read the Code:**
   - Start with `app/index.tsx` - the entry point
   - Look at the screen files in `app/(login)/`
   - Check out reusable components in `components/`
   - Review data processing in `data/processing.tsx`

### Make Your First Code Change

1. **Open a simple screen** like `app/(login)/index.tsx`
2. **Find some text** to modify (maybe a title or button label)
3. **Change the text** to something else
4. **Save the file** - watch the app reload automatically!
5. **Experiment with styles** - try changing colors or sizes

### Use Claude Code

1. **Open Claude Code** (type `Ctrl+'` / `Cmd+'` to open a terminal in VS Code and type 'claude' at the prompt)
2. **Ask questions** about the codebase:
   - "Explain how the match scouting form works"
   - "How does navigation work in this app?"
   - "Show me where team data is fetched from the API"
3. **Get help with coding tasks:**
   - "Add a new button to the home screen"
   - "Help me understand the data processing logic"
   - "Create a new component for displaying match statistics"

### Learn More About the Technologies

- **React Native Basics:** https://reactnative.dev/docs/getting-started
- **Expo Documentation:** https://docs.expo.dev/
- **Expo Router:** https://docs.expo.dev/router/introduction/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/intro.html
- **React Hooks:** https://react.dev/reference/react

### Test on Multiple Platforms

- **iOS Simulator** (Mac only) - Test iPhone/iPad layouts
- **Android Emulator** - Test Android phone/tablet layouts
- **Physical Device** - Test real-world performance and features
- **Web** - Test basic functionality in browser (limited)

---

## Common Commands Reference

### Starting and Stopping the App

**Using the Startup Script (Recommended):**
```bash
# From the Frontend_2025_Scouting directory in a Bash terminal

# Normal start with pre-flight checks
./start_app.sh

# Start with tunnel mode (for connection issues)
./start_app.sh --tunnel

# Start with cleared cache
./start_app.sh --clear

# Combine options
./start_app.sh --tunnel --clear

# Show help
./start_app.sh --help
```

**Manual Start (Alternative):**
```bash
# From the Frontend_2025_Scouting directory

# Basic start
npm start

# Start with cache cleared
npm start -- --clear

# Start in tunnel mode (works through firewalls)
npm start -- --tunnel

# Start on specific platform
npm start -- --ios
npm start -- --android
npm start -- --web

# Combine options
npm start -- --tunnel --clear
```

**Stop the Server:**
```bash
# Press Ctrl+C in the terminal
```

### Development Shortcuts (when Expo is running)

```bash
# In the Expo terminal:
a    # Open on Android
i    # Open on iOS simulator
w    # Open in web browser
r    # Reload app
m    # Toggle developer menu
c    # Show build/bundler options
?    # Show all commands
```

### Working with Git

```bash
# Check status of your changes
git status

# Save your changes
git add .
git commit -m "Description of what you changed"

# Get latest changes from GitHub
git pull

# Push your changes to GitHub
git push
```

### Project Maintenance

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Clear Expo cache
npm start -- --clear

# Reset project completely
rm -rf node_modules
npm install
npm start -- --clear
```

### Building the App (Advanced)

```bash
# Create production build for iOS (requires Mac and Apple Developer account)
eas build --platform ios

# Create production build for Android
eas build --platform android

# Create APK for testing (Android)
eas build --platform android --profile preview
```

---

## Troubleshooting

### General Troubleshooting Tip

**Try the startup script first!** The `start_app.sh` script checks for common issues and provides specific guidance:

```bash
./start_app.sh
```

The script will check for missing dependencies, configuration issues, and other common problems before attempting to start the app.

### App Won't Start or Crashes

1. **Run the startup script to diagnose issues:**
   ```bash
   ./start_app.sh
   ```
2. **Clear the cache:**
   ```bash
   ./start_app.sh --clear
   # or manually: npm start -- --clear
   ```
3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```
4. **Check for JavaScript errors:** Look in the Expo terminal for error messages
5. **Check Node.js version:** Run `node --version` (must be 20.0.0 or higher)

### Cannot Connect to Supabase

1. **Check `.env` file:** Make sure `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_KEY` are correct
2. **Verify Supabase project is active:** Check your Supabase dashboard - free tier projects pause after inactivity
3. **Check internet connection:** Both your device and Supabase require internet access
4. **Verify you're using publishable key:** The key should start with `sb_publishable_`, not `sb_secret_`
5. **Check Supabase status:** Visit https://status.supabase.com/ to see if there are any outages

### Slow Performance

1. **Enable production mode:** Production builds are much faster than development
2. **Close other apps:** Free up memory on your device
3. **Use physical device:** Usually faster than simulators
4. **Check for memory leaks:** Look for console warnings about memory

### Changes Not Showing Up

1. **Reload the app:** Press `r` in the Expo terminal or shake device and select "Reload"
2. **Clear cache:** `npm start -- --clear`
3. **Check for syntax errors:** Look in terminal for error messages
4. **Make sure file is saved:** Check for unsaved indicator in VS Code

### TypeScript Errors

1. **Check VS Code problems panel:** View > Problems (`Ctrl+Shift+M`)
2. **Run type check:** `npx tsc --noEmit`
3. **Install type definitions:** Some packages need `@types/package-name`
4. **Restart TypeScript server:** `Ctrl+Shift+P` > "TypeScript: Restart TS Server"

### Expo Go Issues

1. **Update Expo Go:** Make sure you have the latest version from App Store/Play Store
2. **Check SDK version:** App and Expo Go must use compatible SDK versions
3. **Try development build:** If Expo Go doesn't work, create a custom development build

---

## Getting Help

### Team Resources

- **Team Lead/Mentor:** Ask questions during team meetings
- **GitHub Issues:** Report bugs or request features on the repository
- **Team Chat:** Use your team's communication platform (Slack, Discord, etc.)

### Documentation

- **This Guide:** You're reading it! Bookmark it for reference
- **Supabase Setup Guide:** [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
- **Other Docs:** Check the `docs/` folder for additional guides

### External Resources

- **Stack Overflow:** https://stackoverflow.com - Search for error messages
- **Expo Forums:** https://forums.expo.dev/
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Expo Docs:** https://docs.expo.dev/
- **VS Code Tips:** https://code.visualstudio.com/docs

### Using Claude Code for Help

Claude Code is built into VS Code and can help you:
- Understand error messages
- Debug issues
- Learn new concepts
- Write and modify code

Type `Ctrl+'` / `Cmd+'` to open a terminal in VS Code, type 'claude' at the prompt and ask your question!

---

## Important Security Reminders

⚠️ **Never commit these to GitHub:**
- `.env` file (contains Supabase credentials)
- `node_modules` folder (too large, can be regenerated)
- Any file with passwords or service role keys
- iOS/Android build credentials

✅ **These should be in `.gitignore`:**
- `.env`
- `node_modules/`
- `.expo/`
- Build artifacts

🔒 **Keep your service role key secret:**
- The **publishable key** (`sb_publishable_...`) is safe to share with team members - it's designed for client-side use
- The **service role key** (`sb_secret_...`) should NEVER be used in the frontend or shared
- Don't post credentials in screenshots or public messages
- If your service role key is exposed, regenerate it immediately in Supabase dashboard

---

**Welcome to the team! Happy coding! 🚀**

---

*Last Updated: 9 Nov 2025*
<br>
*Questions or improvements? Open an issue on GitHub or talk to your team lead.*
