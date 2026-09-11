import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { vertexShader, fragmentShader } from './fold-shader.js';
import { presets, frame as foldFrame } from './fold-math.js';
import { buildDesktop, PADDING } from './desktop.js';

// ---------------------------------------------------------------------------
// The stage: Apple's MacBook Pro 14 whose lid closes as you scroll, its
// screen running the Mac Duo fold. Scene units are decimetres.
// ---------------------------------------------------------------------------
export function createStage(els) {
  const { canvas, stage, heroCopy, captions, finaleCopy, angleLabel, lidLine, hint, scrub } = els;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OPEN = 110, SHUT = 1;
  const effect = presets.duo;
  const SCREEN = { w: 1512, h: 982 };

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
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 6, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5); fill.position.set(4, 2, -3); scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const mac = new THREE.Group();
  scene.add(mac);
  const uniforms = {
    picture: { value: null },
    toPicture: { value: new THREE.Matrix3() },
    screenSize: { value: new THREE.Vector2(SCREEN.w, SCREEN.h) },
    paddedOrigin: { value: new THREE.Vector2(-PADDING, -PADDING) },
    paddedSize: { value: new THREE.Vector2(SCREEN.w + 2 * PADDING, SCREEN.h + 2 * PADDING) },
    screenMin: { value: new THREE.Vector2(0, 0) },
    screenExtent: { value: new THREE.Vector2(1, 1) },
    textureScale: { value: 1 },
    maxRadius: { value: effect.blurRadius },
    blurStrength: { value: 0 }, blurFloor: { value: effect.blurFloor }, maxDim: { value: effect.dimming }, maxLevel: { value: 10 },
    dimStart: { value: effect.dimStart }, dimReach: { value: effect.dimReach }, dimHinge: { value: effect.dimHingeFloor }, dimStrength: { value: 0 }, visibleTop: { value: 1 },
    sheenAmount: { value: 0 }, sheenPos: { value: 0 }, grain: { value: effect.grain }, time: { value: 0 }, brightness: { value: 1 },
  };
  const screenMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, glslVersion: THREE.GLSL3 });

  const aluminium = new THREE.MeshPhysicalMaterial({ color: 0xd9dbe0, metalness: 0.9, roughness: 0.42, clearcoat: 0.15, clearcoatRoughness: 0.5, envMapIntensity: 1.0 });
  const aluminiumDark = new THREE.MeshPhysicalMaterial({ color: 0x9a9da4, metalness: 0.9, roughness: 0.5, envMapIntensity: 0.8 });
  const blackGlass = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0c, metalness: 0.1, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const keys = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.65, metalness: 0.05 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x2a2b2f, roughness: 0.9 });

  const DISPLAY = 'lid__abgVijaHVNRUvcc';
  const BLACK_GLASS = new Set(['lid__PbJkUSFBOfThIZE', 'lid__fiqlelggeOoTUAw', 'lid__WeTEPJkcTkMBwBo', 'lid__yxTDdMZViYkuOKm', 'lid__pPCeNYAcgHQGnfB', 'lid__CpRxqsFibJhVZKA', 'lid__FnbkdmFKVeCCxTX']);
  const KEYS = new Set(['body__RkSurqpnfNMQZfv', 'body__eAcvqfZlEdoxHsj', 'body__QYMcPaZnXQfyXcJ', 'body__jvyJQHpRnZNPEYh']);
  const RUBBER = new Set(['body__KCEhahuknsxQOxv', 'body__NdRhLFCrSxRNTxn', 'body__SjSNuZdtWKZRuoq']);
  const DARK = new Set(['body__QHqPxKdexBoFnAK', 'body__tEwRkclpxjXZzil', 'body__ZlizOzukFeXwbga', 'body__wXiLpiodZWNDroe', 'body__MrXuKTffTmUoNPF', 'body__RgJfwZBuZcVWHTq', 'body__DAuseNOrQKyrxKl', 'body__PTxrSKzcEmHVtif', 'body__guoofBSjCEiTIJr', 'lid__CEvArJuvvmtQsgk', 'lid__ESbzqoApOvgbqCM', 'lid__aUVveCqqwsqchVB', 'lid__ehiyYGFzDbgxhiD', 'body__KJGApIEIPKlDIsA', 'body__QMBrsnrwfcVKELm', 'body__MwHxcVTumDWogJY', 'body__RjGOdbHqvxkiDns', 'body__bYMJoztGEkchzEz', 'body__fERhErXVTNqvOgR', 'body__aqQHZmtSqmOcJrJ']);
  const HINGE = new THREE.Vector3(0, -0.45, -11.45);
  const LEAN = Math.atan2(19.02 - 12.35, 19.45 - 1.02);
  const MODEL_SCALE = 0.1;
  let hinge = null;
  let disposed = false;

  const draco = new DRACOLoader(); draco.setDecoderPath('/draco/');
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  loader.load('/models/macbook-pro-14.glb', gltf => {
    if (disposed) return;
    const model = gltf.scene;
    const lid = new THREE.Group();
    const body = new THREE.Group();
    const meshes = [];
    model.traverse(o => { if (o.isMesh) meshes.push(o); });
    for (const m of meshes) {
      m.updateWorldMatrix(true, false);
      m.geometry.applyMatrix4(m.matrixWorld);
      m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1);
      const name = m.name || '';
      if (name === DISPLAY) m.material = screenMaterial;
      else if (BLACK_GLASS.has(name)) m.material = blackGlass;
      else if (KEYS.has(name)) m.material = keys;
      else if (RUBBER.has(name)) m.material = rubber;
      else if (DARK.has(name)) m.material = aluminiumDark;
      else m.material = aluminium;
      if (name.startsWith('lid__')) {
        m.geometry.translate(-HINGE.x, -HINGE.y, -HINGE.z);
        m.geometry.rotateX(LEAN);
        lid.add(m);
      } else {
        body.add(m);
      }
    }
    const display = lid.children.find(m => m.name === DISPLAY);
    if (display) {
      display.geometry.computeBoundingBox();
      const b = display.geometry.boundingBox;
      uniforms.screenMin.value.set(b.min.x, b.min.y);
      uniforms.screenExtent.value.set(b.max.x - b.min.x, b.max.y - b.min.y);
    }
    hinge = new THREE.Group();
    hinge.position.copy(HINGE);
    hinge.add(lid);
    const rig = new THREE.Group();
    rig.add(body, hinge);
    rig.scale.setScalar(MODEL_SCALE);
    const box = new THREE.Box3().setFromObject(rig);
    rig.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    mac.add(rig);
    dirty = true; schedule();
  }, undefined, err => console.error('macbook failed', err));

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

  // Desktop texture.
  const wallpaper = new Image();
  wallpaper.src = '/assets/wallpaper-dunes.jpg';
  wallpaper.onload = () => {
    if (disposed) return;
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

  // Motion.
  let progress = 0, usingSlider = false;
  let angle = OPEN, angleTarget = OPEN, angleVelocity = 0;
  let raf = 0, dirty = true, last = performance.now();
  const clock = new THREE.Clock();

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
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
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function update(dt, t) {
    const closing = Math.min(Math.max((progress - 0.12) / 0.58, 0), 1);
    const finale = ease(Math.min(Math.max((progress - 0.7) / 0.22, 0), 1));
    angleTarget = OPEN + (SHUT - OPEN) * ease(closing);
    if (reduced) { angle = angleTarget; angleVelocity = 0; } else {
      const k = 10, acc = k * k * (angleTarget - angle) - 2 * k * angleVelocity;
      angleVelocity += acc * dt; angle += angleVelocity * dt;
    }
    if (hinge) hinge.rotation.x = (90 - angle) * Math.PI / 180;

    const heroT = Math.min(progress / 0.2, 1);
    const narrow = camera.aspect < 0.9 ? 0.5 : 0;
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

    const f = foldFrame(effect, SCREEN.w, SCREEN.h, angle);
    uniforms.toPicture.value.set(f.inverse[0], f.inverse[3], f.inverse[6], f.inverse[1], f.inverse[4], f.inverse[7], f.inverse[2], f.inverse[5], f.inverse[8]);
    uniforms.visibleTop.value = f.visibleTop;
    uniforms.blurStrength.value = f.blurStrength;
    uniforms.dimStrength.value = f.dimStrength;
    uniforms.sheenAmount.value = f.sheenAmount;
    uniforms.sheenPos.value = f.sheenPos;
    uniforms.time.value = t % 1000;
    uniforms.brightness.value = Math.min(Math.max((angle - 4) / 8, 0), 1);

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
    if (disposed) return;
    const dt = Math.min(Math.max((now - last) / 1000, 1 / 240), 1 / 20); last = now;
    const t = clock.getElapsedTime();
    update(dt, t);
    renderer.render(scene, camera);
    const settled = Math.abs(angle - angleTarget) < 0.01 && Math.abs(angleVelocity) < 0.05;
    const onScreen = stage.getBoundingClientRect().bottom > 0;
    if ((!settled || dirty || progress < 0.2) && onScreen) { dirty = false; raf = requestAnimationFrame(tick); }
  }
  function schedule() { if (!raf && !disposed) { last = performance.now(); raf = requestAnimationFrame(tick); } }

  const onInput = () => { usingSlider = true; progress = 0.14 + (scrub.value / 1000) * 0.86; schedule(); };
  const onChange = () => { setTimeout(() => { usingSlider = false; fromScroll(); }, 1200); };
  const onResize = () => { layout(); dirty = true; schedule(); };
  scrub.addEventListener('input', onInput);
  scrub.addEventListener('change', onChange);
  addEventListener('scroll', fromScroll, { passive: true });
  addEventListener('resize', onResize);
  layout(); fromScroll(); schedule();

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    scrub.removeEventListener('input', onInput);
    scrub.removeEventListener('change', onChange);
    removeEventListener('scroll', fromScroll);
    removeEventListener('resize', onResize);
    pmrem.dispose();
    renderer.dispose();
  };
}
