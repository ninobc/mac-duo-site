import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { vertexShader, fragmentShader } from './fold-shader.js';
import { presets, frame as foldFrame } from './fold-math.js';
import { buildDesktop, PADDING } from './desktop.js';

// ---------------------------------------------------------------------------
// The stage: a MacBook whose lid closes as you scroll, its screen running
// the Mac Duo fold. Units are decimetres (a 14-inch MacBook Pro is 3.13 wide).
// ---------------------------------------------------------------------------
const canvas = document.getElementById('scene');
const stage = document.getElementById('stage');
const heroCopy = document.getElementById('hero-copy');
const captions = [...document.querySelectorAll('.caption')];
const angleLabel = document.getElementById('angle');
const lidLine = document.getElementById('lid-line');
const hint = document.getElementById('hint');
const scrub = document.getElementById('scrub');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const OPEN = 112, SHUT = 6;
const effect = presets.duo;
const SCREEN = { w: 1512, h: 982 };   // the virtual display, in points

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
const lookAt = new THREE.Vector3(0, 1.0, 0);

// Lights: the environment does most of it; a key light adds the highlight
// along the lid's edge and a fill keeps the underside from going flat.
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 6, 4); scene.add(key);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5); fill.position.set(4, 2, -3); scene.add(fill);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// ---- MacBook -----------------------------------------------------------------
const mac = new THREE.Group();
scene.add(mac);

const aluminium = new THREE.MeshPhysicalMaterial({ color: 0xd7d9de, metalness: 0.85, roughness: 0.38, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 1.1 });
const aluminiumDark = new THREE.MeshPhysicalMaterial({ color: 0xc3c6cc, metalness: 0.85, roughness: 0.45, envMapIntensity: 0.9 });

const W = 3.13, D = 2.21, BASE_H = 0.155, LID_T = 0.046;
const base = new THREE.Mesh(new RoundedBoxGeometry(W, BASE_H, D, 4, 0.06), aluminium);
base.position.y = BASE_H / 2;
mac.add(base);

// Keyboard deck: a canvas of keys, so the frost has something under it.
const keys = document.createElement('canvas'); keys.width = 1024; keys.height = 400;
{
  const c = keys.getContext('2d');
  c.fillStyle = '#c9ccd3'; c.fillRect(0, 0, 1024, 400);
  const cols = 14, rows = 6, gap = 6, kw = (1024 - gap * (cols + 1)) / cols, kh = (400 - gap * (rows + 1)) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const wide = r === rows - 1 && k > 4 && k < 9; if (r === rows - 1 && k > 5 && k < 9) continue;
    c.fillStyle = '#26272c';
    const x = gap + k * (kw + gap), y = gap + r * (kh + gap), w = wide ? kw * 4 + gap * 3 : kw;
    c.beginPath(); c.roundRect(x, y, w, kh, 6); c.fill();
  }
}
const keyTex = new THREE.CanvasTexture(keys); keyTex.colorSpace = THREE.SRGBColorSpace; keyTex.anisotropy = 4;
const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(2.72, 1.06), new THREE.MeshStandardMaterial({ map: keyTex, roughness: 0.75, metalness: 0.1 }));
keyboard.rotation.x = -Math.PI / 2; keyboard.position.set(0, BASE_H + 0.002, -0.36);
mac.add(keyboard);
const trackpad = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.82), aluminiumDark);
trackpad.rotation.x = -Math.PI / 2; trackpad.position.set(0, BASE_H + 0.002, 0.62);
mac.add(trackpad);

// Lid, hinged at the back edge of the base.
const hinge = new THREE.Group();
hinge.position.set(0, BASE_H, -D / 2 + 0.04);
mac.add(hinge);
const lid = new THREE.Mesh(new RoundedBoxGeometry(W, D, LID_T, 4, 0.03), aluminium);
lid.position.set(0, D / 2, LID_T / 2);
hinge.add(lid);
const bezel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.05, D - 0.05), new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.35, metalness: 0.2 }));
bezel.position.set(0, D / 2, LID_T + 0.001);
hinge.add(bezel);

