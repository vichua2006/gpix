# gpix - Mathpix but Gemini

why pay 6 dollars a month for Mathpix when you can use a Gemini wrapper? 😋

GPU-accelerated screenshot capture with interactive region selection for equation-to-LaTeX conversion.

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

