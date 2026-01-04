# Technical Context

## Technologies Used

### Core Framework
- **Electron**: Cross-platform desktop application framework
  - Version: Latest stable (TBD)
  - Usage: Main process for system integration, renderer for UI

### Screenshot Libraries (Under Evaluation)
- **desktopCapturer** (Electron built-in)
  - Pros: No dependencies, built-in
  - Cons: May require more setup for overlay scenarios
- **screenshot-desktop** (npm package)
  - Pros: Simple API, good cross-platform support
  - Cons: External dependency

### Development Tools
- **Node.js**: Runtime environment
- **npm/yarn**: Package manager
- **TypeScript** (Optional): Type safety (to be decided)

## Development Setup

### Project Structure (Proposed)
```
gpix/
├── src/
│   ├── main/
│   │   ├── main.js          # Main process entry
│   │   ├── shortcut.js      # Global shortcut handler
│   │   ├── screenshot.js    # Screenshot capture module
│   │   ├── overlay.js       # Overlay window manager
│   │   ├── selection.js     # Selection handler
│   │   └── extractor.js     # Region extraction
│   └── renderer/
│       └── overlay.html     # Overlay window UI
├── package.json
└── README.md
```

### Dependencies (Initial)
```json
{
  "devDependencies": {
    "electron": "^latest"
  },
  "optionalDependencies": {
    "screenshot-desktop": "^latest"
  }
}
```

## Technical Constraints

### Platform-Specific Considerations

#### Windows
- Global shortcuts may require elevated permissions in some cases
- Window transparency supported
- Full-screen overlay works well

#### macOS
- Global shortcuts require accessibility permissions
- Transparency works well
- May need different window management approach

### Electron Limitations
- Global shortcuts only work when app has focus initially (need to keep hidden window)
- Transparency performance varies by OS
- Full-screen overlay may conflict with some applications

## Dependencies

### Core Dependencies
- **electron**: Desktop application framework

### Optional/Future Dependencies
- **screenshot-desktop**: If desktopCapturer doesn't meet needs
- **axios** or **node-fetch**: For Phase 2 API calls

### Development Dependencies
- Standard Node.js development tools
- Linter/formatter (to be configured)

## Tool Usage Patterns

### Electron IPC Communication
- Main process → Renderer: `webContents.send()`
- Renderer → Main: `ipcRenderer.send()` / `ipcRenderer.invoke()`

### Window Creation Pattern
```javascript
new BrowserWindow({
  // Configuration
  show: false,  // Create hidden, then show
  // ...
})
```

### Global Shortcut Pattern
```javascript
globalShortcut.register('CommandOrControl+Shift+S', () => {
  // Trigger screenshot workflow
})
```

## Configuration

### Hard-coded Settings (Phase 1)
- Global shortcut key combination
- Overlay window configuration
- Dimming level (brightness value)
- Selection rectangle color/style

### Future Configuration Needs (Phase 2)
- API key storage
- Customizable shortcut
- Prompt templates
- Result display preferences

## Build & Distribution
- Standard Electron build process
- Electron Builder or Electron Forge (to be decided)
- Windows installer/portable (primary target)

## Environment Requirements
- Node.js 16+ recommended
- Electron compatible OS (Windows primary, macOS secondary)
- Sufficient screen resolution (no specific minimum)

