// Ported from the app's DuoCore: FoldGeometry, Homography, FoldCurve.

export const presets = {
  duo:       { startAngle: 95,  span: 60, blurRadius: 120, blurFloor: 0, dimming: 1,   dimStart: 0, dimReach: 0.55, dimHingeFloor: 0.2,  depth: 1,   eyeDistance: 4.0, eyeHeight: 0, sheen: 0.3,  grain: 0.5 },
  soft:      { startAngle: 90,  span: 50, blurRadius: 70,  blurFloor: 0, dimming: 0.7, dimStart: 0, dimReach: 0.75, dimHingeFloor: 0.1,  depth: 0.8, eyeDistance: 4.0, eyeHeight: 0, sheen: 0.25, grain: 0.5 },
  cinematic: { startAngle: 105, span: 70, blurRadius: 150, blurFloor: 0, dimming: 1,   dimStart: 0, dimReach: 0.5,  dimHingeFloor: 0.25, depth: 1.2, eyeDistance: 3.0, eyeHeight: 0, sheen: 0.5,  grain: 0.5 },
};

export const smoothstep = t => { t = Math.min(Math.max(t, 0), 1); return t * t * (3 - 2 * t); };

/// The default eye: in front of the screen centre at the start pose, as the
/// app assumes when it cannot know where the person is. Points, hinge at
/// the origin, y up, z towards the viewer.
export function defaultEye(effect, W, H) {
  const start = effect.startAngle * Math.PI / 180;
  const centre = { y: H / 2 * Math.sin(start), z: H / 2 * Math.cos(start) };
  const normal = { y: -Math.cos(start), z: Math.sin(start) };
  const up = { y: Math.sin(start), z: Math.cos(start) };
  const reach = effect.eyeDistance * H, lift = effect.eyeHeight * H;
  return { x: W / 2, y: centre.y + normal.y * reach + up.y * lift, z: centre.z + normal.z * reach + up.z * lift };
}

/// Where the four corners of the frozen picture land on the glass, seen
/// from `eye`. The picture is frozen at the start angle; the glass is at
/// `angle`. From a fixed eye the far edge climbs past the top and the sides
/// converge: the picture recedes behind the glass.
/// `x` for small values, easing to `limit` and never past it.
export const softCap = (x, limit) => limit * Math.tanh(x / limit);

export function corners(effect, W, H, angle, eye = defaultEye(effect, W, H)) {
  const travel = Math.max(effect.startAngle - angle, 0);
  const separation = softCap(effect.depth * travel, 50);
  const lid = angle * Math.PI / 180, pic = (angle + separation) * Math.PI / 180;
  const n = { y: -Math.cos(lid), z: Math.sin(lid) };
  const nDotEye = n.y * eye.y + n.z * eye.z;
  function project(px, ph) {
    const q = { x: px, y: ph * Math.sin(pic), z: ph * Math.cos(pic) };
    const d = { x: q.x - eye.x, y: q.y - eye.y, z: q.z - eye.z };
    const nDotD = n.y * d.y + n.z * d.z;
    const t = Math.abs(nDotD) < 1e-9 ? 1 : Math.max(-nDotEye / nDotD, 1e-3);
    const hit = { x: eye.x + t * d.x, y: eye.y + t * d.y, z: eye.z + t * d.z };
    return [hit.x, hit.y * Math.sin(lid) + hit.z * Math.cos(lid)];
  }
  return [project(0, 0), project(W, 0), project(W, H), project(0, H)];
}

export function homography(W, H, c) {
  const [x0, y0] = c[0], [x1, y1] = c[1], [x2, y2] = c[2], [x3, y3] = c[3];
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let g = 0, h = 0;
  if (Math.abs(dx3) > 1e-10 || Math.abs(dy3) > 1e-10) {
    const det = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(det) > 1e-12) { g = (dx3 * dy2 - dx2 * dy3) / det; h = (dx1 * dy3 - dx3 * dy1) / det; }
  }
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, cc = x0, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
  return [a / W, d / W, g / W, b / H, e / H, h / H, cc, f, 1];
}

export function invert3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
}

export function apply(m, x, y) {
  const X = m[0] * x + m[3] * y + m[6], Y = m[1] * x + m[4] * y + m[7], Z = m[2] * x + m[5] * y + m[8];
  return [X / Z, Y / Z];
}

/// Everything the shader needs for one frame.
export function frame(effect, W, H, angle, eye) {
  const progress = smoothstep((effect.startAngle - angle) / effect.span);
  const c = corners(effect, W, H, angle, eye);
  const inverse = invert3(homography(W, H, c));
  const top = apply(inverse, W / 2, H);
  const visibleTop = Math.min(Math.max(top[1] / H, 0.2), 1);
  const envelope = 4 * progress * (1 - progress);
  // As the picture turns edge-on to the glass it goes dark like a surface at
  // a grazing angle, and the whole glass frosts rather than streaking.
  const separation = Math.min(effect.depth * Math.max(effect.startAngle - angle, 0), 84);
  const recede = Math.max(Math.pow(Math.cos(separation * Math.PI / 180), 1.3), 0.05);
  const blurFloor = Math.max(effect.blurFloor, smoothstep((separation / 84 - 0.3) / 0.6));
  return {
    inverse, visibleTop, progress, recede, blurFloor, topEdge: c[2][1],
    blurStrength: Math.pow(progress, 1.6),
    dimStrength: Math.pow(progress, 0.7),
    sheenAmount: effect.sheen * 0.16 * Math.pow(envelope, 1.5),
    sheenPos: 0.15 + 0.75 * progress,
  };
}
