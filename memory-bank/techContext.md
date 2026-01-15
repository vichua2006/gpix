# Technical Context

## Technologies Used

### Core Framework
- **Electron**: v28.0.0 - Desktop application framework
- **WebGL**: GPU-accelerated rendering
- **Node.js**: Runtime environment

### Screenshot Implementation
- **desktopCapturer** (Electron built-in)
  - Chosen for zero external dependencies
  - Captures at physical resolution with DPI scaling
  - **Important**: Returns BGRA format on Windows (not RGBA) - requires channel swap (R↔B) before processing

### Development Tools
- **npm**: Package manager
- **JavaScript**: No TypeScript (keeping simple)

## Development Setup

### Project Structure (Implemented)
```
gpix/
├── src/
│   ├── main/
│   │   ├── main.js              # Entry point, global shortcut, API integration
│   │   ├── capture.js           # Screenshot capture (desktopCapturer)
│   │   ├── overlay-manager.js   # Overlay window lifecycle
│   │   ├── preload.js           # IPC bridge
│   │   ├── region-extractor.js  # Crop selected region
│   │   ├── image-converter.js   # RGBA buffer to PNG base64 conversion (with resizing & compression)
│   │   ├── gemini-client.js     # Gemini API client and response parsing
│   │   └── clipboard-handler.js # Clipboard operations
│   └── renderer/
│       ├── overlay.html         # Minimal HTML shell
│       ├── overlay.js           # WebGL rendering & input
│       └── shaders.js           # GLSL shader programs
├── package.json
├── .env                         # Environment variables (GEMINI_API_KEY)
├── run-gpix.sh                  # Shell script for running app with process management
├── README.md
└── TESTING.md
```

### Dependencies
```json
{
  "dependencies": {
    "dotenv": "^16.3.1",
    "keytar": "^7.9.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  }
}
```

## Technical Constraints

### Platform-Specific Considerations

#### Windows (Primary Platform)
- DPI scaling handled via `screen.getPrimaryDisplay().scaleFactor`
- Window transparency fully supported
- Global shortcut works (hidden window maintains app presence)

#### macOS
- Global shortcuts require accessibility permissions
- Cross-platform compatible but not primary focus

### Electron Implementation Details
- Hidden window required to maintain global shortcut
- Context isolation enabled for security
- Preload script bridges IPC communication
- Single monitor support (primary display only)

## Dependencies

### Production
- **sharp**: ^0.33.0 - Image processing (RGBA to PNG conversion)
- **dotenv**: ^16.3.1 - Environment variable management (.env file support)

### Development
- **electron**: ^28.0.0 - Desktop application framework (dev dependency)
- **electron-builder**: ^24.9.1 - Build and packaging tool (dev dependency)

### API Integration
- **Gemini API**: REST API (v1 endpoint)
- **Model**: gemini-2.5-flash-lite (default - optimized for speed), alternatives: gemini-2.5-flash (balanced), gemini-2.5-pro (best accuracy, slower)
- **Generation Config**: `maxOutputTokens: 2048`, `temperature: 0.1` (increased token limit for longer LaTeX outputs, deterministic responses)
- **HTTP Client**: Native fetch (Node.js 18+, Electron 28 uses Node 20)

## Tool Usage Patterns

### Shell Script for Process Management
- **File**: `run-gpix.sh`
- **Purpose**: Run the built executable with proper process management
- **Features**:
  - Captures process ID (PID) for tracking
  - Handles Ctrl+C (SIGINT) and SIGTERM signals
  - Automatic cleanup on exit
  - Prevents multiple instances (checks for existing PID)
  - Graceful shutdown with fallback to force kill
- **Usage**: `./run-gpix.sh` (requires executable permissions: `chmod +x run-gpix.sh`)
- **Solves**: Issue where app couldn't be stopped once running (app runs in background with global shortcuts)

