import React, { useEffect, useRef, useState } from "react";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import "./MeditationSceneVisual.css";

const SCENES = {
  "wide-sky": {
    src: "/assets/meditation-panorama/wide-sky-v1.jpg",
    alt: "A vast sunrise sky, mountain horizon, and lake surrounding the viewer.",
    startYaw: 0,
  },
  "rain-window": {
    src: "/assets/meditation-panorama/rain-window-v1.jpg",
    alt: "A quiet room surrounded by rain-streaked windows and a misty garden.",
    startYaw: 0,
  },
  "familiar-place": {
    src: "/assets/meditation-panorama/familiar-place-v1.jpg",
    alt: "A warm reading room with a garden window, chair, shelves, and soft light.",
    startYaw: 0,
  },
  "color-and-light": {
    src: "/assets/meditation-panorama/color-light-v1.jpg",
    alt: "An expansive twilight sky filled with flowing teal, violet, rose, and amber light.",
    startYaw: 0,
  },
};

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_screen;
  void main() {
    v_screen = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_screen;
  uniform sampler2D u_panorama;
  uniform vec2 u_resolution;
  uniform float u_yaw;
  uniform float u_pitch;
  uniform float u_fov;
  uniform float u_time;
  uniform float u_scene;
  const float PI = 3.14159265358979323846;
  void main() {
    float scale = tan(radians(u_fov) * 0.5);
    vec2 screen = v_screen * vec2(u_resolution.x / u_resolution.y, 1.0) * scale;
    vec3 ray = normalize(vec3(screen.x, screen.y, 1.0));
    float cp = cos(u_pitch);
    float sp = sin(u_pitch);
    ray = vec3(ray.x, cp * ray.y - sp * ray.z, sp * ray.y + cp * ray.z);
    float cy = cos(u_yaw);
    float sy = sin(u_yaw);
    ray = vec3(cy * ray.x + sy * ray.z, ray.y, -sy * ray.x + cy * ray.z);
    float u = fract(0.5 + atan(ray.x, ray.z) / (2.0 * PI));
    float v = 0.5 - asin(clamp(ray.y, -1.0, 1.0)) / PI;
    // Very slow, low-amplitude movement keeps each environment from feeling
    // like a still photograph while preserving the scene's shapes and edges.
    float upperSky = 1.0 - smoothstep(0.1, 0.42, v);
    float colorScene = step(2.5, u_scene);
    float skyScene = 1.0 - step(0.5, u_scene);
    float drift = sin(v * 10.0 + u_time * 0.13 + u * 7.0) * 0.0018 * upperSky * skyScene;
    float colorFlow = sin(u * 14.0 - v * 8.0 + u_time * 0.18) * 0.0025 * colorScene;
    u = fract(u + drift + colorFlow);
    float seamWidth = 0.035;
    float seamEdge = min(u, 1.0 - u);
    float seamBlend = 1.0 - smoothstep(0.0, seamWidth, seamEdge);
    vec3 panoramaColor = texture2D(u_panorama, vec2(u, v)).rgb;
    vec3 leftEdge = texture2D(u_panorama, vec2(0.003, v)).rgb;
    vec3 rightEdge = texture2D(u_panorama, vec2(0.997, v)).rgb;
    vec3 softenedSeam = mix(panoramaColor, 0.5 * (leftEdge + rightEdge), seamBlend);
    gl_FragColor = vec4(softenedSeam, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function PanoramaCanvas({ scene, focusLabel, canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      className="meditation-panorama__canvas"
      aria-label={`${scene.alt} Drag to look around the full 360-degree scene; pinch or scroll to zoom. Current visual cue: ${focusLabel}.`}
      role="img"
      tabIndex={0}
    />
  );
}

export default function MeditationSceneVisual({ sceneId = "wide-sky", focusLabel = "the view", isActive = false }) {
  const canvasRef = useRef(null);
  const figureRef = useRef(null);
  const controllerRef = useRef({ reset: () => {}, zoom: () => {}, turn: () => {} });
  const activeRef = useRef(isActive);
  const [viewerReady, setViewerReady] = useState(false);
  const scene = SCENES[sceneId] || SCENES["wide-sky"];
  activeRef.current = isActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) {
      setViewerReady(false);
      return undefined;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      setViewerReady(false);
      return undefined;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setViewerReady(false);
      return undefined;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, "u_panorama"), 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      yaw: gl.getUniformLocation(program, "u_yaw"),
      pitch: gl.getUniformLocation(program, "u_pitch"),
      fov: gl.getUniformLocation(program, "u_fov"),
      time: gl.getUniformLocation(program, "u_time"),
      scene: gl.getUniformLocation(program, "u_scene"),
    };
    let yaw = scene.startYaw;
    let pitch = 0;
    let fov = 82;
    let frame = 0;
    let disposed = false;
    let lastFrameTime = 0;
    let lastInteractionTime = 0;
    let yawVelocity = 0;
    let inViewport = false;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
    const frameInterval = () => (activeRef.current && !isCoarsePointer ? 1000 / 60 : 1000 / 30);
    let lastDrawTime = 0;
    const sceneIndex = { "wide-sky": 0, "rain-window": 1, "familiar-place": 2, "color-and-light": 3 }[sceneId] || 0;
    const pointers = new Map();
    let pinchDistance = 0;

    const resizeCanvas = () => {
      if (disposed) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    const draw = (time = 0) => {
      if (disposed || !canvas.width || !canvas.height) return;
      const delta = Math.min(0.05, Math.max(0, (time - (lastFrameTime || time)) / 1000));
      lastFrameTime = time;
      if (!reducedMotion && time - lastInteractionTime > 1800) yaw += delta * 0.012;
      yaw += yawVelocity * delta;
      yawVelocity *= Math.exp(-delta * 2.6);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.yaw, yaw);
      gl.uniform1f(uniforms.pitch, pitch);
      gl.uniform1f(uniforms.fov, fov);
      gl.uniform1f(uniforms.time, time / 1000);
      gl.uniform1f(uniforms.scene, sceneIndex);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const animate = (time) => {
      frame = 0;
      if (disposed || !inViewport || document.visibilityState === "hidden") return;
      if (!lastDrawTime || time - lastDrawTime >= frameInterval()) {
        draw(time);
        lastDrawTime = time;
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(animate);
    };
    const requestDraw = () => {
      if (!frame && inViewport && document.visibilityState !== "hidden") {
        frame = window.requestAnimationFrame(animate);
      }
    };
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      setViewerReady(true);
      resizeCanvas();
      requestDraw();
    };
    image.onerror = () => setViewerReady(false);
    image.src = scene.src;

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      requestDraw();
    });
    resizeObserver.observe(canvas);
    const handleResize = () => {
      resizeCanvas();
      requestDraw();
    };
    window.addEventListener("resize", handleResize, { passive: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
      } else {
        lastFrameTime = 0;
        requestDraw();
      }
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      figureRef.current?.classList.toggle("is-visible", inViewport);
      if (inViewport) {
        lastFrameTime = 0;
        requestDraw();
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { threshold: 0.01 });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    controllerRef.current = {
      reset: () => { yaw = scene.startYaw; pitch = 0; fov = 82; requestDraw(); },
      zoom: (delta) => { fov = Math.max(48, Math.min(105, fov + delta)); requestDraw(); },
      turn: (delta) => { yaw += delta; requestDraw(); },
    };

    const handlePointerDown = (event) => {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const handlePointerMove = (event) => {
      if (!pointers.has(event.pointerId)) return;
      const old = pointers.get(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size > 1) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDistance && distance) fov = Math.max(48, Math.min(105, fov - (distance - pinchDistance) * 0.09));
        pinchDistance = distance;
      } else {
        const rect = canvas.getBoundingClientRect();
        const deltaX = event.clientX - old.x;
        yaw -= deltaX / rect.width * Math.PI * 2;
        yawVelocity = -(deltaX / rect.width) * Math.PI * 2 * 8;
        pitch = Math.max(-1.35, Math.min(1.35, pitch + (event.clientY - old.y) / rect.height * Math.PI));
      }
      lastInteractionTime = performance.now();
      requestDraw();
    };
    const handlePointerUp = (event) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchDistance = 0;
    };
    const handleWheel = (event) => {
      event.preventDefault();
      fov = Math.max(48, Math.min(105, fov + Math.sign(event.deltaY) * 4));
      requestDraw();
    };
    const handleKeyDown = (event) => {
      const turn = Math.PI / 12;
      if (event.key === "ArrowLeft") yaw -= turn;
      else if (event.key === "ArrowRight") yaw += turn;
      else if (event.key === "ArrowUp") pitch = Math.min(1.35, pitch + turn);
      else if (event.key === "ArrowDown") pitch = Math.max(-1.35, pitch - turn);
      else if (event.key === "+" || event.key === "=") fov = Math.max(48, fov - 4);
      else if (event.key === "-") fov = Math.min(105, fov + 4);
      else return;
      event.preventDefault();
      lastInteractionTime = performance.now();
      requestDraw();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("keydown", handleKeyDown);
    requestDraw();

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (frame) window.cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("keydown", handleKeyDown);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [scene, sceneId]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await figureRef.current?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      // Fullscreen can be unavailable in embedded previews; drag and zoom still work.
    }
  };

  return (
    <figure ref={figureRef} className={`meditation-panorama${viewerReady ? " is-ready" : ""}`} aria-label={`360-degree view: ${scene.alt}`}>
      <div className="meditation-panorama__viewport">
        <img className="meditation-panorama__fallback" src={scene.src} alt="" aria-hidden="true" />
        <PanoramaCanvas scene={scene} focusLabel={focusLabel} canvasRef={canvasRef} />
        <div className={`meditation-panorama__atmosphere meditation-panorama__atmosphere--${sceneId}`} aria-hidden="true" />
        <div className="meditation-panorama__caption" aria-live="polite" aria-atomic="true">
          <span className="meditation-panorama__eyebrow">360° visual space</span>
          <span>{focusLabel}</span>
        </div>
        <div className="meditation-panorama__drag-hint" aria-hidden="true">Drag to look around</div>
      </div>
      <figcaption className="meditation-panorama__toolbar">
        <span className="meditation-panorama__instruction">Drag to look · pinch or scroll to zoom</span>
        <div className="meditation-panorama__actions" aria-label="Panorama controls">
          <button type="button" aria-label="Turn view left" onClick={() => controllerRef.current.turn(-Math.PI / 6)}><RotateCcw size={16} /></button>
          <button type="button" aria-label="Zoom out" onClick={() => controllerRef.current.zoom(8)}><ZoomOut size={16} /></button>
          <button type="button" aria-label="Zoom in" onClick={() => controllerRef.current.zoom(-8)}><ZoomIn size={16} /></button>
          <button type="button" aria-label="Reset panoramic view" onClick={() => controllerRef.current.reset()}>Reset</button>
          <button type="button" aria-label="View panorama fullscreen" onClick={toggleFullscreen}><Maximize2 size={16} /></button>
        </div>
      </figcaption>
      {!viewerReady && <span className="sr-only">Panorama viewer unavailable. The full scene image is shown instead.</span>}
    </figure>
  );
}
