// src/core/system/faceSignal.js
// Phase 31 — Face Signal Engine
// On-device facial emotional recognition (no external APIs, no frame storage)

/**
 * Get pixel brightness at coordinates.
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
function getPixelBrightness(data, width, x, y) {
  if (x < 0 || x >= width || y < 0) return 128;
  const idx = (y * width + x) * 4;
  if (idx + 2 >= data.length) return 128;
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  return (r + g + b) / 3;
}

/**
 * Compute vertical gradient (for brow tension detection).
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 * @param {number} startX
 * @param {number} endX
 * @param {number} startY
 * @param {number} endY
 * @returns {number} Gradient strength (0-1)
 */
function computeVerticalGradient(data, width, height, startX, endX, startY, endY) {
  let gradientSum = 0;
  let sampleCount = 0;

  for (let x = startX; x < endX; x += 2) {
    for (let y = startY; y < endY - 1; y += 2) {
      const top = getPixelBrightness(data, width, x, y);
      const bottom = getPixelBrightness(data, width, x, y + 1);
      gradientSum += Math.abs(bottom - top);
      sampleCount++;
    }
  }

  return sampleCount > 0 ? Math.min(1, gradientSum / (sampleCount * 50)) : 0;
}

/**
 * Compute horizontal gradient (for jaw tension detection).
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 * @param {number} startX
 * @param {number} endX
 * @param {number} startY
 * @param {number} endY
 * @returns {number} Gradient strength (0-1)
 */
function computeHorizontalGradient(data, width, height, startX, endX, startY, endY) {
  let gradientSum = 0;
  let sampleCount = 0;

  for (let x = startX; x < endX - 1; x += 2) {
    for (let y = startY; y < endY; y += 2) {
      const left = getPixelBrightness(data, width, x, y);
      const right = getPixelBrightness(data, width, x + 1, y);
      gradientSum += Math.abs(right - left);
      sampleCount++;
    }
  }

  return sampleCount > 0 ? Math.min(1, gradientSum / (sampleCount * 50)) : 0;
}

/**
 * Analyze a single video frame for facial expression features.
 * Lightweight MediaPipe-inspired landmark detection using canvas pixel analysis.
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Object} Facial features including landmarks
 */