### Electron IPC (Implemented)
```javascript
// Main → Renderer
overlayWindow.webContents.send('screenshot-data', data);

// Renderer → Main (via preload)
window.electronAPI.sendSelectionComplete(rect);
window.electronAPI.sendSelectionCancelled();
```

### WebGL Rendering Pipeline
1. Convert BGRA to RGBA (swap red/blue channels in capture.js)
2. Create texture from screenshot buffer (once)
3. Set canvas internal resolution to physical pixels (matches screenshot resolution 1:1 for pixel-perfect rendering)
4. Upload texture to GPU with Y-coordinate flip in vertex shader (accounts for bitmap top-left vs WebGL bottom-left origin)
5. Use `gl.NEAREST` filtering for pixel-perfect rendering (no interpolation blur)
6. Update uniforms during drag (4 floats/frame: x, y, width, height in normalized coordinates)
7. Fragment shader applies dimming/masking based on selection rectangle
8. Separate border shader for red rectangle (rendered in clip space, not texture space)
9. Convert mouse coordinates from CSS pixels to canvas pixels for DPI-scaled displays

### WebGL Coordinate System
- **Canvas Resolution**: Internal resolution (canvas.width/height) set to physical pixels; CSS size (style.width/height) set to logical pixels
- **Mouse Coordinates**: Convert CSS pixels to canvas pixels: `canvasX = mouseX * (canvas.width / canvas.offsetWidth)`
- **Texture Coordinates**: Flipped in vertex shader to match screen coordinates (top-left origin)
- **Selection Coordinates**: Use screen coordinates directly (normalized 0-1) since texture coordinates are already flipped; rounded to integers for buffer extraction
- **Border Coordinates**: Converted to clip space (-1 to 1) with Y-flip for correct rendering
- **Color Format**: BGRA from `toBitmap()` converted to RGBA before all processing

### DPI Coordinate Mapping
```javascript
// Logical → Physical
physicalX = Math.round(logicalX * scaleFactor);
```

## Configuration

### Hard-coded Settings (Phase 1)
- Global shortcut: `Ctrl+Shift+S`
- Dimming: 0.5 brightness
- Border: Red (#FF0000), 2px
- Min selection: 5x5 pixels

### Configuration (Phase 2)
- **API Key**: Stored in OS keychain via keytar; `.env` used as dev fallback only
- **API Version**: v1 (stable)
- **Model**: gemini-2.5-flash-lite (can be changed in gemini-client.js)
- **Generation Config**: maxOutputTokens: 256, temperature: 0.1 (optimized for speed)
- **Image Optimization**: Auto-resize to max 1024px (longest side), PNG compression level 6
- **Prompt**: Stored as constant in gemini-client.js
- **Result Delivery**: Clipboard (automatic copy)

### Future Enhancements
- Customizable shortcuts
- Configuration UI for API key
- Visual feedback during processing

## Build & Distribution
- **Build Tool:** electron-builder v24.9.1
- **Windows Target:** NSIS installer (`.exe`)
- **Code Signing:** Disabled (avoids Windows symlink permission issues)
- **Build Command:** `npm run build` (or `npm run build:win` for Windows only)
- **Output Directory:** `dist/` folder
- **Build Configuration:** 
  - NSIS for Windows, DMG for macOS
  - Code signing explicitly disabled (`sign: null`, `signDlls: false`)
  - Icon support (requires `build/icon.png` for Windows, optional)
- **Known Issue:** Windows requires Developer Mode or admin privileges for code signing tool extraction (resolved by using portable format and disabling signing)
- **Running the App:** Use `./run-gpix.sh` shell script for proper process management (allows stopping with Ctrl+C)

## Environment Requirements
- Node.js 18+ required (for native fetch API)
- Electron compatible OS (Windows primary, macOS secondary)
- Sufficient screen resolution (no specific minimum)
- Internet connection (for Gemini API calls)
- Gemini API key (set in .env file as GEMINI_API_KEY)
- Build tools may be required for sharp native bindings (usually auto-installed)

