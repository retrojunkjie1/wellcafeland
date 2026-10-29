import React, { useCallback, useEffect, useRef, useState } from "react";
import { Expand, Maximize2, Minus, Plus, RotateCcw, Shrink } from "lucide-react";

const STOPS = [
  { id: "entry", name: "Room entrance", detail: "A wide view of the room", src: "/assets/grounding/orientation-tour-entry-v1.webp", yaw: 0.08, pitch: 0.03, portals: [{ target: "reading", label: "Step to the reading chair", yaw: -1.02, pitch: -0.24 }, { target: "window", label: "Move to the garden window", yaw: 1.2, pitch: -0.18 }] },
  { id: "reading", name: "Reading chair", detail: "A quieter seat beside the books", src: "/assets/grounding/orientation-tour-reading-v1.webp", yaw: 0.02, pitch: 0, portals: [{ target: "entry", label: "Return to the entrance", yaw: 2.72, pitch: -0.24 }, { target: "window", label: "Move to the garden window", yaw: 1.15, pitch: -0.12 }] },
  { id: "window", name: "Garden window", detail: "Look toward the light and greenery", src: "/assets/grounding/orientation-tour-window-v1.webp", yaw: -0.05, pitch: 0.02, portals: [{ target: "reading", label: "Step to the reading chair", yaw: -1.15, pitch: -0.18 }, { target: "entry", label: "Return to the entrance", yaw: 2.75, pitch: -0.2 }] },
];
const LANDMARKS = [
  { id: "window", label: "Window", yaw: 1.22, pitch: 0.02 },
  { id: "chair", label: "Reading chair", yaw: -1.02, pitch: -0.2 },
  { id: "table", label: "Table", yaw: 0.42, pitch: -0.25 },
  { id: "plant", label: "Plant", yaw: 1.7, pitch: -0.18 },
  { id: "books", label: "Bookshelf", yaw: -2.3, pitch: -0.08 },
  { id: "art", label: "Wall art", yaw: 2.25, pitch: 0.35 },
];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wrapAngle = (value) => Math.atan2(Math.sin(value), Math.cos(value));

function createWebGLRenderer(canvas) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) return null;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }");
  const fragment = compile(gl.FRAGMENT_SHADER, `
    precision highp float;
    uniform sampler2D room;
    uniform vec2 resolution;
    uniform float aspect;
    uniform float yaw;
    uniform float pitch;
    uniform float fov;
    const float PI=3.141592653589793;
    void main(){
      float focal=1.0/tan(fov*0.5);
      float sx=(2.0*gl_FragCoord.x/resolution.x-1.0)*aspect/focal;
      float sy=(2.0*gl_FragCoord.y/resolution.y-1.0)/focal;
      vec3 ray=normalize(vec3(sx,sy,1.0));
      float yawX=ray.x*cos(yaw)+ray.z*sin(yaw);
      float yawZ=-ray.x*sin(yaw)+ray.z*cos(yaw);
      float worldY=ray.y*cos(pitch)+yawZ*sin(pitch);
      float worldZ=-ray.y*sin(pitch)+yawZ*cos(pitch);
      float longitude=atan(yawX,worldZ);
      float latitude=asin(clamp(worldY,-1.0,1.0));
      vec2 uv=vec2(fract(longitude/(2.0*PI)+0.5),0.5+latitude/PI);
      gl_FragColor=texture2D(room,uv);
    }
  `);
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  return {
    gl,
    program,
    textures: new Map(),
    uniforms: Object.fromEntries(["room", "resolution", "aspect", "yaw", "pitch", "fov"].map((name) => [name, gl.getUniformLocation(program, name)])),
  };
}

