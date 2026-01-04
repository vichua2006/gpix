# Product Context

## Why This Project Exists
Users often encounter mathematical equations in digital content (PDFs, websites, documents) that they need in LaTeX format for academic or professional work. Manual conversion is time-consuming and error-prone.

## Problems It Solves
1. **Time Efficiency:** Quickly extract equations from any on-screen content
2. **Accuracy:** AI-powered conversion reduces manual transcription errors
3. **Workflow Integration:** Global shortcut allows instant access without leaving current application
4. **Visual Selection:** Interactive UI ensures precise equation capture

## How It Should Work

### User Flow
1. User presses global keyboard shortcut (default to be determined)
2. Application captures current screen
3. Full-screen overlay appears with dimmed screenshot
4. User drags mouse to select region containing equation
5. Selected region shows:
   - Red rectangle border
   - Restored brightness (normal lighting)
   - Rest of screen remains dimmed
6. User releases mouse to confirm selection
7. (Phase 2) Selected region sent to Gemini API
8. (Phase 2) LaTeX result returned and displayed

### User Experience Goals
- **Instant:** Global shortcut provides immediate access
- **Intuitive:** Visual feedback makes selection process clear
- **Precise:** Selection rectangle allows pixel-perfect capture
- **Non-intrusive:** Overlay can be dismissed/cancelled easily

## Target Use Cases
- Students converting equations from online lectures
- Researchers extracting formulas from papers
- Professionals documenting mathematical content
- Developers working with mathematical documentation

