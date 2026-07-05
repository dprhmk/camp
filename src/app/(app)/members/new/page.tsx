import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { createMemberAction } from "@/lib/actions/members";
import { getSquadLeaders } from "@/lib/leaders";
import { Container, PageHeader } from "@/components/layout/page-header";
import { MemberForm } from "../member-form";

export default async function NewMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  await requireUser();
  const camp = await requireActiveCamp();
  const requested = ((await searchParams).code ?? "").trim().toUpperCase();

  const [squads, squadLeaders, pooled] = await Promise.all([
    prisma.squad.findMany({
      where: { campId: camp.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSquadLeaders(camp.id),
    // The scan flow passes a pre-printed pool code — honour it only while it
    // is still free (in the pool and not yet assigned to a member).
    requested
      ? prisma.poolCode.findUnique({
          where: { campId_code: { campId: camp.id, code: requested } },
        })
      : null,
  ]);

  const memberTaken = pooled
    ? await prisma.member.findUnique({
        where: { campId_code: { campId: camp.id, code: requested } },
      })
    : null;
  const code = pooled && !memberTaken ? requested : undefined;

  return (
    <Container>
      <PageHeader
        title="Новий учасник"
        back="/members"
        description={code ? `Буде створено з QR-кодом ${code}` : undefined}
      />
      <MemberForm
        action={createMemberAction}
        squads={squads}
        squadLeaders={squadLeaders}
        code={code}
        submitLabel="Створити учасника"
      />
    </Container>
  );
}
