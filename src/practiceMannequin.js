import * as T from 'three';

const housing = new T.MeshStandardMaterial({ color: 0x17171b, roughness: .52, metalness: .12 });
const armor = new T.MeshStandardMaterial({ color: 0x232226, roughness: .46, metalness: .10 });
const rubber = new T.MeshStandardMaterial({ color: 0x0b0b0e, roughness: .72 });
const hardware = new T.MeshStandardMaterial({ color: 0x4b484c, roughness: .38, metalness: .55 });
const caps = new T.MeshStandardMaterial({ color: 0x383703, roughness: .52, metalness: .10 });
const badgeDark = new T.MeshBasicMaterial({ color: 0x211e1a });
const badgeLight = new T.MeshBasicMaterial({ color: 0xe3b66e });
const sphere = new T.SphereGeometry(1, 12, 8);
const up = new T.Vector3(0, 1, 0);

const GRAVITY = 15;      // mannequin-local units / s²
const FLOOR = .0;        // mannequin-local floor height
const SCALE = .61;

function shell(profile) {
  const contour = new T.SplineCurve(profile.map(([radius, height]) => new T.Vector2(radius, height)));
  const points = contour.getPoints(14);
  for (const point of points) point.x = Math.max(0, point.x);
  return new T.LatheGeometry(points, 14);
}

const torsoShape = shell([[0, 0], [.25, .02], [.27, .13], [.33, .33], [.39, .49], [.35, .56], [.22, .61], [0, .64]]);
const headShape = shell([[0, 0], [.088, .02], [.132, .09], [.161, .18], [.152, .27], [.102, .32], [0, .342]]);
const limbShape = shell([[0, -.50], [.31, -.47], [.45, -.35], [.48, -.12], [.43, .24], [.34, .43], [0, .50]]);
const jointRing = new T.TorusGeometry(1, .21, 6, 14);
const neckShape = new T.CylinderGeometry(.089, .105, .17, 10);
const baseShape = new T.CylinderGeometry(.5, .56, .05, 16);
const badgeOuterGeo = new T.CircleGeometry(.089, 14);
const badgeQuadGeo0 = new T.CircleGeometry(.089 * .82, 8, 0, Math.PI / 2);
const badgeQuadGeo1 = new T.CircleGeometry(.089 * .82, 8, Math.PI, Math.PI / 2);

const v = (x, y, z) => new T.Vector3(x, y, z);
const tmpA = new T.Vector3();
const tmpB = new T.Vector3();
const tmpQ = new T.Quaternion();
const tmpInv = new T.Quaternion();

