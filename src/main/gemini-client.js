/**
 * Gemini API client for equation-to-LaTeX conversion
 */

const PROMPT = `
Gemini Prompt — Math OCR → Minimal LaTeX Formatting

System / Instruction Prompt:

You are an OCR and LaTeX transcription engine.

Your task is to transcribe the provided image into text and LaTeX with minimal formatting.

Follow these rules exactly:

1. Content classification

If the image contains only a single mathematical expression or equation (no surrounding prose):

Output only the LaTeX for the equation

Wrap the entire expression in double dollar signs:

$$ ... $$

If the image contains text mixed with mathematics:

Transcribe all readable text verbatim as plain text

Insert math expressions inline using single dollar signs:

$ ... $

Do not use double dollar signs inside paragraphs

2. Aligned and multi-line equations (STRICT)

If the image contains two or more equations that:
- appear on separate lines, AND
- are visually aligned at an equals sign, inequality sign, or another common operator,

then you MUST:

- Use a LaTeX alignment environment (wrapping the block in $$ ... $$ as well):
  $$
  \\begin{align}
  ...
  \\end{align}
  $$

- Place an alignment marker & immediately before the alignment symbol on every aligned line.

- Place each equation on its own line, separated by \\.

- Preserve the relative left-right structure exactly as seen in the image.

You MUST NOT:
- Merge aligned equations into a single line.
- Output them as separate unaligned display equations.
- Use $$ ... $$ instead of an alignment environment when visible alignment is present.
- Introduce alignment environments if alignment is not visually obvious in the image.
`;

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';
// Recommended models for image-to-LaTeX conversion (in order of preference):
// 1. gemini-2.5-flash-lite - FASTEST, optimized for speed and cost (DEFAULT)
// 2. gemini-2.5-flash - Balanced performance and efficiency
// 3. gemini-2.5-pro - Best for complex tasks, coding, and STEM applications (slower)
// If the default doesn't work, try changing MODEL to one of the alternatives above
const MODEL = 'gemini-2.5-flash-lite';

/**
 * Sends an image to Gemini API and returns the response
 * @param {string} base64Image - Base64-encoded PNG image (without data URI prefix)
 * @param {string} prompt - Prompt text (defaults to PROMPT constant)
 * @returns {Promise<Object>} API response object
 */
async function sendImageToGemini(base64Image, prompt = PROMPT) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  if (!base64Image || typeof base64Image !== 'string') {
    throw new Error('Invalid base64 image data provided');
  }
  
  const url = `${API_BASE_URL}/models/${MODEL}:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/png',
            data: base64Image
          }
        }
      ]
    }],
    generationConfig: {
      maxOutputTokens: 256, // Limit response length for faster generation (LaTeX equations are typically short)
      temperature: 0.1 // Lower temperature for more deterministic, faster responses
    }
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed with status ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // If parsing fails, use the raw error text
        if (errorText) {
          errorMessage = `${errorMessage}: ${errorText}`;
        }
      }
      
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error(`Invalid API key: ${errorMessage}`);
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded: ${errorMessage}`);
      } else if (response.status >= 500) {
        throw new Error(`Server error: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    // Re-throw our custom errors, wrap network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: ${error.message}. Please check your internet connection.`);
    }
    throw error;
  }
}

/**
 * Extracts LaTeX code from Gemini API response
 * @param {Object} apiResponse - Response object from Gemini API
 * @returns {string} Extracted LaTeX code
 */
function extractLaTeXFromResponse(apiResponse) {
  try {
    if (!apiResponse || !apiResponse.candidates || apiResponse.candidates.length === 0) {
      throw new Error('API response has no candidates');
    }
    
    const candidate = apiResponse.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('API response candidate has no content parts');
    }
    
    const textPart = candidate.content.parts[0];
    
    if (!textPart.text || typeof textPart.text !== 'string') {
      throw new Error('API response does not contain text content');
    }
    
    // Extract and trim the LaTeX code
    let latex = textPart.text.trim();
    
    // Remove markdown code blocks if present (```latex ... ``` or ``` ... ```)
    latex = latex.replace(/^```(?:latex)?\s*\n?/i, '');
    latex = latex.replace(/\n?```\s*$/i, '');
    latex = latex.trim();
    
    if (!latex) {
      throw new Error('Extracted LaTeX code is empty');
    }
    
    return latex;
  } catch (error) {
    throw new Error(`Failed to extract LaTeX from response: ${error.message}`);
  }
}

module.exports = { sendImageToGemini, extractLaTeXFromResponse, PROMPT };

