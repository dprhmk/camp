import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getActiveCampId } from "@/lib/session";
import { Container, PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/feedback";
import { Tent } from "lucide-react";
import { CampList, CreateCampDialog } from "./camps-client";

export default async function CampsPage() {
  const user = await requireUser();
  const activeCampId = await getActiveCampId();
  const canManage = can(user, "camp:create");

  const camps = await prisma.camp.findMany({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { members: true, squads: true } } },
  });

  return (
    <Container>
      <PageHeader
        title="Табори"
        description="Оберіть активний табір або створіть новий сезон"
        action={canManage ? <CreateCampDialog /> : undefined}
      />

      {camps.length === 0 ? (
        <EmptyState
          icon={Tent}
          title="Ще немає таборів"
          description={
            canManage
              ? "Створіть перший табір, щоб почати додавати загони та учасників."
              : "Зачекайте, поки супер-адмін створить табір."
          }
          action={canManage ? <CreateCampDialog /> : undefined}
        />
      ) : (
        <CampList
          camps={camps.map((c) => ({
            id: c.id,
            name: c.name,
            year: c.year,
            description: c.description,
            members: c._count.members,
            squads: c._count.squads,
          }))}
          activeCampId={activeCampId}
          canDelete={can(user, "camp:delete")}
        />
      )}
    </Container>
  );
}
