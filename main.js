import * as THREE from 'three';
import { DropInViewer } from '@mkkellogg/gaussian-splats-3d';

// ---------- Renderer / Scene / Camera ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

// ---------- Loading HUD ----------
const loadingText = document.getElementById('loading-text');
const loadingFill = document.getElementById('loading-fill');
const loadingEl = document.getElementById('loading');

// ---------- Splat loader ----------
function loadSplat() {
  const viewer = new DropInViewer({
    gpuAcceleratedSort: true,
    sharedMemoryForWorkers: crossOriginIsolated,
    // degree 1 preserves view-dependent color from the .ply if present;
    // falls back gracefully to base RGB if higher-order coefficients are absent.
    sphericalHarmonicsDegree: 0,
  });

  const promise = viewer.addSplatScene('/models/aspen.ply', {
    showLoadingUI: false,
    progressiveLoad: false,
    splatAlphaRemovalThreshold: 5,
    onProgress: (pct) => {
      loadingFill.style.width = `${pct}%`;
      loadingText.textContent = `Loading splat… ${pct.toFixed(0)}%`;
    },
  });

  return promise.then(() => viewer);
}

// Compute robust room stats from splat centers.
// PLYs from Gaussian-splat training almost always have "floater" outliers
// far away from the actual scene — those inflate the bbox and pull its center
// off into empty space. We use percentile-based bounds so the returned center
// and size describe the dense body of the point cloud (the room), not the
// outliers.
function computeSplatRoomStats(dropIn) {
  const mesh = dropIn.splatMesh;
  const count = mesh.getSplatCount();
  const tmp = new THREE.Vector3();
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);
  const zs = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    mesh.getSplatCenter(i, tmp);
    xs[i] = tmp.x; ys[i] = tmp.y; zs[i] = tmp.z;
  }
  const sortedX = Array.from(xs).sort((a, b) => a - b);
  const sortedY = Array.from(ys).sort((a, b) => a - b);
  const sortedZ = Array.from(zs).sort((a, b) => a - b);
  const pct = (sorted, p) => sorted[Math.floor((sorted.length - 1) * p)];
  // Median = 50th percentile → the dense body of the cloud, independent of outliers.
  // IQR (25-75) × 1.5 estimates the full extent of the dense body — this ignores
  // sparse floater splats that inflate naive bboxes.
  const center = new THREE.Vector3(pct(sortedX, 0.5), pct(sortedY, 0.5), pct(sortedZ, 0.5));
  const halfX = (pct(sortedX, 0.75) - pct(sortedX, 0.25)) * 1.5;
  const halfY = (pct(sortedY, 0.75) - pct(sortedY, 0.25)) * 1.5;
  const halfZ = (pct(sortedZ, 0.75) - pct(sortedZ, 0.25)) * 1.5;
  const size = new THREE.Vector3(halfX * 2, halfY * 2, halfZ * 2);
  const min = new THREE.Vector3(center.x - halfX, center.y - halfY, center.z - halfZ);
  const max = new THREE.Vector3(center.x + halfX, center.y + halfY, center.z + halfZ);
  return { center, size, min, max };
}

// ---------- First-person controls (mouse-look + WASD) ----------
let yaw = 0;
let pitch = 0;
let dragging = false;
let lastMx = 0, lastMy = 0;

renderer.domElement.addEventListener('mousedown', (e) => {
  dragging = true; lastMx = e.clientX; lastMy = e.clientY;
});
window.addEventListener('mouseup', () => { dragging = false; });
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastMx;
  const dy = e.clientY - lastMy;
  lastMx = e.clientX; lastMy = e.clientY;
  yaw   -= dx * 0.0035;
  pitch  = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch - dy * 0.0035));
});

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.code));
window.addEventListener('keyup',   (e) => keys.delete(e.code));

// ---------- Init ----------
let moveSpeed = 1.0; // units/sec, scaled to scene size once loaded

async function init() {
  loadingText.textContent = 'Loading splat…';
  const splatViewer = await loadSplat();

  loadingText.textContent = 'Placing camera inside room…';
  await new Promise((r) => requestAnimationFrame(r));

  scene.add(splatViewer);

  const { center, size, min } = computeSplatRoomStats(splatViewer);

  // Camera at the room's center, at roughly eye height (60% up from the floor)
  const eyeY = min.y + size.y * 0.6;
  camera.position.set(center.x, eyeY, center.z);

  // Reasonable near/far for the scene scale
  const worldSize = Math.max(size.x, size.y, size.z);
  camera.near = Math.max(0.001, worldSize * 0.0005);
  camera.far  = worldSize * 20;
  camera.updateProjectionMatrix();

  // Scale movement to scene size so WASD feels right regardless of splat units
  moveSpeed = worldSize * 0.15;

  loadingEl.style.display = 'none';
  window.__debug = { scene, camera, splatViewer, center, size, min, renderer };
  console.log(`[aspen] splats=${splatViewer.splatMesh.getSplatCount().toLocaleString()}  size=${size.x.toFixed(2)}×${size.y.toFixed(2)}×${size.z.toFixed(2)}  camera=${camera.position.toArray().map(v=>v.toFixed(2)).join(',')}`);

  // 'F' flips the splat 180° around X (fixes upside-down PLYs)
  let flipped = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyF') {
      flipped = !flipped;
      splatViewer.rotation.x = flipped ? Math.PI : 0;
      splatViewer.updateMatrixWorld(true);
    }
  });

  animate();
}

// ---------- Main loop ----------
const clock = new THREE.Clock();
const fpsEl = document.getElementById('fps');
let frames = 0, fpsAcc = 0;

function updateCamera(dt) {
  // Build orientation from yaw+pitch
  const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right   = new THREE.Vector3(1, 0,  0).applyQuaternion(camera.quaternion);
  // Keep vertical movement independent of pitch for Q/E; horizontal WASD stays free-fly
  const dir = new THREE.Vector3();
  if (keys.has('KeyW')) dir.add(forward);
  if (keys.has('KeyS')) dir.sub(forward);
  if (keys.has('KeyD')) dir.add(right);
  if (keys.has('KeyA')) dir.sub(right);
  if (keys.has('KeyE') || keys.has('Space'))     dir.y += 1;
  if (keys.has('KeyQ') || keys.has('ShiftLeft')) dir.y -= 1;

  if (dir.lengthSq() > 0) {
    dir.normalize().multiplyScalar(moveSpeed * dt);
    camera.position.add(dir);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 1 / 30);

  updateCamera(dt);
  renderer.render(scene, camera);

  frames++; fpsAcc += dt;
  if (fpsAcc >= 0.5) {
    fpsEl.textContent = `fps: ${(frames / fpsAcc).toFixed(0)}`;
    frames = 0; fpsAcc = 0;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init().catch((err) => {
  console.error(err);
  loadingText.textContent = `Error: ${err.message || err}`;
});
