import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { loadArmoryCast } from './armoryCast.js';
import { buildPracticeMannequin } from './practiceMannequin.js';
import { maxDummies, maxRounds, visorPrelude } from './visorScenario.js';

const palettes = [
  { background: 0x120608, ambient: 0xc8b2b6, key: 0xffd2be, rim: 0xd92638, deck: 0x2b2226, trim: 0x735248, signal: 0xff4238 },
  { background: 0x17180e, ambient: 0xccc792, key: 0xffecc1, rim: 0x9ea748, deck: 0x373c2d, trim: 0x8e8553, signal: 0xf5ce57 },
  { background: 0x091b16, ambient: 0x8dc8b4, key: 0xc7fae4, rim: 0x44c991, deck: 0x22433d, trim: 0x5e8d78, signal: 0x86ffc7 },
];

const colors = [0xffac68, 0x7de8ff, 0xef92ff];
const originX = -6.65;
const pointCount = 48;

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

function dummySlotPosition(index, count) {
  if (count <= 1) return [0, 0, 0];
  if (count <= 5) {
    const spacing = count <= 3 ? 1.25 : 1.0;
    const z = (index - (count - 1) / 2) * spacing;
    const x = Math.abs(z) * 0.16;
    return [x, 0, z];
  }
  const cols = Math.min(7, Math.ceil(Math.sqrt(count * 1.5)));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const rowCount = Math.min(cols, count - row * cols);
  const stagger = (row % 2) * 0.38;
  const z = (col - (rowCount - 1) / 2) * 0.86 + (stagger - 0.19);
  const x = row * 0.95;
  return [x, 0, z];
}

