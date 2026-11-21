import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const assetUrl = name => `${import.meta.env.BASE_URL}media/armory/${name}.glb`;
const propRestAngle = .13;
const rightGrip = new T.Vector3(.70, -.24, -.11);
const leftGrip = new T.Vector3(.33, -.13, .22);
// Center of the visible end face in the imported prop's local coordinates.
const propTip = new T.Vector3(-.952, .061, .036);

function makeArm(bones, suffix, grip, elbowDirection, palmDirection) {
  const upper = bones.get('upperArm' + suffix);
  const lower = bones.get('lowerArm' + suffix);
  const hand = bones.get('hand' + suffix);
  if (!upper || !lower || !hand) throw new Error('Armature lacks an arm chain');
  const rest = [upper, lower, hand].map(bone => bone.quaternion.clone());
  const shoulder = new T.Vector3();
  const elbow = new T.Vector3();
  const wrist = new T.Vector3();
  const target = new T.Vector3();
  const hint = new T.Vector3();
  const direction = new T.Vector3();
  const oldDirection = new T.Vector3();
  const newDirection = new T.Vector3();
  const world = new T.Quaternion();
  const parent = new T.Quaternion();
  const turn = new T.Quaternion();
  const identity = new T.Quaternion();

  function orient(bone, from, to, blend = 1) {
    turn.setFromUnitVectors(from.normalize(), to.normalize()).slerp(identity, 1 - blend);
    bone.getWorldQuaternion(world);
    bone.parent.getWorldQuaternion(parent).invert();
    bone.quaternion.copy(parent.multiply(turn.multiply(world)));
    bone.updateMatrixWorld(true);
  }

  return (actor, prop) => {
    [upper, lower, hand].forEach((bone, index) => bone.quaternion.copy(rest[index]));
    upper.updateMatrixWorld(true);
    upper.getWorldPosition(shoulder);
    lower.getWorldPosition(elbow);
    hand.getWorldPosition(wrist);
    const upperLength = elbow.distanceTo(shoulder);
    const lowerLength = wrist.distanceTo(elbow);
    prop.localToWorld(target.copy(grip));
    direction.subVectors(target, shoulder);
    const distance = T.MathUtils.clamp(direction.length(), .02, upperLength + lowerLength - .002);
    direction.normalize();
    hint.copy(elbowDirection).transformDirection(actor.matrixWorld);
    hint.addScaledVector(direction, -hint.dot(direction)).normalize();
    const along = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
    const across = Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2));
    oldDirection.subVectors(elbow, shoulder);
    newDirection.copy(direction).multiplyScalar(along).addScaledVector(hint, across);
    orient(upper, oldDirection, newDirection);
    lower.getWorldPosition(elbow);
    hand.getWorldPosition(wrist);
    orient(lower, oldDirection.subVectors(wrist, elbow), newDirection.copy(shoulder).addScaledVector(direction, distance).sub(elbow));
    hand.getWorldPosition(wrist);
    orient(hand, oldDirection.subVectors(wrist, elbow), newDirection.copy(palmDirection).transformDirection(prop.matrixWorld), .78);
  };
}

export async function loadArmoryCast() {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const [{ scene: actor }, { scene: prop }] = await Promise.all([
    loader.loadAsync(assetUrl('castiel')),
    loader.loadAsync(assetUrl('longshot')),
  ]);
  const stage = new T.Group();
  stage.position.set(-7.8, .025, 0);
  stage.scale.setScalar(1.58);
  actor.rotation.y = 1.26;
  stage.add(actor);
  const bones = new Map();
  actor.traverse(node => {
    if (node.isBone) bones.set(node.name, node);
    if (node.isSkinnedMesh) node.frustumCulled = false;
  });

  const rightArm = makeArm(bones, 'R', rightGrip, new T.Vector3(-.7, -1, -.25), new T.Vector3(-.55, .08, .85));
  const leftArm = makeArm(bones, 'L', leftGrip, new T.Vector3(.8, -1, -.2), new T.Vector3(-.25, .46, -.85));
  const chest = bones.get('chest');
  const chestRest = chest.quaternion.clone();
  const lift = new T.Quaternion();
  const xAxis = new T.Vector3(1, 0, 0);

  const holder = new T.Group();
  const swing = new T.Group();
  actor.add(holder);
  holder.add(swing);
  swing.add(prop);
  prop.scale.setScalar(.54);
  holder.rotation.y = 1.88;

  function placeProp(raised, impulse = 0) {
    holder.position.set(
      -.125,
      T.MathUtils.lerp(1.34, 1.47, raised) + .018 * impulse,
      T.MathUtils.lerp(.62, .657, raised) - .024 * impulse,
    );
    swing.rotation.z = T.MathUtils.lerp(propRestAngle, .008, raised) + .062 * impulse;
    holder.updateWorldMatrix(true, true);
  }

  function pose(raised, impulse = 0) {
    chest.quaternion.copy(chestRest).multiply(lift.setFromAxisAngle(xAxis, -.035 * raised + .045 * impulse));
    placeProp(raised, impulse);
    rightArm(actor, prop);
    leftArm(actor, prop);
  }

  pose(0);

  return {
    stage,
    pose,
    muzzlePosition: result => prop.localToWorld(result.copy(propTip)),
  };
}
