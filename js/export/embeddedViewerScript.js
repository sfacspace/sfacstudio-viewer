/**
 * Embedded script for exported single HTML app viewer. Reads META from <script id="META">.
 * Frame-based playback; camera interpolation; Space = play/pause.
 * @param {string} [playcanvasPath] - PlayCanvas module URL (default CDN; use local for file://)
 */
export function getEmbeddedViewerScript(playcanvasPath = 'https://cdn.jsdelivr.net/npm/playcanvas@2.15.1/build/playcanvas.mjs') {
  const pcUrl = JSON.stringify(playcanvasPath);
  return `
(async function() {
  const META = JSON.parse(document.getElementById("META").textContent);
  // Frame-based playback: totalFrames = timeline length in frames, fps = playback speed (frames per second)
  const { fps: FPS, totalFrames: TOTAL_FRAMES, objects, keyframes = [], movingObjects = [], initialCamera, orbitTarget, orbitDistance = 6.4, sceneSettings = {}, cameraSpeedProfileStart = 0, cameraSpeedProfileEnd = 0 } = META;
  const totalFrames = Math.max(1, TOTAL_FRAMES | 0);
  const playbackFps = Math.max(1, Math.min(60, FPS | 0));
  const targetPos = orbitTarget || { x: 0, y: 0, z: 0 };

  const setProgress = (pct, text) => {
    const bar = document.getElementById("loading-bar");
    const txt = document.getElementById("loading-text");
    if (bar) bar.style.width = pct + "%";
    if (txt && text) txt.textContent = text;
  };
  const b64ToBuf = (b64) => {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8.buffer;
  };

  setProgress(5, "Loading engine...");
  const pc = await import(${pcUrl});
  window.pc = pc;

  const canvas = document.createElement("canvas");
  canvas.id = "pcCanvas";
  document.getElementById("app").appendChild(canvas);
  const app = new pc.Application(canvas, { graphicsDeviceOptions: { antialias: false, alpha: false, preferWebGl2: true } });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  window.addEventListener("resize", () => app.resizeCanvas());
  app.start();

  if (sceneSettings.fogColor) {
    app.scene.fog.type = pc.FOG_EXP2;
    app.scene.fog.color.set(sceneSettings.fogColor.r || 0, sceneSettings.fogColor.g || 0, sceneSettings.fogColor.b || 0);
    app.scene.fog.density = sceneSettings.fogDensity ?? 0.04;
  }
  const clear = sceneSettings.clearColor || { r: 0.08, g: 0.08, b: 0.12 };
  const cameraEntity = new pc.Entity("Camera");
  cameraEntity.addComponent("camera", { clearColor: new pc.Color(clear.r, clear.g, clear.b), farClip: 1000, nearClip: 0.1 });
  app.root.addChild(cameraEntity);
  function applyCameraState(s) {
    if (!s) return;
    cameraEntity.setLocalPosition(s.position?.x ?? 0, s.position?.y ?? 0, s.position?.z ?? 0);
    if (s.rotation && typeof s.rotation.w === "number") cameraEntity.setLocalRotation(new pc.Quat(s.rotation.x, s.rotation.y, s.rotation.z, s.rotation.w));
    else cameraEntity.lookAt(s.target?.x ?? targetPos.x, s.target?.y ?? targetPos.y, s.target?.z ?? targetPos.z);
  }
  if (initialCamera) applyCameraState(initialCamera);
  else {
    cameraEntity.setLocalPosition(targetPos.x || 0, (targetPos.y || 0) + 5, (targetPos.z || 0) + 10);
    cameraEntity.lookAt(targetPos.x, targetPos.y, targetPos.z);
  }

  const splatRoot = new pc.Entity("SplatRoot");
  app.root.addChild(splatRoot);

  async function loadSplat(base64, name, transform) {
    try {
      const url = URL.createObjectURL(new Blob([b64ToBuf(base64)]));
      const asset = new pc.Asset(name || "splat", "gsplat", { url });
      app.assets.add(asset);
      await new Promise((resolve, reject) => { asset.ready(resolve); asset.on("error", reject); app.assets.load(asset); });
      const entity = new pc.Entity(name || "splat");
      entity.addComponent("gsplat", { asset });
      if (transform) {
        entity.setLocalPosition(transform.position?.x ?? 0, transform.position?.y ?? 0, transform.position?.z ?? 0);
        const rot = transform.rotation;
        const hasQuat = rot && typeof rot.w === "number";
        const qLen = hasQuat ? (rot.x * rot.x + rot.y * rot.y + rot.z * rot.z + rot.w * rot.w) : 0;
        if (hasQuat && qLen > 0.01) {
          entity.setLocalRotation(new pc.Quat(rot.x, rot.y, rot.z, rot.w));
        } else if (rot && (typeof rot.x === "number" || typeof rot.z === "number")) {
          entity.setLocalEulerAngles(rot.x ?? 0, rot.y ?? 0, rot.z ?? 0);
        }
        const s = transform.scale ?? 1;
        entity.setLocalScale(typeof s === "number" ? s : (s?.x ?? 1), typeof s === "number" ? s : (s?.y ?? 1), typeof s === "number" ? s : (s?.z ?? 1));
      }
      splatRoot.addChild(entity);
      URL.revokeObjectURL(url);
      return entity;
    } catch (e) {
      console.error("Load splat failed", name, e);
      return null;
    }
  }

  const splats = [];
  let idx = 0;
  const totalFiles = objects.reduce((n, o) => n + (o.isMultiFile && o.files ? o.files.length : (o.base64 ? 1 : 0)), 0);
  for (const obj of objects) {
    if (obj.isMultiFile && obj.files?.length) {
      const start = Math.max(0, obj.startFrame | 0);
      const end = Math.max(start + 1, obj.endFrame | 0);
      const dur = end - start;
      const n = obj.files.length;
      let acc = 0;
      for (let i = 0; i < n; i++) {
        const f = obj.files[i];
        if (!f.base64) continue;
        const entity = await loadSplat(f.base64, f.fileName, f.transform);
        if (entity) {
          const take = Math.floor(dur / n) + (i < dur % n ? 1 : 0);
          splats.push({ entity, startFrame: start + acc, endFrame: start + acc + take });
          acc += take;
        }
        setProgress(20 + (++idx / totalFiles) * 60, "Loading...");
      }
    } else if (obj.base64) {
      const entity = await loadSplat(obj.base64, obj.name, obj.transform);
      if (entity) splats.push({ entity, startFrame: obj.startFrame | 0, endFrame: Math.max(1, obj.endFrame | 0) });
      setProgress(20 + (++idx / totalFiles) * 60, "Loading...");
    }
  }

  const kfs = keyframes.map(k => ({ ...k, frame: Math.max(0, Math.min(totalFrames - 1, k.frame | 0)) })).sort((a, b) => a.frame - b.frame);
  const mov = movingObjects || [];

  function setVisibility(frame) {
    const f = Math.max(0, Math.min(totalFrames - 1, frame | 0));
    splats.forEach(({ entity, startFrame, endFrame }) => { entity.enabled = f >= startFrame && f < endFrame; });
  }

  function stateToQuat(s) {
    if (s?.rotation && typeof s.rotation.w === "number") return new pc.Quat(s.rotation.x, s.rotation.y, s.rotation.z, s.rotation.w);
    const yaw = (s?.yaw ?? 0) * Math.PI / 180;
    const pitch = (s?.pitch ?? 0) * Math.PI / 180;
    const q = new pc.Quat();
    q.setFromEulerAngles(pitch * 180 / Math.PI, yaw * 180 / Math.PI, 0);
    return q;
  }

  function ease(t, v) {
    if (v === 0) return t;
    const p = 1 + 4 * Math.min(100, Math.abs(v)) / 100;
    return v > 0 ? Math.pow(t, p) : 1 - Math.pow(1 - t, p);
  }
  function remapAlpha(a) {
    a = Math.max(0, Math.min(1, a));
    if (a <= 0) return 0;
    if (a >= 1) return 1;
    if (a < 0.5) return ease(a / 0.5, cameraSpeedProfileStart) * 0.5;
    return 0.5 + ease((a - 0.5) / 0.5, cameraSpeedProfileEnd) * 0.5;
  }

  function interpolateCamera(frameIndex) {
    if (frameIndex === 0 && initialCamera) { applyCameraState(initialCamera); return; }
    if (kfs.length === 0) return;
    if (kfs.length === 1) { applyCameraState(kfs[0].state); return; }
    const norm = ((frameIndex % totalFrames) + totalFrames) % totalFrames;
    let prev = kfs[0], next = kfs[1];
    for (let i = 0; i < kfs.length; i++) {
      const j = (i + 1) % kfs.length;
      const end = j === 0 ? kfs[j].frame + totalFrames : kfs[j].frame;
      if (norm >= kfs[i].frame && norm < end) { prev = kfs[i]; next = kfs[j]; break; }
    }
    let span = (next.frame - prev.frame + totalFrames) % totalFrames;
    if (span <= 0) span = totalFrames;
    let ratio = (norm - prev.frame + totalFrames) % totalFrames;
    ratio = remapAlpha(ratio / span);
    const mo = mov.find(m => m.fromKeyframeId === prev.id && m.toKeyframeId === next.id);
    const curvature = mo?.curvature ?? 1;
    const angle = (mo?.angle ?? 0) * Math.PI / 180;
    const p0 = new pc.Vec3(prev.state.position.x, prev.state.position.y, prev.state.position.z);
    const p2 = new pc.Vec3(next.state.position.x, next.state.position.y, next.state.position.z);
    const mid = new pc.Vec3().lerp(p0, p2, 0.5);
    const dir = new pc.Vec3().sub2(p2, p0);
    const dist = dir.length();
    if (dist > 1e-4 && curvature !== 0) {
      dir.normalize();
      const perp = new pc.Vec3().cross(dir, new pc.Vec3(0, 1, 0));
      if (perp.length() < 1e-4) perp.cross(dir, new pc.Vec3(1, 0, 0));
      perp.normalize();
      const c = Math.cos(angle), s = Math.sin(angle);
      const rx = perp.x * c + (dir.y * perp.z - dir.z * perp.y) * s + dir.x * (dir.x * perp.x + dir.y * perp.y + dir.z * perp.z) * (1 - c);
      const ry = perp.y * c + (dir.z * perp.x - dir.x * perp.z) * s + dir.y * (dir.x * perp.x + dir.y * perp.y + dir.z * perp.z) * (1 - c);
      const rz = perp.z * c + (dir.x * perp.y - dir.y * perp.x) * s + dir.z * (dir.x * perp.x + dir.y * perp.y + dir.z * perp.z) * (1 - c);
      mid.x += rx * dist * curvature * 0.5;
      mid.y += ry * dist * curvature * 0.5;
      mid.z += rz * dist * curvature * 0.5;
    }
    const u = 1 - ratio;
    const pos = new pc.Vec3(u * u * p0.x + 2 * u * ratio * mid.x + ratio * ratio * p2.x, u * u * p0.y + 2 * u * ratio * mid.y + ratio * ratio * p2.y, u * u * p0.z + 2 * u * ratio * mid.z + ratio * ratio * p2.z);
    cameraEntity.setLocalPosition(pos);
    const q0 = stateToQuat(prev.state);
    const q1 = stateToQuat(next.state);
    const q = new pc.Quat().slerp(q0, q1, ratio);
    cameraEntity.setLocalRotation(q);
  }

  let isPlaying = true;
  let frameAcc = 0;
  let currentFrame = 0;
  let firstPlayTick = true;
  const playBtn = document.getElementById("playBtn");
  const frameSlider = document.getElementById("frameSlider");
  const frameLabel = document.getElementById("frameLabel");
  const speedInput = document.getElementById("speedInput");
  const fpsEl = document.getElementById("fpsCounter");
  const memoryHudEl = document.getElementById("memoryHud");
  if (frameSlider) {
    frameSlider.max = Math.max(0, totalFrames - 1);
    frameSlider.step = 1;
  }
  speedInput.value = playbackFps;

  let playbackFpsCurrent = playbackFps;
  speedInput.addEventListener("change", () => {
    const v = parseInt(speedInput.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 60) playbackFpsCurrent = v;
  });

  function updateUI() {
    if (frameSlider) frameSlider.value = currentFrame;
    if (frameLabel) frameLabel.textContent = "Frame " + currentFrame + " / " + Math.max(0, totalFrames - 1);
  }

  let fpsCount = 0, fpsTime = performance.now();
  function tickFps() {
    fpsCount++;
    const now = performance.now();
    if (now - fpsTime >= 1000) {
      if (fpsEl) fpsEl.textContent = Math.round(fpsCount * 1000 / (now - fpsTime)) + " FPS";
      updateMemoryHud();
      fpsCount = 0;
      fpsTime = now;
    }
  }
  const ramKeys = { r: false, a: false, m: false };
  function updateMemoryHud() {
    if (!memoryHudEl || !memoryHudEl.classList.contains("is-visible")) return;
    try {
      if (typeof performance !== "undefined" && performance.memory) {
        const used = (performance.memory.usedJSHeapSize || 0) / 1048576;
        const total = (performance.memory.totalJSHeapSize || 0) / 1048576;
        memoryHudEl.textContent = "RAM " + used.toFixed(1) + " / " + total.toFixed(1) + " MB";
      } else {
        memoryHudEl.textContent = "RAM — MB";
      }
    } catch (_) {
      memoryHudEl.textContent = "RAM — MB";
    }
  }
  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyR") ramKeys.r = true;
    if (e.code === "KeyA") ramKeys.a = true;
    if (e.code === "KeyM") ramKeys.m = true;
    if (ramKeys.r && ramKeys.a && ramKeys.m && memoryHudEl) {
      memoryHudEl.classList.toggle("is-visible");
      ramKeys.r = false;
      ramKeys.a = false;
      ramKeys.m = false;
      if (memoryHudEl.classList.contains("is-visible")) updateMemoryHud();
    }
  }, true);
  window.addEventListener("keyup", (e) => {
    if (e.code === "KeyR") ramKeys.r = false;
    if (e.code === "KeyA") ramKeys.a = false;
    if (e.code === "KeyM") ramKeys.m = false;
  }, true);

  const orbit = {
    target: new pc.Vec3(targetPos.x, targetPos.y, targetPos.z),
    distance: orbitDistance || 10,
    yaw: 0, pitch: 30,
    targetTarget: new pc.Vec3(targetPos.x, targetPos.y, targetPos.z),
    targetDistance: orbitDistance || 10, targetYaw: 0, targetPitch: 30,
    drag: false, pan: false, lastX: 0, lastY: 0
  };
  const orbitSmooth = 8;
  function syncOrbitFromCamera() {
    const p = cameraEntity.getLocalPosition();
    const fwd = cameraEntity.forward;
    const d = orbit.distance || 5;
    orbit.targetTarget.set(p.x + fwd.x * d, p.y + fwd.y * d, p.z + fwd.z * d);
    orbit.targetDistance = d;
    orbit.targetYaw = Math.atan2(-fwd.x, -fwd.z) * (180 / Math.PI);
    orbit.targetPitch = -Math.asin(Math.max(-1, Math.min(1, fwd.y))) * (180 / Math.PI);
    orbit.targetPitch = Math.max(-89, Math.min(89, orbit.targetPitch));
    orbit.target.set(orbit.targetTarget.x, orbit.targetTarget.y, orbit.targetTarget.z);
    orbit.distance = orbit.targetDistance;
    orbit.yaw = orbit.targetYaw;
    orbit.pitch = orbit.targetPitch;
  }
  function updateOrbit() {
    const y = orbit.yaw * Math.PI / 180, p = orbit.pitch * Math.PI / 180;
    const cosP = Math.cos(p), sinP = Math.sin(p), cosY = Math.cos(y), sinY = Math.sin(y);
    cameraEntity.setLocalPosition(
      orbit.target.x + orbit.distance * cosP * sinY,
      orbit.target.y + orbit.distance * sinP,
      orbit.target.z + orbit.distance * cosP * cosY
    );
    cameraEntity.lookAt(orbit.target);
  }
  function updateOrbitSmooth(dt) {
    const t = 1 - Math.exp(-orbitSmooth * dt);
    orbit.target.lerp(orbit.target, orbit.targetTarget, t);
    orbit.distance += (orbit.targetDistance - orbit.distance) * t;
    orbit.yaw += (orbit.targetYaw - orbit.yaw) * t;
    orbit.pitch += (orbit.targetPitch - orbit.pitch) * t;
    updateOrbit();
  }

  let cameraMode = 'orbit';
  const fly = {
    yaw: 0, pitch: 0, pos: new pc.Vec3(),
    targetYaw: 0, targetPitch: 0, targetPos: new pc.Vec3(),
    speed: 4, drag: false, lastX: 0, lastY: 0
  };
  const flySmooth = 10;
  const flyShiftMultiplier = 3;
  const flyKeys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
  function syncFlyFromCamera() {
    const p = cameraEntity.getLocalPosition();
    fly.pos.set(p.x, p.y, p.z);
    fly.targetPos.set(p.x, p.y, p.z);
    const fwd = cameraEntity.forward;
    fly.yaw = fly.targetYaw = Math.atan2(-fwd.x, -fwd.z);
    fly.pitch = fly.targetPitch = Math.asin(Math.max(-1, Math.min(1, fwd.y)));
  }
  function updateFly(dt) {
    let speed = fly.speed * (flyKeys.shift ? flyShiftMultiplier : 1);
    const move = speed * dt;
    const ry = Math.cos(fly.targetPitch);
    const forward = new pc.Vec3(-Math.sin(fly.targetYaw) * ry, Math.sin(fly.targetPitch), -Math.cos(fly.targetYaw) * ry);
    const right = new pc.Vec3(forward.z, 0, -forward.x).normalize();
    if (flyKeys.w) fly.targetPos.add(forward.clone().mulScalar(move));
    if (flyKeys.s) fly.targetPos.add(forward.clone().mulScalar(-move));
    if (flyKeys.d) fly.targetPos.add(right.clone().mulScalar(-move));
    if (flyKeys.a) fly.targetPos.add(right.clone().mulScalar(move));
    if (flyKeys.e) fly.targetPos.y += move;
    if (flyKeys.q) fly.targetPos.y -= move;
    const t = 1 - Math.exp(-flySmooth * dt);
    fly.pos.lerp(fly.pos, fly.targetPos, t);
    fly.yaw += (fly.targetYaw - fly.yaw) * t;
    fly.pitch += (fly.targetPitch - fly.pitch) * t;
    fly.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, fly.pitch));
    cameraEntity.setLocalPosition(fly.pos.x, fly.pos.y, fly.pos.z);
    const q = new pc.Quat();
    q.setFromEulerAngles(fly.pitch * 180 / Math.PI, fly.yaw * 180 / Math.PI, 0);
    cameraEntity.setLocalRotation(q);
  }

  const cameraModeCheckbox = document.getElementById("appViewerCameraMode");
  if (cameraModeCheckbox) {
    cameraModeCheckbox.addEventListener("change", () => {
      cameraMode = cameraModeCheckbox.checked ? 'fly' : 'orbit';
      if (cameraMode === 'orbit') syncOrbitFromCamera();
      else syncFlyFromCamera();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.code === 'KeyF') {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return;
      e.preventDefault();
      if (cameraModeCheckbox) {
        cameraModeCheckbox.checked = !cameraModeCheckbox.checked;
        cameraMode = cameraModeCheckbox.checked ? 'fly' : 'orbit';
        if (cameraMode === 'orbit') syncOrbitFromCamera();
        else syncFlyFromCamera();
      }
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') flyKeys.shift = true;
    if (cameraMode === 'fly') {
      if (e.code === 'KeyW') flyKeys.w = true;
      if (e.code === 'KeyS') flyKeys.s = true;
      if (e.code === 'KeyA') flyKeys.a = true;
      if (e.code === 'KeyD') flyKeys.d = true;
      if (e.code === 'KeyQ') flyKeys.q = true;
      if (e.code === 'KeyE') flyKeys.e = true;
    }
  }, true);
  window.addEventListener("keyup", (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') flyKeys.shift = false;
    if (e.code === 'KeyW') flyKeys.w = false;
    if (e.code === 'KeyS') flyKeys.s = false;
    if (e.code === 'KeyA') flyKeys.a = false;
    if (e.code === 'KeyD') flyKeys.d = false;
    if (e.code === 'KeyQ') flyKeys.q = false;
    if (e.code === 'KeyE') flyKeys.e = false;
  }, true);

  function togglePlay() {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "❚❚" : "▶";
    playBtn.setAttribute("aria-pressed", isPlaying);
    if (isPlaying) firstPlayTick = true;
    if (!isPlaying && cameraMode === 'orbit') syncOrbitFromCamera();
    if (!isPlaying && cameraMode === 'fly') syncFlyFromCamera();
  }
  playBtn.addEventListener("click", togglePlay);
  window.addEventListener("keydown", (e) => {
    if ((e.key !== " " && e.code !== "Space") || e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return;
    e.preventDefault();
    togglePlay();
  }, true);

  if (frameSlider) {
    frameSlider.addEventListener("input", () => {
      currentFrame = Math.max(0, Math.min(totalFrames - 1, parseInt(frameSlider.value, 10) || 0));
      frameAcc = currentFrame;
      setVisibility(currentFrame);
      interpolateCamera(frameAcc);
      if (!isPlaying) {
        if (cameraMode === 'orbit') syncOrbitFromCamera();
        else syncFlyFromCamera();
      }
      updateUI();
    });
  }

  canvas.addEventListener("mousedown", (e) => {
    if (!isPlaying) {
      if (cameraMode === 'orbit') {
        orbit.drag = e.button === 0;
        orbit.pan = e.button === 2 || e.button === 1;
        orbit.lastX = e.clientX;
        orbit.lastY = e.clientY;
      } else {
        fly.drag = e.button === 0;
        fly.lastX = e.clientX;
        fly.lastY = e.clientY;
      }
      e.preventDefault();
    }
  });
  document.addEventListener("mouseup", () => { orbit.drag = false; orbit.pan = false; fly.drag = false; });
  document.addEventListener("mousemove", (e) => {
    if (!isPlaying && cameraMode === 'orbit' && (orbit.drag || orbit.pan)) {
      const dx = e.clientX - orbit.lastX, dy = e.clientY - orbit.lastY;
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
      if (orbit.drag) {
        orbit.targetYaw -= dx * 0.3;
        orbit.targetPitch = Math.max(-89, Math.min(89, orbit.targetPitch + dy * 0.3));
      } else {
        const right = new pc.Vec3();
        const up = new pc.Vec3();
        cameraEntity.getWorldTransform().getX(right);
        cameraEntity.getWorldTransform().getY(up);
        const panSpeed = orbit.targetDistance * 0.01;
        orbit.targetTarget.x -= right.x * dx * panSpeed - up.x * dy * panSpeed;
        orbit.targetTarget.y -= right.y * dx * panSpeed - up.y * dy * panSpeed;
        orbit.targetTarget.z -= right.z * dx * panSpeed - up.z * dy * panSpeed;
      }
    }
    if (!isPlaying && cameraMode === 'fly' && fly.drag) {
      const dx = (e.clientX - fly.lastX) * 0.003, dy = (e.clientY - fly.lastY) * 0.003;
      fly.lastX = e.clientX;
      fly.lastY = e.clientY;
      fly.yaw -= dx;
      fly.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, fly.pitch - dy));
      fly.targetYaw = fly.yaw;
      fly.targetPitch = fly.pitch;
    }
  });
  canvas.addEventListener("wheel", (e) => {
    if (!isPlaying && cameraMode === 'orbit') {
      e.preventDefault();
      orbit.targetDistance *= (e.deltaY > 0 ? 1.1 : 0.9);
      orbit.targetDistance = Math.max(0.5, Math.min(500, orbit.targetDistance));
    }
    if (!isPlaying && cameraMode === 'fly') {
      e.preventDefault();
      fly.speed *= (e.deltaY > 0 ? 0.9 : 1.1);
      fly.speed = Math.max(0.5, Math.min(50, fly.speed));
    }
  }, { passive: false });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  let hideUiTimeout = null;
  function scheduleHideUI() {
    clearTimeout(hideUiTimeout);
    hideUiTimeout = setTimeout(() => document.body.classList.add("app-viewer-ui-hidden"), 2000);
  }
  function showUI() {
    clearTimeout(hideUiTimeout);
    document.body.classList.remove("app-viewer-ui-hidden");
    scheduleHideUI();
  }
  document.addEventListener("pointermove", showUI);
  document.addEventListener("mousemove", showUI);
  scheduleHideUI();

  app.on("update", (dt) => {
    tickFps();
    if (isPlaying) {
      if (firstPlayTick) {
        firstPlayTick = false;
        setVisibility(currentFrame);
        interpolateCamera(frameAcc);
        updateUI();
      } else {
        frameAcc = (frameAcc + dt * playbackFpsCurrent) % totalFrames;
        if (frameAcc < 0) frameAcc += totalFrames;
        currentFrame = Math.max(0, Math.min(totalFrames - 1, Math.floor(frameAcc)));
        setVisibility(currentFrame);
        interpolateCamera(frameAcc);
        if (Math.floor(frameAcc) % 3 === 0) updateUI();
      }
    } else {
      if (cameraMode === 'orbit') updateOrbitSmooth(dt);
      else updateFly(dt);
    }
  });

  setVisibility(0);
  interpolateCamera(0);
  updateUI();
  syncOrbitFromCamera();
  orbit.targetTarget.set(orbit.target.x, orbit.target.y, orbit.target.z);
  orbit.targetDistance = orbit.distance;
  orbit.targetYaw = orbit.yaw;
  orbit.targetPitch = orbit.pitch;
  setProgress(100, "Ready");
  setTimeout(() => document.getElementById("loading")?.classList.add("hidden"), 300);
})().catch(err => {
  document.getElementById("loading-text").textContent = "Error: " + (err?.message || err);
  console.error(err);
});
`;
}
