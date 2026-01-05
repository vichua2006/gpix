# Active Context

## Current Work Focus
**Phase 2: Complete ✓ - Full Application Functional**

Phase 1 and Phase 2 fully implemented. Application captures screenshots, allows region selection, converts equations to LaTeX via Gemini API, and copies result to clipboard.

## Recent Changes
- **Critical Bug Fixes**: Fixed color accuracy and image sharpness issues
  - **BGRA to RGBA conversion**: Added color channel swap in capture.js to fix red/blue channel inversion (Electron's `toBitmap()` returns BGRA on Windows, not RGBA)
  - **Canvas resolution fix**: Set canvas internal resolution to match physical screenshot resolution instead of logical window size (prevents forced scaling/blur)
  - **Mouse coordinate conversion**: Added `getCanvasCoordinates()` to properly convert CSS pixels to canvas pixels for DPI-scaled displays
  - **Integer pixel coordinates**: Added rounding in `calculateRect()` to ensure integer pixel values for buffer extraction
  - **Texture filtering**: Changed from `gl.LINEAR` to `gl.NEAREST` for pixel-perfect rendering without interpolation blur
- **Phase 2 Implementation Complete**: Gemini API integration fully functional
- Added dotenv for environment variable management (.env file support)
- Added sharp library for RGBA to PNG conversion
- Created gemini-client.js for API communication (v1 API, gemini-2.5-flash model)
- Created image-converter.js for buffer to PNG base64 conversion
- Created clipboard-handler.js for LaTeX result copying
- **UX Improvement**: Overlay window now closes immediately after selection (before API call) to prevent freezing
- Updated API version from v1beta to v1 (stable)
- Updated model from gemini-1.5-flash to gemini-2.5-flash (deprecated model replaced)
- All processing happens in-memory (no file storage)
- Comprehensive error handling for API failures, network issues, missing keys

## Next Steps
**Future Enhancements (Optional)**
1. Multi-monitor support
2. Configuration UI for API key and shortcuts
3. Visual feedback during API processing (loading indicator)
4. Retry logic for failed API requests
5. Save cropped images to file (optional)
6. Tray icon integration

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
- **Chosen:** Google Gemini API v1 with gemini-2.5-flash model
- **Reason:** Fast, accurate, supports multimodal (image + text) input
- **Alternative models available:** gemini-2.5-pro (better accuracy), gemini-2.5-flash-lite (faster/cheaper)

### Image Conversion
- **Chosen:** sharp library for RGBA to PNG conversion
- **Reason:** Fast, native bindings, well-maintained, efficient memory usage

### Result Delivery
- **Chosen:** Clipboard copy (automatic)
- **Reason:** Seamless integration, user can paste anywhere immediately

### Environment Configuration
- **Chosen:** dotenv package with .env file
- **Reason:** Standard approach, keeps API key out of code, easy to configure

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
- **Electron color format**: `toBitmap()` returns BGRA format on Windows (not RGBA) - must swap red/blue channels before processing
- **Canvas resolution vs CSS size**: Canvas internal resolution (width/height) must match physical screenshot resolution for pixel-perfect rendering; CSS size (style.width/height) controls display size
- **Mouse coordinate conversion**: Mouse events use CSS pixels; must convert to canvas coordinates using `(mouseX * canvas.width) / canvas.offsetWidth` for DPI-scaled displays
- **Pixel-perfect rendering**: Use `gl.NEAREST` filtering (not `gl.LINEAR`) to prevent interpolation blur when rendering screenshots
- **Integer pixel boundaries**: All pixel coordinates for buffer extraction must be integers - round floating-point values from coordinate calculations

