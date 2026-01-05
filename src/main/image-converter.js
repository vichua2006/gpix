const sharp = require('sharp');

/**
 * Converts an RGBA buffer to PNG format and encodes as base64
 * Optimizes image size for faster API processing:
 * - Resizes to max 1024px on longest side (maintains aspect ratio)
 * - Applies PNG compression for smaller payload
 * 
 * @param {Buffer} rgbaBuffer - RGBA pixel buffer (4 bytes per pixel)
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {Promise<string>} Base64-encoded PNG string (without data URI prefix)
 */
async function convertBufferToPNGBase64(rgbaBuffer, width, height) {
  try {
    // Maximum dimension for faster processing (1024px is sufficient for equation recognition)
    const MAX_DIMENSION = 1024;
    
    // Calculate scaling if image is larger than max dimension
    let targetWidth = width;
    let targetHeight = height;
    
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      targetWidth = Math.round(width * scale);
      targetHeight = Math.round(height * scale);
      console.log(`Resizing image from ${width}x${height} to ${targetWidth}x${targetHeight} for faster processing`);
    }
    
    // Create a sharp image from the RGBA buffer
    let image = sharp(rgbaBuffer, {
      raw: {
        width: width,
        height: height,
        channels: 4 // RGBA
      }
    });
    
    // Resize if needed (maintains aspect ratio, uses high-quality resampling)
    if (targetWidth !== width || targetHeight !== height) {
      image = image.resize(targetWidth, targetHeight, {
        fit: 'inside',
        kernel: sharp.kernel.lanczos3 // High-quality resampling
      });
    }
    
    // Convert to PNG with compression optimization
    const pngBuffer = await image
      .png({
        compressionLevel: 6, // Balance between file size and encoding speed (0-9, default is 6)
        quality: 100, // PNG doesn't use quality, but explicit for clarity
        palette: false // Don't use palette (maintains full color)
      })
      .toBuffer();
    
    // Convert to base64 string (raw base64, not data URI)
    const base64String = pngBuffer.toString('base64');
    
    console.log(`Image converted: ${targetWidth}x${targetHeight}, ${Math.round(pngBuffer.length / 1024)}KB base64`);
    
    return base64String;
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
}

module.exports = { convertBufferToPNGBase64 };

