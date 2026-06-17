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
  /**
   * Random source. When provided, ties (equal-score members, equally-good
   * squads) are broken randomly, so each run differs while staying balanced.
   * Omit for a fully deterministic result (tests, reproducibility).
   */
  rng?: () => number;
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
  const scoreScale = options.scoreScale ?? 12;
  const rng = options.rng;

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

  // Heaviest first; ties broken randomly (rng) or by id (deterministic).
  const tie = new Map(members.map((m) => [m.id, rng ? rng() : 0]));
  const ordered = [...members].sort((a, b) => {
    const diff = combined(b) - combined(a);
    if (diff !== 0) return diff;
    return rng ? tie.get(a.id)! - tie.get(b.id)! : a.id.localeCompare(b.id);
  });

  const assignment: Record<string, number> = {};
  const EPS = 1e-9;

  for (const m of ordered) {
    // Among eligible squads, find the lowest cost, then the smallest size, then
    // pick randomly (rng) or the first (deterministic) from the remaining ties.
    let candidates: SquadLoad[] = [];
    let best = Infinity;
    for (const s of squads) {
      if (s.size >= maxSize) continue;
      const c = cost(s, m);
      if (c < best - EPS) {
        best = c;
        candidates = [s];
      } else if (Math.abs(c - best) <= EPS) {
        candidates.push(s);
      }
    }
    if (candidates.length === 0) candidates = [...squads];

    const minSize = Math.min(...candidates.map((s) => s.size));
    const tied = candidates.filter((s) => s.size === minSize);
    const target = rng ? tied[Math.floor(rng() * tied.length)] : tied[0];

    target.memberIds.push(m.id);
    target.totalPhysical = round(target.totalPhysical + m.physicalScore);
    target.totalMental = round(target.totalMental + m.mentalScore);
    for (const b of buckets(m)) target.counts[b] = (target.counts[b] ?? 0) + 1;
    assignment[m.id] = target.index;
  }

  return { squads, assignment };
}

const spreadOf = (values: number[]) => Math.max(...values) - Math.min(...values);

/** Overall imbalance of a distribution (lower = better): summed spreads. */
export function imbalanceOf(squads: SquadLoad[], scoreScale = 12): number {
  let total =
    spreadOf(squads.map((s) => s.totalPhysical)) / scoreScale +
    spreadOf(squads.map((s) => s.totalMental)) / scoreScale;
  const allBuckets = new Set(squads.flatMap((s) => Object.keys(s.counts)));
  for (const b of allBuckets) total += spreadOf(squads.map((s) => s.counts[b] ?? 0));
  return total;
}

/**
 * Run the greedy balancer several times and keep the best-balanced result.
 * With `rng` set, each attempt differs (random tie-breaks) so regenerating
 * yields a fresh — but still well-balanced — split. Without `rng` it is a
 * single deterministic run.
 */
export function distributeBalanced(
  members: DistributableMember[],
  numSquads: number,
  options: DistributeOptions & { attempts?: number } = {},
): DistributionResult {
  const attempts = options.attempts ?? (options.rng ? 16 : 1);
  let best: DistributionResult | null = null;
  let bestScore = Infinity;
  for (let i = 0; i < attempts; i++) {
    const result = distributeMembers(members, numSquads, options);
    const score = imbalanceOf(result.squads, options.scoreScale ?? 12);
    if (score < bestScore) {
      bestScore = score;
      best = result;
    }
  }
  return best!;
}
