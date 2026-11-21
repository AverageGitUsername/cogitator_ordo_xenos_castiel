import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const palettes = [
  { background: 0x160e17, ambient: 0xc8c0e3, key: 0xffd9bf, rim: 0xec5563, deck: 0x393644, trim: 0x886c61, signal: 0xff945a },
  { background: 0x17180e, ambient: 0xccc792, key: 0xffecc1, rim: 0x9ea748, deck: 0x373c2d, trim: 0x8e8553, signal: 0xf5ce57 },
  { background: 0x091b16, ambient: 0x8dc8b4, key: 0xc7fae4, rim: 0x44c991, deck: 0x22433d, trim: 0x5e8d78, signal: 0x86ffc7 },
];

const colors = [0xffac68, 0x7de8ff, 0xef92ff];
const originX = -6.65;
const pointCount = 97;

function alloy(color, metalness = .45, roughness = .36) {
  return new T.MeshStandardMaterial({ color, metalness, roughness });
}

function lamp(color, strength = 1.7) {
  return new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: strength });
}

function modelBuilder() {
  const shapes = new Map();
  function mesh(parent, shape, material, x, y, z) {
    const part = new T.Mesh(shape, material);
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  }

  function block(parent, material, x, y, z, w, h, d, radius = .06) {
    const key = [w, h, d, radius].join('/');
    if (!shapes.has(key)) {
      shapes.set(key, new RoundedBoxGeometry(w, h, d, 2, radius));
    }
    return mesh(parent, shapes.get(key), material, x, y, z);
  }

  return { mesh, block };
}

function buildTestBay(scene, deck, trim, strip) {
  const { mesh, block } = modelBuilder();
  const dark = alloy(0x151820, .32);
  const steel = alloy(0x85848d);
  const ceramic = alloy(0x605966, .17, .58);
  const fastener = new T.CylinderGeometry(.062, .062, .035, 8);
  const track = new T.Group();
  scene.add(track);

  block(track, dark, 0, -.36, 0, 20.5, .65, 7.6, .18);
  block(track, trim, 0, -.12, 0, 20.3, .14, 7.43);
  for (let i = -4; i <= 4; i += 1) {
    const x = i * 2.23;
    block(track, deck, x, -.055, 0, 2.18, .10, 5.83, .025);
    for (const side of [-1, 1]) {
      block(track, dark, x, -.04, side * 3.29, 2.08, .13, .54);
      block(track, strip, x, .034, side * 3.29, .87, .014, .045);
      block(track, steel, x, -.35, side * 3.79, 1.30, .095, .042);
      for (const dx of [-.94, .94]) mesh(track, fastener, trim, x + dx, .012, side * 2.72);
    }
  }
  for (const side of [-1, 1]) {
    block(track, dark, 0, .021, side * .79, 19.4, .044, .11);
    block(track, steel, 0, .048, side * .79, 19.2, .021, .021);
    for (const x of [-9.7, 9.7]) {
      block(track, trim, x, .02, side * 2.74, .37, .13, 1.31);
      block(track, strip, x, .09, side * 2.74, .062, .018, .69);
    }
  }

  const emitter = new T.Group();
  emitter.position.x = -7.65;
  scene.add(emitter);
  block(emitter, dark, 0, .13, 0, 2.17, .26, 2.43, .12);
  block(emitter, steel, 0, .28, 0, 1.72, .12, 1.72);
  mesh(emitter, new T.CylinderGeometry(.44, .67, .93, 40), deck, 0, .75, 0);
  mesh(emitter, new T.CylinderGeometry(.53, .53, .14, 40), trim, 0, .57, 0);
  block(emitter, ceramic, -.26, 1.42, 0, 1.48, .66, .99, .19);
  for (const side of [-1, 1]) {
    block(emitter, steel, -.36, 1.38, side * .49, 1.1, .31, .13);
    for (let i = 0; i < 5; i += 1) {
      block(emitter, dark, -.72 + i * .18, 1.38, side * .568, .048, .22, .032, .012);
    }
  }
  const emitterHeads = colors.map((color, index) => {
    const head = new T.Group();
    const light = lamp(color);
    mesh(head, new T.CylinderGeometry(.37, .30, .69, 48), trim, .49, 1.45, 0).rotation.z = Math.PI / 2;
    const ring = new T.TorusGeometry(.34 + index * .055, .03, 12, 56);
    for (let i = 0; i <= index; i += 1) {
      mesh(head, ring, light, .59 + i * .15, 1.45, 0).rotation.y = Math.PI / 2;
    }
    mesh(head, new T.SphereGeometry(.23, 32, 24), light, .87, 1.45, 0).scale.x = .52;
    for (const side of [-1, 1]) {
      block(head, steel, .57, 1.45, side * (.41 + index * .045), .46, .22, .17);
    }
    emitter.add(head);
    return head;
  });

  const receiver = new T.Group();
  scene.add(receiver);
  block(receiver, dark, 0, .11, 0, 2.39, .22, 2.57, .13);
  block(receiver, deck, 0, .27, 0, 1.97, .20, 2.19, .10);
  const receiverHeads = [new T.Group(), new T.Group()];
  receiverHeads.forEach(head => receiver.add(head));

  const [core, array] = receiverHeads;
  for (const side of [-1, 1]) {
    block(core, ceramic, 0, 1.07, side * .65, .88, 1.34, .31, .12);
    block(core, steel, .10, 1.45, side * .76, .73, .57, .19, .08);
    block(core, strip, -.10, 1.11, side * .875, .39, .055, .026);
    block(array, deck, 0, .9, side * .48, .57, 1.12, .31);
    for (let i = 0; i < 4; i += 1) {
      block(array, trim, .05, .56 + i * .154, side * .64, .37, .058, .04);
    }
  }
  const torus = new T.TorusGeometry(.51, .077, 16, 64);
  mesh(core, torus, trim, .06, 1.55, 0).rotation.y = Math.PI / 2;
  mesh(core, new T.TorusGeometry(.385, .021, 12, 64), strip, -.045, 1.55, 0).rotation.y = Math.PI / 2;
  mesh(core, new T.IcosahedronGeometry(.32, 3), alloy(0xc18c83, .26, .2), .09, 1.55, 0).scale.x = .68;
  block(array, trim, 0, 1.5, 0, .76, .82, 1.61, .18);
  for (let i = -2; i <= 2; i += 1) {
    const cell = mesh(array, new T.CylinderGeometry(.20, .15, .23, 6), i === 0 ? strip : steel, -.39, 1.55 + (Math.abs(i) % 2) * .15, i * .266);
    cell.rotation.z = Math.PI / 2;
  }

  return { emitterHeads, receiverHeads, receiver };
}