function buildTestBay(scene, deck, trim, strip) {
  const { mesh, block } = modelBuilder();
  const dark = alloy(0x151820, .32);
  const steel = alloy(0x85848d);
  const ceramic = alloy(0x605966, .17, .58);
  const fastener = new T.CylinderGeometry(.062, .062, .035, 8);
  const track = new T.Group();
  scene.add(track);

  block(track, dark, 0, -.36, 0, 20.5, .65, 8.6, .18);
  block(track, trim, 0, -.12, 0, 20.3, .14, 8.43);
  for (let i = -4; i <= 4; i += 1) {
    const x = i * 2.23;
    block(track, deck, x, -.055, 0, 2.18, .10, 6.83, .025);
    for (const side of [-1, 1]) {
      block(track, dark, x, -.04, side * 3.79, 2.08, .13, .54);
      block(track, strip, x, .034, side * 3.79, .87, .014, .045);
      block(track, steel, x, -.35, side * 4.29, 1.30, .095, .042);
      for (const dx of [-.94, .94]) mesh(track, fastener, trim, x + dx, .012, side * 3.22);
    }
  }
  for (const side of [-1, 1]) {
    block(track, dark, 0, .021, side * .79, 19.4, .044, .11);
    block(track, steel, 0, .048, side * .79, 19.2, .021, .021);
    for (const x of [-9.7, 9.7]) {
      block(track, trim, x, .02, side * 3.14, .37, .13, 1.31);
      block(track, strip, x, .09, side * 3.14, .062, .018, .69);
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
  block(receiver, dark, .2, .06, 0, 2.9, .12, 6.4, .12);
  block(receiver, deck, .2, .15, 0, 2.4, .10, 5.9, .08);

  const dummies = [];
  function ensureDummies(count) {
    const target = Math.min(maxDummies, Math.max(1, count));
    while (dummies.length < target) {
      const dummy = buildPracticeMannequin();
      receiver.add(dummy.mannequin);
      dummies.push(dummy);
    }
  }
  ensureDummies(3);

  return { emitter, emitterHeads, receiver, dummies, ensureDummies };
}

function buildDisplayCapsule() {
  const capsule = new T.Group();
  const axis = new T.Group();
  axis.rotation.x = Math.PI / 2;
  axis.scale.set(.11, .34, .11);
  capsule.add(axis);

  const silhouette = [
    [0, -.38], [.085, -.38], [.13, -.32], [.13, .04], [.117, .135],
    [.093, .24], [.052, .34], [.016, .395], [0, .40],
  ].map(([radius, length]) => new T.Vector2(radius, length));
  axis.add(new T.Mesh(new T.LatheGeometry(silhouette, 32), alloy(0x9e8862, .65, .30)));

  const collar = lamp(0xffffff, 2.2);
  const hoop = new T.Mesh(new T.TorusGeometry(.129, .016, 8, 32), collar);
  hoop.rotation.x = Math.PI / 2;
  hoop.position.y = -.21;
  axis.add(hoop);
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

function writeSegmentTrace(line, startPt, endPt, rise, bendAmp, tStart, tEnd) {
  const positions = line.geometry.attributes.position;
  for (let i = 0; i < pointCount; i += 1) {
    const t = tStart + (tEnd - tStart) * i / (pointCount - 1);
    const arch = Math.sin(Math.PI * t) ** 2;
    const bend = bendAmp ? arch * Math.sin(2 * Math.PI * t) * bendAmp : 0;
    positions.setXYZ(
      i,
      T.MathUtils.lerp(startPt.x, endPt.x, t),
      T.MathUtils.lerp(startPt.y, endPt.y, t) + arch * rise,
      T.MathUtils.lerp(startPt.z, endPt.z, t) + bend,
    );
  }
  positions.needsUpdate = true;
}

function buildContactSparks(scene, glowMap) {
  const sparkCount = 16;
  const sparkGeo = new T.BufferGeometry();
  const sparkPos = new T.BufferAttribute(new Float32Array(sparkCount * 6), 3);
  sparkPos.setUsage(T.DynamicDrawUsage);
  sparkGeo.setAttribute('position', sparkPos);
  const sparks = new T.LineSegments(sparkGeo, new T.LineBasicMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  }));
  sparks.frustumCulled = false;

  const bloodCount = 10;
  const bloodGeo = new T.BufferGeometry();
  const bloodPos = new T.BufferAttribute(new Float32Array(bloodCount * 6), 3);
  bloodPos.setUsage(T.DynamicDrawUsage);
  bloodGeo.setAttribute('position', bloodPos);
  const blood = new T.LineSegments(bloodGeo, new T.LineBasicMaterial({
    color: 0xa80c14, transparent: true, depthWrite: false,
  }));
  blood.frustumCulled = false;

  const glow = new T.Sprite(new T.SpriteMaterial({
    map: glowMap, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  }));
  scene.add(sparks, blood, glow);

  return (age, center, profile, isHit) => {
    const duration = .42;
    sparks.visible = age >= 0 && age < duration;
    blood.visible = isHit && age >= 0 && age < .55;
    glow.visible = sparks.visible && age < .11;
    if (!sparks.visible && !blood.visible) return;

    const fade = Math.max(0, 1 - age / duration);
    sparks.material.color.setHex(profile.trace.color).lerp(new T.Color(0xffe3bc), .55);
    sparks.material.opacity = fade * fade;
    glow.position.copy(center);
    glow.material.color.copy(sparks.material.color);
    glow.material.opacity = Math.max(0, 1 - age / .11) * .56;
    glow.scale.setScalar(.36 + age * 2.1);

    for (let i = 0; i < sparkCount; i += 1) {
      const angle = i * 2.39996;
      const speed = 2.1 + (i % 7) * .48;
      const x = -.42 - (i % 5) * .38;
      const y = Math.cos(angle) * speed + .52;
      const z = Math.sin(angle) * speed;
      const tailTime = Math.max(0, age - .045);
      sparkPos.setXYZ(i * 2, center.x + x * age, center.y + y * age - 3.6 * age ** 2, center.z + z * age);
      sparkPos.setXYZ(i * 2 + 1, center.x + x * tailTime, center.y + y * tailTime - 3.6 * tailTime ** 2, center.z + z * tailTime);
    }
    sparkPos.needsUpdate = true;

    if (blood.visible) {
      const bFade = Math.max(0, 1 - age / .55);
      blood.material.opacity = bFade * 0.88;
      for (let i = 0; i < bloodCount; i += 1) {
        const angle = i * 1.93 + .7;
        const speed = 1.1 + (i % 5) * .34;
        const bx = .55 + (i % 4) * .42;
        const by = Math.sin(angle) * speed * .7 + .25;
        const bz = Math.cos(angle) * speed;
        const tailTime = Math.max(0, age - .06);
        bloodPos.setXYZ(i * 2, center.x + bx * age, center.y + by * age - 4.4 * age ** 2, center.z + bz * age);
        bloodPos.setXYZ(i * 2 + 1, center.x + bx * tailTime, center.y + by * tailTime - 4.4 * tailTime ** 2, center.z + bz * tailTime);
      }
      bloodPos.needsUpdate = true;
    }
  };
}

function buildLaunchFlash(scene, glowMap) {
  const group = new T.Group();
  const material = new T.MeshBasicMaterial({
    color: 0xffffff, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  });
  const ray = new T.ConeGeometry(.086, .37, 5);
  ray.rotateX(Math.PI / 2);
  ray.translate(0, 0, .16);
  const core = new T.Mesh(ray, material);
  group.add(core);
  for (const angle of [0, 2.1, 4.2]) {
    const streak = new T.Mesh(ray, material);
    streak.scale.set(.43, .43, .78);
    streak.rotation.set(.42 * Math.cos(angle), .42 * Math.sin(angle), angle);
    group.add(streak);
  }
  const glow = new T.Sprite(new T.SpriteMaterial({
    map: glowMap, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  }));
  scene.add(group, glow);

  return (age, center, forward, color) => {
    const visible = age >= 0 && age < .11;
    group.visible = glow.visible = visible;
    if (!visible) return 0;
    const intensity = 1 - age / .11;
    group.position.copy(center);
    group.lookAt(forward);
    group.scale.setScalar(.85 + age * 3.4);
    material.color.setHex(color);
    material.opacity = intensity * .9;
    glow.position.copy(center);
    glow.material.opacity = intensity * .48;
    glow.material.color.copy(material.color);
    glow.scale.setScalar(.54 + age * 2.4);
    return intensity * 14;
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
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  const scene = new T.Scene();
  scene.background = new T.Color();
  scene.fog = new T.FogExp2(0, .021);
  const camera = new T.PerspectiveCamera(38, 1, .1, 130);
  const overview = new T.Vector3(-7, 5.4, 18).normalize();
  const narrowOverview = new T.Vector3(-10, 8, 11).normalize();
  const portrait = new T.Vector3(2.5, 1.0, 6).normalize();
  const receiverAngle = new T.Vector3(-4.2, 1.8, 6.2).normalize();
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

  const guide = makeLine(0xffffff, .64);
  guide.material.depthTest = false;
  guide.renderOrder = 1;
  const marker = new T.Mesh(new T.RingGeometry(.054, .073, 40), new T.MeshBasicMaterial({
    depthTest: false, depthWrite: false, transparent: true, opacity: .79,
  }));
  marker.renderOrder = 2;
  const flare = new T.PointLight(0xffffff, 0, 8, 2);
  const glowMap = makeGlowTexture();
  const launchFlash = buildLaunchFlash(scene, glowMap);

  const roundPool = Array.from({ length: maxRounds }, () => {
    const wake = makeLine(0xffffff, .94);
    const { capsule, collar } = buildDisplayCapsule();
    wake.visible = false;
    capsule.visible = false;
    scene.add(wake, capsule);
    return {
      wake,
      capsule,
      collar,
      impact: buildContactSparks(scene, glowMap),
      startPt: new T.Vector3(),
      endPt: new T.Vector3(),
      impactPt: new T.Vector3(),
      started: false,
      targetIdx: 0,
      skipped: false,
      hitDone: false,
      wasHit: false,
    };
  });

  const floor = new T.GridHelper(112, 56, 0x5e4b56, 0x5e4b56);
  floor.position.y = -.71;
  floor.material.transparent = true;
  floor.material.opacity = .23;
  scene.add(guide, marker, flare, floor);

  let scenario = null;
  let palette = null;
  let cast = null;
  let pendingCast = null;
  let view = 'overview';
  let fittedDistance = 0;
  let manualView = false;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let dirty = true;
  let wasPlaying = false;
  let launchLocked = false;
  let activeRunRef = null;
  let lastPhysicsTime = null;
  let retreatBlend = 0;

  const launch = new T.Vector3(originX, 1.45, 0);
  const muzzle = launch.clone();
  const receiverPoint = new T.Vector3();
  const endCenter = new T.Vector3();
  const offset = new T.Vector3();
  const horizontal = new T.Vector3();
  const vertical = new T.Vector3();
  const relative = new T.Vector3();
  const facing = new T.Vector3();
  const shotDir = new T.Vector3();
  const navigationKeys = new Set();
  const navigationOffset = new T.Vector3();
  const forward = new T.Vector3();
  const lateral = new T.Vector3();
  const travel = new T.Vector3();
  let lastFrame = null;

  canvas.dataset.castStatus = 'loading';
  loadArmoryCast().then(loaded => {
    pendingCast = loaded;
  }).catch(() => {
    canvas.dataset.castStatus = 'fallback';
  });

  function positionDummies(count) {
    models.ensureDummies(count);
    models.dummies.forEach((dummy, index) => {
      dummy.mannequin.visible = index < count;
      if (index < count) {
        const [x, y, z] = dummySlotPosition(index, count);
        // Platform top surface is at y = 0.20 (deck center 0.15 + half-height 0.05)
        dummy.mannequin.position.set(x, y + .20, z);
      }
    });
  }

  function resetAllDummies() {
    const count = scenario?.dummies ?? models.dummies.length;
    for (let i = 0; i < models.dummies.length; i += 1) {
      models.dummies[i].reset();
      if (i < count) {
        const [x, y, z] = dummySlotPosition(i, count);
        models.dummies[i].mannequin.position.set(x, y + .20, z);
      }
    }
    for (const poolItem of roundPool) {
      poolItem.started = false;
      poolItem.skipped = false;
      poolItem.hitDone = false;
      poolItem.wasHit = false;
      poolItem.wake.visible = false;
      poolItem.capsule.visible = false;
    }
    if (cast) cast.resetStage();
    retreatBlend = 0;
    dirty = true;
  }

  controls.addEventListener('change', () => { dirty = true; });
  controls.addEventListener('start', () => { manualView = true; });

  function setView(value) {
    view = value;
    fittedDistance = 0;
    manualView = false;
    navigationOffset.set(0, 0, 0);
  }

  function setNavigationKey(code, held) {
    if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code)) return false;
    if (held) navigationKeys.add(code);
    else navigationKeys.delete(code);
    return true;
  }

  function stopNavigation() {
    navigationKeys.clear();
    lastFrame = null;
  }

  function navigate(timestamp) {
    const delta = lastFrame === null ? 0 : Math.min((timestamp - lastFrame) / 1000, .05);
    lastFrame = timestamp;
    if (!navigationKeys.size || !delta) return;
    const movement = Number(navigationKeys.has('KeyW')) - Number(navigationKeys.has('KeyS'));
    const strafe = Number(navigationKeys.has('KeyD')) - Number(navigationKeys.has('KeyA'));
    if (!movement && !strafe) return;
    camera.getWorldDirection(forward);
    lateral.crossVectors(forward, camera.up).normalize();
    travel.copy(forward).multiplyScalar(movement).addScaledVector(lateral, strafe);
    travel.normalize().multiplyScalar(delta * Math.max(2.4, controls.getDistance() * .28));
    camera.position.add(travel);
    controls.target.add(travel);
    navigationOffset.add(travel);
    manualView = true;
    if (cast) cast.resetStage();
    retreatBlend = 0;
    dirty = true;
  }

  function fitOverview(left, right, aspect) {
    horizontal.crossVectors(camera.up, offset).normalize();
    vertical.crossVectors(offset, horizontal);
    const slope = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
    let distance = 0;
    const halfZ = Math.max(.9, (scenario?.dummies ?? 1) * .55);
    for (const x of [left - .65, left + .65, right - .65, right + .85]) {
      const height = x < (left + right) / 2 ? 3.14 : 1.95;
      for (const y of [0, height]) {
        for (const z of [-halfZ, halfZ]) {
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
    if (view === 'cast') controls.target.set(left + .40, 1.55, .02);
    else if (view === 'receiver') controls.target.set(right, 1.05, 0);
    else controls.target.set(T.MathUtils.lerp(left, right, .46), 1.38, 0);
    const nextFit = view === 'overview' ? fitOverview(left, right, aspect)
      : view === 'cast' ? Math.max(6.0, 3.8 / aspect) : Math.max(4.4, 3.1 / aspect);
    controls.target.add(navigationOffset);
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
    if (cast) cast.resetStage();
    retreatBlend = 0;
    dirty = true;
  }

  function render(config, mode, elapsed, shots = [], timestamp = performance.now(), onPhysicsEvent = null) {
    if (pendingCast && elapsed === null) {
      cast = pendingCast;
      pendingCast = null;
      scene.add(cast.stage);
      const characterLight = new T.PointLight(0xffddc6, 22, 7, 2);
      characterLight.position.copy(cast.stage.position).add(new T.Vector3(1.2, 3.4, 2.1));
      scene.add(characterLight);
      models.emitter.visible = false;
      canvas.dataset.castStatus = 'ready';
      onCastReady();
      scenario = null;
    }

    let traceMoved = scenario !== config;
    if (traceMoved) {
      const reframe = !scenario || scenario.targetX !== config.targetX || scenario.dummies !== config.dummies;
      scenario = config;
      models.receiver.position.x = scenario.targetX;
      positionDummies(scenario.dummies);
      resetAllDummies();
      models.dummies[0].effectAnchor.getWorldPosition(receiverPoint);
      if (reframe && view !== 'cast' && viewportWidth && viewportHeight) resize(viewportWidth, viewportHeight);
      models.emitterHeads.forEach((model, index) => { model.visible = index === scenario.ammo; });
      guide.material.color.setHex(scenario.trace.color);
      marker.material.color.setHex(scenario.trace.color);
      marker.position.copy(receiverPoint);
      for (const { wake, collar } of roundPool) {
        wake.material.color.setHex(scenario.trace.color);
        collar.color.setHex(scenario.trace.color);
        collar.emissive.copy(collar.color);
      }
      flare.color.setHex(scenario.trace.color);
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

    navigate(timestamp);
    const playing = elapsed !== null;
    if (wasPlaying !== playing) dirty = true;
    wasPlaying = playing;

    if (playing && shots !== activeRunRef) {
      activeRunRef = shots;
      resetAllDummies();
      launchLocked = false;
    } else if (!playing && activeRunRef) {
      activeRunRef = null;
    }

    // Step physics & charging sprint for all active mannequins
    const dt = lastPhysicsTime === null ? 0 : Math.min((timestamp - lastPhysicsTime) / 1000, 0.05);
    lastPhysicsTime = timestamp;
    const flightTime = playing ? elapsed - visorPrelude : -1;
    let physicsActive = false;
    if (dt > 0) {
      const charging = playing && scenario.charge;
      const castX = cast ? cast.stage.position.x : -7.8;
      // Allow rushers to close all the way into point-blank melee range right in front of the rifle/hero
      const minLocalX = castX + 1.15 - scenario.targetX;
      let closestWorldX = Infinity;

      for (let i = 0; i < scenario.dummies; i += 1) {
        const dummy = models.dummies[i];
        if (charging && !dummy.isDamaged()) {
          if (dummy.mannequin.position.x > minLocalX + 0.04) {
            const speed = 3.2 + (i % 5) * 0.34;
            dummy.mannequin.position.x = Math.max(minLocalX, dummy.mannequin.position.x - speed * dt);
            dummy.animateRun(elapsed, i * 0.85);
          } else {
            dummy.animateAttack(elapsed, i * 0.85);
          }
          // Step cleanly from raised platform (y=0.20) onto main deck (y=0.0) when advancing past platform edge
          dummy.mannequin.position.y = dummy.mannequin.position.x > -1.05 ? .20 : .0;
          const worldX = scenario.targetX + dummy.mannequin.position.x;
          if (worldX < closestWorldX) closestWorldX = worldX;
          physicsActive = true;
        }
        if (dummy.step(dt)) physicsActive = true;
        if (onPhysicsEvent) {
          for (const ev of dummy.drainEvents()) onPhysicsEvent(ev);
        } else {
          dummy.drainEvents();
        }
      }

      // Hero tactical backpedal when charging mannequins close in
      const threatClose = charging && (closestWorldX - castX < 3.6);
      retreatBlend = T.MathUtils.clamp(retreatBlend + (threatClose ? 5.0 : -3.5) * dt, 0, 1);
      if (cast && retreatBlend > 0.01 && cast.stage.position.x > -10.2) {
        cast.stage.position.x = Math.max(-10.2, cast.stage.position.x - 1.85 * retreatBlend * dt);
        physicsActive = true;
      }
    }

    if (!dirty && !playing && !physicsActive) return;

    if (flightTime < 0) {
      launchLocked = false;
    }

    const activeShots = Array.isArray(shots) ? shots : [];
    const lastShot = activeShots.at(-1);
    const finalArrival = lastShot ? lastShot.cue + (lastShot.flight ?? scenario.flight) : 0;

    if (cast) {
      if (flightTime >= 0 && !launchLocked) {
        cast.pose(1);
        cast.muzzlePosition(launch);
        launchLocked = true;
        traceMoved = true;
      }
      const raised = playing
        ? T.MathUtils.smoothstep(elapsed, 0, visorPrelude) * (1 - T.MathUtils.smoothstep(flightTime, effectiveFinalArrival, effectiveFinalArrival + .53))
        : 0;
      const latestShot = activeShots.findLast(s => s.cue <= flightTime);
      const sinceLaunch = latestShot ? flightTime - latestShot.cue : -1;
      const accent = T.MathUtils.smoothstep(sinceLaunch, 0, .025) * (1 - T.MathUtils.smoothstep(sinceLaunch, .025, .14));
      cast.pose(raised, accent, elapsed ?? 0, retreatBlend);
      cast.muzzlePosition(muzzle);
      if (retreatBlend > 0.01 || (!launchLocked && !launch.equals(muzzle))) {
        launch.copy(muzzle);
        traceMoved = true;
      }
    }

    const bendAmp = scenario.bend ?? (scenario.ammo === 0 ? .82 : 0);

    if (traceMoved) {
      models.dummies[0].effectAnchor.getWorldPosition(receiverPoint);
      writeSegmentTrace(guide, launch, receiverPoint, scenario.rise, bendAmp, 0, 1);
      endCenter.copy(receiverPoint);
      dirty = true;
    }

    const anyDamaged = models.dummies.some((d, i) => i < scenario.dummies && d.isDamaged());
    guide.visible = marker.visible = !anyDamaged && !scenario.charge;

    // Only react to shots that were actually fired (not skipped reserve rounds)
    let latestShot = null;
    let lastFiredArrival = 0;
    for (let i = 0; i < activeShots.length; i += 1) {
      if (roundPool[i]?.skipped) continue;
      if (activeShots[i].cue <= flightTime) latestShot = activeShots[i];
      if (roundPool[i]?.started) {
        lastFiredArrival = Math.max(lastFiredArrival, activeShots[i].cue + (activeShots[i].flight ?? scenario.flight));
      }
    }
    const effectiveFinalArrival = !hasLivingDummies() && lastFiredArrival > 0 ? lastFiredArrival : finalArrival;
    const sinceLaunch = latestShot ? flightTime - latestShot.cue : -1;
    const flashTarget = latestShot
      ? models.dummies[Math.min(latestShot.target ?? 0, scenario.dummies - 1)].mannequin.localToWorld(facing.set(...(latestShot.aim ?? [0, 1.5, .2])))
      : receiverPoint;
    const flashIntensity = launchFlash(sinceLaunch, muzzle, flashTarget, scenario.trace.color);

    let arrivalIntensity = 0;

    for (let i = 0; i < roundPool.length; i += 1) {
      const visual = roundPool[i];
      const shot = activeShots[i];
      if (!shot || !playing) {
        visual.wake.visible = visual.capsule.visible = false;
        visual.impact(-1, endCenter, scenario, false);
        continue;
      }

      const shotFlight = shot.flight ?? scenario.flight;
      const age = flightTime - shot.cue;
      const t = age / shotFlight;

      if (!visual.started && age >= 0) {
        visual.started = true;
        let idx = Math.min(shot.target ?? 0, scenario.dummies - 1);
        if (scenario.charge) {
          let living = 0;
          let inFlight = 0;
          for (let d = 0; d < scenario.dummies; d += 1) {
            if (!models.dummies[d].isDamaged()) living += 1;
          }
          for (let p = 0; p < i; p += 1) {
            const prev = roundPool[p];
            if (prev.started && !prev.hitDone && !prev.skipped) inFlight += 1;
          }
          if (living === 0 || (i >= scenario.dummies && living <= inFlight)) {
            visual.skipped = true;
            visual.hitDone = true;
          } else if (models.dummies[idx]?.isDamaged()) {
            // Retarget to the nearest surviving charging mannequin not already targeted
            let bestIdx = -1;
            let bestX = Infinity;
            for (let d = 0; d < scenario.dummies; d += 1) {
              if (!models.dummies[d].isDamaged() && models.dummies[d].mannequin.position.x < bestX) {
                bestX = models.dummies[d].mannequin.position.x;
                bestIdx = d;
              }
            }
            if (bestIdx >= 0) idx = bestIdx;
          }
        }
        visual.targetIdx = idx;
      }

      if (visual.skipped) {
        visual.wake.visible = visual.capsule.visible = false;
        visual.impact(-1, endCenter, scenario, false);
        continue;
      }

      const targetDummy = models.dummies[visual.targetIdx];

      if (!visual.hitDone && age >= 0) {
        visual.startPt.copy(launch);
        const aim = shot.aim ?? [0, 1.5, .2];
        visual.endPt.set(aim[0], aim[1], aim[2]);
        targetDummy.mannequin.localToWorld(visual.endPt);
      }

      const inFlight = age >= 0 && t < 1;
      visual.wake.visible = visual.capsule.visible = inFlight;

      if (inFlight) {
        const arch = Math.sin(Math.PI * t) ** 2;
        const bend = bendAmp ? arch * Math.sin(2 * Math.PI * t) * bendAmp : 0;
        visual.capsule.position.set(
          T.MathUtils.lerp(visual.startPt.x, visual.endPt.x, t),
          T.MathUtils.lerp(visual.startPt.y, visual.endPt.y, t) + arch * scenario.rise,
          T.MathUtils.lerp(visual.startPt.z, visual.endPt.z, t) + bend,
        );
        const nt = Math.min(1, t + .02);
        const nArch = Math.sin(Math.PI * nt) ** 2;
        const nBend = bendAmp ? nArch * Math.sin(2 * Math.PI * nt) * bendAmp : 0;
        facing.set(
          T.MathUtils.lerp(visual.startPt.x, visual.endPt.x, nt),
          T.MathUtils.lerp(visual.startPt.y, visual.endPt.y, nt) + nArch * scenario.rise,
          T.MathUtils.lerp(visual.startPt.z, visual.endPt.z, nt) + nBend,
        );
        visual.capsule.lookAt(facing);
        writeSegmentTrace(
          visual.wake,
          visual.startPt,
          visual.endPt,
          scenario.rise,
          bendAmp,
          Math.max(0, t - [.36, .48, .30][scenario.ammo]),
          t,
        );
      }

      const sinceArrival = age - shotFlight;
      if (sinceArrival >= 0 && !visual.hitDone) {
        visual.hitDone = true;
        shotDir.copy(visual.endPt).sub(visual.startPt).normalize();
        const result = targetDummy.hit(visual.startPt, shotDir, [7.2, 8.8, 6.2][scenario.ammo]);
        if (result) {
          visual.wasHit = true;
          visual.impactPt.copy(result.point);
        } else {
          visual.wasHit = false;
          visual.impactPt.copy(visual.endPt);
          if (onPhysicsEvent) onPhysicsEvent({ type: 'miss', strength: 1 });
        }
        physicsActive = true;
      }

      visual.impact(sinceArrival, visual.impactPt, scenario, visual.wasHit);
      if (sinceArrival >= 0 && sinceArrival < .34) {
        arrivalIntensity = Math.max(arrivalIntensity, 4.4 * (1 - sinceArrival * 3));
        endCenter.copy(visual.impactPt);
      }
    }

    flare.position.copy(flashIntensity ? muzzle : endCenter);
    flare.intensity = flashIntensity || arrivalIntensity;
    marker.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
    dirty = false;
  }

  function hasLivingDummies() {
    if (!scenario) return true;
    for (let i = 0; i < scenario.dummies; i += 1) {
      if (!models.dummies[i]?.isDamaged()) return true;
    }
    return false;
  }

  function hasPendingTargets() {
    if (!scenario) return true;
    let living = 0;
    for (let i = 0; i < scenario.dummies; i += 1) {
      if (!models.dummies[i]?.isDamaged()) living += 1;
    }
    if (living === 0) return false;
    let inFlight = 0;
    for (const item of roundPool) {
      if (item.started && !item.hitDone && !item.skipped) inFlight += 1;
    }
    return living > inFlight;
  }

  return { render, resize, setView, setNavigationKey, stopNavigation, resetAllDummies, hasLivingDummies, hasPendingTargets };
}
