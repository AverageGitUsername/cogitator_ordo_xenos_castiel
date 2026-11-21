import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { loadArmoryCast } from './armoryCast.js';
import { buildPracticeMannequin } from './practiceMannequin.js';
import { visorPrelude } from './visorScenario.js';

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
  const receiverHeads = [buildPracticeMannequin(), new T.Group()];
  receiverHeads.forEach(head => receiver.add(head));

  const array = receiverHeads[1];
  for (const side of [-1, 1]) {
    block(array, deck, 0, .9, side * .48, .57, 1.12, .31);
    for (let i = 0; i < 4; i += 1) {
      block(array, trim, .05, .56 + i * .154, side * .64, .37, .058, .04);
    }
  }
  block(array, trim, 0, 1.5, 0, .76, .82, 1.61, .18);
  for (let i = -2; i <= 2; i += 1) {
    const cell = mesh(array, new T.CylinderGeometry(.20, .15, .23, 6), i === 0 ? strip : steel, -.39, 1.55 + (Math.abs(i) % 2) * .15, i * .266);
    cell.rotation.z = Math.PI / 2;
  }

  return { emitter, emitterHeads, receiverHeads, receiver };
}

function buildDisplayCapsule() {
  const capsule = new T.Group();
  const axis = new T.Group();
  axis.rotation.x = Math.PI / 2;
  capsule.add(axis);

  // A solid decorative profile for the animated prop.
  const silhouette = [
    [0, -.38], [.085, -.38], [.13, -.32], [.13, .04], [.117, .135],
    [.093, .24], [.052, .34], [.016, .395], [0, .40],
  ].map(([radius, length]) => new T.Vector2(radius, length));
  axis.add(new T.Mesh(new T.LatheGeometry(silhouette, 48), alloy(0x9e8862, .65, .30)));
  const finGeometry = new RoundedBoxGeometry(.24, .09, .038, 2, .013);
  const finMaterial = alloy(0x4a3332, .61, .37);
  for (let index = 0; index < 3; index += 1) {
    const angle = index * (2 * Math.PI / 3);
    const fin = new T.Mesh(finGeometry, finMaterial);
    fin.position.set(Math.cos(angle) * .105, -.29, Math.sin(angle) * .105);
    fin.rotation.y = -angle;
    axis.add(fin);
  }

  const collar = lamp(0xffffff, 1.8);
  for (const y of [-.24, -.18]) {
    const hoop = new T.Mesh(new T.TorusGeometry(.129, .012, 10, 48), collar);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = y;
    axis.add(hoop);
  }
  return { capsule, collar };
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

export function createVisorScene(canvas, onCastReady) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  const scene = new T.Scene();
  scene.background = new T.Color();
  scene.fog = new T.FogExp2(0, .021);
  const camera = new T.PerspectiveCamera(38, 1, .1, 130);
  const overview = new T.Vector3(-3.5, 6.7, 18).normalize();
  const narrowOverview = new T.Vector3(-10, 8, 11).normalize();
  const portrait = new T.Vector3(2.5, 1.0, 6).normalize();
  const receiverAngle = new T.Vector3(-4, 1.6, 6).normalize();
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

  const deck = alloy(0xffffff, .40, .56);
  const trim = alloy(0xffffff, .62, .29);
  const strip = lamp(0xffffff);
  const models = buildTestBay(scene, deck, trim, strip);
  const guide = makeLine(0xffffff, .65);
  const wake = makeLine(0xffffff, .98);
  const { capsule, collar } = buildDisplayCapsule();
  const flare = new T.PointLight(0xffffff, 0, 8, 2);
  const glowMap = makeGlowTexture();
  const launchGlow = new T.Sprite(new T.SpriteMaterial({
    map: glowMap, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  }));
  const eventPulse = buildPulse(scene, .12, glowMap);
  const endPulse = buildPulse(scene, .16, glowMap);
  const floor = new T.GridHelper(112, 56, 0x5e4b56, 0x5e4b56);
  floor.position.y = -.71;
  floor.material.transparent = true;
  floor.material.opacity = .23;
  scene.add(guide, wake, capsule, flare, launchGlow, floor);

  let scenario;
  let palette;
  let cast = null;
  let pendingCast = null;
  let view = 'overview';
  let fittedDistance = 0;
  let manualView = false;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let dirty = true;
  let wasPlaying = false;
  const launch = new T.Vector3(originX, 1.45, 0);
  const receiverPoint = new T.Vector3();
  const eventCenter = new T.Vector3();
  const endCenter = new T.Vector3();
  const offset = new T.Vector3();
  const horizontal = new T.Vector3();
  const vertical = new T.Vector3();
  const relative = new T.Vector3();
  const facing = new T.Vector3();

  canvas.dataset.castStatus = 'loading';
  loadArmoryCast().then(loaded => {
    pendingCast = loaded;
  }).catch(() => {
    canvas.dataset.castStatus = 'fallback';
  });

  function path(t, point) {
    const height = Math.sin(Math.PI * t) * scenario.rise;
    const bend = scenario.ammo === 0 ? Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * t) * .82 : 0;
    return point.set(
      T.MathUtils.lerp(launch.x, receiverPoint.x, t),
      T.MathUtils.lerp(launch.y, receiverPoint.y, t) + height,
      T.MathUtils.lerp(launch.z, receiverPoint.z, t) + bend,
    );
  }

  controls.addEventListener('change', () => { dirty = true; });
  controls.addEventListener('start', () => { manualView = true; });

  function setView(value) {
    view = value;
    fittedDistance = 0;
    manualView = false;
  }

  function fitOverview(left, right, aspect) {
    horizontal.crossVectors(camera.up, offset).normalize();
    vertical.crossVectors(offset, horizontal);
    const slope = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
    let distance = 0;
    for (const x of [left - .65, left + .65, right - .65, right + .65]) {
      for (const y of [0, 2.82]) {
        for (const z of [-.68, .68]) {
          relative.set(x, y, z).sub(controls.target);
          const edge = Math.max(
            Math.abs(relative.dot(horizontal)) / (slope * aspect * .90),
            Math.abs(relative.dot(vertical)) / (slope * .82),
          );
          distance = Math.max(distance, relative.dot(offset) + edge);
        }
      }
    }
    return Math.max(9.8, distance);
  }

  function resize(width, height) {
    const aspect = width / height;
    const left = cast?.stage.position.x ?? -7.65;
    const right = scenario?.targetX ?? 4.93;
    const zoom = fittedDistance ? controls.getDistance() / fittedDistance : 1;
    const defaultAngle = view === 'cast' ? portrait
      : view === 'receiver' ? receiverAngle
      : aspect < 1.12 ? narrowOverview : overview;
    offset.copy(manualView ? relative.copy(camera.position).sub(controls.target).normalize() : defaultAngle);
    if (view === 'cast') controls.target.set(left + .32, 1.35, .02);
    else if (view === 'receiver') controls.target.set(right, 1.35, 0);
    else controls.target.set((left + right) / 2, 1.22, 0);
    const nextFit = view === 'overview' ? fitOverview(left, right, aspect) : Math.max(5.6, 3.5 / aspect);
    fittedDistance = nextFit;
    controls.minDistance = nextFit * .36;
    controls.maxDistance = nextFit * 1.85;
    camera.position.copy(controls.target).addScaledVector(offset, nextFit * zoom);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    controls.update();
    if (viewportWidth !== width || viewportHeight !== height) {
      renderer.setSize(width, height, false);
      viewportWidth = width;
      viewportHeight = height;
    }
    dirty = true;
  }

  function render(config, mode, elapsed) {
    if (pendingCast && elapsed === null) {
      cast = pendingCast;
      pendingCast = null;
      scene.add(cast.stage);
      launch.copy(cast.launchPoint);
      const characterLight = new T.PointLight(0xffddc6, 22, 7, 2);
      characterLight.position.copy(cast.stage.position).add(new T.Vector3(1.2, 3.4, 2.1));
      scene.add(characterLight);
      models.emitter.visible = false;
      canvas.dataset.castStatus = 'ready';
      onCastReady();
      scenario = null;
    }
    if (scenario !== config) {
      const reframe = !scenario || scenario.targetX !== config.targetX;
      scenario = config;
      models.receiver.position.x = scenario.targetX;
      receiverPoint.set(scenario.targetX - .27, scenario.target === 0 ? 1.97 : 1.55, scenario.target === 0 ? .10 : 0);
      if (reframe && view !== 'cast' && viewportWidth && viewportHeight) resize(viewportWidth, viewportHeight);
      models.receiverHeads.forEach((model, index) => { model.visible = index === scenario.target; });
      models.emitterHeads.forEach((model, index) => { model.visible = index === scenario.emitter; });
      guide.material.color.setHex(scenario.trace.color);
      wake.material.color.setHex(scenario.trace.color);
      collar.color.setHex(scenario.trace.color);
      collar.emissive.copy(collar.color);
      flare.color.setHex(scenario.trace.color);
      launchGlow.material.color.setHex(colors[scenario.emitter]);
      launchGlow.position.copy(launch);
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
    const flightTime = playing ? elapsed - visorPrelude : -1;
    guide.visible = view === 'overview' || flightTime >= 0;
    const end = scenario.flight * scenario.trace.end;
    const head = flightTime / scenario.flight;
    const visible = flightTime >= 0 && head < scenario.trace.end;
    if (wake.visible !== visible) dirty = true;
    wake.visible = capsule.visible = visible;
    if (cast) {
      const raised = playing
        ? T.MathUtils.smoothstep(elapsed, 0, visorPrelude) * (1 - T.MathUtils.smoothstep(flightTime, end, end + .53))
        : 0;
      const accent = flightTime < 0 ? 0 : 1 - T.MathUtils.smoothstep(flightTime, 0, .21);
      cast.pose(raised, accent);
    }
    launchGlow.visible = flightTime >= 0 && flightTime < .17;
    if (launchGlow.visible) {
      const fade = 1 - flightTime / .17;
      launchGlow.scale.setScalar(.55 + (1 - fade) * .69);
      launchGlow.material.opacity = fade;
    }
    if (visible) {
      path(head, capsule.position);
      capsule.lookAt(path(Math.min(1, head + .005), facing));
      writeTrace(wake, path, Math.max(0, head - [.18, .32, .12][scenario.ammo]), head);
    }
    eventPulse(flightTime - scenario.flight * scenario.trace.event, eventCenter, scenario, .82);
    endPulse(scenario.trace.end > scenario.trace.event ? flightTime - end : -1, endCenter, scenario, .96);
    flare.position.copy(launchGlow.visible ? launch : visible ? capsule.position : endCenter);
    flare.intensity = flightTime < 0 ? 0
      : launchGlow.visible ? launchGlow.material.opacity * 15
      : visible ? 8
      : 19 * Math.max(0, 1 - (flightTime - end) * 3);
    if (dirty || playing) {
      renderer.render(scene, camera);
      dirty = false;
    }
  }

  return { render, resize, setView };
}
