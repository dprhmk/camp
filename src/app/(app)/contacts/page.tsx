import { Phone, MapPin, Crown, AtSign, Send } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { fullName } from "@/lib/utils";

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

  // Group by squad; unassigned last. Leaders already sorted first within each.
  const groups = new Map<string, { name: string; color: string | null; members: typeof members }>();
  for (const m of members) {
    const key = m.squad?.id ?? "none";
    if (!groups.has(key)) {
      groups.set(key, {
        name: m.squad?.name ?? "Без загону",
        color: m.squad?.color ?? null,
        members: [],
      });
    }
    groups.get(key)!.members.push(m);
  }
  const ordered = [...groups.values()].sort((a, b) =>
    a.name === "Без загону" ? 1 : b.name === "Без загону" ? -1 : a.name.localeCompare(b.name),
  );

  return (
    <Container>
      <PageHeader title="Контакти" description={`Табір «${camp.name}»`} />

      {members.length === 0 ? (
        <EmptyState icon={Phone} title="Немає контактів" description="Додайте учасників, щоб побачити контакти." />
      ) : (
        <div className="space-y-5">
          {ordered.map((group) => (
            <div key={group.name}>
              <div className="mb-2 flex items-center gap-2">
                {group.color && (
                  <span className="size-3 rounded-full" style={{ backgroundColor: group.color }} />
                )}
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {group.name}
                </h2>
              </div>
              <div className="space-y-2">
                {group.members.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">{fullName(m)}</span>
                        {m.isLeader && <Crown className="size-4 text-amber-500" />}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <PhoneRow label="Дитина" value={m.childPhone} />
                        <PhoneRow label="Батьки" value={m.parentsPhone} />
                        {m.guardianName && <TextRow label="Опікун" value={m.guardianName} />}
                        <PhoneRow label="Додатково" value={m.additionalContact} />
                        {m.address && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="size-4 shrink-0 text-slate-400" />
                            {m.address}
                          </div>
                        )}
                        {m.instagram && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <AtSign className="size-4 shrink-0 text-slate-400" />
                            {m.instagram}
                          </div>
                        )}
                        {m.telegram && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Send className="size-4 shrink-0 text-slate-400" />
                            {m.telegram}
                          </div>
                        )}
                        {m.otherSocial && <TextRow label="Соцмережі" value={m.otherSocial} />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

function PhoneRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <a href={`tel:${value.replace(/\s/g, "")}`} className="flex items-center gap-2 text-brand-700">
      <Phone className="size-4 shrink-0 text-slate-400" />
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </a>
  );
}

function TextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span className="text-slate-500">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
