import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, canManageSquad } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/feedback";
import { Shield } from "lucide-react";
import { SquadsView, CreateSquadDialog } from "./squads-client";

export default async function SquadsPage() {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  const canManageAny = can(user, "squad:manageAny");
  const canChangeLeader = can(user, "squad:changeLeader");

  const [squads, leaders, traitAverages] = await Promise.all([
    prisma.squad.findMany({
      where: { campId: camp.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { members: true } } },
    }),
    canChangeLeader
      ? prisma.user.findMany({
          where: { role: { in: ["LEADER", "DIRECTOR"] } },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    // Per-squad average of both scales, for the team gauges.
    prisma.member.groupBy({
      by: ["squadId"],
      where: { campId: camp.id, squadId: { not: null } },
      _avg: { physicalScore: true, mentalScore: true },
    }),
  ]);

  const avgBySquad = new Map(traitAverages.map((a) => [a.squadId, a._avg]));

  return (
    <Container>
      <PageHeader
        title="Загони"
        description={`${squads.length} у таборі «${camp.name}»`}
        action={canManageAny ? <CreateSquadDialog leaders={leaders} canChangeLeader={canChangeLeader} /> : undefined}
      />

      {squads.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Ще немає загонів"
          description={
            canManageAny
              ? "Створіть загони вручну або скористайтесь автоматичним розподілом команд."
              : "Загони ще не створено."
          }
        />
      ) : (
        <SquadsView
          squads={squads.map((s) => {
            const avg = avgBySquad.get(s.id);
            return {
              id: s.id,
              name: s.name,
              color: s.color,
              leaderUserId: s.leaderUserId,
              leaderName: s.leaderName,
              assistantName: s.assistantName,
              members: s._count.members,
              canManage: canManageSquad(user, s),
              physicalScore: avg?.physicalScore ?? 0,
              mentalScore: avg?.mentalScore ?? 0,
            };
          })}
          leaders={leaders}
          canChangeLeader={canChangeLeader}
          canDelete={canManageAny}
        />
      )}
    </Container>
  );
}
