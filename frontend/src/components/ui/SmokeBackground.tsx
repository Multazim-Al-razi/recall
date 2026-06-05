import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Fragment shader — FBM smoke/noise tinted with `u_color`.
// The base is dark (mix with vec3(.08)) and the brightest noise is
// blended toward the user color via a luminance-style dot product.
const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;

#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)

float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}

void main(){
  vec2 uv=(FC-.5*R)/R.y;
  vec3 col=vec3(1);
  uv.x+=.25;
  uv*=vec2(2,1);

  float n=fbm(uv*.28-vec2(T*.01,0));
  n=noise(uv*3.+n*2.);

  col.r-=fbm(uv+vec2(0,T*.015)+n);
  col.g-=fbm(uv*1.003+vec2(0,T*.015)+n+.003);
  col.b-=fbm(uv*1.006+vec2(0,T*.015)+n+.006);

  col=mix(col, u_color, dot(col,vec3(.21,.71,.07)));

  col=mix(vec3(.08),col,min(time*.1,1.));
  col=clamp(col,.08,1.);
  O=vec4(col,1);
}`;

const vertexShaderSource = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

// Two triangles covering the full clip space.
const VERTICES = [-1, 1, -1, -1, 1, 1, 1, -1] as const;

const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : null;
};

class Renderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private color: [number, number, number] = [0.5, 0.5, 0.5];
  private uResolution: WebGLUniformLocation | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uColor: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement, fragmentSource: string) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: false });
    if (!gl) {
      console.error('[SmokeBackground] WebGL2 is not available in this browser.');
      return;
    }
    this.gl = gl;
    this.setup(fragmentSource);
    this.init();
  }

  updateColor(newColor: [number, number, number]) {
    this.color = newColor;
  }

  updateScale() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    // Fall back to 1x1 if the canvas isn't laid out yet (avoids 0-sized
    // framebuffers that some drivers refuse to render).
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`[SmokeBackground] Shader compile error: ${gl.getShaderInfoLog(shader)}`);
    }
  }

  reset() {
    const { gl, program, buffer } = this;
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    this.program = null;
    this.buffer = null;
  }

  private setup(fragmentSource: string) {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    this.compile(vs, vertexShaderSource);
    this.compile(fs, fragmentSource);
    this.program = program;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(`[SmokeBackground] Program link error: ${gl.getProgramInfoLog(this.program)}`);
    }
    // Shaders are linked into the program now; we can free them.
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  }

  private init() {
    const { gl, program } = this;
    if (!program) return;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    // Cache uniform locations.
    this.uResolution = gl.getUniformLocation(program, 'resolution');
    this.uTime = gl.getUniformLocation(program, 'time');
    this.uColor = gl.getUniformLocation(program, 'u_color');
  }

  render(now = 0) {
    const { gl, program, canvas, buffer } = this;
    if (!program || !buffer) return;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.uniform2f(this.uResolution, canvas.width, canvas.height);
    gl.uniform1f(this.uTime, now * 1e-3);
    gl.uniform3fv(this.uColor, this.color);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

interface SmokeBackgroundProps {
  /** Hex color (e.g. "#FF725E") that tints the brightest parts of the smoke. */
  smokeColor?: string;
  className?: string;
}

/**
 * Animated WebGL2 smoke/noise background. The fragment shader runs an
 * FBM noise pattern that's slowly evolving with time and tinted toward
 * `smokeColor`. Used as the card's surface treatment so each card can
 * carry a different shade without needing an SVG illustration.
 *
 * Falls back silently to a transparent canvas if WebGL2 isn't
 * available — the parent layer's background will show through.
 */
export function SmokeBackground({
  smokeColor = '#808080',
  className,
}: SmokeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // Init / teardown.
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new Renderer(canvas, fragmentShaderSource);
    rendererRef.current = renderer;

    const handleResize = () => renderer.updateScale();
    // Defer to the next frame so layout has settled and getBoundingClientRect
    // returns a non-zero size.
    const raf = requestAnimationFrame(handleResize);
    window.addEventListener('resize', handleResize);

    let animationFrameId = 0;
    const loop = (now: number) => {
      renderer.render(now);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(animationFrameId);
      renderer.reset();
      rendererRef.current = null;
    };
  }, []);

  // Color updates — cheap; just writes a small tuple on the renderer.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const rgb = hexToRgb(smokeColor);
    if (rgb) renderer.updateColor(rgb);
  }, [smokeColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none block h-full w-full', className)}
    />
  );
}
