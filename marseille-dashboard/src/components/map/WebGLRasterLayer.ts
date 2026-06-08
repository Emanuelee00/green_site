import L from "leaflet";

const ZONES = [
  "centre_ville","nord_urbain","sud_urbain",
  "periurbain_est","periurbain_nord",
  "rural_est","rural_nord","rural_ouest","rural_sud",
];


const VERT = `
  attribute vec2 a_pos;  // NDC position of quad corner
  attribute vec2 a_uv;   // texture UV
  varying vec2 v_uv;
  void main() { v_uv = a_uv; gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
  precision mediump float;
  uniform sampler2D u_raster;
  uniform float u_min;
  uniform float u_max;
  uniform float u_shift;   // anomaly shift in normalised UHI space
  varying vec2 v_uv;

  vec4 heatRgba(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c;
    if      (t < 0.25) c = mix(vec3(0.13,0.77,0.37), vec3(0.53,0.94,0.67), t*4.0);
    else if (t < 0.50) c = mix(vec3(0.53,0.94,0.67), vec3(0.99,0.88,0.28), (t-0.25)*4.0);
    else if (t < 0.75) c = mix(vec3(0.99,0.88,0.28), vec3(0.98,0.57,0.24), (t-0.50)*4.0);
    else               c = mix(vec3(0.98,0.57,0.24), vec3(0.73,0.11,0.11), (t-0.75)*4.0);
    return vec4(c, 0.82);
  }

  void main() {
    float raw = texture2D(u_raster, v_uv).r;
    if (raw < -1e30) { discard; }  // NaN / nodata
    float norm = clamp((raw - u_min) / (u_max - u_min + 1e-5) + u_shift, 0.0, 1.0);
    gl_FragColor = heatRgba(norm);
  }
`;

export interface AllZonesHistory {
  [zone: string]: { [year: number]: { anomaly_norm: number } };
}

interface RasterMeta { rows: number; cols: number; min: number; max: number; data: Float32Array }

export class WebGLRasterLayer extends L.Layer {
  private _canvas!: HTMLCanvasElement;
  private _gl!: WebGLRenderingContext;
  private _program!: WebGLProgram;
  private _texture!: WebGLTexture;
  private _posBuffer!: WebGLBuffer;
  private _uvBuffer!: WebGLBuffer;
  private _meta!: RasterMeta;
  private _history: AllZonesHistory | null = null;
  private _year = 2023;
  private _loaded = false;

  private readonly _geo = {
    south: 43.19994755263194, west: 5.249940079052022,
    north: 43.42001637152874, east: 5.5268096923828125,
  };

  // ── Leaflet lifecycle ───────────────────────────────────────────────────────

  onAdd(map: L.Map): this {
    this._canvas = document.createElement("canvas");
    this._canvas.style.cssText =
      "position:absolute;top:0;left:0;pointer-events:none;image-rendering:pixelated;";
    map.getPanes().overlayPane!.appendChild(this._canvas);

    const gl = this._canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) { console.error("WebGL not supported"); return this; }
    if (!gl.getExtension("OES_texture_float"))
      console.warn("OES_texture_float unavailable — raster may look wrong");

    this._gl = gl;
    this._program = this._buildProgram(gl);
    this._posBuffer = gl.createBuffer()!;
    this._uvBuffer  = gl.createBuffer()!;

    // UV is always the same: full [0,1]² quad
    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([0,1, 1,1, 0,0, 1,0]), gl.STATIC_DRAW);

    map.on("move zoom resize viewreset", this._draw, this);
    return this;
  }

  onRemove(map: L.Map): this {
    map.off("move zoom resize viewreset", this._draw, this);
    this._canvas.remove();
    return this;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async loadData(): Promise<void> {
    const [rawRes, histRes] = await Promise.all([
      fetch("/api/uhi/raster/raw?scale=0.3"),
      fetch("/api/uhi/raster/all-zones-history"),
    ]);

    this._meta = {
      rows: parseInt(rawRes.headers.get("X-Raster-Rows") ?? "0"),
      cols: parseInt(rawRes.headers.get("X-Raster-Cols") ?? "0"),
      min:  parseFloat(rawRes.headers.get("X-Raster-Min") ?? "0"),
      max:  parseFloat(rawRes.headers.get("X-Raster-Max") ?? "1"),
      data: new Float32Array(await rawRes.arrayBuffer()),
    };
    this._history = await histRes.json();
    this._uploadTexture();
    this._loaded = true;
    this._draw();
  }

  setYear(year: number): void {
    this._year = year;
    if (this._loaded) this._draw();
  }

  // ── Internals ───────────────────────────────────────────────────────────────

  private _buildProgram(gl: WebGLRenderingContext): WebGLProgram {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? "shader compile error");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    return prog;
  }

  private _uploadTexture(): void {
    const gl = this._gl;
    const { rows, cols, data } = this._meta;
    this._texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, cols, rows, 0,
      gl.LUMINANCE, gl.FLOAT, data);
  }

  private _draw(): void {
    if (!this._loaded || !this._gl) return;
    const map  = this._map as L.Map;
    const size = map.getSize();
    const gl   = this._gl;

    this._canvas.width  = size.x;
    this._canvas.height = size.y;

    // Align canvas with Leaflet overlay pane
    const origin = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, origin);

    // Compute raster corners in layer-point space → NDC
    const corners = [
      L.latLng(this._geo.south, this._geo.west),
      L.latLng(this._geo.south, this._geo.east),
      L.latLng(this._geo.north, this._geo.west),
      L.latLng(this._geo.north, this._geo.east),
    ].map((ll) => {
      const cp = map.latLngToContainerPoint(ll);
      // shift by layer origin, then NDC
      const lp = { x: cp.x - origin.x, y: cp.y - origin.y };
      return [
        (lp.x / size.x) * 2 - 1,
        1 - (lp.y / size.y) * 2,
      ] as [number, number];
    });

    // [SW, SE, NW, NE] → triangle strip
    const posData = new Float32Array([
      ...corners[0], ...corners[1], ...corners[2], ...corners[3],
    ]);

    gl.viewport(0, 0, size.x, size.y);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this._program);

    // Bind pos buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, posData, gl.DYNAMIC_DRAW);
    const posLoc = gl.getAttribLocation(this._program, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Bind UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
    const uvLoc = gl.getAttribLocation(this._program, "a_uv");
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    // Raster texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform1i(gl.getUniformLocation(this._program, "u_raster"), 0);
    gl.uniform1f(gl.getUniformLocation(this._program, "u_min"),   this._meta.min);
    gl.uniform1f(gl.getUniformLocation(this._program, "u_max"),   this._meta.max);
    gl.uniform1f(gl.getUniformLocation(this._program, "u_shift"), this._yearShift());

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private _yearShift(): number {
    if (!this._history) return 0;
    const shifts = ZONES.map((z) => this._history![z]?.[this._year]?.anomaly_norm ?? 0);
    const avg = shifts.reduce((a, b) => a + b, 0) / shifts.length;
    return avg * 0.15;   // ±15% shift on normalised UHI
  }
}