function makeLine(color, opacity) {
  const geometry = new T.BufferGeometry();
  const positions = new T.BufferAttribute(new Float32Array(pointCount * 3), 3);
  positions.setUsage(T.DynamicDrawUsage);
  geometry.setAttribute('position', positions);
  const line = new T.Line(geometry, new T.LineBasicMaterial({
    color, opacity, transparent: true, depthWrite: false,
  }));
  line.frustumCulled = false;
  return line;
}

function writeTrace(line, path, start, end) {
  const point = new T.Vector3();
  const positions = line.geometry.attributes.position;
  for (let i = 0; i < pointCount; i += 1) {
    path(start + (end - start) * i / (pointCount - 1), point);
    positions.setXYZ(i, point.x, point.y, point.z);
  }
  positions.needsUpdate = true;
}

function buildPulse(scene, size, glowMap) {
  const count = 56;
  const geometry = new T.BufferGeometry();
  const positions = new T.BufferAttribute(new Float32Array(count * 3), 3);
  geometry.setAttribute('position', positions);
  const dust = new T.Points(geometry, new T.PointsMaterial({
    color: 0xffffff, transparent: true, depthWrite: false,
    size, blending: T.AdditiveBlending,
  }));
  const ring = new T.Mesh(
    new T.TorusGeometry(.8, .017, 8, 64),
    new T.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending }),
  );
  const glow = new T.Sprite(new T.SpriteMaterial({
    map: glowMap, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  }));
  dust.frustumCulled = false;
  scene.add(dust, ring, glow);

  return (age, center, profile, strength) => {
    const visible = age >= 0 && age < .68;
    dust.visible = ring.visible = glow.visible = visible;
    if (!visible) return;
    const progress = age / .68;
    dust.material.color.setHex(profile.trace.color);
    dust.material.opacity = (1 - progress) * strength;
    dust.material.size = size * (.5 + (1 - progress) * .6);
    ring.position.copy(center);
    ring.rotation.set(profile.ammo === 2 ? -Math.PI / 2 : 0, profile.ammo === 2 ? 0 : Math.PI / 2, 0);
    ring.material.color.copy(dust.material.color);
    ring.material.opacity = (1 - progress) * strength * .75;
    ring.scale.setScalar(.10 + progress * (profile.ammo === 2 ? 2.5 : 1.4));
    glow.position.copy(center);
    glow.material.color.copy(dust.material.color);
    glow.material.opacity = (1 - progress) ** 2 * strength;
    glow.scale.setScalar((.6 + progress * 2.2) * (profile.ammo === 2 ? 1.55 : 1));

    for (let i = 0; i < count; i += 1) {
      const angle = i * 2.39996;
      const spread = progress * (.4 + (i % 11) / 8) * (profile.ammo === 2 ? 1.6 : 1);
      positions.setXYZ(i,
        center.x + Math.cos(angle) * spread * (profile.ammo === 1 ? .42 : .86),
        Math.max(.05, center.y + Math.sin(angle) * spread - progress * progress * .38),
        center.z + Math.sin(i * 1.73) * spread);
    }
    positions.needsUpdate = true;
  };
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(.18, 'rgba(255,255,255,.65)');
  gradient.addColorStop(.57, 'rgba(255,255,255,.16)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new T.CanvasTexture(canvas);
}

