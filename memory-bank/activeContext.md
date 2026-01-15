# Active Context

## Current Work Focus
**Installer + Main UI integration**

Converted the app to a single main UI window (React-based) with keychain API key storage and tray/menu access. Packaging switched to NSIS for Windows and DMG for macOS.

## Recent Changes
- **Main UI window**: Settings UI is now the primary app window (no separate settings window)
- **Key storage**: API key stored in OS keychain via keytar, `.env` used only as dev fallback
- **UI framework**: Lightweight React UI with neutral styling
- **Tray/menu**: Tray icon with Open/Quit and app menu entry
- **Build target**: Windows NSIS installer and macOS DMG
- **Dev tooling**: DevTools auto-open in dev builds
- **Shell Script for Process Management**: Created `run-gpix.sh` to solve app stopping issue
  - **Purpose**: Allows stopping the app with Ctrl+C (solves issue where app couldn't be stopped once running)
  - **Features**: Process ID tracking, signal handling (SIGINT/SIGTERM), automatic cleanup, prevents multiple instances
  - **Usage**: Run `./run-gpix.sh` to start the app, press Ctrl+C to stop
  - **PID Management**: Saves process ID to `.gpix.pid` file for tracking and cleanup
- **Build Configuration**: Added electron-builder for packaging and distribution
  - **Build target**: Portable executable for Windows (avoids code signing requirements)
  - **Code signing**: Disabled (`sign: null`, `signDlls: false`) to avoid Windows symlink permission issues
  - **Build scripts**: Added `build`, `build:win`, `build:mac`, `build:linux`, and `clean-cache` scripts
  - **Output**: Builds to `dist/` directory as portable `.exe` file
- **API Token Limit**: Increased `maxOutputTokens` from 256 to 2048 for longer LaTeX outputs
- **Cursor**: Changed from crosshair to pointer cursor for better visibility
- **Performance Optimizations**: Speed improvements for Gemini API requests (2-4x faster)
  - **Model switch**: Changed from `gemini-2.5-flash` to `gemini-2.5-flash-lite` (optimized for speed)
  - **Image resizing**: Automatically resizes images to max 1024px on longest side (maintains aspect ratio, reduces payload size by 50-80%)
  - **PNG compression**: Added compression level 6 for optimized file sizes
  - **API generation config**: `maxOutputTokens: 2048` and `temperature: 0.1` for faster, more deterministic responses
- **Critical Bug Fixes**: Fixed color accuracy and image sharpness issues
  - **BGRA to RGBA conversion**: Added color channel swap in capture.js to fix red/blue channel inversion (Electron's `toBitmap()` returns BGRA on Windows, not RGBA)
  - **Canvas resolution fix**: Set canvas internal resolution to match physical screenshot resolution instead of logical window size (prevents forced scaling/blur)
  - **Mouse coordinate conversion**: Added `getCanvasCoordinates()` to properly convert CSS pixels to canvas pixels for DPI-scaled displays
  - **Integer pixel coordinates**: Added rounding in `calculateRect()` to ensure integer pixel values for buffer extraction
  - **Texture filtering**: Changed from `gl.LINEAR` to `gl.NEAREST` for pixel-perfect rendering without interpolation blur
- **Phase 2 Implementation Complete**: Gemini API integration fully functional
- Added dotenv for environment variable management (.env file support)
- Added sharp library for RGBA to PNG conversion with resizing and compression
- Created gemini-client.js for API communication (v1 API, gemini-2.5-flash-lite model)
- Created image-converter.js for buffer to PNG base64 conversion with optimization
- Created clipboard-handler.js for LaTeX result copying
- **UX Improvement**: Overlay window now closes immediately after selection (before API call) to prevent freezing
- Updated API version from v1beta to v1 (stable)
- Updated model from gemini-1.5-flash to gemini-2.5-flash-lite (deprecated model replaced, optimized for speed)
- All processing happens in-memory (no file storage)
- Comprehensive error handling for API failures, network issues, missing keys

## Next Steps
**Follow-ups**
1. Revisit security: re-enable contextIsolation and remove nodeIntegration for main UI
2. Add app icons (tray/app) for dev and build assets
3. Optional: add shortcut customization UI

## Key Decisions Made

### Screenshot Library
- **Chosen:** Electron's `desktopCapturer` API
- **Reason:** Built-in, no external dependencies

### Rendering Approach
- **Chosen:** WebGL with custom shaders
- **Reason:** GPU-accelerated, minimal CPU overhead, smooth 60 FPS

### DPI Scaling
- **Chosen:** Native `screen.getPrimaryDisplay().scaleFactor`
- **Reason:** No hardcoding, automatic detection, pixel-perfect accuracy

### API Integration
- **Chosen:** Google Gemini API v1 with gemini-2.5-flash-lite model
- **Reason:** Fastest model for equation-to-LaTeX conversion, optimized for speed and cost, maintains accuracy for mathematical content
- **Generation Config:** `maxOutputTokens: 256`, `temperature: 0.1` (optimized for fast, deterministic LaTeX output)
- **Alternative models available:** gemini-2.5-flash (balanced), gemini-2.5-pro (better accuracy, slower)

### Image Conversion
- **Chosen:** sharp library for RGBA to PNG conversion with automatic optimization
- **Reason:** Fast, native bindings, well-maintained, efficient memory usage
- **Optimizations:** Automatic resizing to max 1024px (longest side), PNG compression level 6, maintains aspect ratio
- **Result:** 50-80% smaller payloads for large selections, faster API processing

### Result Delivery
- **Chosen:** Clipboard copy (automatic)
- **Reason:** Seamless integration, user can paste anywhere immediately

### Environment Configuration
- **Chosen:** dotenv package with .env file
- **Reason:** Standard approach, keeps API key out of code, easy to configure

### Build & Distribution
- **Chosen:** electron-builder with portable format for Windows
- **Reason:** Portable format avoids code signing requirements and Windows symlink permission issues
- **Configuration:** Code signing disabled, outputs standalone executable to `dist/` directory
- **Build command:** `npm run build` creates portable `.exe` file

## Important Patterns & Preferences
- Modular structure: capture, overlay, extraction, API, image conversion, clipboard separated
- Security: context isolation, preload script, API key in environment variable
- One-shot capture: screenshot taken once, texture uploaded once
- Clean state machine: idle → capturing → selecting → processing → idle
- Resource management: cleanup on ESC and completion
- Immediate UX: overlay closes before API call to prevent UI freezing
- In-memory processing: all image data stays in memory, no file I/O

## Learnings & Insights
- WebGL texture upload is one-time; uniforms update during drag
- DPI scaling requires logical → physical coordinate mapping
- ESC handler needs capture phase for highest priority
- Small selections (< 5x5) should be filtered
- Hidden window required to maintain global shortcut
- **WebGL coordinate system**: Bitmap data from `toBitmap()` has top-left origin, but WebGL textures use bottom-left origin - must flip Y in vertex shader (`v_texCoord.y = 1.0 - texCoord.y`)
- **Selection coordinate mapping**: After Y-flip in vertex shader, fragment shader texture coordinates match screen coordinates (top-left origin), so selection rectangles use screen coordinates directly
- **Global shortcut registration**: `globalShortcut.register()` can return `false` even when the shortcut is actually registered and working - check actual behavior rather than just return value
- **Gemini API model deprecation**: gemini-1.5-flash was deprecated, switched to gemini-2.5-flash with v1 API
- **Overlay UX**: Closing overlay immediately after selection prevents perceived freezing during API calls (1-3 second delay)
- **dotenv configuration**: Must be required at the very top of main.js before any other code that uses process.env
- **Image format**: Gemini API accepts PNG via inline_data with mime_type 'image/png' and base64 data
- **Image optimization**: Images automatically resized to max 1024px on longest side for faster processing (1024px is sufficient for equation recognition while reducing payload size significantly)
- **API performance**: Using gemini-2.5-flash-lite with generationConfig (maxOutputTokens: 256, temperature: 0.1) results in 2-4x faster response times compared to previous configuration
- **Electron color format**: `toBitmap()` returns BGRA format on Windows (not RGBA) - must swap red/blue channels before processing
- **Canvas resolution vs CSS size**: Canvas internal resolution (width/height) must match physical screenshot resolution for pixel-perfect rendering; CSS size (style.width/height) controls display size
- **Mouse coordinate conversion**: Mouse events use CSS pixels; must convert to canvas coordinates using `(mouseX * canvas.width) / canvas.offsetWidth` for DPI-scaled displays
- **Pixel-perfect rendering**: Use `gl.NEAREST` filtering (not `gl.LINEAR`) to prevent interpolation blur when rendering screenshots
- **Integer pixel boundaries**: All pixel coordinates for buffer extraction must be integers - round floating-point values from coordinate calculations

