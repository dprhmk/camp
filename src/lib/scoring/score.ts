import {
  bandValue,
  defaultScoringConfig,
  mentalRawMax,
  physicalRawMax,
  type ScoringConfig,
} from "./config";

// The subset of member profile fields that feed the scores. Kept deliberately
// narrow so the scoring engine stays a pure, easily-tested function.
export type ScorableMember = {
  // Physical
  agility?: number | null;
  strength?: number | null;
  endurance?: number | null;
  coordination?: number | null;
  doesSports?: boolean | null;
  sportType?: string | null;
  height?: number | null;
  weight?: number | null;
  build?: string | null;

  // Mental ("розумова")
  intellect?: number | null;
  logic?: number | null;
  creativity?: number | null;
  communication?: number | null;
};

const num = (v: number | null | undefined) => (typeof v === "number" ? v : 0);
const round = (v: number) => Math.round(v * 100) / 100;

/** Physical score, normalised to 0..scaleMax. */
export function computePhysicalScore(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
): number {
  const c = config.physical;
  let raw =
    (num(m.agility) + num(m.strength) + num(m.endurance) + num(m.coordination)) * c.traitWeight;
  if (m.doesSports) raw += c.sportsBonus;
  if (m.sportType && m.sportType.trim()) raw += c.sportTypeBonus;
  if (m.build && c.build[m.build] != null) raw += c.build[m.build];
  if (m.height) raw += bandValue(c.heightBands, m.height);
  if (m.weight) raw += bandValue(c.weightBands, m.weight);

  const max = physicalRawMax(config);
  return round(Math.max(0, (raw / max) * config.scaleMax));
}

/** Mental ("розумова") score, normalised to 0..scaleMax. */
export function computeMentalScore(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
): number {
  const raw =
    (num(m.intellect) + num(m.logic) + num(m.creativity) + num(m.communication)) *
    config.mental.traitWeight;
  const max = mentalRawMax(config);
  return round(Math.max(0, (raw / max) * config.scaleMax));
}

/** Both normalised scales at once. */
export function computeScores(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
) {
  return {
    physicalScore: computePhysicalScore(m, config),
    mentalScore: computeMentalScore(m, config),
  };
}
