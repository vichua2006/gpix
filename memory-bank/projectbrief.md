# Project Brief: gpix

## Overview
gpix is an Electron application that enables users to capture screenshots, select specific regions, and convert mathematical equations in those images to LaTeX format using Google's Gemini API.

## Core Goals
1. Provide a global keyboard shortcut to initiate screenshot mode
2. Display a full-screen overlay with dimmed screenshot for interactive region selection
3. Allow users to drag and select regions with visual feedback (red rectangle, restored brightness)
4. Extract selected region and send to Gemini API for equation-to-LaTeX conversion
5. Display/return LaTeX results

## Current Scope (Phase 1)
**Focus: Screenshot & Selection UI Only**
- Implement global shortcut registration
- Create full-screen screenshot capture
- Build transparent overlay window with dimmed screenshot
- Implement interactive selection with mouse drag
- Visual feedback: red rectangle border and brightness restoration within selection
- Region extraction and cropping

**Out of Scope for Phase 1:**
- Gemini API integration (Phase 2)
- Multi-monitor optimization
- Performance optimizations for large screens
- Advanced error handling
- Configuration UI for shortcuts

## Platform Priority
- **Primary:** Windows
- **Secondary:** macOS (cross-platform preferred but not critical for Phase 1)
- **Tertiary:** Linux (low priority)

## Key Requirements
- Global shortcut support (hard-coded initially)
- Frameless, transparent overlay window
- Real-time selection feedback
- Clean, intuitive user experience

