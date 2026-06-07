import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/layout/page-header";
import { UsersView, CreateUserDialog } from "./users-client";

export default async function UsersPage() {
  const current = await requirePermission("user:manage");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <Container>
      <PageHeader
        title="Акаунти"
        description="Особисті облікові записи служителів"
        action={<CreateUserDialog />}
      />
      <UsersView
        users={users}
        currentUserId={current.id}
      />
    </Container>
  );
}
