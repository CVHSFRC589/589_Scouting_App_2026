# Rookie Week Demo Setup Guide

This guide helps **FRC Team 589** run the scouting app demo during rookie week meetings. The app runs in **demo mode** with built-in sample data - no backend server required!

---

## Section 1: Team Lead Setup (One-Time Setup)

**This section is for the team lead who will run the development server on their laptop.**

### Prerequisites

Before the meeting, make sure you have:
- Completed the `Frontend_2025_Scouting/docs/FRONTEND_SETUP_GUIDE.md` (covers Windows, macOS, and repository cloning)
- Node.js and npm installed (covered in setup guide)

### Step 1: Install Dependencies

Open a terminal and navigate to the frontend folder:

```bash
cd Frontend_2025_Scouting
npm install
```

This will install all required packages. **You only need to do this once** (unless dependencies are updated).

### Step 2: Create an Expo Account (If You Haven't Already)

1. Go to [expo.dev](https://expo.dev)
2. Sign up for a free account
3. Remember your login credentials

### Step 3: Login to Expo CLI

In your terminal:

```bash
npx expo login
```

Enter your Expo account credentials when prompted.

### Step 4: Start the Development Server

Start the server with tunnel mode:

```bash
npx expo start --tunnel
```

**Important**: The `--tunnel` flag is required! It creates a connection that works across different networks.

### Step 5: Wait for the QR Code

After a few moments, you'll see:
- A **QR code** displayed in your terminal
- A message saying **"Tunnel ready"**
- The local development URL

**Keep this terminal window open** - students will scan the QR code to connect!

### Before the Meeting Checklist:
- ✅ Development server is running (`npx expo start --tunnel`)
- ✅ QR code is visible in the terminal
- ✅ "Tunnel ready" message appears
- ✅ Laptop is on a table where students can scan the QR code

---

## Section 2: Student Setup (During the Meeting)

**This section is for students who want to run the demo app on their phones.**

### Step 1: Install Expo Go

#### For iPhone:
1. Open the **App Store**
2. Search for **"Expo Go"**
3. Download and install the app

#### For Android:
1. Open the **Google Play Store**
2. Search for **"Expo Go"**
3. Download and install the app

### Step 2: Scan the QR Code

1. Open **Expo Go** on your phone
2. **For iPhone**: Tap **"Scan QR Code"** in the Expo Go app
3. **For Android**: Tap **"Scan QR Code"** in the Expo Go app
4. Point your camera at the **QR code on the team lead's laptop**
5. Wait for the app to load (this may take 30-60 seconds the first time)

**Note**: You do **NOT** need to create an Expo account to use the demo!

### Step 3: Skip Login and Start Exploring

1. When the app loads, you'll see a login screen
2. Tap the **Skip button** (right-pointing arrow icon) at the bottom
3. The app will load with default team data (Team 589, East Bay regional)

### Step 4: Explore Demo Mode

The app will run in **demo mode** with sample data for 6 FRC teams:
- **Team 589** (The Falcons) - our team!
- Team 254 (The Cheesy Poofs)
- Team 1678 (Citrus Circuits)
- Team 1323 (MadTown Robotics)
- Team 971 (Spartan Robotics)
- Team 2056 (OP Robotics)

You'll see a **red database icon** ⭕ in the upper right corner of the home screen indicating demo mode is active.

### Step 5: Demo Mode Navigation

In demo mode, you have special navigation features to quickly move through the scouting workflow:

**Arrow Navigation:**
- Look for the **forward arrow (>)** in the top-right corner of each match scouting screen
- Tap it to skip to the next screen without filling out forms
- Works on all match scouting screens: Pregame → Auto → Tele → Post

**Swipe Gestures:**
- **Swipe left** to go to the next screen
- **Swipe right** to go back to the previous screen
- Great for quickly demonstrating the full scouting workflow!

---

## What Can You Do in Demo Mode?

### Available Features:

**Home Screen**: View team rankings with the top 3 teams displayed on a podium

**Pit Scouting**: Record robot capabilities
- Enter team number
- Select vision system (Yes/No)
- Select drive train (Swerve/Tank/Wheel)
- Toggle scoring abilities on/off
- Select climb capabilities
- Add comments

**Match Scouting**: Full match data entry workflow
- **Pre-game**: Select regional, team, match number, and starting position
- **Autonomous**: Track coral and algae scoring during auto period
- **Teleop**: Record game piece scoring during driver-controlled period
- **Post-game**: Rate driver performance (1-10 scale) and add comments

**Leaderboard**: Browse and sort all teams by different statistics
- Sort by: Rank, Algae (Scored/Removed/Processed), Coral (L1/L2/L3/L4)
- Search for specific teams by number

**Team Info**: View detailed statistics and match history for any team
- Match data with scoring breakdowns
- Qualification data
- Climb statistics

### Demo Data Includes:
- Realistic team statistics and rankings
- Sample match data showing scoring patterns
- Climb statistics (deep/shallow/parked percentages)
- All game piece scoring data (coral levels L1-L4, algae scored/removed/processed)

### Important Demo Behaviors:
- ✅ **All data entry shows success messages** but doesn't permanently save (it's demo mode!)
- ✅ **Network errors are handled gracefully** - the app won't crash
- ✅ **Works completely offline** once loaded on your phone
- ✅ The **red database icon** reminds you that you're in demo/offline mode

