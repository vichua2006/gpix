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

### Development Tools
- **npm**: Package manager
- **JavaScript**: No TypeScript (keeping simple)

## Development Setup

### Project Structure (Implemented)
```
gpix/
├── src/
│   ├── main/
│   │   ├── main.js              # Entry point, global shortcut
│   │   ├── capture.js           # Screenshot capture (desktopCapturer)
│   │   ├── overlay-manager.js   # Overlay window lifecycle
│   │   ├── preload.js           # IPC bridge
│   │   └── region-extractor.js  # Crop selected region
│   └── renderer/
│       ├── overlay.html         # Minimal HTML shell
│       ├── overlay.js           # WebGL rendering & input
│       └── shaders.js           # GLSL shader programs
├── package.json
├── README.md
└── TESTING.md
```

### Dependencies
```json
{
  "dependencies": {
    "electron": "^28.0.0"
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
- **electron**: ^28.0.0 (only dependency)

### Future (Phase 2)
- Gemini API client (TBD)
- HTTP client for API calls

## Tool Usage Patterns

### Electron IPC (Implemented)
```javascript
// Main → Renderer
overlayWindow.webContents.send('screenshot-data', data);

// Renderer → Main (via preload)
window.electronAPI.sendSelectionComplete(rect);
window.electronAPI.sendSelectionCancelled();
```

### WebGL Rendering Pipeline
1. Create texture from screenshot buffer (once)
2. Upload texture to GPU with Y-coordinate flip in vertex shader (accounts for bitmap top-left vs WebGL bottom-left origin)
3. Update uniforms during drag (4 floats/frame: x, y, width, height in normalized coordinates)
4. Fragment shader applies dimming/masking based on selection rectangle
5. Separate border shader for red rectangle (rendered in clip space, not texture space)

### WebGL Coordinate System
- **Texture Coordinates**: Flipped in vertex shader to match screen coordinates (top-left origin)
- **Selection Coordinates**: Use screen coordinates directly (normalized 0-1) since texture coordinates are already flipped
- **Border Coordinates**: Converted to clip space (-1 to 1) with Y-flip for correct rendering

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

### Future (Phase 2)
- API key storage
- Customizable shortcuts
- Result display preferences

## Build & Distribution
- Standard Electron build process
- Electron Builder or Electron Forge (to be decided)
- Windows installer/portable (primary target)

## Environment Requirements
- Node.js 16+ recommended
- Electron compatible OS (Windows primary, macOS secondary)
- Sufficient screen resolution (no specific minimum)

