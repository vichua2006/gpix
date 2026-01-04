# Active Context

## Current Work Focus
**Phase 1: Complete ✓ - Ready for Phase 2**

Phase 1 screenshot and selection UI fully implemented and functional.

## Recent Changes
- Complete Electron app structure implemented
- WebGL-based overlay with GPU acceleration
- DPI scaling support with native Electron API
- ESC cancellation with full resource cleanup
- All Phase 1 features working

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

