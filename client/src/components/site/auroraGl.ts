// The aurora's drawing, shared by the background worker that normally runs it and by the page itself in
// browsers that cannot hand a canvas to a worker. See Aurora.tsx.

export const FRAGMENT = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = vec2(uv.x * u_res.x / u_res.y, uv.y);
  float t = u_time * 0.05;

  // Pointer influence: strongest under the cursor, fading out smoothly.
  vec2 d = uv - u_mouse;
  float near = exp(-dot(d, d) * 7.0);
  p += d * near * 0.4;

  float n1 = fbm(vec2(p.x * 1.5 + t, p.y * 0.5 - t * 0.6));
  float n2 = fbm(vec2(p.x * 2.3 - t * 0.8, p.y * 0.7 + t * 0.4) + 5.2);

  // Two curtains whose height follows the noise and tilts a little with the pointer.
  float c1 = smoothstep(0.30, 0.0, abs(uv.y - (0.64 + (n1 - 0.5) * 0.55 + (u_mouse.y - 0.5) * 0.14)));
  float c2 = smoothstep(0.34, 0.0, abs(uv.y - (0.34 + (n2 - 0.5) * 0.60 - (u_mouse.y - 0.5) * 0.10)));
  // Vertical rays inside the curtains.
  float rays = 0.62 + 0.38 * noise(vec2(p.x * 8.0 + n1 * 3.0, t * 2.0));

  vec3 sky   = vec3(0.961, 0.980, 1.000);
  vec3 mint  = vec3(0.640, 0.900, 0.850);
  vec3 blue  = vec3(0.640, 0.800, 0.975);
  vec3 lilac = vec3(0.800, 0.770, 0.970);

  vec3 col = sky;
  col = mix(col, mint, c1 * rays * 0.60);
  col = mix(col, blue, c2 * 0.55);
  col = mix(col, lilac, c1 * c2 * 0.65 + near * 0.16);
  col = mix(col, vec3(1.0), near * 0.10);
  gl_FragColor = vec4(col, 1.0);
}`;

export const VERTEX = "attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }";

export type AuroraControl = { size: (width: number, height: number) => void; pointer: (x: number, y: number) => void; stop: () => void };

/**
 * Starts drawing on `canvas`, or returns null when it cannot (no WebGL, or WebGL drawn in software: without a
 * graphics chip every frame would cost the page its responsiveness, so such a device keeps the still haze).
 * `size` is in canvas pixels; `pointer` is 0..1 across and up the window.
 */
export function paintAurora(canvas: HTMLCanvasElement | OffscreenCanvas, still: boolean): AuroraControl | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "u_res");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uMouse = gl.getUniformLocation(program, "u_mouse");

  // Workers in some browsers have no requestAnimationFrame; a 30-a-second timer stands in.
  const nextFrame = typeof requestAnimationFrame === "function"
    ? (callback: FrameRequestCallback) => requestAnimationFrame(callback)
    : (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 32) as unknown as number;
  const cancelFrame = typeof cancelAnimationFrame === "function" ? (id: number) => cancelAnimationFrame(id) : (id: number) => clearTimeout(id);

  const target = { x: 0.5, y: 0.6 };
  const mouse = { x: 0.5, y: 0.6 };
  let frame = 0;
  let lastDraw = 0;
  const draw = (now: number) => {
    // The drift is slow, so 30 frames a second looks the same and leaves the GPU free for scrolling.
    if (!still && now - lastDraw < 32) { frame = nextFrame(draw); return; }
    lastDraw = now;
    // Ease toward the pointer so the curtains glide instead of snapping.
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, still ? 12 : now / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!still) frame = nextFrame(draw);
  };
  let started = false;
  return {
    size: (width, height) => {
      canvas.width = width; canvas.height = height;
      gl.viewport(0, 0, width, height);
      // The first size starts the drawing; with motion switched off, each new size is drawn once.
      if (!started || still) { started = true; cancelFrame(frame); frame = nextFrame(draw); }
    },
    pointer: (x, y) => { target.x = x; target.y = y; },
    stop: () => cancelFrame(frame),
  };
}
