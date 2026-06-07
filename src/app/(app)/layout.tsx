import { requireUser } from "@/lib/auth";
import { getActiveCamp } from "@/lib/camp";
import { can } from "@/lib/rbac";
import { ToastProvider } from "@/components/ui/toast";
import { AppChrome } from "@/components/layout/app-chrome";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const camp = await getActiveCamp();

  const caps = {
    generate: can(user, "generate:run"),
    users: can(user, "user:manage"),
    camps: can(user, "camp:create"),
    schedule: can(user, "schedule:edit"),
  };

  return (
    <ToastProvider>
      <AppChrome
        user={{ name: user.name, role: user.role }}
        camp={camp ? { id: camp.id, name: camp.name, year: camp.year } : null}
        caps={caps}
      >
        {children}
      </AppChrome>
    </ToastProvider>
  );
}