export function buildPracticeMannequin() {
  const mannequin = new T.Group();
  mannequin.position.y = .20;
  mannequin.scale.setScalar(SCALE);
  mannequin.rotation.y = -1.07;

  const body = new T.Group();
  mannequin.add(body);

  const segments = [];
  const byName = {};
  const events = [];
  const state = {
    sway: new T.Vector2(), swayVel: new T.Vector2(),
    falling: false, fallAxis: new T.Vector3(1, 0, 0), fallAngle: 0, fallVel: 0, fallen: false,
    damaged: false, active: false,
  };

  function segment(name, parent, pivot, center, radius, hp = 1, kind = 'limb') {
    const group = new T.Group();
    const parentSeg = parent ? byName[parent] : null;
    group.position.copy(pivot).sub(parentSeg ? parentSeg.pivot : new T.Vector3());
    (parentSeg ? parentSeg.group : body).add(group);
    const seg = {
      name, kind, group, parent: parentSeg, children: [],
      pivot: pivot.clone(), center: center.clone().sub(pivot), radius,
      hp, maxHp: hp, free: false, sleeping: true,
      restParent: parentSeg ? parentSeg.group : body, restPos: group.position.clone(),
      vel: new T.Vector3(), ang: new T.Vector3(), flinch: 0,
    };
    if (parentSeg) parentSeg.children.push(seg);
    segments.push(seg);
    byName[name] = seg;
    return seg;
  }

  function put(seg, geometry, material, position, scale = [1, 1, 1]) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.copy(position).sub(seg.pivot);
    mesh.scale.set(...scale);
    seg.group.add(mesh);
    return mesh;
  }

  function limbCover(seg, start, end, diameter, depth, material) {
    const center = start.clone().lerp(end, .5);
    const axis = end.clone().sub(start);
    const mesh = put(seg, limbShape, material, center, [diameter, axis.length(), depth]);
    mesh.quaternion.setFromUnitVectors(up, axis.normalize());
  }

  function joint(seg, point, radius) {
    put(seg, sphere, rubber, point, [radius, radius, radius * .96]);
    const cap = put(seg, jointRing, hardware, point, [radius * .8, radius * .8, radius * .45]);
    cap.rotation.y = Math.PI / 2;
  }

  // ── Core (hp = 1 so every .75 bolt round shatters/tears on impact) ──
  const pelvis = segment('pelvis', null, v(0, 1.0, 0), v(0, .99, 0), .25, 1, 'core');
  put(pelvis, sphere, housing, v(0, .99, 0), [.28, .215, .20]);
  const hipRing = put(pelvis, jointRing, rubber, v(0, 1.07, 0), [.24, .17, .03]);
  hipRing.rotation.x = -Math.PI / 2;

  const abdomen = segment('abdomen', 'pelvis', v(0, 1.1, 0), v(0, 1.16, 0), .2, 1, 'core');
  put(abdomen, sphere, rubber, v(0, 1.16, 0), [.235, .16, .16]);

  const chest = segment('chest', 'abdomen', v(0, 1.22, 0), v(0, 1.5, .02), .33, 1, 'core');
  put(chest, torsoShape, armor, v(0, 1.19, 0), [1.02, .96, .65]);
  for (const height of [1.19, 1.23, 1.27]) {
    const seam = put(chest, jointRing, rubber, v(0, height, 0), [.226, .152, .026]);
    seam.rotation.x = -Math.PI / 2;
  }
  const badge = new T.Group();
  badge.position.set(0, 1.60 - 1.22, .270);
  chest.group.add(badge);
  badge.add(new T.Mesh(badgeOuterGeo, badgeDark));
  for (const geo of [badgeQuadGeo0, badgeQuadGeo1]) {
    const q = new T.Mesh(geo, badgeLight);
    q.position.z = .002;
    badge.add(q);
  }

  const neck = segment('neck', 'chest', v(0, 1.76, 0), v(0, 1.83, 0), .1, 1, 'neck');
  put(neck, neckShape, rubber, v(0, 1.83, 0));

  const head = segment('head', 'neck', v(0, 1.88, 0), v(0, 2.02, 0), .18, 1, 'head');
  put(head, headShape, armor, v(0, 1.88, 0), [1, 1, .94]);
  put(head, sphere, housing, v(0, 2.015, .111), [.12, .108, .055]);
  for (const side of [-1, 1]) {
    put(head, sphere, hardware, v(side * .15, 2.035, -.006), [.029, .055, .039]);
    const temple = put(head, jointRing, rubber, v(side * .162, 2.035, -.006), [.032, .032, .012]);
    temple.rotation.y = side * Math.PI / 2;
  }

  // ── Limbs ──
  for (const side of [-1, 1]) {
    const tag = side < 0 ? 'L' : 'R';
    const shoulder = v(side * .337, 1.685, 0);
    const elbow = v(side * .429, 1.375, .033);
    const wrist = v(side * .438, 1.117, .082);
    const upperArm = segment('upperArm' + tag, 'chest', shoulder, shoulder.clone().lerp(elbow, .5), .13);
    joint(upperArm, shoulder, .118);
    limbCover(upperArm, shoulder, elbow, .219, .23, armor);
    put(upperArm, sphere, caps, v(side * .336, 1.73, .024), [.086, .097, .102]);

    const forearm = segment('forearm' + tag, 'upperArm' + tag, elbow, elbow.clone().lerp(wrist, .5), .1);
    joint(forearm, elbow, .078);
    limbCover(forearm, elbow, wrist, .171, .19, housing);

    const hand = segment('hand' + tag, 'forearm' + tag, wrist, v(wrist.x, 1.05, .088), .08);
    put(hand, sphere, rubber, wrist, [.05, .06, .048]);
    put(hand, sphere, housing, v(wrist.x, 1.045, .088), [.058, .105, .052]);

    const hip = v(side * .16, 1.02, 0);
    const knee = v(side * .174, .565, .036);
    const ankle = v(side * .18, .132, -.014);
    const thigh = segment('thigh' + tag, 'pelvis', hip, hip.clone().lerp(knee, .5), .16, 1, 'leg');
    limbCover(thigh, hip, knee, .295, .32, housing);

    const shin = segment('shin' + tag, 'thigh' + tag, knee, knee.clone().lerp(ankle, .5), .13, 1, 'leg');
    joint(shin, knee, .106);
    limbCover(shin, knee, ankle, .24, .27, armor);
    put(shin, sphere, caps, v(knee.x, knee.y, .111), [.076, .079, .028]);

    const foot = segment('foot' + tag, 'shin' + tag, ankle, v(ankle.x, .06, .045), .1, 1, 'leg');
    joint(foot, ankle, .070);
    put(foot, sphere, rubber, v(ankle.x, .049, .045), [.103, .051, .188]);
    put(foot, sphere, housing, v(ankle.x, .085, .048), [.097, .052, .17]);
  }

  const chestAnchor = new T.Object3D();
  chestAnchor.position.set(0, 1.60, .27);
  mannequin.add(chestAnchor);

  function connected(seg) {
    for (let node = seg; node; node = node.parent) if (node.free) return false;
    return true;
  }

  function release(seg, velocity, spin) {
    mannequin.attach(seg.group);
    seg.free = true;
    seg.flinch = 0;
    seg.group.rotation.set(0, 0, 0);
    seg.sleeping = false;
    seg.vel.copy(velocity);
    seg.ang.copy(spin);
    state.active = true;
  }

  function worldCenter(seg, target) {
    return seg.group.localToWorld(target.copy(seg.center));
  }

  function localDirection(worldDir, target) {
    mannequin.getWorldQuaternion(tmpInv).invert();
    return target.copy(worldDir).applyQuaternion(tmpInv);
  }

  function randomSpin(scale) {
    return v((Math.random() * 2 - 1) * scale, (Math.random() * 2 - 1) * scale, (Math.random() * 2 - 1) * scale);
  }

  function startFall(direction, sideHint) {
    if (state.falling || !connected(pelvis)) return;
    state.falling = true;
    const horizontal = tmpA.set(direction.x + sideHint * .6, 0, direction.z);
    if (horizontal.lengthSq() < 1e-4) horizontal.set(1, 0, 0);
    horizontal.normalize();
    state.fallAxis.crossVectors(up, horizontal).normalize();
    state.fallAngle = Math.hypot(state.sway.x, state.sway.y);
    state.fallVel = 1.6;
    events.push({ type: 'topple', strength: 1 });
  }

  function collapse(direction, power, hitSeg) {
    const hitCenter = hitSeg ? worldCenter(hitSeg, tmpA).clone() : null;
    if (hitCenter) mannequin.worldToLocal(hitCenter);
    const originCenter = hitCenter || v(0, 1.25, 0);

    const order = segments.slice().reverse();
    for (const seg of order) {
      if (!connected(seg)) continue;
      const segPos = worldCenter(seg, tmpB).clone();
      mannequin.worldToLocal(segPos);
      const radial = segPos.sub(originCenter);
      const dist = radial.length() || 0.1;
      radial.divideScalar(dist);

      const isHitPart = seg === hitSeg;
      const proximity = Math.max(0.35, 1.35 - dist * 0.45);
      const impulse = power * (isHitPart ? 1.18 : (0.52 + Math.random() * 0.42) * proximity);
      const upKick = seg.kind === 'leg'
        ? 2.2 + Math.random() * 2.1
        : (seg.kind === 'head' ? 3.4 + Math.random() * 2.2 : 2.1 + Math.max(0, radial.y) * 2.2 + Math.random() * 1.8);

      const spin = seg.kind === 'head'
        ? v((Math.random() * 2 - 1) * 5, (Math.random() < .5 ? -1 : 1) * (20 + Math.random() * 10), (Math.random() * 2 - 1) * 7)
        : randomSpin(seg.kind === 'leg' ? 9.5 : 11);

      release(seg,
        v(
          direction.x * impulse + radial.x * (2.4 + Math.random() * 1.4),
          upKick,
          direction.z * impulse + radial.z * (2.4 + Math.random() * 1.4),
        ),
        spin);
    }
  }

  function destroy(seg, direction, power) {
    // 1 bullet = full kinetic shatter of all 16 body segments (head, torso, arms, pelvis, thighs, shins, feet)
    collapse(direction, power, seg);
    return seg.kind === 'head' ? 'head' : 'collapse';
  }

  // Ray hit test against connected segments (world space). Returns null on miss.
  function hit(origin, direction, power = 6.5) {
    let best = null;
    let bestT = Infinity;
    const center = new T.Vector3();
    for (const seg of segments) {
      if (!connected(seg)) continue;
      worldCenter(seg, center);
      const radius = seg.radius * SCALE * 1.25;
      tmpA.copy(center).sub(origin);
      const along = tmpA.dot(direction);
      if (along <= 0) continue;
      const distSq = tmpA.lengthSq() - along * along;
      if (distSq > radius * radius) continue;
      const t = along - Math.sqrt(radius * radius - distSq);
      if (t < bestT) { bestT = t; best = seg; }
    }
    if (!best) return null;
    const point = origin.clone().addScaledVector(direction, bestT);
    const local = localDirection(direction, new T.Vector3());
    state.damaged = true;
    state.active = true;
    best.hp -= 1;
    let type = 'hit';
    if (best.hp <= 0) {
      type = destroy(best, local, power);
    } else {
      best.flinch = 1;
    }
    // Every round transfers momentum to whatever is still standing.
    const height = (best.pivot.y + best.center.y) / 2.1;
    const torque = tmpB.crossVectors(up, local).normalize().multiplyScalar(2.6 * height);
    state.swayVel.x += torque.x;
    state.swayVel.y += torque.z;
    events.push({ type, strength: 1, part: best.name });
    return { point, type, part: best.name };
  }

  function updateBody(dt) {
    if (state.falling) {
      if (!state.fallen) {
        state.fallVel += 9.5 * Math.sin(state.fallAngle + .08) * dt;
        state.fallAngle += state.fallVel * dt;
        if (state.fallAngle >= 1.42) {
          state.fallAngle = 1.42;
          if (state.fallVel > .6) events.push({ type: 'fall', strength: Math.min(2, state.fallVel / 3) });
          state.fallVel *= -.22;
          if (Math.abs(state.fallVel) < .35) state.fallen = true;
        }
      }
      body.quaternion.setFromAxisAngle(state.fallAxis, state.fallAngle);
      return !state.fallen;
    }
    state.swayVel.x += (-55 * state.sway.x - 5.5 * state.swayVel.x) * dt;
    state.swayVel.y += (-55 * state.sway.y - 5.5 * state.swayVel.y) * dt;
    state.sway.addScaledVector(state.swayVel, dt);
    state.sway.clampLength(0, .42);
    body.rotation.set(state.sway.x, 0, state.sway.y);
    return state.sway.lengthSq() + state.swayVel.lengthSq() > 1e-5;
  }

  function updateSegment(seg, dt) {
    if (seg.flinch > 0) {
      seg.flinch = Math.max(0, seg.flinch - dt * 5);
      const k = Math.sin(seg.flinch * Math.PI) * .14;
      seg.group.rotation.set(-k, 0, k * .5);
      if (!seg.flinch) seg.group.rotation.set(0, 0, 0);
      return true;
    }
    if (!seg.free || seg.sleeping) return false;
    const g = seg.group;
    seg.vel.y -= GRAVITY * dt;
    g.position.addScaledVector(seg.vel, dt);
    const spin = seg.ang.length();
    if (spin > 1e-4) {
      tmpQ.setFromAxisAngle(tmpA.copy(seg.ang).divideScalar(spin), spin * dt);
      g.quaternion.premultiply(tmpQ);
    }
    const cy = tmpB.copy(seg.center).applyQuaternion(g.quaternion).add(g.position).y;
    const floor = FLOOR + seg.radius * .55;
    let grounded = false;
    if (cy < floor) {
      g.position.y += floor - cy;
      grounded = true;
      if (seg.vel.y < 0) {
        const impact = -seg.vel.y;
        if (impact > 1.4) events.push({ type: 'debris', strength: impact, part: seg.name });
        seg.vel.y *= -.26;
        seg.vel.x *= .6;
        seg.vel.z *= .6;
        seg.ang.multiplyScalar(.55);
      }
    }
    seg.ang.multiplyScalar(Math.exp(-.4 * dt));
    if (grounded) {
      seg.vel.x *= Math.exp(-5 * dt);
      seg.vel.z *= Math.exp(-5 * dt);
      seg.ang.multiplyScalar(Math.exp(-4 * dt));
      if (seg.vel.lengthSq() < .01 && seg.ang.lengthSq() < .02) seg.sleeping = true;
    }
    return true;
  }

  function step(dt) {
    if (!state.active) return false;
    let active = updateBody(dt);
    for (const seg of segments) active = updateSegment(seg, dt) || active;
    state.active = active;
    return active;
  }

  function animateRun(time, phase = 0) {
    if (state.damaged || state.falling || !connected(pelvis)) return;
    const s = Math.sin(time * 11 + phase);
    const c = Math.cos(time * 11 + phase);
    body.position.y = Math.abs(s) * 0.055;
    body.rotation.set(0.14, s * 0.06, 0);
    if (connected(byName.thighL)) byName.thighL.group.rotation.x = s * 0.65;
    if (connected(byName.thighR)) byName.thighR.group.rotation.x = -s * 0.65;
    if (connected(byName.shinL)) byName.shinL.group.rotation.x = Math.max(0, -c) * 0.7;
    if (connected(byName.shinR)) byName.shinR.group.rotation.x = Math.max(0, c) * 0.7;
    if (connected(byName.upperArmL)) byName.upperArmL.group.rotation.x = -s * 0.55;
    if (connected(byName.upperArmR)) byName.upperArmR.group.rotation.x = s * 0.55;
    if (connected(byName.forearmL)) byName.forearmL.group.rotation.x = -0.65;
    if (connected(byName.forearmR)) byName.forearmR.group.rotation.x = -0.65;
  }

  function animateAttack(time, phase = 0) {
    if (state.damaged || state.falling || !connected(pelvis)) return;
    const s = Math.sin(time * 9 + phase);
    body.position.y = 0;
    body.rotation.set(0.18 + Math.max(0, s) * 0.12, s * 0.14, 0);
    if (connected(byName.thighL)) byName.thighL.group.rotation.x = -0.22;
    if (connected(byName.thighR)) byName.thighR.group.rotation.x = 0.25;
    if (connected(byName.shinL)) byName.shinL.group.rotation.x = 0.2;
    if (connected(byName.shinR)) byName.shinR.group.rotation.x = 0.15;
    if (connected(byName.upperArmL)) byName.upperArmL.group.rotation.x = -1.25 + s * 0.55;
    if (connected(byName.upperArmR)) byName.upperArmR.group.rotation.x = -1.25 - s * 0.55;
    if (connected(byName.forearmL)) byName.forearmL.group.rotation.x = -0.5;
    if (connected(byName.forearmR)) byName.forearmR.group.rotation.x = -0.5;
  }

  function reset() {
    for (const seg of segments) {
      seg.restParent.add(seg.group);
      seg.group.position.copy(seg.restPos);
      seg.group.quaternion.identity();
      seg.group.scale.set(1, 1, 1);
      seg.free = false;
      seg.sleeping = true;
      seg.hp = seg.maxHp;
      seg.flinch = 0;
      seg.vel.set(0, 0, 0);
      seg.ang.set(0, 0, 0);
    }
    body.position.set(0, 0, 0);
    body.quaternion.identity();
    state.sway.set(0, 0);
    state.swayVel.set(0, 0);
    state.falling = false;
    state.fallen = false;
    state.fallAngle = 0;
    state.fallVel = 0;
    state.damaged = false;
    state.active = false;
    events.length = 0;
  }

  function drainEvents() {
    return events.splice(0, events.length);
  }

  return {
    mannequin,
    effectAnchor: chestAnchor,
    hit,
    step,
    animateRun,
    animateAttack,
    reset,
    drainEvents,
    isDamaged: () => state.damaged,
    isActive: () => state.active,
    partCount: segments.length,
  };
}
