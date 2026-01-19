# System Patterns

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Global Shortcut Handler         │ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│  ┌──────────────▼────────────────────┐ │
│  │   Screenshot Capture Module       │ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│  ┌──────────────▼────────────────────┐ │
│  │   Overlay Window Manager          │ │
│  │   - Create transparent window     │ │
│  │   - Display dimmed screenshot     │ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│  ┌──────────────▼────────────────────┐ │
│  │   Selection Handler               │ │
│  │   - Mouse event tracking          │ │
│  │   - Rectangle calculation         │ │
│  │   - Visual feedback rendering     │ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│  ┌──────────────▼────────────────────┐ │
│  │   Region Extraction               │ │
│  │   - Crop selected area            │ │
│  │   - Prepare for API (Phase 2)     │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Component Relationships

### Main Process Components
1. **Global Shortcut Handler**
   - Registers system-wide keyboard shortcut
   - Triggers screenshot workflow
   - Single entry point for user interaction

2. **Screenshot Capture**
   - Captures full screen on demand
   - Returns image buffer/data
   - Called once per shortcut activation

3. **Overlay Window Manager**
   - Creates and manages transparent overlay
   - Renders screenshot with dimming effect
   - Handles window lifecycle (show/hide/destroy)

4. **Selection Handler**
   - Listens to mouse events in overlay window
   - Calculates selection rectangle coordinates
   - Manages selection state (dragging, selected, cancelled)

5. **Region Extractor**
   - Crops original screenshot based on selection
   - Formats image for next phase (API integration)
   - Currently just returns image data

6. **Main UI Window**
  - React-based UI for API key management
  - Runs as the primary app window (no separate settings window)
  - Tray/menu opens and focuses this window

### Renderer Process (Overlay Window)
- Lightweight renderer for overlay display
- Receives screenshot data via IPC or direct assignment
- Handles mouse events and visual feedback
- Communicates selection back to main process

## Key Technical Decisions

### Window Configuration

#### Overlay Window (Screenshot Selection)
```javascript
{
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  fullscreen: true,
  focusable: true,  // Need to capture mouse events
  webPreferences: {
    nodeIntegration: false,  // Security best practice
    contextIsolation: true
  }
}
```

#### Main Window (Settings UI)
```javascript
{
  width: 520,
  height: 380,
  resizable: false,
  title: '',  // Empty title removes text and icon
  titleBarStyle: 'hidden',  // Hides title bar, keeps window controls
  titleBarOverlay: {  // Windows-only: shows overlay buttons
    color: '#0f1115',      // Background color (matches dark theme)
    symbolColor: '#e6e9ef', // Button icon color
    height: 36
  },
  icon: path.join(__dirname, '../../build/icon.png'),
  webPreferences: {
    contextIsolation: false,  // TODO: re-enable for production
    nodeIntegration: true     // TODO: remove for production
  }
}
```

**Cross-platform behavior:**
- **macOS**: `titleBarStyle: 'hidden'` shows native traffic light buttons (top-left); `titleBarOverlay` is ignored
- **Windows**: `titleBarStyle: 'hidden'` + `titleBarOverlay` shows themed minimize/maximize/close buttons (top-right)
- **CSS**: `body { -webkit-app-region: drag; padding-top: 48px; }` enables window dragging and reserves space for controls

### Selection Flow
1. User presses shortcut → Main process captures screen
2. Overlay window created and shown
3. Screenshot rendered with dimming (brightness filter)
4. Mouse events tracked:
   - `mousedown`: Start selection, record start point
   - `mousemove`: Update selection rectangle, apply brightness mask
   - `mouseup`: Finalize selection, extract region
5. Overlay destroyed, extracted region returned

### Brightness Restoration Technique
**Approach:** WebGL shader-based dimming
- Full screenshot rendered dimmed (0.5 brightness multiplier)
- Selection rectangle area masked with normal brightness via fragment shader
- Red border rendered on top layer with separate border shader

### WebGL Coordinate System Handling
**Critical Implementation Detail:**
- Bitmap data from Electron's `toBitmap()` has top-left origin (Y=0 at top)
- WebGL textures use bottom-left origin by default (Y=0 at bottom)
- Solution: Flip Y coordinate in vertex shader: `v_texCoord = vec2(texCoord.x, 1.0 - texCoord.y)`
- After flip, fragment shader texture coordinates match screen coordinates (top-left origin)
- Selection rectangles use screen coordinates directly without additional transformation

## Design Patterns in Use

### Event-Driven Architecture
- Global shortcut triggers workflow
- Mouse events drive selection state
- IPC for main/renderer communication
- Tray/menu actions open the main UI window

### Single Responsibility
- Each module handles one concern
- Clear separation: capture, display, selection, extraction

### State Management
- Selection state: idle, selecting, selected
- Coordinate tracking: start point, current point, final bounds

## Critical Implementation Paths

### Screenshot to Overlay Path
1. `desktopCapturer.getSources()` captures at physical resolution
2. `thumbnail.toBitmap()` returns BGRA buffer
3. Convert BGRA to RGBA (swap red/blue channels)
4. Pass RGBA buffer to overlay renderer process
5. Set canvas internal resolution to match screenshot physical resolution
6. Upload texture to GPU with `gl.NEAREST` filtering
7. Render in overlay window at 1:1 pixel ratio (no scaling)

### Selection to Extraction Path
1. Mouse events capture coordinates (CSS pixels)
2. Convert CSS pixels to canvas pixels (physical coordinates)
3. Calculate rectangle bounds and round to integer pixels
4. Coordinates are already in physical pixels (match buffer dimensions)
5. Crop RGBA buffer using integer pixel bounds
6. Return cropped RGBA image data for PNG conversion

## Future Integration Points (Phase 2)
- Region extractor will pass data to API client
- API client will format request with prompt
- Response handler will process LaTeX output
- Result display will show LaTeX to user