export function createVisorScene(canvas) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  const scene = new T.Scene();
  scene.background = new T.Color();
  scene.fog = new T.FogExp2(0, .021);
  const camera = new T.PerspectiveCamera(38, 1, .1, 130);
  const home = new T.Vector3(4.5, 10, 18).normalize();
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, .85, 0);
  controls.minPolarAngle = .13;
  controls.maxPolarAngle = Math.PI * .49;
  controls.enablePan = false;
  controls.rotateSpeed = .67;

  const fill = new T.HemisphereLight(0xffffff, 0x422029, 2.15);
  const key = new T.DirectionalLight(0xffffff, 3.1);
  const rim = new T.DirectionalLight(0xffffff, 2.65);
  key.position.set(-7, 11, 5);
  rim.position.set(4, 5, -7);
  scene.add(fill, key, rim);

  const deck = alloy(0xffffff);
  const trim = alloy(0xffffff, .62, .29);
  const strip = lamp(0xffffff);
  const models = buildTestBay(scene, deck, trim, strip);
  const guide = makeLine(0xffffff, .65);
  const wake = makeLine(0xffffff, .98);
  const mark = new T.Mesh(new T.SphereGeometry(.11, 24, 16), new T.MeshBasicMaterial({ color: 0xffffff }));
  const flare = new T.PointLight(0xffffff, 0, 8, 2);
  const glowMap = makeGlowTexture();
  const eventPulse = buildPulse(scene, .12, glowMap);
  const endPulse = buildPulse(scene, .16, glowMap);
  const floor = new T.GridHelper(112, 56, 0x5e4b56, 0x5e4b56);
  floor.position.y = -.71;
  floor.material.transparent = true;
  floor.material.opacity = .23;
  scene.add(guide, wake, mark, flare, floor);

  let scenario;
  let palette;
  let fittedDistance = 0;
  let dirty = true;
  let wasPlaying = false;
  const eventCenter = new T.Vector3();
  const endCenter = new T.Vector3();
  const offset = new T.Vector3();

  function path(t, point) {
    const height = Math.sin(Math.PI * t) * scenario.rise;
    const bend = scenario.ammo === 0 ? Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * t) * .82 : 0;
    return point.set(T.MathUtils.lerp(originX, scenario.targetX - .30, t), 1.45 + height + .10 * t, bend);
  }

  controls.addEventListener('change', () => { dirty = true; });

  function resize(width, height) {
    const aspect = width / height;
    const nextFit = Math.max(24, 32 / aspect);
    const zoom = fittedDistance ? controls.getDistance() / fittedDistance : 1;
    offset.copy(fittedDistance ? camera.position.clone().sub(controls.target).normalize() : home);
    fittedDistance = nextFit;
    controls.minDistance = nextFit * .36;
    controls.maxDistance = nextFit * 1.85;
    camera.position.copy(controls.target).addScaledVector(offset, nextFit * zoom);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize(width, height, false);
    dirty = true;
  }

  function render(config, mode, elapsed) {
    if (scenario !== config) {
      scenario = config;
      models.receiver.position.x = scenario.targetX;
      models.receiverHeads.forEach((model, index) => { model.visible = index === scenario.target; });
      models.emitterHeads.forEach((model, index) => { model.visible = index === scenario.emitter; });
      guide.material.color.setHex(scenario.trace.color);
      wake.material.color.setHex(scenario.trace.color);
      mark.material.color.setHex(scenario.trace.color).lerp(new T.Color(0xffffff), .76);
      flare.color.setHex(scenario.trace.color);
      writeTrace(guide, path, 0, scenario.trace.end);
      path(scenario.trace.event, eventCenter);
      path(scenario.trace.end, endCenter);
      dirty = true;
    }
    if (palette !== palettes[mode]) {
      palette = palettes[mode];
      scene.background.setHex(palette.background);
      scene.fog.color.copy(scene.background);
      fill.color.setHex(palette.ambient);
      key.color.setHex(palette.key);
      rim.color.setHex(palette.rim);
      deck.color.setHex(palette.deck);
      trim.color.setHex(palette.trim);
      strip.color.setHex(palette.signal);
      strip.emissive.copy(strip.color);
      dirty = true;
    }

    const playing = elapsed !== null;
    if (!dirty && !playing && !wasPlaying) return;
    if (wasPlaying !== playing) dirty = true;
    wasPlaying = playing;
    const head = playing ? elapsed / scenario.flight : 0;
    const visible = playing && head < scenario.trace.end;
    if (wake.visible !== visible) dirty = true;
    wake.visible = mark.visible = visible;
    if (visible) {
      path(head, mark.position);
      writeTrace(wake, path, Math.max(0, head - [.18, .32, .12][scenario.ammo]), head);
    }
    eventPulse(playing ? elapsed - scenario.flight * scenario.trace.event : -1, eventCenter, scenario, .82);
    endPulse(playing && scenario.trace.end > scenario.trace.event ? elapsed - scenario.flight : -1, endCenter, scenario, .96);
    flare.position.copy(visible ? mark.position : endCenter);
    flare.intensity = playing ? (visible ? 8 : 19 * Math.max(0, 1 - (elapsed - scenario.flight * scenario.trace.end) * 3)) : 0;
    if (dirty || playing) {
      renderer.render(scene, camera);
      dirty = false;
    }
  }

  return { render, resize };
}
