import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, ownSquadFilter } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { createMemberAction } from "@/lib/actions/members";
import { getSquadLeaders } from "@/lib/leaders";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/feedback";
import { MemberForm } from "../member-form";

export default async function NewMemberPage() {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  const createAny = can(user, "member:createAny");

  const [squads, squadLeaders] = await Promise.all([
    prisma.squad.findMany({
      where: { campId: camp.id, ...(createAny ? {} : ownSquadFilter(user.id)) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSquadLeaders(camp.id),
  ]);

  return (
    <Container>
      <PageHeader title="Новий учасник" back="/members" />
      {!createAny && squads.length === 0 ? (
        <Alert variant="info">
          До вас ще не привʼязано загін. Зверніться до директора, щоб додавати учасників.
        </Alert>
      ) : (
        <MemberForm
          action={createMemberAction}
          squads={squads}
          squadLeaders={squadLeaders}
          submitLabel="Створити учасника"
        />
      )}
    </Container>
  );
}
