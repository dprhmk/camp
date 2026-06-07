import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/feedback";
import { GenerateForm } from "./generate-form";

export default async function GeneratePage() {
  await requirePermission("generate:run");
  const camp = await requireActiveCamp();
  const memberCount = await prisma.member.count({ where: { campId: camp.id } });

  return (
    <Container>
      <PageHeader
        title="Розподіл команд"
        back="/squads"
        description="Автоматично рознесе всіх учасників по загонах із балансуванням балів"
      />
      {memberCount === 0 ? (
        <Alert variant="info">
          У таборі ще немає учасників. Додайте учасників, перш ніж генерувати команди.
        </Alert>
      ) : (
        <GenerateForm memberCount={memberCount} />
      )}
    </Container>
  );
}
