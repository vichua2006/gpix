// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { captureScreen } = require('./capture');
const { createOverlay, destroyOverlay } = require('./overlay-manager');
const { extractRegion } = require('./region-extractor');
const { convertBufferToPNGBase64 } = require('./image-converter');
const { sendImageToGemini, extractLaTeXFromResponse } = require('./gemini-client');
const { copyToClipboard } = require('./clipboard-handler');
const { getApiKey, setApiKey, deleteApiKey } = require('./secure-store');

// Application state
let appState = 'idle';
let screenshotData = null;

// Keep a global reference of main window
let mainWindow = null;
let tray = null;
let isQuitting = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 380,
    resizable: false,
    show: false,
    title: 'gpix',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });
}

function openMainWindow() {
  if (!mainWindow) {
    createMainWindow();
    return;
  }

  mainWindow.show();
  mainWindow.focus();
}

function getTrayImage() {
  const fallbackDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const trayIconPath = path.join(__dirname, '../../build/icon.png');
  const imageFromPath = nativeImage.createFromPath(trayIconPath);

  if (!imageFromPath.isEmpty()) {
    return imageFromPath;
  }

  return nativeImage.createFromDataURL(fallbackDataUrl);
}

function createTray() {
  if (tray) {
    return;
  }

  tray = new Tray(getTrayImage());
  tray.setToolTip('gpix');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open gpix', click: openMainWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', openMainWindow);
}

function createAppMenu() {
  const template = [
    {
      label: 'gpix',
      submenu: [
        { label: 'Open gpix', click: openMainWindow },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

ipcMain.handle('settings-get-key', async () => {
  return await getApiKey();
});

ipcMain.handle('settings-save-key', async (event, apiKey) => {
  await setApiKey(apiKey);
  return true;
});

ipcMain.handle('settings-clear-key', async () => {
  await deleteApiKey();
  return true;
});

ipcMain.on('settings-quit-app', () => {
  app.quit();
});

// Test API key validity by checking if we can access the model
ipcMain.handle('settings-test-key', async (event, apiKey) => {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return { success: false, error: 'No API key provided' };
  }

  const MODEL = 'gemini-2.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}?key=${apiKey.trim()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      return { success: true };
    }

    // Parse error response
    const errorText = await response.text();
    let errorMessage = `API error (${response.status})`;

    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error && errorJson.error.message) {
        errorMessage = errorJson.error.message;
      }
    } catch (e) {
      // Use raw text if JSON parsing fails
    }

    if (response.status === 400) {
      return { success: false, error: 'Invalid API key format' };
    } else if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Invalid or unauthorized API key' };
    } else if (response.status === 404) {
      return { success: false, error: 'Model not available for this API key' };
    } else {
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error - check your connection' };
    }
    return { success: false, error: error.message || 'Connection test failed' };
  }
});

app.whenReady().then(async () => {
  createMainWindow();
  createTray();
  createAppMenu();
  
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

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On macOS, recreate hidden window if closed
  if (!mainWindow) {
    createMainWindow();
  } else {
    openMainWindow();
  }
});

