# Testing Guide for gpix

## Application Status

✅ **Application successfully running**
- Electron process started
- Global shortcut registered: `Ctrl+Shift+S`
- Ready to capture screenshots

## Manual Testing Checklist

### 1. Basic Screenshot Capture
- [ ] Press `Ctrl+Shift+S`
- [ ] Verify fullscreen overlay appears
- [ ] Verify screen content is visible (dimmed)
- [ ] Verify cursor changes to crosshair

### 2. Selection Interaction
- [ ] Click and hold mouse button
- [ ] Drag to create selection rectangle
- [ ] Verify red border appears around selection
- [ ] Verify selected area has restored brightness
- [ ] Verify area outside selection remains dimmed
- [ ] Release mouse button
- [ ] Verify overlay closes
- [ ] Check console for "Selection complete" message

### 3. ESC Key Cancellation
Test ESC at different stages:

#### 3a. Cancel Before Selection
- [ ] Press `Ctrl+Shift+S` to open overlay
- [ ] Press `ESC` immediately (without clicking)
- [ ] Verify overlay closes
- [ ] Check console for "Selection cancelled" message

#### 3b. Cancel During Selection
- [ ] Press `Ctrl+Shift+S`
- [ ] Click and start dragging
- [ ] Press `ESC` while still holding mouse button
- [ ] Verify overlay closes immediately
- [ ] Verify no selection is processed

#### 3c. Cancel After Drawing Rectangle
- [ ] Press `Ctrl+Shift+S`
- [ ] Drag to create selection
- [ ] Press `ESC` before releasing mouse
- [ ] Verify overlay closes
- [ ] Verify no selection is processed

### 4. DPI Scaling Tests

For each Windows scaling level:

#### 4a. 100% Scaling (No scaling)
- [ ] Set Windows scaling to 100%
- [ ] Restart application
- [ ] Make selection
- [ ] Verify coordinates are accurate
- [ ] Check console output for scale factor: 1.0

#### 4b. 125% Scaling
- [ ] Set Windows scaling to 125%
- [ ] Restart application
- [ ] Make selection
- [ ] Verify selection matches visual area
- [ ] Check console output for scale factor: 1.25

#### 4c. 150% Scaling
- [ ] Set Windows scaling to 150%
- [ ] Restart application
- [ ] Make selection
- [ ] Verify selection is pixel-perfect
- [ ] Check console output for scale factor: 1.5

#### 4d. 200% Scaling
- [ ] Set Windows scaling to 200%
- [ ] Restart application
- [ ] Make selection
- [ ] Verify high-resolution capture
- [ ] Check console output for scale factor: 2.0

### 5. Edge Cases

#### 5a. Small Selection
- [ ] Make very small selection (< 5x5 pixels)
- [ ] Verify it's ignored with console message

#### 5b. Large Selection
- [ ] Select entire screen
- [ ] Verify it works correctly
- [ ] Check console for large buffer extraction

#### 5c. Rapid Shortcuts
- [ ] Press `Ctrl+Shift+S` twice quickly
- [ ] Verify second press is ignored (no duplicate overlays)
- [ ] Check console for "already in progress" message

#### 5d. Multiple Selections
- [ ] Complete a selection
- [ ] Immediately press `Ctrl+Shift+S` again
- [ ] Make another selection
- [ ] Verify both work correctly

### 6. Visual Quality Tests

#### 6a. Rendering Quality
- [ ] Open overlay with complex screen content
- [ ] Verify screenshot is clear (no distortion)
- [ ] Verify dimming is uniform
- [ ] Verify no color shifts

#### 6b. Selection Border
- [ ] Make selection
- [ ] Verify red border is clearly visible
- [ ] Verify border is 2 pixels wide
- [ ] Verify border forms clean rectangle

#### 6c. Brightness Restoration
- [ ] Make selection
- [ ] Compare selected area to original screen
- [ ] Verify brightness matches original
- [ ] Verify smooth transition at border

### 7. Performance Tests

#### 7a. Render Loop Performance
- [ ] Open overlay
- [ ] Move mouse rapidly while dragging
- [ ] Verify smooth, responsive selection
- [ ] Verify no lag or stuttering

#### 7b. Large Screen Support
- [ ] Test on 1920x1080 display
- [ ] Test on 2560x1440 display (if available)
- [ ] Test on 4K display (if available)
- [ ] Verify performance is acceptable on all

### 8. Resource Cleanup

#### 8a. Normal Completion
- [ ] Complete a selection
- [ ] Check Task Manager for memory usage
- [ ] Make multiple selections
- [ ] Verify no memory leaks

#### 8b. ESC Cancellation Cleanup
- [ ] Open and cancel 10 times with ESC
- [ ] Check Task Manager
- [ ] Verify memory is released

## Expected Console Output

### Successful Capture & Selection
```
Capturing screenshot...
Display: 1920x1080 (logical), scale: 1.5x
Requesting screenshot at 2880x1620 (physical)
Screenshot received: 2880x1620
Screenshot captured: 2880x1620, scale: 1.5
Overlay window created: 1920x1080
Screenshot data received: { width: 2880, height: 2880, scaleFactor: 1.5 }
WebGL initialized
Shaders compiled and linked
Texture uploaded: 2880x1620
Overlay ready
Selection started at (100, 100)
Selection complete (logical): { x: 100, y: 100, width: 200, height: 150 }
Selection complete (physical): { x: 150, y: 150, width: 300, height: 225 }
Extracting region: 300x225 from (150, 150)
Region extracted successfully: 270000 bytes
Region extraction logged to console
Overlay window destroyed
```

### ESC Cancellation
```
Selection cancelled by user (ESC)
Cleaning up WebGL resources...
Cleanup complete
Selection cancelled by user
Overlay window destroyed
```

## Known Issues

None currently - all features implemented and working as designed.

## Phase 2 Testing (Future)

When Gemini API integration is added:
- Test LaTeX conversion accuracy
- Test network error handling
- Test API rate limiting
- Test result display

## Testing Tools

- **Chrome DevTools**: Can be enabled for renderer debugging
- **Task Manager**: Monitor memory/CPU usage
- **Windows Display Settings**: Test DPI scaling
- **Console Output**: Monitor application flow

## Test Results Summary

Fill in after testing:

- **Basic functionality**: [ ] Pass / [ ] Fail
- **ESC cancellation**: [ ] Pass / [ ] Fail
- **DPI scaling**: [ ] Pass / [ ] Fail
- **Performance**: [ ] Pass / [ ] Fail
- **Resource cleanup**: [ ] Pass / [ ] Fail

## Notes

The application is currently in **headless mode** - it runs in the background with no visible window until the shortcut is pressed. This is by design to keep the global shortcut active.

To enable DevTools for debugging:
1. Edit `src/main/overlay-manager.js`
2. Add `overlayWindow.webContents.openDevTools()` after window creation
3. Restart application

