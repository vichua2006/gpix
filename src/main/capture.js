const { desktopCapturer, screen } = require('electron');

/**
 * Captures the primary display screenshot at physical resolution
 * Accounts for Windows DPI scaling
 * 
 * @returns {Promise<Object>} Screenshot data
 *   - buffer: Raw RGBA pixel buffer (Uint8Array) at physical resolution
 *   - width: Physical width in pixels
 *   - height: Physical height in pixels
 *   - scaleFactor: DPI scale factor (1.0, 1.25, 1.5, 2.0, etc.)
 *   - logicalWidth: Logical width (CSS pixels)
 *   - logicalHeight: Logical height (CSS pixels)
 */
async function captureScreen() {
  // Get display info including scale factor
  const primaryDisplay = screen.getPrimaryDisplay();
  const scaleFactor = primaryDisplay.scaleFactor;
  const { width, height } = primaryDisplay.bounds;
  
  console.log(`Display: ${width}x${height} (logical), scale: ${scaleFactor}x`);
  
  // Calculate physical resolution
  const physicalWidth = Math.round(width * scaleFactor);
  const physicalHeight = Math.round(height * scaleFactor);
  
  console.log(`Requesting screenshot at ${physicalWidth}x${physicalHeight} (physical)`);
  
  // Request screenshot at physical resolution
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { 
      width: physicalWidth, 
      height: physicalHeight 
    }
  });
  
  if (!sources || sources.length === 0) {
    throw new Error('No screen sources available');
  }
  
  // Get primary display source
  const primarySource = sources[0];
  const image = primarySource.thumbnail;
  
  // Get actual image dimensions
  const actualWidth = image.getSize().width;
  const actualHeight = image.getSize().height;
  
  console.log(`Screenshot received: ${actualWidth}x${actualHeight}`);
  
  // Convert to raw buffer (BGRA format on Windows)
  const buffer = image.toBitmap();
  
  // Convert BGRA to RGBA (swap red and blue channels)
  // Electron's toBitmap() returns BGRA on Windows, but we need RGBA
  for (let i = 0; i < buffer.length; i += 4) {
    const b = buffer[i];     // Blue
    const r = buffer[i + 2]; // Red
    buffer[i] = r;           // Red -> position 0
    buffer[i + 2] = b;       // Blue -> position 2
    // Green (i+1) and Alpha (i+3) stay in place
  }
  
  return {
    buffer: buffer,  // Raw RGBA buffer at physical resolution
    width: actualWidth,
    height: actualHeight,
    scaleFactor: scaleFactor,  // Pass scale factor for coordinate mapping
    logicalWidth: width,
    logicalHeight: height
  };
}

module.exports = { captureScreen };

