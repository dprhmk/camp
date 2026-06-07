import { notFound } from "next/navigation";
import { Crown, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, canManageMember } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { updateMemberAction } from "@/lib/actions/members";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/feedback";
import { fullName } from "@/lib/utils";
import { MemberForm } from "../member-form";
import { ProfileView } from "../profile-view";
import { DeleteMemberButton } from "./delete-member";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const camp = await requireActiveCamp();

  const member = await prisma.member.findUnique({
    where: { id },
    include: { squad: { select: { id: true, name: true, color: true, leaderUserId: true } } },
  });
  if (!member || member.campId !== camp.id) notFound();

  const editable = canManageMember(user, member);
  const createAny = can(user, "member:createAny");

  const squads = await prisma.squad.findMany({
    where: { campId: camp.id, ...(createAny ? {} : { leaderUserId: user.id }) },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <Container>
      <PageHeader
        title={fullName(member)}
        back="/members"
        action={editable ? <DeleteMemberButton id={member.id} /> : undefined}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-slate-700">
          {member.code}
        </span>
        {member.squad && (
          <span
            className="rounded-full px-2.5 py-1 font-medium text-white"
            style={{ backgroundColor: member.squad.color }}
          >
            {member.squad.name}
          </span>
        )}
        {member.isLeader && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">
            <Crown className="size-3.5" /> Лідер
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
          💪 {member.physicalScore}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
          <Star className="size-3.5 text-violet-500" /> {member.mentalScore}
        </span>
        {!member.isProfileComplete && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-700">
            Анкета не заповнена
          </span>
        )}
      </div>

      {editable ? (
        <MemberForm
          action={updateMemberAction.bind(null, member.id)}
          values={{ ...member, dateOfBirth: member.dateOfBirth?.toISOString() ?? "" }}
          squads={squads}
          submitLabel="Зберегти зміни"
        />
      ) : (
        <>
          <Alert variant="info" className="mb-4">
            Ви можете переглядати цього учасника, але керувати ним може лише його вожатий або
            директор.
          </Alert>
          <ProfileView m={member} />
        </>
      )}
    </Container>
  );
}
