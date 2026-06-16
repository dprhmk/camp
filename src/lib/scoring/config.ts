// Tunable weights for the scoring engine. Everything is data — change a number
// here and the whole app (and its tests) follow. No magic numbers elsewhere.
//
// Two balanced scales:
//   • physical — body metrics, sport and four motor traits;
//   • mental ("розумова") — intellect, logic, creativity, communication.
// Each raw score is normalised to 0..`scaleMax` so the two scales are directly
// comparable and the team balancer treats them equally.

export type Band = { min: number; value: number };

export type ScoringConfig = {
  scaleMax: number; // normalised ceiling for both scales (e.g. 10)
  physical: {
    traitWeight: number; // per point of agility/strength/endurance/coordination
    sportsBonus: number; // does sports
    sportTypeBonus: number; // a specific sport is named
    build: Record<string, number>; // body-composition factor (statura)
    heightBands: Band[]; // cm -> contribution (sorted by min ascending)
    weightBands: Band[]; // kg -> contribution
  };
  mental: {
    traitWeight: number; // per point of intellect/logic/creativity/communication
  };
};

export const defaultScoringConfig: ScoringConfig = {
  scaleMax: 10,
  physical: {
    traitWeight: 1,
    sportsBonus: 1,
    sportTypeBonus: 0.5,
    build: { SLIM: 0.5, AVERAGE: 1, ATHLETIC: 1.5, HEAVY: 1 },
    heightBands: [
      { min: 0, value: 0 },
      { min: 130, value: 0.5 },
      { min: 150, value: 1 },
      { min: 165, value: 1.5 },
    ],
    weightBands: [
      { min: 0, value: 0 },
      { min: 35, value: 0.5 },
      { min: 50, value: 1 },
      { min: 65, value: 1.5 },
    ],
  },
  mental: {
    traitWeight: 1,
  },
};

/** Highest band whose `min` is <= value (bands sorted ascending). */
export function bandValue(bands: Band[], value: number): number {
  let out = 0;
  for (const b of bands) {
    if (value >= b.min) out = b.value;
    else break;
  }
  return out;
}

const maxBand = (bands: Band[]) => bands.reduce((m, b) => Math.max(m, b.value), 0);

/** Maximum possible RAW physical score (before normalisation). */
export function physicalRawMax(config: ScoringConfig = defaultScoringConfig): number {
  const p = config.physical;
  return (
    4 * 5 * p.traitWeight +
    p.sportsBonus +
    p.sportTypeBonus +
    Math.max(0, ...Object.values(p.build)) +
    maxBand(p.heightBands) +
    maxBand(p.weightBands)
  );
}

/** Maximum possible RAW mental score (before normalisation). */
export function mentalRawMax(config: ScoringConfig = defaultScoringConfig): number {
  return 4 * 5 * config.mental.traitWeight;
}
