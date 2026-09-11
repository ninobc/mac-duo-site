import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
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
const finaleCopy = document.getElementById('finale-copy');
const angleLabel = document.getElementById('angle');
const lidLine = document.getElementById('lid-line');
const hint = document.getElementById('hint');
const scrub = document.getElementById('scrub');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const OPEN = 112, SHUT = 1;
const effect = presets.duo;

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
// A real MacBook model (glTF, Draco). Its `screen` node is the lid, hinged at
// its own origin; `matte` is the display face, which gets the fold shader.
const mac = new THREE.Group();
scene.add(mac);
const SCREEN = { w: 1512, h: 982 };   // the virtual display, in points
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

let hinge = null;              // the lid node
let hingeRestY = 0, modelScale = 1;
let lidRest = 0;               // the model's own lid rotation (radians about x)
let lidSign = 1;

const draco = new DRACOLoader(); draco.setDecoderPath('/draco/');
const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
loader.load('/models/macbook.glb', gltf => {
  const model = gltf.scene;
  // Materials: a cleaner aluminium and a proper black for the bezel.
  model.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = false;
    if (o.name === 'matte') { o.material = screenMaterial; }
    else if (o.material && o.material.name === 'aluminium') {
      o.material = new THREE.MeshPhysicalMaterial({ color: 0xd4d6db, metalness: 0.85, roughness: 0.4, clearcoat: 0.2, clearcoatRoughness: 0.5, envMapIntensity: 1.1 });
    } else if (o.material && o.material.name === 'blackmatte') {
      o.material = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.6, metalness: 0.1 });
    }
  });
  hinge = model.getObjectByName('screen');
  lidRest = hinge ? hinge.rotation.x : 0;
  hingeRestY = hinge ? hinge.position.y : 0;
  // Fit: 3.13 units wide, resting on y = 0, centred on x/z.
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3(); box.getSize(size);
  const scale = 3.13 / size.x;
  modelScale = scale;
  model.scale.setScalar(scale);
  const fitted = new THREE.Box3().setFromObject(model);
  const centre = new THREE.Vector3(); fitted.getCenter(centre);
  model.position.set(-centre.x, -fitted.min.y, -centre.z);
  mac.add(model);
  console.log('macbook', { size: size.toArray(), lidRest, hinge: hinge && hinge.position.toArray() });
  dirty = true; schedule();
});

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
  camera.fov = w / h < 0.7 ? 54 : (w / h < 0.9 ? 46 : (w / h < 1.3 ? 34 : 26));
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
  // Phases along the scroll: hero (0–0.12), close (0.12–0.7), finale (0.7–1).
  const closing = Math.min(Math.max((progress - 0.12) / 0.58, 0), 1);
  const finale = ease(Math.min(Math.max((progress - 0.7) / 0.22, 0), 1));
  angleTarget = OPEN + (SHUT - OPEN) * ease(closing);
  if (reduced) { angle = angleTarget; angleVelocity = 0; } else {
    const k = 10, acc = k * k * (angleTarget - angle) - 2 * k * angleVelocity;
    angleVelocity += acc * dt; angle += angleVelocity * dt;
  }

  // Lid pose: the model's rest pose is fully open (OPEN); closing rotates
  // the lid about the hinge's x axis.
  // The model rests fully upright (90°).
  if (hinge) {
    hinge.rotation.x = lidRest + lidSign * (90 - angle) * Math.PI / 180;
    // The model's pivot sits a touch above the deck; settle the lid onto it.
    hinge.position.y = hingeRestY - (0.09 / modelScale) * Math.pow(closing, 2);
  }

  // Camera: from a hero pose (MacBook low, copy above it) to a centred,
  // slightly lower and closer view while it folds.
  const heroT = Math.min(progress / 0.2, 1);
  const narrow = camera.aspect < 0.9 ? 0.5 : 0;
  // Closing view → finale: a centred, slightly higher front view of the
  // closed MacBook, sitting under the closing line.
  let camY = 3.3 - 1.6 * ease(heroT), camZ = 10.4 - 3.2 * ease(heroT);
  let lookY = 2.95 + narrow - (2.0 + narrow) * ease(heroT);
  camY += (3.6 - camY) * finale;
  camZ += (7.6 + narrow * 2 - camZ) * finale;
  lookY += (-0.35 - lookY) * finale;
  const idle = reduced ? 0 : (1 - heroT) * Math.sin(t * 0.7) * 0.04;
  camera.position.set(Math.sin(t * 0.13) * 0.25 * (1 - heroT) * (1 - finale), camY + idle, camZ);
  lookAt.set(0, lookY, 0);
  camera.lookAt(lookAt);
  mac.rotation.y = (-0.16 + 0.10 * closing) * (1 - finale);

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
  uniforms.brightness.value = Math.min(Math.max((angle - 4) / 8, 0), 1);

  // Copy and captions.
  heroCopy.style.opacity = String(Math.max(0, 1 - progress / 0.14));
  heroCopy.style.pointerEvents = progress > 0.14 ? 'none' : '';
  for (const caption of captions) {
    const at = parseFloat(caption.dataset.at);
    caption.classList.toggle('on', Math.abs(closing - at) < 0.12 && progress > 0.14 && finale < 0.05);
  }
  finaleCopy.style.opacity = String(finale);
  finaleCopy.style.transform = `translate(-50%, ${(1 - finale) * 24}px)`;
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
