export const rangeMin = 500;
export const rangeMax = 2500;
export const visorPrelude = .34;
export const visorSettle = 1.15;
const singleCue = [0];
const burstCues = [0, .27, .54];

export function visorCues(burst) {
  return burst ? burstCues : singleCue;
}

export const traces = [
  { color: 0xffac68, duration: 1.2, end: 1 },
  { color: 0x7de8ff, duration: .85, end: 1 },
  { color: 0xef92ff, duration: 1.45, end: 1 },
];

export function visorScenario(distance, ammo, target) {
  const range = (distance - rangeMin) / (rangeMax - rangeMin);
  const trace = traces[ammo];
  return {
    ammo, target,
    trace,
    targetX: -1.3 + 9.3 * range,
    rise: (.7 + 1.7 * range) * [1, .23, 1.3][ammo],
    flight: trace.duration * (.66 + .94 * range),
  };
}
