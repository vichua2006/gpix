/**
 * WebGL-based screenshot overlay renderer
 * Handles GPU-accelerated rendering, mouse input, and selection
 */

// Global state
let gl = null;
let screenshotProgram = null;
let borderProgram = null;
let screenshotTexture = null;
let fullscreenQuadBuffer = null;
let borderBuffer = null;

let screenshotWidth = 0;
let screenshotHeight = 0;
let scaleFactor = 1.0;

// Selection state
let selecting = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

// Render loop
let animationFrameId = null;

// Uniform locations
let uniformLocations = {};
let borderUniformLocations = {};

/**
 * Initialize WebGL context and setup
 * @param {number} physicalWidth - Physical width of screenshot in pixels
 * @param {number} physicalHeight - Physical height of screenshot in pixels
 */
function initWebGL(physicalWidth, physicalHeight) {
  const canvas = document.getElementById('canvas');
  
  // Set canvas to match physical screenshot resolution (not logical window size)
  // This prevents WebGL from having to scale the texture, ensuring pixel-perfect rendering
  canvas.width = physicalWidth;
  canvas.height = physicalHeight;
  
  // Set CSS size to fill window (maintains aspect ratio)
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  
  // Get WebGL context (try WebGL2 first, fall back to WebGL1)
  gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    throw new Error('WebGL not supported');
  }
  
  console.log(`WebGL initialized: canvas ${physicalWidth}x${physicalHeight}, display ${window.innerWidth}x${window.innerHeight}`);
  
  // Create shader programs
  screenshotProgram = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
  borderProgram = createProgram(gl, BORDER_VERTEX_SHADER_SOURCE, BORDER_FRAGMENT_SHADER_SOURCE);
  
  // Get uniform locations for screenshot program
  uniformLocations = {
    screenshot: gl.getUniformLocation(screenshotProgram, 'u_screenshot'),
    selectionRect: gl.getUniformLocation(screenshotProgram, 'u_selectionRect'),
    dimAmount: gl.getUniformLocation(screenshotProgram, 'u_dimAmount'),
    hasSelection: gl.getUniformLocation(screenshotProgram, 'u_hasSelection')
  };
  
  // Get uniform locations for border program
  borderUniformLocations = {
    borderColor: gl.getUniformLocation(borderProgram, 'u_borderColor')
  };
  
  // Create fullscreen quad
  createFullscreenQuad();
  
  console.log('Shaders compiled and linked');
}

/**
 * Creates a fullscreen quad for rendering the screenshot
 */
function createFullscreenQuad() {
  // Fullscreen quad vertices (clip space -1 to 1)
  const vertices = new Float32Array([
    -1, -1,  // Bottom-left
     1, -1,  // Bottom-right
    -1,  1,  // Top-left
     1,  1   // Top-right
  ]);
  
  fullscreenQuadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

/**
 * Uploads screenshot data to GPU as texture (one-time operation)
 */
function uploadScreenshotTexture(buffer, width, height) {
  screenshotWidth = width;
  screenshotHeight = height;
  
  // Create texture
  screenshotTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, screenshotTexture);
  
  // Upload pixel data
  const uint8Array = new Uint8Array(buffer);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                    // mip level
    gl.RGBA,              // internal format
    width,
    height,
    0,                    // border
    gl.RGBA,              // format
    gl.UNSIGNED_BYTE,     // type
    uint8Array
  );
  
  // Set texture parameters (use NEAREST for pixel-perfect rendering, no blur)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  console.log(`Texture uploaded: ${width}x${height}`);
}

/**
 * Calculates selection rectangle from start and current points
 * Returns integer pixel coordinates (rounds to nearest pixel)
 */
function calculateRect(x1, y1, x2, y2) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  
  // Round to integer pixels for buffer extraction
  return { 
    x: Math.round(left), 
    y: Math.round(top), 
    width: Math.round(width), 
    height: Math.round(height) 
  };
}

/**
 * Main render loop
 */
