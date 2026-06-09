import { prisma } from "@/lib/db";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ContactsList } from "./contacts-client";

export default async function ContactsPage() {
  const camp = await requireActiveCamp();

  const members = await prisma.member.findMany({
    where: { campId: camp.id },
    orderBy: [{ isLeader: "desc" }, { lastName: "asc" }],
    select: {
      id: true,
      lastName: true,
      firstName: true,
      middleName: true,
      isLeader: true,
      childPhone: true,
      parentsPhone: true,
      guardianName: true,
      additionalContact: true,
      address: true,
      instagram: true,
      telegram: true,
      otherSocial: true,
      squad: { select: { id: true, name: true, color: true } },
    },
  });

  return (
    <Container>
      <PageHeader title="Контакти" description={`Табір «${camp.name}»`} />
      <ContactsList members={members} />
    </Container>
  );
}
