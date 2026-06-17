// Balanced team distribution.
//
// Goal: split all members across N squads so each squad is as similar as
// possible on every axis at once:
//   • headcount (sizes differ by at most one);
//   • physical and mental score totals;
//   • every categorical "group" a member carries — gender, residence, height,
//     build, age band, … (whatever the caller puts in `groups`).
//
// Strategy: greedy. Sort members heaviest-first by combined score, then place
// each into the eligible (not-yet-full) squad that minimises the resulting
// imbalance — the sum of how far apart the squads would be (max − min) on the
// score totals (normalised) and on the count of each group the member carries.

export type DistributableMember = {
  id: string;
  physicalScore: number;
  mentalScore: number;
  /** Categorical buckets to spread evenly, e.g. "g:MALE", "r:HOME", "age:12-13". */
  groups?: string[];
};

export type SquadLoad = {
  index: number;
  memberIds: string[];
  totalPhysical: number;
  totalMental: number;
  /** Per-bucket counts, e.g. "g:MALE", "r:HOME". */
  counts: Record<string, number>;
  get size(): number;
};

export type DistributionResult = {
  squads: SquadLoad[];
  /** memberId -> squad index */
  assignment: Record<string, number>;
};

export type DistributeOptions = {
  /** Score scale (used to normalise score spread against count spread). */
  scoreScale?: number;
};

const combined = (m: DistributableMember) => m.physicalScore + m.mentalScore;
const round = (v: number) => Math.round(v * 100) / 100;
const buckets = (m: DistributableMember) => m.groups ?? [];

export function distributeMembers(
  members: DistributableMember[],
  numSquads: number,
  options: DistributeOptions = {},
): DistributionResult {
  if (numSquads < 1) throw new Error("numSquads must be >= 1");
  // Larger scale => score spread weighs less, so gender/residence balance (the
  // higher priority) dominates while scores still break otherwise-equal ties.
  const scoreScale = options.scoreScale ?? 30;

  const squads: SquadLoad[] = Array.from({ length: numSquads }, (_, index) => ({
    index,
    memberIds: [] as string[],
    totalPhysical: 0,
    totalMental: 0,
    counts: {} as Record<string, number>,
    get size() {
      return this.memberIds.length;
    },
  }));

  const maxSize = Math.ceil(members.length / numSquads);

  // Spread (max − min) of a metric across all squads, if `boost` were added to
  // the squad at `boostIndex`.
  const spread = (value: (s: SquadLoad) => number, boostIndex: number, boost: number) => {
    let max = -Infinity;
    let min = Infinity;
    for (const s of squads) {
      const v = value(s) + (s.index === boostIndex ? boost : 0);
      if (v > max) max = v;
      if (v < min) min = v;
    }
    return max - min;
  };

  // Total imbalance if member m is placed in squad s (lower = better).
  const cost = (s: SquadLoad, m: DistributableMember) => {
    let c =
      spread((x) => x.totalPhysical, s.index, m.physicalScore) / scoreScale +
      spread((x) => x.totalMental, s.index, m.mentalScore) / scoreScale;
    for (const b of buckets(m)) c += spread((x) => x.counts[b] ?? 0, s.index, 1);
    return c;
  };

  // Heaviest first; deterministic id tie-break.
  const ordered = [...members].sort((a, b) => {
    const diff = combined(b) - combined(a);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });

  const assignment: Record<string, number> = {};

  for (const m of ordered) {
    let target: SquadLoad | null = null;
    let best = Infinity;
    for (const s of squads) {
      if (s.size >= maxSize) continue;
      const c = cost(s, m);
      if (target === null || c < best || (c === best && s.size < target.size)) {
        target = s;
        best = c;
      }
    }
    if (!target) target = squads.reduce((a, b) => (a.size <= b.size ? a : b));

    target.memberIds.push(m.id);
    target.totalPhysical = round(target.totalPhysical + m.physicalScore);
    target.totalMental = round(target.totalMental + m.mentalScore);
    for (const b of buckets(m)) target.counts[b] = (target.counts[b] ?? 0) + 1;
    assignment[m.id] = target.index;
  }

  return { squads, assignment };
}
