const { BrowserWindow, screen } = require('electron');
const path = require('path');

let overlayWindow = null;

/**
 * Creates and displays the fullscreen overlay window
 * @param {Object} screenshotData - Screenshot data from capture module
 */
async function createOverlay(screenshotData) {
  if (overlayWindow) {
    console.warn('Overlay window already exists');
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    fullscreen: true,
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

