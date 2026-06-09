import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireActiveCamp } from "@/lib/camp";
import { isBirthdayThisWeek } from "@/lib/utils";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { MembersList } from "./members-list";

export default async function MembersPage() {
  const camp = await requireActiveCamp();

  const [members, squads] = await Promise.all([
    prisma.member.findMany({
      where: { campId: camp.id },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        code: true,
        lastName: true,
        firstName: true,
        middleName: true,
        isLeader: true,
        isProfileComplete: true,
        dateOfBirth: true,
        physicalScore: true,
        mentalScore: true,
        squad: { select: { id: true, name: true, color: true } },
      },
    }),
    prisma.squad.findMany({
      where: { campId: camp.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <Container>
      <PageHeader
        title="Учасники"
        description={`${members.length} у таборі «${camp.name}»`}
        action={
          <Button asChild size="sm">
            <Link href="/members/new">
              <Plus className="size-5" />
              Додати
            </Link>
          </Button>
        }
      />
      <MembersList
        members={members.map((m) => ({
          id: m.id,
          code: m.code,
          lastName: m.lastName,
          firstName: m.firstName,
          middleName: m.middleName,
          isLeader: m.isLeader,
          isProfileComplete: m.isProfileComplete,
          hasBirthday: isBirthdayThisWeek(m.dateOfBirth),
          physicalScore: m.physicalScore,
          mentalScore: m.mentalScore,
          squad: m.squad,
        }))}
        squads={squads}
      />
    </Container>
  );
}
