import * as T from 'three';

const housing = new T.MeshStandardMaterial({ color: 0x17171b, roughness: .52, metalness: .12 });
const armor = new T.MeshStandardMaterial({ color: 0x232226, roughness: .46, metalness: .10 });
const rubber = new T.MeshStandardMaterial({ color: 0x0b0b0e, roughness: .72 });
const hardware = new T.MeshStandardMaterial({ color: 0x4b484c, roughness: .38, metalness: .55 });
const caps = new T.MeshStandardMaterial({ color: 0x383703, roughness: .52, metalness: .10 });
const badgeDark = new T.MeshBasicMaterial({ color: 0x211e1a });
const badgeLight = new T.MeshBasicMaterial({ color: 0xe3b66e });
const sphere = new T.SphereGeometry(1, 40, 24);
const up = new T.Vector3(0, 1, 0);

function addMesh(group, geometry, material, position, scale = [1, 1, 1]) {
  const mesh = new T.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  group.add(mesh);
  return mesh;
}

function shell(profile) {
  const contour = new T.SplineCurve(profile.map(([radius, height]) => new T.Vector2(radius, height)));
  const points = contour.getPoints(48);
  for (const point of points) point.x = Math.max(0, point.x);
  return new T.LatheGeometry(points, 48);
}

const torso = shell([[0, 0], [.25, .02], [.27, .13], [.33, .33], [.39, .49], [.35, .56], [.22, .61], [0, .64]]);
const head = shell([[0, 0], [.088, .02], [.132, .09], [.161, .18], [.152, .27], [.102, .32], [0, .342]]);
const limb = shell([[0, -.50], [.31, -.47], [.45, -.35], [.48, -.12], [.43, .24], [.34, .43], [0, .50]]);
const jointRing = new T.TorusGeometry(1, .21, 12, 36);

function limbCover(group, start, end, diameter, depth, material) {
  const center = start.clone().lerp(end, .5);
  const axis = end.clone().sub(start);
  const mesh = addMesh(group, limb, material, center.toArray(), [diameter, axis.length(), depth]);
  mesh.quaternion.setFromUnitVectors(up, axis.normalize());
}

function joint(group, point, radius) {
  addMesh(group, sphere, rubber, point.toArray(), [radius, radius, radius * .96]);
  const cap = addMesh(group, jointRing, hardware, point.toArray(), [radius * .80, radius * .80, radius * .45]);
  cap.rotation.y = Math.PI / 2;
}

function calibrationBadge(group, position, size) {
  const badge = new T.Group();
  badge.position.set(...position);
  group.add(badge);
  addMesh(badge, new T.CircleGeometry(size, 48), badgeDark, [0, 0, 0]);
  for (const quadrant of [0, Math.PI]) {
    addMesh(badge, new T.CircleGeometry(size * .82, 24, quadrant, Math.PI / 2), badgeLight, [0, 0, .002]);
  }
  return badge;
}

