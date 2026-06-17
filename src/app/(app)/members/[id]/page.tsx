import { notFound } from "next/navigation";
import { Crown } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, canManageMember } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { updateMemberAction } from "@/lib/actions/members";
import { getSquadLeaders } from "@/lib/leaders";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/card";
import { displayName } from "@/lib/utils";
import { StatsScales } from "@/components/stats-scales";
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

  const [squads, squadLeaders] = await Promise.all([
    prisma.squad.findMany({
      where: { campId: camp.id, ...(createAny ? {} : { leaderUserId: user.id }) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSquadLeaders(camp.id),
  ]);

  return (
    <Container>
      <PageHeader
        title={displayName(member)}
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
        {!member.isProfileComplete && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-700">
            Не готова до розподілу
          </span>
        )}
      </div>

      <Card className="mb-4">
        <CardContent>
          <StatsScales physicalScore={member.physicalScore} mentalScore={member.mentalScore} />
        </CardContent>
      </Card>

      {editable ? (
        <MemberForm
          // Remount with fresh server values after each successful save so the
          // uncontrolled fields don't keep React 19's post-action reset to the
          // stale mount-time defaults. updatedAt changes only on a real save.
          key={member.updatedAt.toISOString()}
          action={updateMemberAction.bind(null, member.id)}
          values={{ ...member, dateOfBirth: member.dateOfBirth?.toISOString() ?? "" }}
          squads={squads}
          squadLeaders={squadLeaders}
          currentMemberId={member.id}
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
