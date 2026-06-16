import { describe, expect, it } from "vitest";
import { computeMentalScore, computePhysicalScore, computeScores } from "./score";
import { distributeMembers, type DistributableMember } from "./distribute";
import { bandValue, defaultScoringConfig, mentalRawMax, physicalRawMax } from "./config";

describe("computePhysicalScore", () => {
  it("is zero for an empty profile", () => {
    expect(computePhysicalScore({})).toBe(0);
  });

  it("reaches the scale ceiling when everything is maxed", () => {
    expect(
      computePhysicalScore({
        agility: 5,
        strength: 5,
        endurance: 5,
        coordination: 5,
        doesSports: true,
        sportType: "Футбол",
        build: "ATHLETIC",
        height: 200,
        weight: 90,
      }),
    ).toBe(10);
  });

  it("normalises the four motor traits against the raw max", () => {
    // 20 raw out of 26 -> 7.69
    const expected = Math.round(((20 / physicalRawMax()) * 10) * 100) / 100;
    expect(
      computePhysicalScore({ agility: 5, strength: 5, endurance: 5, coordination: 5 }),
    ).toBe(expected);
  });

  it("respects a custom config", () => {
    const config = { ...defaultScoringConfig, scaleMax: 100 };
    expect(computePhysicalScore({}, config)).toBe(0);
  });
});

describe("computeMentalScore", () => {
  it("is zero for an empty profile", () => {
    expect(computeMentalScore({})).toBe(0);
  });

  it("reaches the ceiling when all four traits are maxed", () => {
    expect(
      computeMentalScore({ intellect: 5, logic: 5, creativity: 5, communication: 5 }),
    ).toBe(10);
  });

  it("is half the ceiling for half the points", () => {
    // 10 of 20 -> 5
    expect(computeMentalScore({ intellect: 5, logic: 5 })).toBe(5);
  });
});

describe("raw maxima", () => {
  it("computes the physical and mental raw ceilings", () => {
    expect(physicalRawMax()).toBe(26);
    expect(mentalRawMax()).toBe(20);
  });
});

describe("bandValue", () => {
  it("returns the highest band whose min is reached", () => {
    const bands = defaultScoringConfig.physical.heightBands;
    expect(bandValue(bands, 120)).toBe(0);
    expect(bandValue(bands, 135)).toBe(0.5);
    expect(bandValue(bands, 200)).toBe(1.5);
  });
});

describe("computeScores", () => {
  it("returns both balanced scales", () => {
    const s = computeScores({
      agility: 5,
      strength: 5,
      endurance: 5,
      coordination: 5,
      doesSports: true,
      sportType: "x",
      build: "ATHLETIC",
      height: 200,
      weight: 90,
      intellect: 5,
      logic: 5,
      creativity: 5,
      communication: 5,
    });
    expect(s).toEqual({ physicalScore: 10, mentalScore: 10 });
  });
});

describe("distributeMembers", () => {
  const make = (n: number): DistributableMember[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `m${i}`,
      physicalScore: (i % 5) + 1,
      mentalScore: ((i + 2) % 5) + 1,
    }));

  it("assigns every member exactly once", () => {
    const { assignment } = distributeMembers(make(20), 4);
    expect(Object.keys(assignment)).toHaveLength(20);
  });

  it("keeps squad sizes balanced within one", () => {
    const { squads } = distributeMembers(make(23), 4);
    const sizes = squads.map((s) => s.size);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it("balances the combined load within one member's weight (LPT guarantee)", () => {
    const { squads } = distributeMembers(make(80), 5);
    const combinedTotals = squads.map((s) => s.totalPhysical + s.totalMental);
    const spread = Math.max(...combinedTotals) - Math.min(...combinedTotals);
    // LPT bounds the combined-load spread by the heaviest single member (<= 10 here).
    expect(spread).toBeLessThanOrEqual(10);
  });

  it("is deterministic", () => {
    expect(distributeMembers(make(15), 3).assignment).toEqual(
      distributeMembers(make(15), 3).assignment,
    );
  });

  it("handles fewer members than squads", () => {
    const { squads } = distributeMembers(make(2), 4);
    expect(squads.filter((s) => s.size > 0)).toHaveLength(2);
  });

  it("throws for an invalid squad count", () => {
    expect(() => distributeMembers(make(3), 0)).toThrow();
  });
});
