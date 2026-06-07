import { defaultScoringConfig, type ScoringConfig } from "./config";

// The subset of member profile fields that feed the scores. Kept deliberately
// narrow so the scoring engine stays a pure, easily-tested function.
export type ScorableMember = {
  agility?: number | null;
  strength?: number | null;
  doesSports?: boolean | null;
  sportType?: string | null;

  drawing?: number | null;
  poetry?: number | null;
  isMusician?: boolean | null;
  englishLevel?: number | null;
  generalLevel?: number | null;
  personalityType?: string | null;
  isExceptional?: boolean | null;
  firstTimeAtCamp?: boolean | null;
  panicAttacks?: boolean | null;
};

const num = (v: number | null | undefined) => (typeof v === "number" ? v : 0);
const round = (v: number) => Math.round(v * 100) / 100;

/** Physical score: agility, strength, and sports involvement. */
export function computePhysicalScore(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
): number {
  const c = config.physical;
  let score = num(m.agility) * c.agilityWeight + num(m.strength) * c.strengthWeight;
  if (m.doesSports) score += c.sportsBonus;
  if (m.sportType && m.sportType.trim()) score += c.sportTypeBonus;
  return round(Math.max(0, score));
}

/** Mental score: personality, creativity, intellect, and psychological flags. */
export function computeMentalScore(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
): number {
  const c = config.mental;
  let score =
    num(m.drawing) * c.drawingWeight +
    num(m.poetry) * c.poetryWeight +
    num(m.englishLevel) * c.englishWeight +
    num(m.generalLevel) * c.generalWeight;

  if (m.isMusician) score += c.musicianBonus;
  if (m.personalityType && c.personality[m.personalityType] != null) {
    score += c.personality[m.personalityType];
  }
  if (m.isExceptional) score += c.exceptionalBonus;
  if (m.firstTimeAtCamp) score -= c.firstTimePenalty;
  if (m.panicAttacks) score -= c.panicPenalty;

  return round(Math.max(0, score));
}

/** Convenience: both scores at once. */
export function computeScores(
  m: ScorableMember,
  config: ScoringConfig = defaultScoringConfig,
) {
  return {
    physicalScore: computePhysicalScore(m, config),
    mentalScore: computeMentalScore(m, config),
  };
}
