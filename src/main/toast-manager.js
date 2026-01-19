const { BrowserWindow, screen } = require('electron');
const path = require('path');

let toastWindow = null;
let autoCloseTimeout = null;

const TOAST_WIDTH = 340;
const TOAST_HEIGHT = 100;
const TOAST_DURATION = 2500; // milliseconds
const FADE_OUT_DURATION = 200; // milliseconds

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
  // Close existing toast if present
  if (toastWindow) {
    clearTimeout(autoCloseTimeout);
    toastWindow.destroy();
    toastWindow = null;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Position at bottom-center of screen
  const x = Math.round((screenWidth - TOAST_WIDTH) / 2);
  const y = screenHeight - TOAST_HEIGHT - 40; // 40px from bottom

  toastWindow = new BrowserWindow({
    width: TOAST_WIDTH,
    height: TOAST_HEIGHT,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    movable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'toast-preload.js')
    }
  });

  // Load the toast HTML
  toastWindow.loadFile(path.join(__dirname, '../renderer/toast.html'));

  // Send toast data once loaded and show window
  toastWindow.webContents.once('did-finish-load', () => {
    toastWindow.webContents.send('toast-data', { message, type });
    toastWindow.showInactive(); // Show without stealing focus
  });

  // Handle window close
  toastWindow.on('closed', () => {
    toastWindow = null;
    clearTimeout(autoCloseTimeout);
  });

  // Auto-close after duration (with fade-out animation)
  autoCloseTimeout = setTimeout(() => {
    if (toastWindow) {
      toastWindow.webContents.send('toast-hide');
      // Wait for fade-out animation to complete before destroying
      setTimeout(() => {
        if (toastWindow) {
          toastWindow.destroy();
          toastWindow = null;
        }
      }, FADE_OUT_DURATION);
    }
  }, TOAST_DURATION);
}

/**
 * Manually closes the toast if visible
 */
function closeToast() {
  if (toastWindow) {
    clearTimeout(autoCloseTimeout);
    toastWindow.destroy();
    toastWindow = null;
  }
}

module.exports = { showToast, closeToast };
