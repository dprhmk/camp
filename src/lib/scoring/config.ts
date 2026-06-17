// Tunable weights for the scoring engine. Everything is data — change a number
// here and the whole app (and its tests) follow. No magic numbers elsewhere.
//
// Two balanced scales, each normalised to 0..`scaleMax`:
//   • physical — height level, build and "does sports";
//   • mental ("розумова / креативна") — creativity and communication (1..5).

export type ScoringConfig = {
  scaleMax: number; // normalised ceiling for both scales (e.g. 10)
  physical: {
    height: Record<string, number>; // LOW / MEDIUM / HIGH
    build: Record<string, number>; // SLIM / AVERAGE / HEAVY
    sportsBonus: number; // does sports
  };
  mental: {
    traitWeight: number; // per point of creativity / communication (1..5)
  };
};

export const defaultScoringConfig: ScoringConfig = {
  scaleMax: 10,
  physical: {
    height: { LOW: 1, MEDIUM: 2, HIGH: 3 },
    build: { SLIM: 1, AVERAGE: 2, HEAVY: 1 },
    sportsBonus: 2,
  },
  mental: {
    traitWeight: 1,
  },
};

const maxOf = (record: Record<string, number>) => Math.max(0, ...Object.values(record));

/** Maximum possible RAW physical score (before normalisation). */
export function physicalRawMax(config: ScoringConfig = defaultScoringConfig): number {
  const p = config.physical;
  return maxOf(p.height) + maxOf(p.build) + p.sportsBonus;
}

/** Maximum possible RAW mental score (before normalisation): two traits × 5. */
export function mentalRawMax(config: ScoringConfig = defaultScoringConfig): number {
  return 2 * 5 * config.mental.traitWeight;
}
