/**
 * GLSL Shader programs for GPU-accelerated rendering
 */

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
  // Convert from clip space (-1 to 1) to texture space (0 to 1)
  // Flip Y coordinate: WebGL textures have origin at bottom-left,
  // but bitmap data from toBitmap() has origin at top-left
  vec2 texCoord = a_position * 0.5 + 0.5;
  v_texCoord = vec2(texCoord.x, 1.0 - texCoord.y);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform sampler2D u_screenshot;
uniform vec4 u_selectionRect;  // x, y, width, height (normalized 0-1)
uniform float u_dimAmount;      // Dimming factor (e.g., 0.5)
uniform bool u_hasSelection;    // Whether a selection is active

varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_screenshot, v_texCoord);
  
  if (u_hasSelection) {
    // Check if pixel is inside selection rect
    bool inSelection = (
      v_texCoord.x >= u_selectionRect.x &&
      v_texCoord.x <= u_selectionRect.x + u_selectionRect.z &&
      v_texCoord.y >= u_selectionRect.y &&
      v_texCoord.y <= u_selectionRect.y + u_selectionRect.w
    );
    
    if (!inSelection) {
      // Dim pixels outside selection
      color.rgb *= u_dimAmount;
    }
  } else {
    // No selection - dim everything
    color.rgb *= u_dimAmount;
  }
  
  gl_FragColor = color;
}
`;

// Border rendering shaders (for red rectangle)
const BORDER_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const BORDER_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform vec4 u_borderColor;  // RGBA color

void main() {
  gl_FragColor = u_borderColor;
}
`;

/**
 * Compiles a shader
 * @param {WebGLRenderingContext} gl 
 * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source - Shader source code
 * @returns {WebGLShader}
 */
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compilation failed: ' + info);
  }
  
  return shader;
}

/**
 * Creates a shader program
 * @param {WebGLRenderingContext} gl 
 * @param {string} vertexSource 
 * @param {string} fragmentSource 
 * @returns {WebGLProgram}
 */
function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error('Program linking failed: ' + info);
  }
  
  return program;
}

