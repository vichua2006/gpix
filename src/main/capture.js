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
  
  // Convert to raw RGBA buffer
  const buffer = image.toBitmap();
  
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

