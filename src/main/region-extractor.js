/**
 * Extracts a rectangular region from the screenshot buffer
 * Uses physical pixel coordinates (already scaled by DPI factor)
 */

/**
 * Extracts a region from the original screenshot buffer
 * @param {Buffer} originalBuffer - Original RGBA screenshot buffer
 * @param {number} bufferWidth - Width of the screenshot buffer
 * @param {number} bufferHeight - Height of the screenshot buffer
 * @param {Object} rect - Rectangle in physical coordinates
 * @param {number} rect.x - X coordinate
 * @param {number} rect.y - Y coordinate
 * @param {number} rect.width - Width
 * @param {number} rect.height - Height
 * @returns {Buffer} Cropped RGBA buffer
 */
function extractRegion(originalBuffer, bufferWidth, bufferHeight, rect) {
  // Validate rectangle bounds
  if (rect.x < 0 || rect.y < 0 || 
      rect.x + rect.width > bufferWidth || 
      rect.y + rect.height > bufferHeight) {
    throw new Error(`Invalid rectangle bounds: ${JSON.stringify(rect)} for buffer ${bufferWidth}x${bufferHeight}`);
  }
  
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(`Invalid rectangle dimensions: ${rect.width}x${rect.height}`);
  }
  
  console.log(`Extracting region: ${rect.width}x${rect.height} from (${rect.x}, ${rect.y})`);
  
  // Allocate buffer for cropped region (4 bytes per pixel: RGBA)
  const cropped = Buffer.alloc(rect.width * rect.height * 4);
  
  // Copy pixels row by row
  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      // Source pixel position in original buffer
      const srcX = rect.x + x;
      const srcY = rect.y + y;
      const srcIndex = (srcY * bufferWidth + srcX) * 4;
      
      // Destination pixel position in cropped buffer
      const dstIndex = (y * rect.width + x) * 4;
      
      // Copy RGBA values
      cropped[dstIndex] = originalBuffer[srcIndex];         // R
      cropped[dstIndex + 1] = originalBuffer[srcIndex + 1]; // G
      cropped[dstIndex + 2] = originalBuffer[srcIndex + 2]; // B
      cropped[dstIndex + 3] = originalBuffer[srcIndex + 3]; // A
    }
  }
  
  console.log(`Region extracted successfully: ${cropped.length} bytes`);
  
  return cropped;
}

module.exports = { extractRegion };

