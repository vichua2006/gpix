# Progress

## What Works
- Project initialized
- Requirements documented
- Architecture planned
- Memory bank established

## What's Left to Build

### Phase 1: Screenshot & Selection UI (Current Focus)

#### Core Application Setup
- [ ] Initialize Electron project structure
- [ ] Create package.json with Electron dependency
- [ ] Set up main process entry point
- [ ] Configure basic window management

#### Global Shortcut
- [ ] Register global keyboard shortcut
- [ ] Implement shortcut handler
- [ ] Test shortcut activation

#### Screenshot Capture
- [ ] Choose screenshot method (desktopCapturer vs screenshot-desktop)
- [ ] Implement full-screen capture
- [ ] Convert captured image to usable format
- [ ] Test capture functionality

#### Overlay Window System
- [ ] Create transparent, frameless overlay window
- [ ] Configure window properties (alwaysOnTop, fullscreen, etc.)
- [ ] Implement window show/hide/destroy lifecycle
- [ ] Test overlay appearance and behavior

#### Screenshot Display & Dimming
- [ ] Render screenshot in overlay window
- [ ] Apply brightness/dimming filter to entire screenshot
- [ ] Test visual appearance

#### Selection Interaction
- [ ] Capture mouse down event (selection start)
- [ ] Track mouse move events (selection drag)
- [ ] Calculate selection rectangle bounds
- [ ] Render red rectangle border during selection
- [ ] Implement brightness restoration within selection area
- [ ] Handle mouse up event (selection complete)
- [ ] Test selection behavior and visual feedback

#### Region Extraction
- [ ] Map selection coordinates to screenshot coordinates
- [ ] Crop screenshot to selected region
- [ ] Return/extract cropped image data
- [ ] Test region extraction accuracy

#### Cancellation & Cleanup
- [ ] Implement ESC key handler to cancel selection
- [ ] Clean up overlay window on cancel
- [ ] Clean up overlay window after selection
- [ ] Test cleanup and resource management

### Phase 2: API Integration (Future)
- [ ] Gemini API client setup
- [ ] Image encoding/preparation
- [ ] API request implementation
- [ ] Response parsing
- [ ] LaTeX result display
- [ ] Error handling

## Current Status
**Status:** Planning & Setup Phase
**Phase:** 1 - Screenshot & Selection UI
**Next Milestone:** Working screenshot capture with interactive selection

## Known Issues
- None yet (project just started)

## Evolution of Decisions

### Initial Decisions (Current)
- Focus on Windows first, cross-platform where easy
- Hard-coded shortcuts for Phase 1
- Simple implementation, avoid premature optimization
- Screenshot library choice pending evaluation
- Rendering approach (CSS vs Canvas) pending evaluation

### Decisions to Make
- Screenshot capture method (desktopCapturer vs screenshot-desktop)
- Selection rendering approach (CSS filters vs Canvas)
- Global shortcut key combination (default)
- Dimming brightness level
- Selection rectangle styling details

## Testing Status
- No tests written yet
- Manual testing will be primary method for Phase 1

## Notes
- Project name: gpix (screenshot + Gemini API)
- Focus is on getting core screenshot/selection working first
- API integration deferred until selection UI is solid