---

## Practice Activities for Rookie Week

### Getting Familiar with the Interface:
1. **Explore the home screen** - notice the top 3 teams on the podium
2. **Try the Skip button** - see how quickly you can get into the app
3. **Check out the Leaderboard** - practice sorting by different statistics
4. **Look at Team Info** - view detailed stats for different teams

### Practice Data Entry:

**Pit Scouting Practice:**
1. Tap **"Pit"** from the home screen
2. Enter a team number (try **589**!)
3. Use the dropdown to select **Vision System**: Yes or No
4. Use the dropdown to select **Drive Train**: Swerve, Tank, or Wheel
5. Toggle the **Intake** options (Ground/Source)
6. Toggle the **Scoring** levels (L1/L2/L3/L4)
7. Toggle the **Algae** capabilities (Remove/Net/Processor)
8. Toggle the **Climb** options (Deep/Shallow)
9. Add a comment like "Great robot design!"
10. Tap **Submit** and see the success message

**Match Scouting Practice:**
1. Tap **"Match"** from the home screen
2. **Pre-game**:
   - Select **East Bay** regional
   - Select a team (try **589**)
   - Enter match number **1**
   - Use the slider to select a starting position
   - Tap **Next**
3. **Autonomous**:
   - Practice using the **+** buttons to score coral at different levels
   - Try the algae counters
   - Tap **Next**
4. **Teleop**:
   - Use the quick-add buttons to score game pieces
   - Notice how counters increment
   - Tap **Next**
5. **Post-game**:
   - Slide the **Driver Rating** to rate 1-10
   - Try tapping the **Quick Tags** (Disabled, No Show, Defense, Malfunction)
   - Add a comment about the match
   - Tap **Submit**

### Understanding the Workflow:
- Notice how the **progress bar** at the top shows your position (Pre → Auto → Tele → Post)
- See how **quick tags** toggle on/off with visual feedback
- Experiment with the **starting position slider** - click anywhere to snap to that position
- Practice using the **number pad** that appears for team and match entry
- Try the **keyboard toggle** on pit scouting to switch between number pad and full keyboard

### Using Demo Navigation Features:
- **Forward arrows (>)** appear in the top-right corner - tap to skip to the next screen
- **Swipe left** on any match scouting screen to advance forward
- **Swipe right** to go back to the previous screen
- These features only appear in demo mode to help you learn the workflow quickly!

---

## Troubleshooting

### "I can't scan the QR code"
- Make sure you're using the **Expo Go app** to scan (not your phone's camera)
- Move closer to the laptop screen
- Make sure the terminal window with the QR code is maximized
- Ask the team lead to verify the server is running with "Tunnel ready" message

### "The app is loading very slowly"
- **First time loads take 30-60 seconds** - this is normal!
- Make sure you have a good internet connection
- Once loaded, the app works offline

### "The app times out or shows network errors"
- **This is normal in demo mode!** The app is designed to work offline
- Just tap **Skip** on the login screen
- The app will load with sample data and work perfectly

### "The app shows success but my data isn't saved"
- **This is expected in demo mode!**
- Demo mode shows realistic success messages to help you practice
- When connected to the real backend at competition, data will be saved to the database

### "I closed the app and can't get back in"
- In **Expo Go**, look for **"Recently opened"** and tap the Reefscape app
- Or scan the QR code again from the team lead's laptop

---

## What Makes This App Special?

### Demo-Ready Design:
- **Works completely offline** with realistic sample data
- **No crashes or errors** - designed to be fault-tolerant
- **Smooth user experience** even without backend connection
- Perfect for demos, practice, and learning!

### Real Scouting Features:
- **Fast data entry** with number pads and quick-add buttons
- **Visual feedback** with sliders, toggles, and counters
- **Progress tracking** so you always know where you are in match scouting
- **Realistic workflows** matching actual competition scouting

---

## Next Steps

### For Rookie Week:
- Practice entering data on all screens
- Get comfortable with the match scouting workflow (Pre → Auto → Tele → Post)
- Learn what statistics matter for team selection and strategy
- Ask questions about scouting priorities and how we use data!

### For Students Interested in Development:
- Review the setup guide: `Frontend_2025_Scouting/docs/FRONTEND_SETUP_GUIDE.md` (covers both Windows and macOS)
- Check out `Frontend_2025_Scouting/docs/PHYSICAL_DEVICE_GUIDE.md` for more testing options
- Clone the repository and explore the code
- Read `Docs/APP_QUICKSTART.md` in the main Docs folder
- Ask team leads about contributing to development

---

## Questions?

### For Team Leads:
- Having trouble starting the server? Check `Frontend_2025_Scouting/docs/FRONTEND_SETUP_GUIDE.md`
- Need help with Expo account? See `Frontend_2025_Scouting/docs/PHYSICAL_DEVICE_GUIDE.md`
- Want to understand the code? Check `Docs/APP_QUICKSTART.md`

### For Students:
- Can't scan the QR code? Ask the team lead to help
- Want to understand the scouting workflow? Practice with the app!
- Interested in development? See the "Next Steps" section above
- Questions about strategy? Talk to mentors and experienced team members

---

**Happy scouting!** 🤖🔧

*Remember: Demo mode is perfect for learning. Once we're at competition with the backend server, all your data entry will be saved to help our team make strategic decisions!*