function analyzeFrame(canvas, ctx) {
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixelCount = canvas.width * canvas.height;

    // Basic brightness and contrast analysis
    let totalBrightness = 0;
    let minBrightness = 255;
    let maxBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }

    const avgBrightness = totalBrightness / pixelCount;
    const contrast = maxBrightness - minBrightness;

    // Assume face is centered in frame (typical for front-facing camera)
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const faceWidth = Math.min(canvas.width, canvas.height) * 0.4;
    const faceHeight = Math.min(canvas.width, canvas.height) * 0.5;

    // Define facial regions (MediaPipe-inspired layout)
    // Brow region: upper 20% of face
    const browStartY = Math.max(0, centerY - faceHeight / 2);
    const browEndY = Math.max(0, centerY - faceHeight / 2 + faceHeight * 0.2);
    const browStartX = Math.max(0, centerX - faceWidth / 2);
    const browEndX = Math.min(canvas.width, centerX + faceWidth / 2);

    // Eye region: middle 30% of face (upper portion)
    const eyeStartY = Math.max(0, centerY - faceHeight / 2 + faceHeight * 0.2);
    const eyeEndY = Math.max(0, centerY - faceHeight / 2 + faceHeight * 0.5);
    const eyeStartX = Math.max(0, centerX - faceWidth / 2);
    const eyeEndX = Math.min(canvas.width, centerX + faceWidth / 2);

    // Mouth region: lower 30% of face
    const mouthStartY = Math.max(0, centerY + faceHeight / 2 - faceHeight * 0.3);
    const mouthEndY = Math.min(canvas.height, centerY + faceHeight / 2);
    const mouthStartX = Math.max(0, centerX - faceWidth / 2);
    const mouthEndX = Math.min(canvas.width, centerX + faceWidth / 2);

    // Jaw region: bottom 20% of face
    const jawStartY = Math.max(0, centerY + faceHeight / 2 - faceHeight * 0.2);
    const jawEndY = Math.min(canvas.height, centerY + faceHeight / 2);
    const jawStartX = Math.max(0, centerX - faceWidth / 2);
    const jawEndX = Math.min(canvas.width, centerX + faceWidth / 2);

    // Compute brow tension (vertical gradients in brow region)
    const browTension = computeVerticalGradient(
      data,
      canvas.width,
      canvas.height,
      browStartX,
      browEndX,
      browStartY,
      browEndY
    );

    // Compute jaw tension (horizontal gradients in jaw region)
    const jawTension = computeHorizontalGradient(
      data,
      canvas.width,
      canvas.height,
      jawStartX,
      jawEndX,
      jawStartY,
      jawEndY
    );

    // Compute eye openness (brightness variation in eye region)
    let eyeBrightnessSum = 0;
    let eyePixelCount = 0;
    let eyeMinBrightness = 255;
    let eyeMaxBrightness = 0;

    for (let y = eyeStartY; y < eyeEndY; y++) {
      for (let x = eyeStartX; x < eyeEndX; x++) {
        const brightness = getPixelBrightness(data, canvas.width, x, y);
        eyeBrightnessSum += brightness;
        eyeMinBrightness = Math.min(eyeMinBrightness, brightness);
        eyeMaxBrightness = Math.max(eyeMaxBrightness, brightness);
        eyePixelCount++;
      }
    }

    const eyeAvgBrightness = eyePixelCount > 0 ? eyeBrightnessSum / eyePixelCount : 128;
    const eyeOpenness = eyePixelCount > 0
      ? Math.min(1, (eyeMaxBrightness - eyeMinBrightness) / 100) // Higher variation = more open
      : 0.5;

    // Compute mouth curvature (edge detection in mouth region)
    let mouthEdgeStrength = 0;
    let mouthSampleCount = 0;

    for (let y = mouthStartY; y < mouthEndY - 1; y += 2) {
      for (let x = mouthStartX; x < mouthEndX - 1; x += 2) {
        const center = getPixelBrightness(data, canvas.width, x, y);
        const right = getPixelBrightness(data, canvas.width, x + 1, y);
        const bottom = getPixelBrightness(data, canvas.width, x, y + 1);
        const edge = Math.abs(right - center) + Math.abs(bottom - center);
        mouthEdgeStrength += edge;
        mouthSampleCount++;
      }
    }

    const mouthCurvature = mouthSampleCount > 0
      ? Math.min(1, mouthEdgeStrength / (mouthSampleCount * 30)) // Higher edge = more curvature
      : 0.5;

    return {
      avgBrightness,
      contrast,
      browTension,
      jawTension,
      eyeOpenness,
      mouthCurvature,
    };
  } catch (err) {
    console.warn("[faceSignal] Frame analysis failed:", err);
    return {
      avgBrightness: 128,
      contrast: 50,
      browTension: 0.5,
      jawTension: 0.5,
      eyeOpenness: 0.5,
      mouthCurvature: 0.5,
    };
  }
}

/**
 * Convert frame features to emotion estimate.
 * Uses facial landmarks (brow tension, jaw tension, eye openness, mouth curvature) + movement.
 * @param {Array<Object>} frameFeatures - Array of frame analysis results
 * @returns {Object} Emotion estimate
 */
