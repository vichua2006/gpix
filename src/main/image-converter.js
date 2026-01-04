const sharp = require('sharp');

/**
 * Converts an RGBA buffer to PNG format and encodes as base64
 * @param {Buffer} rgbaBuffer - RGBA pixel buffer (4 bytes per pixel)
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {Promise<string>} Base64-encoded PNG string (without data URI prefix)
 */
async function convertBufferToPNGBase64(rgbaBuffer, width, height) {
  try {
    // Create a sharp image from the RGBA buffer
    const pngBuffer = await sharp(rgbaBuffer, {
      raw: {
        width: width,
        height: height,
        channels: 4 // RGBA
      }
    })
    .png()
    .toBuffer();
    
    // Convert to base64 string (raw base64, not data URI)
    const base64String = pngBuffer.toString('base64');
    
    return base64String;
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
}

module.exports = { convertBufferToPNGBase64 };

