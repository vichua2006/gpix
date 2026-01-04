# Active Context

## Current Work Focus
**Phase 1: Complete ✓ - Ready for Phase 2**

Phase 1 screenshot and selection UI fully implemented and functional.

## Recent Changes
- Complete Electron app structure implemented
- WebGL-based overlay with GPU acceleration
- DPI scaling support with native Electron API
- ESC cancellation with full resource cleanup
- **Fixed image flip issue**: Added Y-coordinate flip in vertex shader to account for WebGL texture coordinates (bottom-left origin) vs bitmap data (top-left origin)
- **Fixed selection rectangle coordinates**: Corrected coordinate mapping to match flipped texture coordinate system
- **Fixed global shortcut error message**: Changed error message to informational since `register()` can return false even when shortcut works
- All Phase 1 features working correctly

## Next Steps
**Phase 2: Gemini API Integration**
1. Add Gemini API client
2. Implement image encoding (base64)
3. Create equation extraction prompt
4. Add LaTeX result display
5. Error handling and retry logic

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

## Important Patterns & Preferences
- Modular structure: capture, overlay, extraction separated
- Security: context isolation, preload script
- One-shot capture: screenshot taken once, texture uploaded once
- Clean state machine: idle → capturing → selecting → idle
- Resource management: cleanup on ESC and completion

## Learnings & Insights
- WebGL texture upload is one-time; uniforms update during drag
- DPI scaling requires logical → physical coordinate mapping
- ESC handler needs capture phase for highest priority
- Small selections (< 5x5) should be filtered
- Hidden window required to maintain global shortcut
- **WebGL coordinate system**: Bitmap data from `toBitmap()` has top-left origin, but WebGL textures use bottom-left origin - must flip Y in vertex shader (`v_texCoord.y = 1.0 - texCoord.y`)
- **Selection coordinate mapping**: After Y-flip in vertex shader, fragment shader texture coordinates match screen coordinates (top-left origin), so selection rectangles use screen coordinates directly
- **Global shortcut registration**: `globalShortcut.register()` can return `false` even when the shortcut is actually registered and working - check actual behavior rather than just return value

