import { describe, expect, it } from "vitest";
import { computeMentalScore, computePhysicalScore, computeScores } from "./score";
import { distributeMembers, type DistributableMember } from "./distribute";
import { defaultScoringConfig } from "./config";

describe("computePhysicalScore", () => {
  it("is zero for an empty profile", () => {
    expect(computePhysicalScore({})).toBe(0);
  });

  it("sums agility and strength with default weights", () => {
    expect(computePhysicalScore({ agility: 3, strength: 2 })).toBe(5);
  });

  it("adds the sports bonus and sport-type bonus", () => {
    expect(
      computePhysicalScore({ agility: 1, strength: 1, doesSports: true, sportType: "Футбол" }),
    ).toBe(3.5);
  });

  it("ignores a blank sport type", () => {
    expect(computePhysicalScore({ doesSports: true, sportType: "   " })).toBe(1);
  });

  it("never goes negative", () => {
    expect(computePhysicalScore({ agility: 0, strength: 0 })).toBe(0);
  });

  it("respects a custom config", () => {
    const config = {
      ...defaultScoringConfig,
      physical: { ...defaultScoringConfig.physical, agilityWeight: 10 },
    };
    expect(computePhysicalScore({ agility: 2 }, config)).toBe(20);
  });
});

describe("computeMentalScore", () => {
  it("is zero for an empty profile", () => {
    expect(computeMentalScore({})).toBe(0);
  });

  it("combines creativity, intellect and personality", () => {
    // drawing 2 + poetry 1 + english 3 + general 2 + extrovert(2) = 10
    expect(
      computeMentalScore({
        drawing: 2,
        poetry: 1,
        englishLevel: 3,
        generalLevel: 2,
        personalityType: "EXTROVERT",
      }),
    ).toBe(10);
  });

  it("applies exceptional bonus and psychological penalties", () => {
    // base general 2 + exceptional 1.5 - firstTime 0.5 - panic 0.5 = 2.5
    expect(
      computeMentalScore({
        generalLevel: 2,
        isExceptional: true,
        firstTimeAtCamp: true,
        panicAttacks: true,
      }),
    ).toBe(2.5);
  });

  it("adds the musician bonus", () => {
    expect(computeMentalScore({ isMusician: true })).toBe(1);
  });
});

describe("computeScores", () => {
  it("returns both scores", () => {
    const s = computeScores({ agility: 1, strength: 1, generalLevel: 1 });
    expect(s).toEqual({ physicalScore: 2, mentalScore: 1 });
  });
});

describe("distributeMembers", () => {
  const make = (n: number): DistributableMember[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `m${i}`,
      physicalScore: (i % 3) + 1,
      mentalScore: ((i + 1) % 3) + 1,
    }));

  it("assigns every member exactly once", () => {
    const members = make(20);
    const { assignment } = distributeMembers(members, 4);
    expect(Object.keys(assignment)).toHaveLength(20);
  });

  it("keeps squad sizes balanced within one", () => {
    const members = make(23);
    const { squads } = distributeMembers(members, 4);
    const sizes = squads.map((s) => s.size);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it("keeps total scores reasonably even", () => {
    const members = make(60);
    const { squads } = distributeMembers(members, 5);
    const totals = squads.map((s) => s.totalPhysical + s.totalMental);
    const spread = Math.max(...totals) - Math.min(...totals);
    // With 60 members across 5 squads the imbalance should stay tiny.
    expect(spread).toBeLessThanOrEqual(3);
  });

  it("is deterministic", () => {
    const members = make(15);
    const a = distributeMembers(members, 3).assignment;
    const b = distributeMembers(members, 3).assignment;
    expect(a).toEqual(b);
  });

  it("handles fewer members than squads", () => {
    const members = make(2);
    const { squads } = distributeMembers(members, 4);
    expect(squads.filter((s) => s.size > 0)).toHaveLength(2);
  });

  it("throws for an invalid squad count", () => {
    expect(() => distributeMembers(make(3), 0)).toThrow();
  });
});