// The screen: our fold shader.
const uniforms = {
  picture: { value: null },
  toPicture: { value: new THREE.Matrix3() },
  screenSize: { value: new THREE.Vector2(SCREEN.w, SCREEN.h) },
  paddedOrigin: { value: new THREE.Vector2(-PADDING, -PADDING) },
  paddedSize: { value: new THREE.Vector2(SCREEN.w + 2 * PADDING, SCREEN.h + 2 * PADDING) },
  textureScale: { value: 1 },
  maxRadius: { value: effect.blurRadius },
  blurStrength: { value: 0 }, blurFloor: { value: effect.blurFloor }, maxDim: { value: effect.dimming }, maxLevel: { value: 10 },
  dimStart: { value: effect.dimStart }, dimStrength: { value: 0 }, visibleTop: { value: 1 },
  sheenAmount: { value: 0 }, sheenPos: { value: 0 }, grain: { value: effect.grain }, time: { value: 0 }, brightness: { value: 1 },
};
const screenMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, glslVersion: THREE.GLSL3 });
const SCREEN_W = 2.99, SCREEN_H = SCREEN_W * SCREEN.h / SCREEN.w;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMaterial);
screen.position.set(0, D / 2 + 0.01, LID_T + 0.002);
hinge.add(screen);
// The notch.
const notch = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.06), new THREE.MeshBasicMaterial({ color: 0x000000 }));
notch.position.set(0, D / 2 + 0.01 + SCREEN_H / 2 - 0.03, LID_T + 0.003);
hinge.add(notch);

// Contact shadow.
const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 256;
{
  const c = shadowCanvas.getContext('2d');
  const g = c.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, 'rgba(20,24,40,0.55)'); g.addColorStop(0.55, 'rgba(20,24,40,0.18)'); g.addColorStop(1, 'rgba(20,24,40,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
}
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.001; shadow.scale.set(1, 0.8, 1);
mac.add(shadow);

// ---- Desktop texture ----------------------------------------------------------
const wallpaper = new Image();
wallpaper.src = '/assets/wallpaper-dunes.jpg';
wallpaper.onload = () => {
  const scale = Math.min(2, 4096 / (SCREEN.w + 2 * PADDING));
  const padded = buildDesktop(wallpaper, SCREEN.w, SCREEN.h, scale);
  const tex = new THREE.CanvasTexture(padded);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.flipY = true;
  uniforms.picture.value = tex;
  uniforms.textureScale.value = scale;
  uniforms.maxLevel.value = Math.floor(Math.log2(Math.max(padded.width, padded.height)));
  dirty = true; schedule();
};

// ---- Motion -------------------------------------------------------------------
let progress = 0;              // 0 at the top of the page, 1 when the stage ends
let usingSlider = false;
let angle = OPEN, angleTarget = OPEN, angleVelocity = 0;
let raf = 0, dirty = true, last = performance.now();
const clock = new THREE.Clock();

function layout() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Keep the MacBook framed on narrow screens.
  camera.fov = w / h < 0.9 ? 40 : (w / h < 1.3 ? 32 : 26);
  camera.updateProjectionMatrix();
}

function fromScroll() {
  if (usingSlider) return;
  const rect = stage.getBoundingClientRect();
  const travel = rect.height - innerHeight;
  progress = Math.min(Math.max(-rect.top / Math.max(travel, 1), 0), 1);
  scrub.value = Math.round(progress * 1000);
  schedule();
}

