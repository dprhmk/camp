import { describe, expect, it } from "vitest";
import { computeMentalScore, computePhysicalScore, computeScores } from "./score";
import { distributeMembers, type DistributableMember } from "./distribute";
import { defaultScoringConfig, mentalRawMax, physicalRawMax } from "./config";

describe("computePhysicalScore", () => {
  it("is zero for an empty profile", () => {
    expect(computePhysicalScore({})).toBe(0);
  });

  it("reaches the scale ceiling when everything is maxed", () => {
    expect(computePhysicalScore({ height: "HIGH", build: "AVERAGE", doesSports: true })).toBe(10);
  });

  it("normalises against the raw max", () => {
    // MEDIUM(2) + SLIM(1) = 3 of 7 -> 4.29
    const expected = Math.round(((3 / physicalRawMax()) * 10) * 100) / 100;
    expect(computePhysicalScore({ height: "MEDIUM", build: "SLIM" })).toBe(expected);
  });

  it("ignores unknown values", () => {
    expect(computePhysicalScore({ height: "???", build: "???" })).toBe(0);
  });
});

describe("computeMentalScore", () => {
  it("is zero for an empty profile", () => {
    expect(computeMentalScore({})).toBe(0);
  });

  it("reaches the ceiling when both traits are maxed", () => {
    expect(computeMentalScore({ creativity: 5, communication: 5 })).toBe(10);
  });

  it("is half the ceiling for half the points", () => {
    expect(computeMentalScore({ creativity: 5 })).toBe(5);
  });

  it("'особливий' lowers the mental score by the configured factor", () => {
    // full 10 × 0.5 -> 5
    expect(computeMentalScore({ creativity: 5, communication: 5, isExceptional: true })).toBe(5);
  });
});

describe("raw maxima", () => {
  it("computes the physical and mental raw ceilings", () => {
    expect(physicalRawMax()).toBe(7); // height 3 + build 2 + sports 2
    expect(mentalRawMax()).toBe(10); // 2 traits × 5
  });

  it("scales with scaleMax", () => {
    const config = { ...defaultScoringConfig, scaleMax: 100 };
    expect(computeMentalScore({ creativity: 5, communication: 5 }, config)).toBe(100);
  });
});

describe("computeScores", () => {
  it("returns both balanced scales", () => {
    expect(
      computeScores({
        height: "HIGH",
        build: "AVERAGE",
        doesSports: true,
        creativity: 5,
        communication: 5,
      }),
    ).toEqual({ physicalScore: 10, mentalScore: 10 });
  });
});

describe("distributeMembers", () => {
  const make = (n: number): DistributableMember[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `m${i}`,
      physicalScore: (i % 5) + 1,
      mentalScore: ((i + 2) % 5) + 1,
      groups: [
        i % 2 === 0 ? "g:MALE" : "g:FEMALE",
        i % 3 === 0 ? "r:HOME" : "r:BUILDING",
      ],
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
    const totals = squads.map((s) => s.totalPhysical + s.totalMental);
    expect(Math.max(...totals) - Math.min(...totals)).toBeLessThanOrEqual(10);
  });

  it("spreads gender and residence evenly across squads", () => {
    const { squads } = distributeMembers(make(48), 4);
    const countIn = (s: (typeof squads)[number], bucket: string) => s.counts[bucket] ?? 0;
    // Greedy multi-objective balance with a hard headcount cap: within ~2 on
    // adversarial (score-correlated) data — far tighter than random (~5-6) and
    // typically ±1 on real uncorrelated data.
    for (const bucket of ["g:MALE", "g:FEMALE", "r:HOME", "r:BUILDING"]) {
      const counts = squads.map((s) => countIn(s, bucket));
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2);
    }
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
