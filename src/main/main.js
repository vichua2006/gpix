// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { captureScreen } = require('./capture');
const { createOverlay, destroyOverlay } = require('./overlay-manager');
const { extractRegion } = require('./region-extractor');
const { convertBufferToPNGBase64 } = require('./image-converter');
const { sendImageToGemini, extractLaTeXFromResponse } = require('./gemini-client');
const { copyToClipboard } = require('./clipboard-handler');

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
ipcMain.on('selection-complete', async (event, rect) => {
  console.log('Selection complete:', rect);
  
  // Prevent multiple simultaneous processing requests
  if (appState === 'processing') {
    console.log('Already processing a request, ignoring');
    return;
  }
  
  // Store screenshot data before cleanup
  const screenshotBuffer = screenshotData.buffer;
  const screenshotWidth = screenshotData.width;
  const screenshotHeight = screenshotData.height;
  
  // Destroy overlay immediately after selection (before API call)
  destroyOverlay();
  appState = 'processing';
  
  try {
    // Extract region from original buffer
    console.log('Extracting region...');
    const croppedImage = extractRegion(
      screenshotBuffer,
      screenshotWidth,
      screenshotHeight,
      rect
    );
    
    console.log(`Extracted region: ${rect.width}x${rect.height}`);
    
    // Convert RGBA buffer to PNG base64
    console.log('Converting image to PNG...');
    const base64Image = await convertBufferToPNGBase64(
      croppedImage,
      rect.width,
      rect.height
    );
    
    console.log('Image converted to base64, sending to Gemini API...');
    
    // Send to Gemini API
    const apiResponse = await sendImageToGemini(base64Image);
    
    // Extract LaTeX from response
    console.log('Parsing API response...');
    const latex = extractLaTeXFromResponse(apiResponse);
    
    console.log('LaTeX extracted:', latex);
    
    // Copy to clipboard
    const clipboardSuccess = copyToClipboard(latex);
    if (!clipboardSuccess) {
      console.warn('Warning: Failed to copy LaTeX to clipboard, but LaTeX was extracted successfully');
    }
    
    console.log('Process completed successfully');
    
  } catch (error) {
    console.error('Error during processing:', error.message);
    // Errors are logged but don't prevent cleanup
  } finally {
    // Final cleanup
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
    // Note: register() can return false even when shortcut works, so we don't treat this as an error
    console.log('Global shortcut registration (Ctrl+Shift+S) - may still be active');
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

