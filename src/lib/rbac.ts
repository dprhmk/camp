import type { Role } from "./enums";
import type { SessionUser } from "./session";

// Permission model: roles grant a SCOPE of actions, not visibility of profile
// sections. Anyone who can edit a member sees all of that member's fields.

export type Action =
  | "camp:create"
  | "camp:delete"
  | "camp:manage" // edit camp settings
  | "user:manage" // create/edit accounts
  | "squad:manageAny" // manage any squad
  | "squad:changeLeader"
  | "member:createAny"
  | "member:deleteAny"
  | "generate:run"
  | "schedule:edit"
  | "system";

const MATRIX: Record<Role, Action[]> = {
  SUPER_ADMIN: [
    "camp:create",
    "camp:delete",
    "camp:manage",
    "user:manage",
    "squad:manageAny",
    "squad:changeLeader",
    "member:createAny",
    "member:deleteAny",
    "generate:run",
    "schedule:edit",
    "system",
  ],
  DIRECTOR: [
    "squad:manageAny",
    "squad:changeLeader",
    "member:createAny",
    "member:deleteAny",
    "generate:run",
    "schedule:edit",
  ],
  LEADER: [],
};

/** Can this user perform a global/camp-wide action? */
export function can(user: Pick<SessionUser, "role">, action: Action): boolean {
  return MATRIX[user.role]?.includes(action) ?? false;
}

/**
 * Can this user manage a specific squad (edit its members, settings, leader)?
 * Super-admins and directors manage any squad; a leader manages only the squad
 * they lead.
 */
export function canManageSquad(
  user: Pick<SessionUser, "id" | "role">,
  squad: { leaderUserId: string | null },
): boolean {
  if (can(user, "squad:manageAny")) return true;
  return user.role === "LEADER" && squad.leaderUserId === user.id;
}

/** Can this user edit/delete a given member (based on the member's squad)? */
export function canManageMember(
  user: Pick<SessionUser, "id" | "role">,
  member: { squad: { leaderUserId: string | null } | null },
): boolean {
  if (can(user, "member:createAny")) return true;
  if (!member.squad) return false; // unassigned -> only director/admin
  return canManageSquad(user, member.squad);
}