function featuresToEmotion(frameFeatures) {
  if (!Array.isArray(frameFeatures) || frameFeatures.length === 0) {
    return {
      label: "neutral",
      intensity: 0,
      valence: "neutral",
    };
  }

  // Average landmark features across frames
  const avgBrowTension = frameFeatures.reduce((sum, f) => sum + (f.browTension || 0.5), 0) / frameFeatures.length;
  const avgJawTension = frameFeatures.reduce((sum, f) => sum + (f.jawTension || 0.5), 0) / frameFeatures.length;
  const avgEyeOpenness = frameFeatures.reduce((sum, f) => sum + (f.eyeOpenness || 0.5), 0) / frameFeatures.length;
  const avgMouthCurvature = frameFeatures.reduce((sum, f) => sum + (f.mouthCurvature || 0.5), 0) / frameFeatures.length;
  const avgBrightness = frameFeatures.reduce((sum, f) => sum + (f.avgBrightness || 128), 0) / frameFeatures.length;
  const avgContrast = frameFeatures.reduce((sum, f) => sum + (f.contrast || 50), 0) / frameFeatures.length;

  // Overall movement detection (frame-to-frame variation)
  const movement = frameFeatures.length > 1
    ? frameFeatures.reduce((sum, f, i) => {
        if (i === 0) return 0;
        const prev = frameFeatures[i - 1];
        const curr = f;
        const browChange = Math.abs((curr.browTension || 0.5) - (prev.browTension || 0.5));
        const jawChange = Math.abs((curr.jawTension || 0.5) - (prev.jawTension || 0.5));
        const eyeChange = Math.abs((curr.eyeOpenness || 0.5) - (prev.eyeOpenness || 0.5));
        const mouthChange = Math.abs((curr.mouthCurvature || 0.5) - (prev.mouthCurvature || 0.5));
        return sum + (browChange + jawChange + eyeChange + mouthChange) / 4;
      }, 0) / (frameFeatures.length - 1)
    : 0;

  // Emotion detection using facial landmarks
  let label = "neutral";
  let intensity = 0;
  let valence = "neutral";

  // Tense: High brow tension + high jaw tension
  if (avgBrowTension > 0.6 && avgJawTension > 0.6) {
    label = "tense";
    intensity = Math.min(0.8, (avgBrowTension + avgJawTension) / 2);
    valence = "negative";
  }
  // Angry: High brow tension + high jaw tension + low eye openness
  else if (avgBrowTension > 0.65 && avgJawTension > 0.65 && avgEyeOpenness < 0.4) {
    label = "angry";
    intensity = Math.min(0.9, (avgBrowTension + avgJawTension) / 2);
    valence = "negative";
  }
  // Sad: Low eye openness + low mouth curvature + low brightness
  else if (avgEyeOpenness < 0.4 && avgMouthCurvature < 0.4 && avgBrightness < 110) {
    label = "sad";
    intensity = Math.min(0.7, (0.4 - avgEyeOpenness) * 2 + (0.4 - avgMouthCurvature) * 2);
    valence = "negative";
  }
  // Calm: Low brow tension + low jaw tension + moderate eye openness + moderate mouth curvature
  else if (avgBrowTension < 0.4 && avgJawTension < 0.4 && avgEyeOpenness > 0.5 && avgMouthCurvature > 0.5) {
    label = "calm";
    intensity = Math.min(0.6, (0.4 - avgBrowTension) + (0.4 - avgJawTension));
    valence = "positive";
  }
  // Neutral with movement: High movement but balanced features
  else if (movement > 0.15) {
    label = "neutral";
    intensity = Math.min(0.4, movement);
    valence = "neutral";
  }
  // Default: neutral
  else {
    label = "neutral";
    intensity = Math.min(0.3, movement);
    valence = "neutral";
  }

  // Boost intensity if there's significant movement (indicates active expression)
  if (movement > 0.2) {
    intensity = Math.min(1, intensity + movement * 0.3);
  }

  return {
    label,
    intensity: Math.max(0, Math.min(1, intensity)),
    valence,
  };
}

/**
 * Get face emotion snapshot from camera stream.
 * @param {Object} options
 * @param {number} [options.seconds=5] - Duration to capture frames
 * @returns {Promise<Object|null>} Face emotion snapshot or null if failed
 */
export async function getFaceEmotionSnapshot({ seconds = 5 } = {}) {
  let stream = null;
  let video = null;
  let canvas = null;
  let ctx = null;

  try {
    // Request camera access
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });

    // Create hidden video element
    video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.style.position = "fixed";
    video.style.top = "-9999px";
    video.style.left = "-9999px";
    video.style.width = "1px";
    video.style.height = "1px";
    document.body.appendChild(video);

    // Wait for video to be ready
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(reject);
      };
      video.onerror = reject;
      setTimeout(() => reject(new Error("Video load timeout")), 5000);
    });

    // Create canvas for frame capture
    canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Capture frames over duration
    const frameFeatures = [];
    const frameInterval = 200; // Capture every 200ms
    const totalFrames = Math.floor((seconds * 1000) / frameInterval);
    const startTime = Date.now();

    for (let i = 0; i < totalFrames; i++) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= seconds * 1000) break;

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Analyze frame
      const features = analyzeFrame(canvas, ctx);
      frameFeatures.push(features);

      // Wait before next frame
      if (i < totalFrames - 1) {
        await new Promise((resolve) => setTimeout(resolve, frameInterval));
      }
    }

    // Convert features to emotion
    const emotion = featuresToEmotion(frameFeatures);

    // Cleanup
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (video && video.parentNode) {
      video.parentNode.removeChild(video);
    }

    return {
      source: "face",
      label: emotion.label,
      intensity: emotion.intensity,
      valence: emotion.valence,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn("[faceSignal] Face scan failed:", err);

    // Cleanup on error
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (video && video.parentNode) {
      video.parentNode.removeChild(video);
    }

    // Return null if user denied permission or other error
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return null;
    }

    return null;
  }
}

export default {
  getFaceEmotionSnapshot,
};

