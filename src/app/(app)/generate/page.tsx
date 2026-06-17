import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/feedback";
import { ageGroup } from "@/lib/member-utils";
import { GenerateForm } from "./generate-form";
import { SquadSummaries, type SquadSummary } from "./squad-summaries";

export default async function GeneratePage() {
  await requirePermission("generate:run");
  const camp = await requireActiveCamp();
  const [memberCount, notReadyCount, leaders, squads, members] = await Promise.all([
    prisma.member.count({ where: { campId: camp.id } }),
    prisma.member.count({ where: { campId: camp.id, isProfileComplete: false } }),
    prisma.user.findMany({
      where: { role: { in: ["LEADER", "DIRECTOR"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.squad.findMany({
      where: { campId: camp.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
    prisma.member.findMany({
      where: { campId: camp.id, squadId: { not: null } },
      select: {
        squadId: true,
        gender: true,
        residenceType: true,
        dateOfBirth: true,
        physicalScore: true,
        mentalScore: true,
        creativity: true,
        communication: true,
      },
    }),
  ]);

  // Aggregate per-squad characteristics for the comparison tiles.
  const now = new Date();
  const summaries: SquadSummary[] = squads.map((sq) => {
    const list = members.filter((m) => m.squadId === sq.id);
    const sum = (f: (m: (typeof list)[number]) => number) => list.reduce((a, m) => a + f(m), 0);
    const n = list.length || 1;
    const ageBands: Record<string, number> = {};
    for (const m of list) {
      const band = ageGroup(m.dateOfBirth, now);
      if (band) ageBands[band] = (ageBands[band] ?? 0) + 1;
    }
    return {
      id: sq.id,
      name: sq.name,
      color: sq.color,
      count: list.length,
      male: list.filter((m) => m.gender === "MALE").length,
      female: list.filter((m) => m.gender === "FEMALE").length,
      building: list.filter((m) => m.residenceType === "BUILDING").length,
      home: list.filter((m) => m.residenceType === "HOME").length,
      ageBands,
      avgPhysical: sum((m) => m.physicalScore) / n,
      avgMental: sum((m) => m.mentalScore) / n,
      avgCreativity: sum((m) => m.creativity ?? 0) / n,
      avgCommunication: sum((m) => m.communication ?? 0) / n,
    };
  });

  return (
    <Container>
      <PageHeader
        title="Розподіл команд"
        back="/squads"
        description="Балансує стать, проживання, вік, зріст, статуру та бали. Тисніть «Згенерувати», щоб перетасувати."
      />
      {memberCount === 0 ? (
        <Alert variant="info">
          У таборі ще немає учасників. Додайте учасників, перш ніж генерувати команди.
        </Alert>
      ) : (
        <>
          <GenerateForm memberCount={memberCount} notReadyCount={notReadyCount} leaders={leaders} />
          <SquadSummaries squads={summaries} />
        </>
      )}
    </Container>
  );
}
