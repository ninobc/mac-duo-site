// The fold, as a screen material. Same construction as the app's Metal
// shader: each screen pixel maps back into the frozen picture through the
// inverse of the perspective; frost, dimming and sheen follow the picture's
// height above the hinge, normalised to what the glass still shows.
export const vertexShader = /* glsl */`
  varying vec2 vUv;
  uniform vec2 screenMin, screenExtent;
  void main() {
    // Address the screen by where the vertex sits on the lid, not by the
    // asset's UVs: bottom-left of the display is (0,0), top-right is (1,1).
    vUv = (position.xy - screenMin) / screenExtent;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */`
  layout(location = 0) out highp vec4 pc_fragColor;
  #define gl_FragColor pc_fragColor
  varying vec2 vUv;
  uniform sampler2D picture;
  uniform mat3 toPicture;
  uniform vec2 screenSize, paddedOrigin, paddedSize;
  uniform float textureScale, maxRadius, blurStrength, blurFloor, maxDim, maxLevel, dimStart, dimReach, dimHinge, dimStrength, visibleTop, sheenAmount, sheenPos, grain, time, brightness, recede, topEdge;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 screenPoint = vUv * screenSize;
    float above = max(screenPoint.y - (topEdge - 2.0), 0.0);
    screenPoint.y = min(screenPoint.y, topEdge - 2.0);
    vec3 m = toPicture * vec3(screenPoint, 1.0);
    vec2 pp = m.xy / m.z;
    if (m.z < 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
    vec2 edge = max(-pp, pp - screenSize);
    float outside = max(max(edge.x, edge.y), 0.0);
    vec2 cp = clamp(pp, vec2(0.0), screenSize);
    vec2 tc = (cp - paddedOrigin) / paddedSize;
    float height = clamp(cp.y / screenSize.y, 0.0, 1.0);
    float g = clamp(height / max(visibleTop, 0.25), 0.0, 1.0);
    float blur = blurStrength * (blurFloor + (1.0 - blurFloor) * pow(g, 1.35));
    float radius = blur * maxRadius;
    radius = max(radius, smoothstep(0.0, 24.0, outside) * 0.35 * maxRadius);
    float lod = clamp(log2(max(radius, 1.0)), 0.0, maxLevel);
    vec3 colour = vec3(0.0);
    if (radius < 0.75) {
      colour = textureLod(picture, tc, 0.0).rgb;
    } else {
      vec2 texel = 1.0 / (paddedSize * textureScale);
      vec2 stride = texel * radius * 0.45;
      float w[3]; w[0] = 1.0; w[1] = 2.0; w[2] = 1.0;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
        colour += textureLod(picture, tc + vec2(float(x), float(y)) * stride, lod).rgb * w[x + 1] * w[y + 1] / 16.0;
      }
    }
    float glowReach = max(1.6 * maxRadius / textureScale, 48.0);
    colour *= mix(1.0, 0.45, smoothstep(0.0, glowReach * 2.5, outside));
    float spread = smoothstep(dimStart, max(dimReach, dimStart + 0.05), g);
    float dim = dimStrength * (dimHinge + (1.0 - dimHinge) * spread) * maxDim;
    colour *= pow(1.0 - dim, 2.0) * recede;
    colour *= exp(-pow(above / max(0.22 * screenSize.y, 1.0), 1.4));
    if (sheenAmount > 0.0005) {
      float band = exp(-pow((g - sheenPos) / 0.22, 2.0));
      vec3 average = textureLod(picture, vec2(0.5), maxLevel).rgb;
      colour += sheenAmount * band * (0.55 + 0.45 * average) * (1.0 - 0.5 * dim) * recede;
    }
    colour += (hash(gl_FragCoord.xy + fract(time) * 17.0) - 0.5) * grain * (2.5 / 255.0);
    gl_FragColor = vec4(max(colour, 0.0) * brightness, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
