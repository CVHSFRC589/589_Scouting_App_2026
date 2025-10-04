# FRC 589 Scouting App - Quick Start Guide

Quick steps to get the app running in VSCode.

## 1. Update from Remote Repository

Open VSCode terminal (`` Ctrl+` ``) and pull latest changes:

```bash
git pull
```

**Expected output:**
```
Already up to date.
```
or
```
Updating abc1234..def5678
Fast-forward
 [list of updated files]
```

**⚠️ Important:** This only pulls updates. It does NOT push your local changes to the remote.

## 2. Start the Backend

Open a terminal and run:

```bash
cd Backend_2025_Scouting
npm run dev
```

**Expected output:**
```
🚀 589 Scouting API Server running on port 3000
📊 Swagger docs available at http://localhost:3000/api-docs
```

**Leave this terminal running.**

## 3. Start the Frontend

Open a **second terminal** (Terminal → New Terminal) and run:

```bash
cd Frontend_2025_Scouting
npm start
```

**Expected output:**
```
› Metro waiting on exp://[your-ip]:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
```

**Leave this terminal running.**

## 4. Open the App

Choose one:
- **Phone:** Scan QR code with Expo Go app (same WiFi network required)
- **Web:** Press `w` in the terminal
- **Emulator:** Press `a` (Android) or `i` (iOS/Mac only)

## Stopping the App

Press `Ctrl+C` in both terminal windows.

## Troubleshooting

**Backend won't start?**
```bash
cd Backend_2025_Scouting
npm install
```

**Frontend won't start?**
```bash
cd Frontend_2025_Scouting
npm install
```

**Port 3000 in use?**
Backend was likely not closed properly. Find and kill the process:

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill //PID <PID> //F
```

**Mac:**
```bash
lsof -ti:3000
kill -9 <PID>
```

Replace `<PID>` with the number from the first command.
