# Active Context

## Current Work Focus
**Phase 1: Screenshot & Selection UI Implementation**

Building the core screenshot capture and interactive selection interface. This includes:
- Setting up Electron application structure
- Implementing global shortcut registration
- Creating screenshot capture functionality
- Building transparent overlay window system
- Implementing mouse drag selection with visual feedback

## Recent Changes
- Project initialized
- Memory bank created
- Architecture and requirements defined

## Next Steps
1. Initialize Electron project with package.json
2. Set up main process with global shortcut handler
3. Implement screenshot capture (desktopCapturer or screenshot-desktop)
4. Create overlay window (BrowserWindow with transparent, frameless, alwaysOnTop)
5. Render screenshot in overlay with dimming effect
6. Implement mouse event handlers (mousedown, mousemove, mouseup)
7. Add selection rectangle rendering
8. Implement brightness restoration within selection area
9. Add selection extraction/cropping functionality
10. Add cancel/escape functionality

## Active Decisions & Considerations

### Screenshot Library
- **Decision Pending:** Use Electron's `desktopCapturer` API or `screenshot-desktop` npm package
- **Consideration:** `desktopCapturer` is built-in but may require more setup for overlay
- **Consideration:** `screenshot-desktop` is simpler but adds dependency

### Selection Rendering Approach
- **Decision Pending:** CSS filters vs Canvas manipulation for dimming/selection
- **Consideration:** CSS approach: simpler, HTML-based, may have performance limits
- **Consideration:** Canvas approach: more control, better performance, more complex

### Window Management
- **Approach:** Single overlay window (transparent, frameless)
- **Dimensions:** Full screen matching primary display
- **Behavior:** Always on top, click-through regions outside selection

## Important Patterns & Preferences
- Keep implementation simple for Phase 1 (no premature optimization)
- Focus on Windows compatibility first
- Hard-coded shortcuts/config for now
- Clean, modular code structure for future API integration

## Learnings & Insights
- Overlay window needs careful coordinate handling for mouse events
- Brightness restoration within selection requires masking/clipping technique
- Full-screen overlay may need special handling on different screen resolutions

