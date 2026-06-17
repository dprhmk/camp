"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, canManageMember, canManageSquad } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { recomputeSquadTotalsMany } from "@/lib/aggregates";
import { computeScores } from "@/lib/scoring";
import { generateCode, isProfileComplete } from "@/lib/member-utils";
import { fieldErrors, memberSchema, type MemberInput } from "@/lib/validation";
import type { SessionUser } from "@/lib/session";
import type { ActionState } from "./types";

function parseDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Map validated input to a Prisma data object (without camp/code). */
function toData(input: MemberInput) {
  const scores = computeScores(input);
  return {
    isLeader: input.isLeader ?? false,
    isProfileComplete: isProfileComplete(input),
    physicalScore: scores.physicalScore,
    mentalScore: scores.mentalScore,
    squadId: input.squadId ?? null,
    lastName: input.lastName ?? null,
    firstName: input.firstName ?? null,
    middleName: input.middleName ?? null,
    dateOfBirth: parseDate(input.dateOfBirth),
    gender: input.gender ?? null,
    residenceType: input.residenceType ?? null,
    photoUrl: input.photoUrl ?? null,
    childPhone: input.childPhone ?? null,
    guardianName: input.guardianName ?? null,
    parentsPhone: input.parentsPhone ?? null,
    additionalContact: input.additionalContact ?? null,
    instagram: input.instagram ?? null,
    telegram: input.telegram ?? null,
    otherSocial: input.otherSocial ?? null,
    address: input.address ?? null,
    height: input.height ?? null,
    build: input.build ?? null,
    doesSports: input.doesSports ?? false,
    creativity: input.creativity ?? null,
    communication: input.communication ?? null,
    allergies: input.allergies ?? null,
    medicalRestrictions: input.medicalRestrictions ?? null,
    physicalRestrictions: input.physicalRestrictions ?? null,
    medicalNotes: input.medicalNotes ?? null,
    isExceptional: input.isExceptional ?? false,
  };
}

/** A leader may only assign members to a squad they lead. */
async function assertCanAssign(user: SessionUser, squadId: string | undefined) {
  if (can(user, "member:createAny")) return true;
  if (!squadId) return false;
  const squad = await prisma.squad.findUnique({ where: { id: squadId } });
  return squad ? canManageSquad(user, squad) : false;
}

async function uniqueCode(campId: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCode();
    const exists = await prisma.member.findUnique({
      where: { campId_code: { campId, code } },
    });
    if (!exists) return code;
  }
  // Extremely unlikely fallback.
  return generateCode(8);
}

export async function createMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const camp = await requireActiveCamp();

  const parsed = memberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  if (!(await assertCanAssign(user, parsed.data.squadId))) {
    return {
      ok: false,
      message: can(user, "member:createAny")
        ? "Не вдалося визначити загін"
        : "Ви можете додавати учасників лише у свій загін",
    };
  }

  const code = await uniqueCode(camp.id);
  const member = await prisma.member.create({
    data: { ...toData(parsed.data), campId: camp.id, code },
  });

  await recomputeSquadTotalsMany([member.squadId]);
  revalidatePath("/members");
  revalidatePath("/squads");
  redirect(`/members/${member.id}`);
}

export async function updateMemberAction(
  memberId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const camp = await requireActiveCamp();

  const member = await prisma.member.findFirst({
    where: { id: memberId, campId: camp.id },
    include: { squad: { select: { leaderUserId: true } } },
  });
  if (!member) return { ok: false, message: "Учасника не знайдено" };
  if (!canManageMember(user, member)) {
    return { ok: false, message: "Недостатньо прав для редагування цього учасника" };
  }

  const parsed = memberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  // A leader cannot move a member into a squad they don't lead.
  if (!can(user, "member:createAny")) {
    const target = parsed.data.squadId ?? null;
    if (target !== member.squadId && !(await assertCanAssign(user, parsed.data.squadId))) {
      return { ok: false, message: "Ви не можете перемістити учасника до чужого загону" };
    }
  }

  const previousSquadId = member.squadId;
  const updated = await prisma.member.update({
    where: { id: memberId },
    data: toData(parsed.data),
  });

  await recomputeSquadTotalsMany([previousSquadId, updated.squadId]);
  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  revalidatePath("/squads");
  return { ok: true };
}

export async function deleteMemberAction(memberId: string) {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  const member = await prisma.member.findFirst({
    where: { id: memberId, campId: camp.id },
    include: { squad: { select: { leaderUserId: true } } },
  });
  if (!member) return;
  if (!canManageMember(user, member)) return;

  await prisma.member.delete({ where: { id: memberId } });
  await recomputeSquadTotalsMany([member.squadId]);
  revalidatePath("/members");
  revalidatePath("/squads");
  redirect("/members");
}
