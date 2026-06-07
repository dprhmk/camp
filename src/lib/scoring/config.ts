// Tunable weights for the scoring engine. Everything is data — change a number
// here and the whole app (and its tests) follow. No magic numbers elsewhere.

export type ScoringConfig = {
  physical: {
    agilityWeight: number; // per agility point (1..3)
    strengthWeight: number; // per strength point (1..3)
    sportsBonus: number; // added when the child does sports
    sportTypeBonus: number; // added when a specific sport is named
  };
  mental: {
    drawingWeight: number; // per drawing point (1..3)
    poetryWeight: number; // per poetry point (1..3)
    musicianBonus: number; // added when the child plays an instrument
    englishWeight: number; // per english level point (1..3)
    generalWeight: number; // per general level point (1..3)
    personality: Record<string, number>; // EXTROVERT/INTROVERT/AMBIVERT
    exceptionalBonus: number; // added when flagged "exceptional"
    firstTimePenalty: number; // subtracted when it is the child's first camp
    panicPenalty: number; // subtracted when the child has panic attacks
  };
};

export const defaultScoringConfig: ScoringConfig = {
  physical: {
    agilityWeight: 1,
    strengthWeight: 1,
    sportsBonus: 1,
    sportTypeBonus: 0.5,
  },
  mental: {
    drawingWeight: 1,
    poetryWeight: 1,
    musicianBonus: 1,
    englishWeight: 1,
    generalWeight: 1,
    personality: { EXTROVERT: 2, AMBIVERT: 1, INTROVERT: 0 },
    exceptionalBonus: 1.5,
    firstTimePenalty: 0.5,
    panicPenalty: 0.5,
  },
};
