export const rangeMin = 500;
export const rangeMax = 2500;
export const visorPrelude = .34;

export const traces = [
  { color: 0xffac68, duration: 1.2, event: .38, end: 1 },
  { color: 0x7de8ff, duration: .85, event: .59, end: 1 },
  { color: 0xef92ff, duration: 1.45, event: .80, end: .80 },
];

export function visorScenario(distance, ammo, emitter, target) {
  const range = (distance - rangeMin) / (rangeMax - rangeMin);
  const trace = traces[ammo];
  return {
    ammo, emitter, target,
    trace,
    targetX: -1.3 + 9.3 * range,
    rise: (.7 + 1.7 * range) * [1, .23, 1.3][ammo],
    flight: trace.duration * (.66 + .94 * range),
  };
}
