# gpix - Screenshot Selection Tool

GPU-accelerated screenshot capture with interactive region selection for equation-to-LaTeX conversion.

## Features

- **Global Keyboard Shortcut**: `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (macOS)
- **GPU-Accelerated Rendering**: WebGL-based overlay for smooth performance
- **DPI Scaling Support**: Automatic handling of Windows display scaling (100%, 125%, 150%, 200%, etc.)
- **Interactive Selection**: Drag to select region with visual feedback
- **ESC Cancellation**: Press ESC at any time to cancel

## Installation

```bash
npm install
```

## Usage

### Development Mode

```bash
npm start
```

### How to Use

1. Launch the application with `npm start`
2. Press `Ctrl+Shift+S` to initiate screenshot capture
3. A fullscreen overlay will appear showing your screen (dimmed)
4. Click and drag to select a region
5. The selected region will be highlighted (restored brightness) with a red border
6. Release mouse to confirm selection
7. Press `ESC` at any time to cancel

### Current Phase

**Phase 1: Screenshot & Selection UI** ✓ Complete

- ✓ Global shortcut registration
- ✓ Full-screen screenshot capture
- ✓ Transparent overlay window
- ✓ Interactive selection with mouse drag
- ✓ Visual feedback (dimming + red rectangle)
- ✓ Region extraction
- ✓ DPI scaling support
- ✓ ESC key cancellation

**Phase 2: API Integration** (Future)

- Gemini API integration
- LaTeX conversion
- Result display

## Architecture

### File Structure

```
src/
├── main/
│   ├── main.js              # Entry point, global shortcut
│   ├── capture.js           # Screenshot capture (desktopCapturer)
│   ├── overlay-manager.js   # Overlay window lifecycle
│   ├── preload.js           # IPC bridge for security
│   └── region-extractor.js  # Crop selected region
└── renderer/
    ├── overlay.html         # Minimal HTML shell
    ├── overlay.js           # WebGL rendering & input handling
    └── shaders.js           # GLSL shader programs
```

### Key Technologies

- **Electron**: Cross-platform desktop framework
- **WebGL**: GPU-accelerated rendering
- **desktopCapturer**: Built-in Electron API for screenshots
- **Context Isolation**: Security best practices

### Technical Highlights

1. **One-shot capture**: Screenshot taken once before overlay appears
2. **Texture upload**: Screenshot uploaded to GPU once, never re-uploaded
3. **Minimal CPU work**: Only 4 uniform values updated per frame during drag
4. **Shader-based dimming**: Fragment shader applies dimming outside selection
5. **DPI scaling**: Automatic conversion between logical and physical coordinates

## Testing

The application has been tested for:

- Screenshot capture with various DPI settings
- WebGL texture upload and rendering
- Mouse event handling and selection
- Coordinate mapping (logical ↔ physical)
- ESC key cancellation at all stages
- Resource cleanup

### Testing Different DPI Scales

To test DPI scaling on Windows:
1. Right-click desktop → Display settings
2. Change "Scale and layout" setting
3. Restart the application
4. Test selection accuracy

## Known Limitations (Phase 1)

- Single monitor only (primary display)
- Hard-coded global shortcut
- No configuration UI
- Region extraction logged to console (no API integration yet)

## Future Enhancements (Phase 2)

- Gemini API integration for equation recognition
- LaTeX output display
- Multi-monitor support
- Customizable shortcuts
- Configuration UI
- Save cropped images to file

## Development Notes

### WebGL Rendering Pipeline

1. **Vertex Shader**: Fullscreen quad in clip space
2. **Fragment Shader**: Dimming + selection masking
3. **Border Rendering**: Separate shader for red rectangle
4. **Uniforms**: Selection rect coordinates (normalized 0-1)

### Coordinate Systems

- **Mouse events**: Logical pixels (affected by DPI)
- **WebGL uniforms**: Normalized [0-1] coordinates
- **Extraction**: Physical pixels (scaled by DPI factor)

### IPC Communication

- `screenshot-data`: Main → Renderer (screenshot buffer)
- `selection-complete`: Renderer → Main (selected region)
- `selection-cancelled`: Renderer → Main (ESC pressed)
- `get-scale-factor`: Renderer → Main (DPI scale)

## License

MIT

