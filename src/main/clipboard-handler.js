const { clipboard } = require('electron');

/**
 * Copies text to the system clipboard
 * @param {string} text - Text to copy to clipboard
 * @returns {boolean} True if successful, false otherwise
 */
function copyToClipboard(text) {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text provided to clipboard');
      return false;
    }
    
    clipboard.writeText(text);
    console.log('LaTeX copied to clipboard successfully');
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error.message);
    return false;
  }
}

module.exports = { copyToClipboard };

