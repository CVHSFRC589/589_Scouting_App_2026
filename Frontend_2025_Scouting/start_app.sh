#!/bin/bash

# Team 589 Scouting App Startup Script
# This script checks for common setup issues before starting the Expo app
# It references the FRONTEND_SETUP_GUIDE.md for detailed instructions

echo "========================================="
echo "Team 589 Scouting App - Startup Check"
echo "========================================="
echo ""

# Initialize variables
ERRORS_FOUND=0
WARNINGS_FOUND=0
USE_TUNNEL=false
USE_CLEAR=false

# Parse command line arguments
for arg in "$@"
do
    case $arg in
        --tunnel)
            USE_TUNNEL=true
            ;;
        --clear)
            USE_CLEAR=true
            ;;
        --help)
            echo "Usage: ./start_app.sh [--tunnel] [--clear]"
            echo ""
            echo "Options:"
            echo "  --tunnel    Start Expo with tunnel mode (helps with network issues)"
            echo "  --clear     Clear Expo cache before starting"
            echo "  --help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./start_app.sh              # Normal start"
            echo "  ./start_app.sh --tunnel     # Start with tunnel mode"
            echo "  ./start_app.sh --clear      # Start with cleared cache"
            echo "  ./start_app.sh --tunnel --clear  # Both options"
            exit 0
            ;;
    esac
done

echo "Running pre-flight checks..."
echo ""

# ============================================
# CHECK 1: Node.js Installation (Step 1.1)
# ============================================
echo "[1/8] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "  ❌ ERROR: Node.js is not installed or not in PATH"
    echo "     → Please install Node.js v20 or higher"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 1.1: Install Node.js"
    echo "     → Download from: https://nodejs.org/"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    NODE_VERSION=$(node --version)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

    if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
        echo "  ⚠️  WARNING: Node.js version $NODE_VERSION is too old"
        echo "     → You need Node.js v20 or higher"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 1.1: Install Node.js"
        echo "     → Download from: https://nodejs.org/"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo "  ✓ Node.js $NODE_VERSION installed"
    fi
fi
echo ""

# ============================================
# CHECK 2: npm Installation
# ============================================
echo "[2/8] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "  ❌ ERROR: npm is not installed or not in PATH"
    echo "     → npm should be installed with Node.js"
    echo "     → Try reinstalling Node.js from Step 1.1"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 1.1: Install Node.js"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    NPM_VERSION=$(npm --version)
    echo "  ✓ npm $NPM_VERSION installed"
fi
echo ""

# ============================================
# CHECK 3: Git Installation (Step 1.2)
# ============================================
echo "[3/8] Checking Git installation..."
if ! command -v git &> /dev/null; then
    echo "  ⚠️  WARNING: Git is not installed or not in PATH"
    echo "     → Git is needed to clone the repository and manage code"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 1.2: Install Git"
    echo "     → Download from: https://git-scm.com/"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
else
    GIT_VERSION=$(git --version)
    echo "  ✓ $GIT_VERSION installed"
fi
echo ""

# ============================================
# CHECK 4: Working Directory (Step 3)
# ============================================
echo "[4/8] Checking working directory..."
CURRENT_DIR=$(basename "$PWD")
if [ "$CURRENT_DIR" != "Frontend_2025_Scouting" ]; then
    echo "  ❌ ERROR: You are not in the Frontend_2025_Scouting directory"
    echo "     → Current directory: $PWD"
    echo "     → You should run this script from the Frontend_2025_Scouting folder"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 3.3: Open the Project in VS Code"
    echo "     → Run: cd Frontend_2025_Scouting"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    echo "  ✓ Running in correct directory: $CURRENT_DIR"
fi
echo ""

# ============================================
# CHECK 5: .env File (Step 4.3)
# ============================================
echo "[5/8] Checking .env configuration..."
if [ ! -f ".env" ]; then
    echo "  ❌ ERROR: .env file not found"
    echo "     → The app needs Supabase credentials to connect to the database"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 4.3: Create Your Environment Configuration File"
    echo "     → You need to:"
    echo "        1. Copy .env.example to .env"
    echo "        2. Add your Supabase URL and Key to the .env file"
    echo "     → Ask your team lead for credentials or see SUPABASE_SETUP_GUIDE.md"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    echo "  ✓ .env file exists"

    # Check if .env has the required variables
    if ! grep -q "PUBLIC_SUPABASE_URL=" .env; then
        echo "  ⚠️  WARNING: PUBLIC_SUPABASE_URL not found in .env"
        echo "     → Add your Supabase project URL to .env"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 4.3"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    elif grep -q "PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co" .env; then
        echo "  ⚠️  WARNING: PUBLIC_SUPABASE_URL still has placeholder value"
        echo "     → Replace 'xxxxx' with your actual Supabase project URL"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 4.3"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo "  ✓ PUBLIC_SUPABASE_URL is configured"
    fi

    if ! grep -q "PUBLIC_SUPABASE_KEY=" .env; then
        echo "  ⚠️  WARNING: PUBLIC_SUPABASE_KEY not found in .env"
        echo "     → Add your Supabase publishable key to .env"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 4.3"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    elif grep -q "PUBLIC_SUPABASE_KEY=sb_publishable_...your_key_here" .env || grep -q "PUBLIC_SUPABASE_KEY=eyJhb" .env; then
        echo "  ⚠️  WARNING: PUBLIC_SUPABASE_KEY still has placeholder/example value"
        echo "     → Replace with your actual Supabase publishable key"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 4.3"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo "  ✓ PUBLIC_SUPABASE_KEY is configured"
    fi
fi
echo ""