function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function update(dt, t) {
  // Phases along the scroll: hero, close, hold.
  const closing = Math.min(Math.max((progress - 0.12) / 0.78, 0), 1);
  angleTarget = OPEN + (SHUT - OPEN) * ease(closing);
  if (reduced) { angle = angleTarget; angleVelocity = 0; } else {
    const k = 10, acc = k * k * (angleTarget - angle) - 2 * k * angleVelocity;
    angleVelocity += acc * dt; angle += angleVelocity * dt;
  }

  // Lid pose. 90° is upright; 0° lies flat on the keys, screen down.
  hinge.rotation.x = (90 - angle) * Math.PI / 180;

  // Camera: from a hero pose (MacBook low, copy above it) to a centred,
  // slightly lower and closer view while it folds.
  const heroT = Math.min(progress / 0.2, 1);
  const camY = 3.1 - 1.4 * ease(heroT), camZ = 9.8 - 2.6 * ease(heroT);
  const idle = reduced ? 0 : (1 - heroT) * Math.sin(t * 0.7) * 0.04;
  camera.position.set(Math.sin(t * 0.13) * 0.25 * (1 - heroT), camY + idle, camZ);
  lookAt.set(0, 2.5 - 1.55 * ease(heroT), 0);
  camera.lookAt(lookAt);
  mac.rotation.y = -0.18 + 0.36 * (0.5 - 0.5 * Math.cos(closing * Math.PI)) * 0.35;

  // Screen.
  const f = foldFrame(effect, SCREEN.w, SCREEN.h, angle);
  uniforms.toPicture.value.set(f.inverse[0], f.inverse[3], f.inverse[6], f.inverse[1], f.inverse[4], f.inverse[7], f.inverse[2], f.inverse[5], f.inverse[8]);
  uniforms.visibleTop.value = f.visibleTop;
  uniforms.blurStrength.value = f.blurStrength;
  uniforms.dimStrength.value = f.dimStrength;
  uniforms.sheenAmount.value = f.sheenAmount;
  uniforms.sheenPos.value = f.sheenPos;
  uniforms.time.value = t % 1000;
  // The display sleeps as the lid meets the keys.
  uniforms.brightness.value = Math.min(Math.max((angle - 8) / 8, 0), 1);

  // Copy and captions.
  heroCopy.style.opacity = String(Math.max(0, 1 - progress / 0.14));
  heroCopy.style.pointerEvents = progress > 0.14 ? 'none' : '';
  for (const caption of captions) {
    const at = parseFloat(caption.dataset.at);
    caption.classList.toggle('on', Math.abs(closing - at) < 0.14 && progress > 0.14);
  }
  angleLabel.textContent = Math.round(angle);
  const a = Math.min(Math.max(angle, 5), 135) * Math.PI / 180;
  lidLine.setAttribute('d', `M4.5 12.5l${(11 * Math.cos(a)).toFixed(2)} ${(-11 * Math.sin(a)).toFixed(2)}`);
  hint.textContent = usingSlider ? 'Drag to fold' : (progress < 0.02 ? 'Scroll to close' : (progress > 0.96 ? 'Scroll up to open' : 'Closing'));
}

function tick(now) {
  raf = 0;
  const dt = Math.min(Math.max((now - last) / 1000, 1 / 240), 1 / 20); last = now;
  const t = clock.getElapsedTime();
  update(dt, t);
  renderer.render(scene, camera);
  const settled = Math.abs(angle - angleTarget) < 0.01 && Math.abs(angleVelocity) < 0.05;
  const onScreen = stage.getBoundingClientRect().bottom > 0;
  if ((!settled || dirty || progress < 0.2) && onScreen) { dirty = false; raf = requestAnimationFrame(tick); }
}
function schedule() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }

scrub.addEventListener('input', () => { usingSlider = true; progress = 0.14 + (scrub.value / 1000) * 0.86; schedule(); });
scrub.addEventListener('change', () => { setTimeout(() => { usingSlider = false; fromScroll(); }, 1200); });
addEventListener('scroll', fromScroll, { passive: true });
addEventListener('resize', () => { layout(); dirty = true; schedule(); });
layout(); fromScroll(); schedule();

// Nav: solid once past the hero.
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

// Latest version, for the install card.
fetch('/updates.json').then(r => r.json()).then(u => { const v = document.getElementById('version'); if (v && u.version) v.textContent = u.version; }).catch(() => {});
