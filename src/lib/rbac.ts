import type { Role } from "./enums";
import type { SessionUser } from "./session";

// Two roles. SUPER_ADMIN can do everything. USER may view everything and fully
// manage members (create / edit / delete ANY member) — nothing else: accounts,
// camps, squads, schedule and team distribution are all SUPER_ADMIN only.
//
// Permissions grant a SCOPE of actions, not visibility of profile sections:
// anyone who may edit a member sees all of that member's fields.

export type Action =
  | "camp:create"
  | "camp:delete"
  | "camp:manage" // edit camp settings
  | "user:manage" // create/edit accounts
  | "squad:manageAny" // create/edit/delete squads
  | "squad:changeLeader"
  | "member:createAny"
  | "member:deleteAny"
  | "generate:run"
  | "codes:manage" // generate/print the pre-printed QR code pool
  | "schedule:edit"
  | "system";

const ALL_ACTIONS: Action[] = [
  "camp:create",
  "camp:delete",
  "camp:manage",
  "user:manage",
  "squad:manageAny",
  "squad:changeLeader",
  "member:createAny",
  "member:deleteAny",
  "generate:run",
  "codes:manage",
  "schedule:edit",
  "system",
];

const MATRIX: Record<Role, Action[]> = {
  SUPER_ADMIN: ALL_ACTIONS,
  USER: ["member:createAny", "member:deleteAny"],
};

/** Squad fields that bind staff accounts (leader + two assistants) — a label. */
export type SquadStaff = {
  leaderUserId: string | null;
  assistant1UserId: string | null;
  assistant2UserId: string | null;
};

/** Can this user perform a global/camp-wide action? */
export function can(user: Pick<SessionUser, "role">, action: Action): boolean {
  return MATRIX[user.role]?.includes(action) ?? false;
}

/** Can this user create/edit/delete squads? (SUPER_ADMIN only.) */
export function canManageSquad(user: Pick<SessionUser, "role">): boolean {
  return can(user, "squad:manageAny");
}

/** Can this user edit/delete members? Both roles may manage any member. */
export function canManageMember(user: Pick<SessionUser, "role">): boolean {
  return can(user, "member:createAny");
}