/** GPU-projected equirectangular panorama with a bounded canvas fallback. */
export default function GroundingPanorama() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const imagesRef = useRef(new Map());
  const sourcePixelsRef = useRef(new Map());
  const webglRef = useRef(null);
  const webglUnavailableRef = useRef(false);
  const renderRef = useRef(() => {});
  const renderFrameRef = useRef(0);
  const pointersRef = useRef(new Map());
  const dragRef = useRef(null);
  const portalRefs = useRef([]);
  const cameraRef = useRef({ yaw: 0.08, pitch: 0.03, fov: 1.05 });
  const [activeStop, setActiveStop] = useState("entry");
  const [focusedLandmark, setFocusedLandmark] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    const stop = STOPS.find((item) => item.id === activeStop) || STOPS[0];
    const image = imagesRef.current.get(stop.id);
    if (!canvas || !viewport || !image) return;

    const rect = viewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const aspect = rect.width / rect.height;
    const pixelBudgetWidth = Math.sqrt(400000 * aspect);
    const width = Math.max(1, Math.round(Math.min(rect.width * dpr, 850, pixelBudgetWidth)));
    const height = Math.max(1, Math.round(width * rect.height / rect.width));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }

    const { yaw, pitch, fov } = cameraRef.current;
    const renderAspect = width / height;
    const focal = 1 / Math.tan(fov / 2);
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    if (!webglRef.current && !webglUnavailableRef.current) {
      webglRef.current = createWebGLRenderer(canvas);
      webglUnavailableRef.current = !webglRef.current;
    }
    if (webglRef.current) {
      const renderer = webglRef.current;
      const { gl } = renderer;
      let texture = renderer.textures.get(stop.id);
      if (!texture) {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Source panorama images are 1536×768 (non-power-of-two), so WebGL 1
        // requires clamp-to-edge for a complete texture. Longitude wraps in
        // the shader before sampling.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        renderer.textures.set(stop.id, texture);
      } else gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.viewport(0, 0, width, height);
      gl.useProgram(renderer.program);
      gl.uniform1i(renderer.uniforms.room, 0);
      gl.uniform2f(renderer.uniforms.resolution, width, height);
      gl.uniform1f(renderer.uniforms.aspect, renderAspect);
      gl.uniform1f(renderer.uniforms.yaw, yaw);
      gl.uniform1f(renderer.uniforms.pitch, pitch);
      gl.uniform1f(renderer.uniforms.fov, fov);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
      if (!context) return;
      let source = sourcePixelsRef.current.get(stop.id);
      if (!source) {
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = image.naturalWidth;
        sourceCanvas.height = image.naturalHeight;
        const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
        sourceContext.drawImage(image, 0, 0);
        source = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        sourcePixelsRef.current.set(stop.id, source);
      }
      const output = context.createImageData(width, height);
      for (let y = 0; y < height; y += 1) {
        const screenY = (1 - 2 * (y + 0.5) / height) / focal;
        for (let x = 0; x < width; x += 1) {
          const screenX = (2 * (x + 0.5) / width - 1) * renderAspect / focal;
          const length = Math.sqrt(screenX * screenX + screenY * screenY + 1);
          const cx = screenX / length, cy = screenY / length, cz = 1 / length;
          const yawX = cx * cosYaw + cz * sinYaw;
          const yawZ = -cx * sinYaw + cz * cosYaw;
          const worldY = cy * cosPitch + yawZ * sinPitch;
          const worldZ = -cy * sinPitch + yawZ * cosPitch;
          const longitude = Math.atan2(yawX, worldZ);
          const latitude = Math.asin(clamp(worldY, -1, 1));
          const sourceX = ((longitude / (2 * Math.PI) + 0.5) * source.width + source.width) % source.width;
          const sourceY = clamp(Math.round((0.5 - latitude / Math.PI) * source.height), 0, source.height - 1);
          const si = (sourceY * source.width + Math.floor(sourceX)) * 4;
          const di = (y * width + x) * 4;
          output.data[di] = source.data[si]; output.data[di + 1] = source.data[si + 1];
          output.data[di + 2] = source.data[si + 2]; output.data[di + 3] = 255;
        }
      }
      context.putImageData(output, 0, 0);
    }

    const project = ({ yaw: portalYaw, pitch: portalPitch }) => {
      const wx = Math.cos(portalPitch) * Math.sin(portalYaw);
      const wy = Math.sin(portalPitch);
      const wz = Math.cos(portalPitch) * Math.cos(portalYaw);
      const vx = wx * cosYaw - wz * sinYaw;
      const vz = wx * sinYaw + wz * cosYaw;
      const vy = wy * cosPitch - vz * sinPitch;
      const depth = wy * sinPitch + vz * cosPitch;
      if (depth <= 0.12) return null;
      const nx = 0.5 + (vx / depth / renderAspect / focal) * 0.5;
      const ny = 0.5 - (vy / depth / focal) * 0.5;
      if (nx < 0.05 || nx > 0.95 || ny < 0.08 || ny > 0.9) return null;
      return { left: `${nx * 100}%`, top: `${ny * 100}%` };
    };
    stop.portals.forEach((portal, index) => {
      const element = portalRefs.current[index];
      const position = project(portal);
      if (!element) return;
      element.style.display = position ? "flex" : "none";
      if (position) { element.style.left = position.left; element.style.top = position.top; }
    });
  }, [activeStop]);

  const requestRender = useCallback(() => {
    if (renderFrameRef.current) return;
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = 0;
      renderRef.current();
    });
  }, []);

  useEffect(() => { renderRef.current = render; render(); }, [render]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(STOPS.map((stop) => new Promise((resolve, reject) => {
      const existing = imagesRef.current.get(stop.id);
      if (existing?.complete) { resolve(existing); return; }
      const image = new Image();
      image.decoding = "async";
      image.onload = () => { imagesRef.current.set(stop.id, image); resolve(image); };
      image.onerror = reject;
      image.src = stop.src;
    }))).then(() => { if (!cancelled) { setLoaded(true); requestRender(); } })
      .catch(() => { if (!cancelled) setError("The room view could not load. Check your connection and refresh."); });
    return () => { cancelled = true; };
  }, [requestRender]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", requestRender);
      return () => window.removeEventListener("resize", requestRender);
    }
    const observer = new ResizeObserver(requestRender);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [requestRender]);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => { if (event.key === "Escape") setIsFullscreen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [isFullscreen]);

  const moveToStop = (id) => {
    if (id === activeStop) return;
    const next = STOPS.find((item) => item.id === id);
    if (!next) return;
    cameraRef.current = { ...cameraRef.current, yaw: next.yaw, pitch: next.pitch };
    setFocusedLandmark(null);
    setActiveStop(id);
  };
  const turnTo = (landmark) => {
    cameraRef.current.yaw = landmark.yaw;
    cameraRef.current.pitch = landmark.pitch;
    setFocusedLandmark(landmark.id);
    requestRender();
  };
  const zoom = (amount) => { cameraRef.current.fov = clamp(cameraRef.current.fov + amount, 0.48, 1.36); requestRender(); };
  const resetView = () => {
    const stop = STOPS.find((item) => item.id === activeStop) || STOPS[0];
    cameraRef.current = { ...cameraRef.current, yaw: stop.yaw, pitch: stop.pitch, fov: 1.05 };
    setFocusedLandmark(null); requestRender();
  };
  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) dragRef.current = { x: event.clientX, y: event.clientY, yaw: cameraRef.current.yaw, pitch: cameraRef.current.pitch };
    else if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()];
      dragRef.current = { pinch: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), fov: cameraRef.current.fov };
    }
  };
  const onPointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 2 && dragRef.current?.pinch) {
      const points = [...pointersRef.current.values()];
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      cameraRef.current.fov = clamp(dragRef.current.fov * dragRef.current.pinch / distance, 0.48, 1.36);
    } else if (pointersRef.current.size === 1 && dragRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      cameraRef.current.yaw = wrapAngle(dragRef.current.yaw - (event.clientX - dragRef.current.x) / rect.width * Math.PI * 2);
      cameraRef.current.pitch = clamp(dragRef.current.pitch + (event.clientY - dragRef.current.y) / rect.height * Math.PI, -1.45, 1.45);
      setFocusedLandmark(null);
    }
    requestRender();
  };
  const onPointerUp = (event) => { pointersRef.current.delete(event.pointerId); dragRef.current = null; };
  const active = STOPS.find((stop) => stop.id === activeStop) || STOPS[0];

  return (
    <section className={`grounding-panorama${isFullscreen ? " is-fullscreen" : ""}`} aria-label="Interactive 360 room tour">
      <div className="grounding-panorama__topline">
        <div><span className="grounding-panorama__badge"><span /> 360 ROOM TOUR</span><div className="grounding-panorama__scene-label">{active.name}</div></div>
        <span className="grounding-panorama__gesture">Drag to look · pinch to zoom</span>
      </div>
      <div className={`grounding-panorama__viewport${loaded ? " is-ready" : ""}`} ref={viewportRef}>
        <canvas ref={canvasRef} className="grounding-panorama__canvas" aria-label={`${active.name}, panoramic room view. Drag to look around.`} role="img" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={(event) => zoom(event.deltaY > 0 ? 0.08 : -0.08)} onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();
          if (event.key === "ArrowLeft") cameraRef.current.yaw -= 0.12;
          if (event.key === "ArrowRight") cameraRef.current.yaw += 0.12;
          if (event.key === "ArrowUp") cameraRef.current.pitch = clamp(cameraRef.current.pitch + 0.08, -1.45, 1.45);
          if (event.key === "ArrowDown") cameraRef.current.pitch = clamp(cameraRef.current.pitch - 0.08, -1.45, 1.45);
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) requestRender();
        }} tabIndex={0} />
        {!loaded && !error && <div className="grounding-panorama__loading">Opening the room view…</div>}
        {error && <div className="grounding-panorama__error" role="alert">{error}</div>}
        {active.portals.map((portal, index) => <button key={`${activeStop}-${portal.target}`} ref={(element) => { portalRefs.current[index] = element; }} type="button" className="grounding-panorama__portal" onClick={() => moveToStop(portal.target)} aria-label={portal.label}><span className="grounding-panorama__portal-ring"><Expand size={14} /></span><span>{portal.label}</span></button>)}
        <div className="grounding-panorama__controls" aria-label="Panorama controls">
          <button type="button" onClick={() => zoom(-0.12)} aria-label="Zoom in"><Plus /></button>
          <button type="button" onClick={() => zoom(0.12)} aria-label="Zoom out"><Minus /></button>
          <i />
          <button type="button" onClick={resetView} aria-label="Reset view"><RotateCcw /></button>
          <button type="button" onClick={() => setIsFullscreen((value) => !value)} aria-label={isFullscreen ? "Exit full screen" : "View full screen"}>{isFullscreen ? <Shrink /> : <Maximize2 />}</button>
        </div>
        <div className="grounding-panorama__view-caption"><span>{active.detail}</span><span>360° · {activeStop === "entry" ? "1" : activeStop === "reading" ? "2" : "3"} / 3</span></div>
      </div>
      <div className="grounding-panorama__stops" role="group" aria-label="Choose a place in the room">
        {STOPS.map((stop, index) => <button type="button" key={stop.id} onClick={() => moveToStop(stop.id)} className={stop.id === activeStop ? "is-current" : ""} aria-pressed={stop.id === activeStop}>
          <span className="grounding-panorama__stop-image" style={{ backgroundImage: `url(${stop.src})` }}><span>{String(index + 1).padStart(2, "0")}</span></span>
          <span className="grounding-panorama__stop-copy"><strong>{stop.name}</strong><small>{stop.detail}</small></span>
          <span className="grounding-panorama__stop-arrow">↗</span>
        </button>)}
      </div>
      <div className="grounding-panorama__landmarks">
        <div className="grounding-panorama__landmarks-heading"><span className="grounding-panorama__eyebrow">LOOK AROUND THIS VIEW</span><span className="grounding-panorama__landmarks-hint">Choose a detail to turn toward it</span></div>
        <div className="grounding-panorama__landmark-list">{LANDMARKS.map((item) => <button type="button" key={item.id} className={focusedLandmark === item.id ? "is-selected" : ""} aria-pressed={focusedLandmark === item.id} onClick={() => turnTo(item)}>{item.label}</button>)}</div>
      </div>
      <p className="grounding-panorama__accessibility-note">Drag with one finger or mouse to look around. Pinch or use + / − to zoom. Select a room card or a glowing floor marker to move between viewpoints.</p>
    </section>
  );
}
