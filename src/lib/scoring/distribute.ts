// Balanced team distribution.
//
// Goal: split all members across N squads so that (a) squad sizes differ by at
// most one and (b) the summed physical and mental scores are as even as
// possible — no squad ends up "stronger" on either scale. Because body metrics
// feed the physical score, height/weight get balanced too.
//
// Strategy: greedy LPT (longest-processing-time-first). Sort members by their
// combined score descending, then place each into the least-loaded squad that
// is not yet full.

export type DistributableMember = {
  id: string;
  physicalScore: number;
  mentalScore: number;
};

export type SquadLoad = {
  index: number;
  memberIds: string[];
  totalPhysical: number;
  totalMental: number;
  get size(): number;
};

export type DistributionResult = {
  squads: SquadLoad[];
  /** memberId -> squad index */
  assignment: Record<string, number>;
};

const combined = (m: DistributableMember) => m.physicalScore + m.mentalScore;
const load = (s: SquadLoad) => s.totalPhysical + s.totalMental;
const round = (v: number) => Math.round(v * 100) / 100;

export function distributeMembers(
  members: DistributableMember[],
  numSquads: number,
): DistributionResult {
  if (numSquads < 1) throw new Error("numSquads must be >= 1");

  const squads: SquadLoad[] = Array.from({ length: numSquads }, (_, index) => ({
    index,
    memberIds: [] as string[],
    totalPhysical: 0,
    totalMental: 0,
    get size() {
      return this.memberIds.length;
    },
  }));

  const maxSize = Math.ceil(members.length / numSquads);

  // Sort heaviest first. Tie-break by id for deterministic output.
  const ordered = [...members].sort((a, b) => {
    const diff = combined(b) - combined(a);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });

  const assignment: Record<string, number> = {};

  for (const m of ordered) {
    let target: SquadLoad | null = null;
    for (const s of squads) {
      if (s.size >= maxSize) continue;
      if (
        target === null ||
        load(s) < load(target) ||
        (load(s) === load(target) && s.size < target.size)
      ) {
        target = s;
      }
    }
    if (!target) target = squads.reduce((a, b) => (load(a) <= load(b) ? a : b));

    target.memberIds.push(m.id);
    target.totalPhysical = round(target.totalPhysical + m.physicalScore);
    target.totalMental = round(target.totalMental + m.mentalScore);
    assignment[m.id] = target.index;
  }

  return { squads, assignment };
}
