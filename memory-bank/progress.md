# Progress

## What Works

### Phase 1: Screenshot & Selection UI ✓ COMPLETE
- [x] Electron project structure
- [x] Global shortcut (Ctrl+Shift+S)
- [x] Screenshot capture with desktopCapturer
- [x] DPI scaling detection and coordinate mapping
- [x] Transparent fullscreen overlay window
- [x] WebGL GPU-accelerated rendering
- [x] Shader-based dimming and selection masking
- [x] Red rectangle border rendering
- [x] Mouse drag selection tracking
- [x] ESC key cancellation with cleanup
- [x] Region extraction from buffer
- [x] IPC communication (main ↔ renderer)

**Application Status:** Running and functional

### Phase 2: API Integration ✓ COMPLETE
- [x] Gemini API client setup
- [x] Image encoding/preparation (base64 PNG)
- [x] Prompt template for equation extraction
- [x] API request with error handling
- [x] Response parsing
- [x] LaTeX result display (clipboard)
- [x] Environment variable configuration (dotenv)
- [x] Overlay window closes immediately after selection

**Application Status:** Fully functional with API integration

### Operational Tooling ✓ COMPLETE
- [x] Shell script for running and stopping the app (`run-gpix.sh`)
  - Process management with PID tracking
  - Ctrl+C signal handling for graceful shutdown
  - Prevents multiple instances
  - Automatic cleanup on exit

**Application Status:** Fully functional with operational tooling

### Distribution & UI ✓ IN PROGRESS
- [x] Windows NSIS installer target
- [x] macOS DMG target
- [x] Main UI window (React) for API key management
- [x] Keychain storage via keytar (with .env dev fallback)
- [x] Tray/menu actions for Open/Quit
- [x] Simplified settings UI (removed card container, direct window layout)
- [x] Global shortcut description with styled kbd elements
- [x] API key connectivity test (on startup, on save, and manual "Test key" button)
- [x] Eye icon toggle for API key visibility
- [x] Custom title bar: removed menu bar, title text, and default Electron icon
- [x] Cross-platform window controls (macOS traffic lights, Windows overlay buttons)

## What's Left to Build

### Future Enhancements
- [ ] Multi-monitor support
- [ ] Customizable shortcuts
- [ ] Save cropped images to file
- [ ] Configuration UI (advanced settings)

## Current Status
**Status:** Core functionality complete with UI + keychain storage
**Phase:** Distribution UI integration in progress
**Next Milestone:** Harden main UI security (remove nodeIntegration), add icons, validate installer on macOS
**Build Status:** electron-builder configured, NSIS/DMG targets working on Windows

## Known Issues
- Main UI currently uses `nodeIntegration: true` to load React in dev; should be replaced with preload + bundling for production security

## Previously Fixed Issues
- **Image flip (180° rotation)**: Resolved by Y-coordinate flip in vertex shader
- **Selection rectangle vertical inversion**: Resolved by using screen coordinates directly (texture coordinates already flipped)
- **Global shortcut error message**: Resolved by changing to informational message
- **Color hue distortion (red/blue swap)**: Resolved by adding BGRA to RGBA conversion in capture.js (Electron's `toBitmap()` returns BGRA on Windows)
- **Image blurriness**: Resolved by:
  - Setting canvas internal resolution to match physical screenshot resolution
  - Converting mouse coordinates from CSS pixels to canvas pixels
  - Using `gl.NEAREST` texture filtering instead of `gl.LINEAR`
  - Rounding coordinates to integer pixel values for buffer extraction

## Evolution of Decisions

### Finalized Decisions
- **Screenshot:** desktopCapturer (built-in, no dependencies)
- **Rendering:** WebGL with shaders (GPU-accelerated)
- **DPI Scaling:** Native Electron API (automatic)
- **Shortcut:** Ctrl+Shift+S (hard-coded for Phase 1)
- **Dimming:** 0.5 brightness factor
- **Border:** Red 2px rectangle
- **API:** Gemini API v1 with gemini-2.5-flash-lite model (optimized for speed)
- **API Config:** maxOutputTokens: 256, temperature: 0.1 (fast, deterministic responses)
- **Image Conversion:** sharp library (PNG format with auto-resize to max 1024px and compression)
- **Environment Config:** dotenv for .env file support
- **Result Display:** Clipboard copy (automatic)

### Implementation Details
- WebGL texture uploaded once per capture
- Uniforms updated during drag (4 floats/frame)
- Physical resolution capture, logical coordinate overlay
- State machine: idle → capturing → selecting → processing → idle
- Cleanup on ESC and completion
- Overlay closes immediately after selection (before API call)
- All image processing in-memory (no file storage)
- API key loaded from .env file via dotenv
- Image optimization: automatic resizing and compression for faster API processing (2-4x speed improvement)

## Testing Status
- Application launches successfully
- Global shortcut registers correctly
- Manual testing checklist available in TESTING.md
- Ready for user acceptance testing

## Notes
- Dependencies: electron (dev), sharp, dotenv, electron-builder (dev)
- Modular structure with separate modules for API, image conversion, clipboard
- Production-ready for core functionality
- Requires GEMINI_API_KEY in .env file
- Build: Run `npm run build` to create portable executable in `dist/` directory
- Build format: Portable `.exe` (no installer, no code signing required)

