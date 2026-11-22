export const rangeMin = 500;
export const rangeMax = 2500;
export const visorPrelude = .34;
export const visorSettle = 1.7;
export const maxDummies = 50;
export const minDummies = 1;
export const roundsPerDummyBurst = 3;
export const maxRounds = 90;

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
    dummies,
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
  const rawRounds = charge
    ? (burst ? Math.max(count * 2, 6) : count)
    : (burst ? count * roundsPerDummyBurst : count);
  const rounds = Math.min(maxRounds, rawRounds);
  const interval = charge
    ? Math.max(.045, Math.min(.14, 2.6 / Math.max(rounds, 1)))
    : (burst ? (count > 8 ? .045 : .085) : (count > 8 ? .08 : .26));
  const passes = new Array(count).fill(0);
  const shots = [];
  for (let index = 0; index < rounds; index += 1) {
    const target = index % count;
    const pass = passes[target]++;
    let aim;
    if (spread) {
      aim = [
        (random() * 2 - 1) * .55,
        .25 + random() * 1.9,
        .15,
      ];
    } else if (!burst && !charge) {
      // Single-shot mode hits chest so the whole upper body shatters from bullet force
      aim = [
        (random() - .5) * .06,
        1.48 + (random() - .5) * .08,
        .2,
      ];
    } else {
      const base = aimedSequence[pass] ?? [(random() * 2 - 1) * .35, .5 + random() * 1.2, .15];
      aim = [base[0] + (random() - .5) * .05, base[1] + (random() - .5) * .05, base[2]];
    }
    const jitter = spread && index ? (random() - .5) * .025 : 0;
    shots.push({
      cue: Math.max(0, index * interval + jitter),
      target,
      aim,
      flight: scenario.flight * (1 + (random() - .5) * .04),
    });
  }
  shots.sort((a, b) => a.cue - b.cue);
  return shots;
}
