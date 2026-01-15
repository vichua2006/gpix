#!/bin/bash

# Script to run gpix 1.0.0 with proper process management
# This allows you to stop the app using Ctrl+C

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXE_PATH="$SCRIPT_DIR/dist/gpix 1.0.0.exe"
PID_FILE="$SCRIPT_DIR/.gpix.pid"
ENV_FILE="$SCRIPT_DIR/.env"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping gpix..."
    
    # Kill the process if PID file exists
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "Killing process $PID..."
            kill "$PID" 2>/dev/null
            # Wait a bit, then force kill if still running
            sleep 2
            if ps -p "$PID" > /dev/null 2>&1; then
                echo "Force killing process $PID..."
                kill -9 "$PID" 2>/dev/null
            fi
        fi
        rm -f "$PID_FILE"
    fi
    
    # Also try to kill any remaining gpix processes
    pkill -f "gpix.*exe" 2>/dev/null
    
    echo "gpix stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Check if executable exists
if [ ! -f "$EXE_PATH" ]; then
    echo "Error: Executable not found at $EXE_PATH"
    exit 1
fi

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "gpix is already running (PID: $OLD_PID)"
        echo "Kill it first or remove $PID_FILE"
        exit 1
    else
        # Stale PID file, remove it
        rm -f "$PID_FILE"
    fi
fi

echo "Starting gpix 1.0.0..."
echo "Press Ctrl+C to stop"

# Load environment variables from .env in app folder (if present)
if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
else
    echo "Warning: .env not found at $ENV_FILE"
fi

# Run the executable from the app folder and capture PID
(cd "$SCRIPT_DIR" && "$EXE_PATH") &
APP_PID=$!

# Save PID to file
echo "$APP_PID" > "$PID_FILE"

echo "gpix started (PID: $APP_PID)"
echo "Waiting for process to finish..."

# Wait for the process to finish
wait $APP_PID

# Cleanup PID file if process ended naturally
rm -f "$PID_FILE"

