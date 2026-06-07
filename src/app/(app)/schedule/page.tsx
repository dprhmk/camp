import { requireUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ScheduleView } from "./schedule-view";

export default async function SchedulePage() {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  const canEdit = can(user, "schedule:edit");

  const entries = await prisma.scheduleEntry.findMany({
    where: { campId: camp.id },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <Container>
      <PageHeader title="Розклад" description={`Табір «${camp.name}»`} />
      <ScheduleView
        entries={entries.map((e) => ({
          id: e.id,
          date: e.date.toISOString(),
          startTime: e.startTime,
          endTime: e.endTime,
          title: e.title,
          description: e.description,
        }))}
        canEdit={canEdit}
      />
    </Container>
  );
}
