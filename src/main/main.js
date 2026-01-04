const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { captureScreen } = require('./capture');
const { createOverlay, destroyOverlay } = require('./overlay-manager');
const { extractRegion } = require('./region-extractor');

// Application state
let appState = 'idle';
let screenshotData = null;

// Keep a global reference of hidden window to maintain global shortcuts
let hiddenWindow = null;

function createHiddenWindow() {
  hiddenWindow = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false
    }
  });
}

async function handleScreenshotShortcut() {
  if (appState !== 'idle') {
    console.log('Screenshot already in progress');
    return;
  }

  try {
    appState = 'capturing';
    console.log('Capturing screenshot...');
    
    // Capture screen once
    screenshotData = await captureScreen();
    console.log(`Screenshot captured: ${screenshotData.width}x${screenshotData.height}, scale: ${screenshotData.scaleFactor}`);
    
    // Create and show overlay
    appState = 'selecting';
    await createOverlay(screenshotData);
    
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    appState = 'idle';
    screenshotData = null;
  }
}

// IPC Handlers
ipcMain.on('selection-complete', (event, rect) => {
  console.log('Selection complete:', rect);
  
  try {
    // Extract region from original buffer
    const croppedImage = extractRegion(
      screenshotData.buffer,
      screenshotData.width,
      screenshotData.height,
      rect
    );
    
    console.log(`Extracted region: ${rect.width}x${rect.height}`);
    
    // TODO Phase 2: Send to Gemini API
    // For now, just log success
    console.log('Region extracted successfully');
    
  } catch (error) {
    console.error('Region extraction failed:', error);
  } finally {
    // Cleanup
    destroyOverlay();
    screenshotData = null;
    appState = 'idle';
  }
});

ipcMain.on('selection-cancelled', () => {
  console.log('Selection cancelled by user');
  
  // Complete cleanup
  destroyOverlay();
  screenshotData = null;
  appState = 'idle';
});

ipcMain.handle('get-scale-factor', () => {
  const { screen } = require('electron');
  return screen.getPrimaryDisplay().scaleFactor;
});

app.whenReady().then(() => {
  // Create hidden window to maintain app presence
  createHiddenWindow();
  
  // Register global shortcut (Ctrl+Shift+S)
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+S', handleScreenshotShortcut);
  
  if (shortcutRegistered) {
    console.log('Global shortcut registered: Ctrl+Shift+S');
  } else {
    console.error('Failed to register global shortcut');
  }
  
  console.log('gpix ready - Press Ctrl+Shift+S to capture screenshot');
});

app.on('window-all-closed', () => {
  // Don't quit - we want to keep global shortcut active
  // User must explicitly quit from tray or task manager
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On macOS, recreate hidden window if closed
  if (BrowserWindow.getAllWindows().length === 0) {
    createHiddenWindow();
  }
});