export function buildPracticeMannequin() {
  const mannequin = new T.Group();
  mannequin.position.y = .37;
  mannequin.scale.setScalar(.61);
  mannequin.rotation.y = -1.07;
  const pieces = [];
  function segment(start, pivot, radius) {
    const piece = new T.Group();
    piece.position.set(...pivot);
    const parts = mannequin.children.slice(start);
    for (const part of parts) {
      part.position.sub(piece.position);
      piece.add(part);
    }
    mannequin.add(piece);
    pieces.push({ piece, origin: piece.position.clone(), radius });
  }

  addMesh(mannequin, sphere, housing, [0, .99, 0], [.28, .215, .20]);
  addMesh(mannequin, sphere, rubber, [0, 1.16, 0], [.235, .16, .16]);
  addMesh(mannequin, torso, armor, [0, 1.19, 0], [1.02, .96, .65]);

  for (const height of [1.19, 1.23, 1.27]) {
    const seam = addMesh(mannequin, jointRing, rubber, [0, height, 0], [.226, .152, .026]);
    seam.rotation.x = -Math.PI / 2;
  }

  calibrationBadge(mannequin, [0, 1.60, .270], .089);
  segment(0, [0, 1.35, 0], .34);

  addMesh(mannequin, new T.CylinderGeometry(.089, .105, .17, 32), rubber, [0, 1.83, 0]);
  addMesh(mannequin, head, armor, [0, 1.88, 0], [1, 1, .94]);
  addMesh(mannequin, sphere, housing, [0, 2.015, .111], [.12, .108, .055]);
  for (const side of [-1, 1]) {
    addMesh(mannequin, sphere, hardware, [side * .15, 2.035, -.006], [.029, .055, .039]);
    const temple = addMesh(mannequin, jointRing, rubber, [side * .162, 2.035, -.006], [.032, .032, .012]);
    temple.rotation.y = side * Math.PI / 2;
  }
  segment(1, [0, 2.0, 0], .18);

  for (const side of [-1, 1]) {
    const legStart = mannequin.children.length;

    const hip = new T.Vector3(side * .16, 1.02, 0);
    const knee = new T.Vector3(side * .174, .565, .036);
    const ankle = new T.Vector3(side * .18, .132, -.014);
    joint(mannequin, knee, .106);
    joint(mannequin, ankle, .070);
    limbCover(mannequin, hip, knee, .295, .32, housing);
    limbCover(mannequin, knee, ankle, .24, .27, armor);
    addMesh(mannequin, sphere, caps, [knee.x, knee.y, .111], [.076, .079, .028]);
    addMesh(mannequin, sphere, rubber, [ankle.x, .049, .045], [.103, .051, .188]);
    addMesh(mannequin, sphere, housing, [ankle.x, .085, .048], [.097, .052, .17]);
    segment(legStart, [side * .17, .55, 0], .32);

    const armStart = mannequin.children.length;
    const shoulder = new T.Vector3(side * .337, 1.685, 0);
    const elbow = new T.Vector3(side * .429, 1.375, .033);
    const wrist = new T.Vector3(side * .438, 1.117, .082);
    joint(mannequin, shoulder, .118);
    joint(mannequin, elbow, .078);
    limbCover(mannequin, shoulder, elbow, .219, .23, armor);
    limbCover(mannequin, elbow, wrist, .171, .19, housing);
    addMesh(mannequin, sphere, rubber, wrist.toArray(), [.05, .06, .048]);
    addMesh(mannequin, sphere, housing, [wrist.x, 1.045, .088], [.058, .105, .052]);
    addMesh(mannequin, sphere, caps, [side * .336, 1.73, .024], [.086, .097, .102]);
    segment(armStart, [side * .42, 1.38, 0], .23);
  }

  const effectAnchor = new T.Object3D();
  effectAnchor.position.set(0, 1.60, .270);
  mannequin.add(effectAnchor);

  function reactToImpact(elapsed) {
    const time = T.MathUtils.clamp(elapsed, 0, 1.12);
    for (const [index, { piece, origin, radius }] of pieces.entries()) {
      const lift = 1.05 + (index % 3) * .52;
      const floor = radius - mannequin.position.y / mannequin.scale.y;
      const fall = 6.5;
      const landing = (lift + Math.sqrt(lift ** 2 + 4 * fall * (origin.y - floor))) / (2 * fall);
      const bounce = Math.max(0, time - landing);
      const height = time <= landing
        ? origin.y + lift * time - fall * time * time
        : floor + Math.max(0, 1.7 * bounce - 7 * bounce ** 2);
      const slide = Math.min(time, landing) + Math.min(bounce, .38) * .37;
      const side = Math.sin(index * 2.4) * 1.5;
      piece.position.set(
        origin.x + (1.25 + side) * slide,
        height,
        origin.z - (4.15 + index * .43) * slide,
      );
      const tumble = Math.min(time, landing + .20);
      piece.rotation.set((3.8 + index * .5) * tumble, side * tumble, (2.1 - index * .9) * tumble);
    }
  }

  return { mannequin, effectAnchor, reactToImpact };
}
