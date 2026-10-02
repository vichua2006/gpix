const { BrowserWindow, screen } = require('electron');
const path = require('path');

let overlayWindow = null;

/**
 * Creates and displays the screen-sized selection overlay
 * @param {Object} screenshotData - Screenshot data from capture module
 */
async function createOverlay(screenshotData) {
  if (overlayWindow) {
    console.warn('Overlay window already exists');
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;
  const isMac = process.platform === 'darwin';

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    // Native macOS fullscreen creates a separate Space and animates into it.
    fullscreen: !isMac,
    fullscreenable: !isMac,
    type: isMac ? 'panel' : undefined,
    roundedCorners: !isMac,
    enableLargerThanScreen: isMac,
    show: !isMac,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isMac) {
    // Panels stay on the current Space, including above fullscreen apps.
    // Cover the menu bar and Dock as well as the display's content area.
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  }

  // Load the overlay HTML
  await overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));

  // Send screenshot data to renderer
  overlayWindow.webContents.send('screenshot-data', {
    buffer: screenshotData.buffer.buffer, // Get underlying ArrayBuffer
    width: screenshotData.width,
    height: screenshotData.height,
    scaleFactor: screenshotData.scaleFactor,
    logicalWidth: screenshotData.logicalWidth,
    logicalHeight: screenshotData.logicalHeight
  });

  // Show window
  overlayWindow.show();
  overlayWindow.focus();

  // Handle window close
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  console.log(`Overlay window created: ${width}x${height}`);
}

/**
 * Destroys the overlay window and cleans up resources
 */
function destroyOverlay() {
  if (overlayWindow) {
    overlayWindow.destroy();
    overlayWindow = null;
    console.log('Overlay window destroyed');
  }
}

module.exports = { createOverlay, destroyOverlay };