function render() {
  // Clear canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Render screenshot with dimming/selection
  renderScreenshot();
  
  // Render selection border if active
  if (selecting && startX !== currentX && startY !== currentY) {
    renderBorder();
  }
  
  // Continue render loop
  animationFrameId = requestAnimationFrame(render);
}

/**
 * Renders the screenshot with dimming and selection
 */
function renderScreenshot() {
  gl.useProgram(screenshotProgram);
  
  // Bind texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, screenshotTexture);
  gl.uniform1i(uniformLocations.screenshot, 0);
  
  // Set dimming amount
  gl.uniform1f(uniformLocations.dimAmount, 0.5);
  
  // Calculate normalized selection rectangle
  if (selecting && startX !== currentX && startY !== currentY) {
    const rect = calculateRect(startX, startY, currentX, currentY);
    const canvasWidth = gl.canvas.width;
    const canvasHeight = gl.canvas.height;
    
    // Convert to normalized coordinates (0-1) and flip Y for WebGL texture coordinates
    // Screen coordinates have origin at top-left, texture coordinates at bottom-left (after Y-flip in shader)
    const normalizedX = rect.x / canvasWidth;
    const normalizedY = rect.y / canvasHeight;
    const normalizedWidth = rect.width / canvasWidth;
    const normalizedHeight = rect.height / canvasHeight;
    
    // Flip Y coordinate: screen Y (top=0) -> texture Y (bottom=0 after flip)
    // Since we flipped the texture Y in the vertex shader (v_texCoord.y = 1.0 - texCoord.y),
    // the texture coordinate system now has Y=0 at top, Y=1 at bottom
    // Screen top (normalizedY=0) should map to texture top (Y=0)
    // Screen bottom (normalizedY+height) should map to texture bottom (Y=normalizedY+height)
    // The shader checks: v_texCoord.y >= u_selectionRect.y && v_texCoord.y <= u_selectionRect.y + u_selectionRect.w
    // So we pass the top coordinate (not bottom) since texture Y is now flipped
    const textureY = normalizedY;
    
    gl.uniform1i(uniformLocations.hasSelection, 1);
    gl.uniform4f(
      uniformLocations.selectionRect,
      normalizedX,
      textureY,
      normalizedWidth,
      normalizedHeight
    );
  } else {
    gl.uniform1i(uniformLocations.hasSelection, 0);
    gl.uniform4f(uniformLocations.selectionRect, 0, 0, 0, 0);
  }
  
  // Bind vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuadBuffer);
  const positionLocation = gl.getAttribLocation(screenshotProgram, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
  // Draw fullscreen quad
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/**
 * Renders the red selection border
 */
function renderBorder() {
  const rect = calculateRect(startX, startY, currentX, currentY);
  const canvasWidth = gl.canvas.width;
  const canvasHeight = gl.canvas.height;
  
  // Convert to clip space (-1 to 1)
  const x1 = (rect.x / canvasWidth) * 2 - 1;
  const y1 = 1 - (rect.y / canvasHeight) * 2;
  const x2 = ((rect.x + rect.width) / canvasWidth) * 2 - 1;
  const y2 = 1 - ((rect.y + rect.height) / canvasHeight) * 2;
  
  // Create border line vertices (4 lines forming rectangle)
  const borderWidth = 2.0 / canvasWidth; // 2 pixels
  const borderHeight = 2.0 / canvasHeight;
  
  const vertices = new Float32Array([
    // Top line
    x1, y1, x2, y1,
    // Right line
    x2, y1, x2, y2,
    // Bottom line
    x2, y2, x1, y2,
    // Left line
    x1, y2, x1, y1
  ]);
  
  // Update border buffer
  if (!borderBuffer) {
    borderBuffer = gl.createBuffer();
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, borderBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  
  // Use border program
  gl.useProgram(borderProgram);
  
  // Set border color (red)
  gl.uniform4f(borderUniformLocations.borderColor, 1.0, 0.0, 0.0, 1.0);
  
  // Bind vertex buffer
  const positionLocation = gl.getAttribLocation(borderProgram, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
  // Draw lines
  gl.lineWidth(2.0);
  gl.drawArrays(gl.LINES, 0, 8);
}

/**
 * Cleanup WebGL resources
 */
function cleanup() {
  console.log('Cleaning up WebGL resources...');
  
  // Stop render loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  if (gl) {
    // Delete texture
    if (screenshotTexture) {
      gl.deleteTexture(screenshotTexture);
      screenshotTexture = null;
    }
    
    // Delete buffers
    if (fullscreenQuadBuffer) {
      gl.deleteBuffer(fullscreenQuadBuffer);
      fullscreenQuadBuffer = null;
    }
    
    if (borderBuffer) {
      gl.deleteBuffer(borderBuffer);
      borderBuffer = null;
    }
    
    // Delete programs
    if (screenshotProgram) {
      gl.deleteProgram(screenshotProgram);
      screenshotProgram = null;
    }
    
    if (borderProgram) {
      gl.deleteProgram(borderProgram);
      borderProgram = null;
    }
  }
  
  console.log('Cleanup complete');
}

/**
 * Converts mouse event coordinates (CSS pixels) to canvas coordinates (physical pixels)
 */
function getCanvasCoordinates(mouseX, mouseY) {
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  
  // Convert CSS coordinates to canvas coordinates
  const canvasX = (mouseX - rect.left) * (canvas.width / rect.width);
  const canvasY = (mouseY - rect.top) * (canvas.height / rect.height);
  
  return { x: canvasX, y: canvasY };
}

/**
 * Mouse event handlers
 */
function setupInputHandlers() {
  const canvas = document.getElementById('canvas');
  
  // Mouse down - start selection
  canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    startX = currentX = coords.x;
    startY = currentY = coords.y;
    selecting = true;
    console.log(`Selection started at (${startX}, ${startY})`);
  });
  
  // Mouse move - update selection
  canvas.addEventListener('mousemove', (e) => {
    if (selecting) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      currentX = coords.x;
      currentY = coords.y;
    }
  });
  
  // Mouse up - complete selection
  canvas.addEventListener('mouseup', (e) => {
    if (!selecting) return;
    
    selecting = false;
    
    // Calculate final rectangle (already in physical coordinates)
    const physicalRect = calculateRect(startX, startY, currentX, currentY);
    
    // Skip if selection is too small (likely accidental click)
    if (physicalRect.width < 5 || physicalRect.height < 5) {
      console.log('Selection too small, ignoring');
      return;
    }
    
    console.log('Selection complete (physical):', physicalRect);
    
    // Send to main process (coordinates are already physical, no conversion needed)
    window.electronAPI.sendSelectionComplete(physicalRect);
  });
  
  // ESC key - cancel selection (highest priority)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Selection cancelled by user (ESC)');
      
      // Cleanup resources
      cleanup();
      
      // Notify main process
      window.electronAPI.sendSelectionCancelled();
    }
  }, true); // Use capture phase for immediate handling
}

/**
 * Initialize the overlay when screenshot data is received
 */
window.electronAPI.onScreenshotData(async (data) => {
  console.log('Screenshot data received:', {
    width: data.width,
    height: data.height,
    scaleFactor: data.scaleFactor
  });
  
  scaleFactor = data.scaleFactor;
  
  try {
    // Initialize WebGL with physical screenshot dimensions
    initWebGL(data.width, data.height);
    
    // Upload screenshot texture (one-time)
    uploadScreenshotTexture(data.buffer, data.width, data.height);
    
    // Setup input handlers
    setupInputHandlers();
    
    // Start render loop
    render();
    
    console.log('Overlay ready');
    
  } catch (error) {
    console.error('Overlay initialization failed:', error);
    window.electronAPI.sendSelectionCancelled();
  }
});

// Handle context loss
const canvas = document.getElementById('canvas');
canvas.addEventListener('webglcontextlost', (e) => {
  console.error('WebGL context lost');
  e.preventDefault();
  cancelAnimationFrame(animationFrameId);
});

canvas.addEventListener('webglcontextrestored', () => {
  console.log('WebGL context restored');
  // Would need to reinitialize, but for now just cancel
  window.electronAPI.sendSelectionCancelled();
});

