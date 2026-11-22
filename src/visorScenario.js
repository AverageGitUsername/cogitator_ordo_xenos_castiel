export const rangeMin = 500;
export const rangeMax = 2500;
export const visorPrelude = .34;
export const visorSettle = 1.7;
export const visorShotInterval = 1.2;
export const maxDummies = 5;
export const minDummies = 1;

// Muzzle velocity in range units per second (realistic bolt-round speeds).
export const traces = [
  { color: 0xffac68, velocity: 1050, end: 1 },
  { color: 0x7de8ff, velocity: 1290, end: 1 },
  { color: 0xef92ff, velocity: 880, end: 1 },
];

export function visorScenario(distance, ammo, dummies = 3, charge = false) {
  const range = (distance - rangeMin) / (rangeMax - rangeMin);
  const trace = traces[ammo];
  return {
    ammo,
    dummies: Math.max(minDummies, Math.min(maxDummies, dummies)),
    charge,
    trace,
    distance,
    tof: distance / trace.velocity,
    targetX: -1.3 + 9.3 * range,
    guided: ammo === 0,
    rise: [.34 + .55 * range, 0, .12 + .23 * range][ammo],
    bend: ammo === 0 ? .42 : 0,
    flight: [.38, 0, .42][ammo] + (.08 + .20 * range) * [1, .80, 1.25][ammo],
    airburstHeight: ammo === 2 ? 1.25 : 0,
  };
}

export function visorShots(scenario) {
  return Array.from({ length: scenario.dummies }, (_, target) => ({
    cue: target * visorShotInterval,
    target,
    aim: [0, 1.45, 0],
    flight: scenario.flight * (1 + (Math.random() - .5) * .04),
  }));
}