# ============================================
# CHECK 6: node_modules Installation (Step 5)
# ============================================
echo "[6/8] Checking node_modules installation..."
if [ ! -d "node_modules" ]; then
    echo "  ❌ ERROR: node_modules directory not found"
    echo "     → Dependencies have not been installed"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 5.2: Install Dependencies"
    echo "     → Run: npm install"
    echo "     → If you get peer dependency errors, try: npm install --legacy-peer-deps"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
elif [ ! -d "node_modules/expo" ]; then
    echo "  ⚠️  WARNING: Expo not found in node_modules"
    echo "     → Dependencies may be incomplete or corrupted"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 5.2: Install Dependencies"
    echo "     → Try running: npm install --legacy-peer-deps"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
else
    echo "  ✓ node_modules directory exists and contains Expo"

    # Check package.json vs node_modules freshness
    if [ "package.json" -nt "node_modules" ]; then
        echo "  ⚠️  WARNING: package.json is newer than node_modules"
        echo "     → Dependencies may be out of date"
        echo "     → Consider running: npm install --legacy-peer-deps"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
fi
echo ""

# ============================================
# CHECK 7: Package.json exists
# ============================================
echo "[7/8] Checking package.json..."
if [ ! -f "package.json" ]; then
    echo "  ❌ ERROR: package.json not found"
    echo "     → This doesn't look like the Frontend_2025_Scouting directory"
    echo "     → See FRONTEND_SETUP_GUIDE.md - Step 3: Clone the Repository"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    echo "  ✓ package.json exists"

    # Verify it's the correct package.json
    if grep -q '"name": "589-scouting-app-2025"' package.json; then
        echo "  ✓ Verified correct project (589-scouting-app-2025)"
    else
        echo "  ⚠️  WARNING: This may not be the Team 589 Scouting App"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
fi
echo ""

# ============================================
# CHECK 8: Port 8081 Availability (Step 6.4)
# ============================================
echo "[8/8] Checking if port 8081 is available..."
if command -v lsof &> /dev/null; then
    # Mac/Linux
    if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  ⚠️  WARNING: Port 8081 is already in use"
        echo "     → Another Metro bundler or app may be running"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 6.4: Common Startup Errors"
        echo "     → Solutions:"
        echo "        - Stop the other instance (Ctrl+C in that terminal)"
        echo "        - Kill the process: lsof -ti:8081 | xargs kill -9"
        echo "        - Use a different port: npx expo start --port 8082"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo "  ✓ Port 8081 is available"
    fi
elif command -v netstat &> /dev/null; then
    # Windows
    if netstat -ano | grep -q ":8081.*LISTENING"; then
        echo "  ⚠️  WARNING: Port 8081 is already in use"
        echo "     → Another Metro bundler or app may be running"
        echo "     → See FRONTEND_SETUP_GUIDE.md - Step 6.4: Common Startup Errors"
        echo "     → Solutions:"
        echo "        - Stop the other instance (Ctrl+C in that terminal)"
        echo "        - Find PID: netstat -ano | findstr :8081"
        echo "        - Kill process: taskkill /PID [PID] /F"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo "  ✓ Port 8081 is available"
    fi
else
    echo "  ℹ️  Unable to check port availability (lsof/netstat not found)"
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "========================================="
echo "Pre-flight Check Summary"
echo "========================================="
echo ""

if [ $ERRORS_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
    echo "✅ All checks passed! Ready to start the app."
    echo ""
else
    if [ $ERRORS_FOUND -gt 0 ]; then
        echo "❌ Found $ERRORS_FOUND error(s) that must be fixed before starting"
        echo ""
        echo "Please review the errors above and follow the instructions in:"
        echo "  → Frontend_2025_Scouting/docs/FRONTEND_SETUP_GUIDE.md"
        echo ""
        echo "After fixing the errors, run this script again."
        echo ""
        exit 1
    fi

    if [ $WARNINGS_FOUND -gt 0 ]; then
        echo "⚠️  Found $WARNINGS_FOUND warning(s)"
        echo ""
        echo "The app may still work, but you might encounter issues."
        echo "Review the warnings above for recommended fixes."
        echo ""
        echo "Press Ctrl+C to cancel, or wait 5 seconds to continue anyway..."
        sleep 5
        echo ""
    fi
fi

# ============================================
# START EXPO
# ============================================
echo "========================================="
echo "Starting Expo Development Server"
echo "========================================="
echo ""

# Build the command with parameters
EXPO_CMD="npm start --"

if [ "$USE_CLEAR" = true ]; then
    echo "• Clear cache: ENABLED"
    EXPO_CMD="$EXPO_CMD --clear"
fi

if [ "$USE_TUNNEL" = true ]; then
    echo "• Tunnel mode: ENABLED"
    echo "  (This helps if you can't connect your phone to the app)"
    echo ""
    echo "  NOTE: Tunnel mode can be slow to start and may time out."
    echo "  If you see 'ngrok tunnel took too long to connect':"
    echo "    - Try running without --tunnel first (same WiFi network required)"
    echo "    - Check your internet connection"
    echo "    - Ngrok service may be experiencing issues"
    EXPO_CMD="$EXPO_CMD --tunnel"
fi

echo ""
echo "See FRONTEND_SETUP_GUIDE.md - Step 6 for instructions on:"
echo "  • How to open the app on your phone (scan QR code)"
echo "  • How to open iOS simulator (press 'i')"
echo "  • How to open Android emulator (press 'a')"
echo "  • How to open in web browser (press 'w')"
echo ""
echo "Starting Expo with command: $EXPO_CMD"
echo ""
echo "Press Ctrl+C to stop the server at any time."
echo ""
echo "========================================="
echo ""

# Execute the command
$EXPO_CMD
