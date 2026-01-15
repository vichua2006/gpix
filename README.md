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

```bash
npm install
```

## Usage

### Development
```bash
npm start
```

### Building the Executable
First, build the portable executable:
```bash
npm run build
```
This creates `dist/gpix 1.0.0.exe` (Windows portable executable).

### Running the Built Executable
Use the provided shell script to run the executable with proper process management:
```bash
./run-gpix.sh
```
The script will:
- Launch the app from `dist/gpix 1.0.0.exe`
- Track the process ID for easy stopping
- Allow you to stop the app with `Ctrl+C`

**Note:** The app runs in the background with global shortcuts. Use the shell script to ensure you can stop it properly.

### Setting Up a CLI Alias

To run `gpix` from anywhere, add an alias to your shell configuration:

**Unix/Linux/Git Bash:**
Add to `~/.bashrc` or `~/.bash_profile`:
```bash
alias gpix='cd /path/to/gpix && ./run-gpix.sh'
```
Then reload: `source ~/.bashrc`

**Windows CMD:**
Create a batch file `gpix.bat` in a directory in your PATH:
```batch
@echo off
cd /d "C:\path\to\gpix"
bash run-gpix.sh
```
Replace `C:\path\to\gpix` with your actual project path.

# Liscense
MIT

