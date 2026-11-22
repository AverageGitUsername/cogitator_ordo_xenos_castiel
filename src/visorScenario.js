export const rangeMin = 500;
export const rangeMax = 2500;
export const visorPrelude = .34;
export const visorSettle = 1.7;
export const visorShotInterval = 1.2;
export const maxDummies = 5;
export const minDummies = 1;
export const roundsPerDummyBurst = 3;
export const maxRounds = maxDummies * 2;

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
    // Restored distinct per-weapon ballistic trajectories:
    // 0 Executioner = guided S-curve, 1 Mortis = flat hyper-velocity rail, 2 Infernus = high mortar arc
    rise: (.45 + 1.05 * range) * [1, .23, 1.3][ammo],
    bend: ammo === 0 ? .82 : 0,
    flight: (.08 + .20 * range) * [1, .80, 1.25][ammo],
  };
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Aim points in mannequin-local units (front of the body faces +z).
const aimedSequence = [
  [0, 2.0, .06],   // head
  [0, 1.5, .2],    // chest
  [0, 1.0, .16],   // pelvis
];

export function visorShots(scenario, burst, spread, charge = false, seed = Math.floor(Math.random() * 1e9)) {
  const random = seeded(seed);
  const count = scenario.dummies;
  // 1 bullet = 1 mannequin shattered; only add reserve rounds in Charge + Scatter mode
  const rawRounds = (charge && spread)
    ? Math.max(count * 2, 8)
    : ((burst && count === 1) ? roundsPerDummyBurst : count);
  const rounds = Math.min(maxRounds, rawRounds);
  const shots = [];
  for (let index = 0; index < rounds; index += 1) {
    const target = index % count;
    let aim;
    if (spread) {
      aim = [
        (random() * 2 - 1) * .36,
        .4 + random() * 1.65,
        .05,
      ];
    } else if (burst && !charge) {
      // Burst hits heads sequentially (1st head spins, 2nd head spins, 3rd head spins) while shattering each body
      aim = [
        (random() - .5) * .04,
        1.98 + (random() - .5) * .05,
        .04,
      ];
    } else {
      // Aimed shot hits center-mass chest so it never misses even at point-blank range
      aim = [
        0,
        1.45,
        0,
      ];
    }
    shots.push({
      cue: index * visorShotInterval,
      target,
      aim,
      flight: scenario.flight * (1 + (random() - .5) * .04),
    });
  }
  return shots;
}
