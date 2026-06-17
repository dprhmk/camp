import { defaultScoringConfig, mentalRawMax, physicalRawMax, type ScoringConfig } from "./config";

// The subset of member profile fields that feed the scores. Kept deliberately
// narrow so the scoring engine stays a pure, easily-tested function.
export type ScorableMember = {
  // Physical
  height?: string | null; // "LOW" | "MEDIUM" | "HIGH"
  build?: string | null; // "SLIM" | "AVERAGE" | "HEAVY"
  doesSports?: boolean | null;

  // Mental ("розумова / креативна"), 1..5
  creativity?: number | null;
  communication?: number | null;
  isExceptional?: boolean | null; // "особливий" — lowers the mental score
};

const num = (v: number | null | undefined) => (typeof v === "number" ? v : 0);
const round = (v: number) => Math.round(v * 100) / 100;

/** Physical score: height level + build + sports, normalised to 0..scaleMax. */
export function computePhysicalScore(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
): number {
  const c = config.physical;
  let raw = 0;
  if (m.height && c.height[m.height] != null) raw += c.height[m.height];
  if (m.build && c.build[m.build] != null) raw += c.build[m.build];
  if (m.doesSports) raw += c.sportsBonus;

  const max = physicalRawMax(config);
  return round(Math.max(0, (raw / max) * config.scaleMax));
}

/** Mental score: creativity + communication, normalised to 0..scaleMax. */
export function computeMentalScore(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
): number {
  let raw = (num(m.creativity) + num(m.communication)) * config.mental.traitWeight;
  if (m.isExceptional) raw *= config.mental.exceptionalFactor;
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
