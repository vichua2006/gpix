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

### Renderer Process (Overlay Window)
- Lightweight renderer for overlay display
- Receives screenshot data via IPC or direct assignment
- Handles mouse events and visual feedback
- Communicates selection back to main process

## Key Technical Decisions

### Window Configuration
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
**Approach:** Canvas-based clipping or CSS masking
- Full screenshot rendered dimmed
- Selection rectangle area clipped/masked with normal brightness
- Red border rendered on top layer

## Design Patterns in Use

### Event-Driven Architecture
- Global shortcut triggers workflow
- Mouse events drive selection state
- IPC for main/renderer communication

### Single Responsibility
- Each module handles one concern
- Clear separation: capture, display, selection, extraction

### State Management
- Selection state: idle, selecting, selected
- Coordinate tracking: start point, current point, final bounds

## Critical Implementation Paths

### Screenshot to Overlay Path
1. `desktopCapturer.getSources()` or screenshot library
2. Convert to image buffer/base64
3. Pass to overlay renderer process
4. Render in overlay window

### Selection to Extraction Path
1. Mouse events capture coordinates
2. Calculate normalized rectangle bounds
3. Map to original screenshot coordinates
4. Crop image using bounds
5. Return cropped image data

## Future Integration Points (Phase 2)
- Region extractor will pass data to API client
- API client will format request with prompt
- Response handler will process LaTeX output
- Result display will show LaTeX to user

