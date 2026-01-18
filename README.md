<img width="1920" height="1280" alt="gpix" src="https://github.com/user-attachments/assets/20c0cd54-c9c1-4993-9741-59b85f9e8428" />

> [!NOTE]
> **Result:**
> 
> $$
\begin{align}
G_t^t &= -\frac{h'}{rh^2} - \frac{1}{r^2}\left(1 - \frac{1}{h}\right), \quad &(49) \notag\\
G_r^r &= \frac{f'}{rfh} - \frac{1}{r^2}\left(1 - \frac{1}{h}\right), \quad &(50) \notag\\
G_\theta^\theta = G_\varphi^\varphi &= \frac{1}{2\sqrt{fh}}\frac{d}{dr}\left(\frac{f'}{\sqrt{fh}}\right) + \frac{f'}{2rfh} - \frac{h'}{2rh^2}, \quad &(51) \notag\\
\end{align}
> $$

# gpix - Mathpix but Gemini
why pay 6 dollars a month for Mathpix when you can use a Gemini wrapper? 😋

## Features

- **Global Keyboard Shortcut**: `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (macOS)
- **GPU-Accelerated Rendering**: WebGL-based overlay for smooth performance
- **DPI Scaling Support**: Automatic handling of Windows display scaling (100%, 125%, 150%, 200%, etc.)
- **Interactive Selection**: Drag to select region with visual feedback
- **ESC Cancellation**: Press ESC at any time to cancel

## Installation

Download the latest installer from the [GitHub Releases](https://github.com/YOUR_USERNAME/gpix/releases) page and run `gpix Setup x.x.x.exe`.

## Usage

### Settings Window
<img width="886" height="585" alt="image" src="https://github.com/user-attachments/assets/eb20ebfb-771c-40bd-abe3-f1e87eb88ab4" />


On launch, gpix opens a settings window with four buttons:

| Button | Description |
|--------|-------------|
| **Save key** | Saves your Gemini API key securely to the system keychain |
| **Test key** | Validates your API key by testing connectivity to Gemini |
| **Quit app** | Closes gpix completely |
| **Delete key** | Removes the stored API key from your keychain |

### Capturing Equations

1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> (or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> on macOS) anywhere
2. Drag to select the region containing your equation
3. Release to capture — the LaTeX is automatically copied to your clipboard
4. Paste anywhere with <kbd>Ctrl</kbd>+<kbd>V</kbd>

Press <kbd>ESC</kbd> at any time to cancel the selection.

# Liscense
MIT

