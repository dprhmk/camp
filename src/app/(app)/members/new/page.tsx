import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { createMemberAction } from "@/lib/actions/members";
import { getSquadLeaders } from "@/lib/leaders";
import { Container, PageHeader } from "@/components/layout/page-header";
import { MemberForm } from "../member-form";

export default async function NewMemberPage() {
  await requireUser();
  const camp = await requireActiveCamp();

  const [squads, squadLeaders] = await Promise.all([
    prisma.squad.findMany({
      where: { campId: camp.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSquadLeaders(camp.id),
  ]);

  return (
    <Container>
      <PageHeader title="Новий учасник" back="/members" />
      <MemberForm
        action={createMemberAction}
        squads={squads}
        squadLeaders={squadLeaders}
        submitLabel="Створити учасника"
      />
    </Container>
  );
}
