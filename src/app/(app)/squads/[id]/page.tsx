import { notFound } from "next/navigation";
import Link from "next/link";
import { Crown, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/feedback";
import { ageYears } from "@/lib/member-utils";
import { displayName } from "@/lib/utils";
import { BUILD_OPTIONS, HEIGHT_OPTIONS, labelOf } from "@/lib/enums";

const HEIGHT_SHORT: Record<string, string> = { LOW: "Н", MEDIUM: "С", HIGH: "В" };
const BUILD_SHORT: Record<string, string> = { SLIM: "Худ", AVERAGE: "Сер", HEAVY: "Повн" };

export default async function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const camp = await requireActiveCamp();

  const squad = await prisma.squad.findFirst({ where: { id, campId: camp.id } });
  if (!squad) notFound();

  const members = await prisma.member.findMany({
    where: { campId: camp.id, squadId: squad.id },
    select: {
      id: true,
      code: true,
      lastName: true,
      firstName: true,
      middleName: true,
      isLeader: true,
      isExceptional: true,
      gender: true,
      dateOfBirth: true,
      height: true,
      build: true,
      doesSports: true,
      physicalScore: true,
      mentalScore: true,
    },
  });

  // Leader first, then strongest (combined score) to weakest.
  const now = new Date();
  const sorted = [...members].sort((a, b) => {
    if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
    return b.physicalScore + b.mentalScore - (a.physicalScore + a.mentalScore);
  });

  return (
    <Container>
      <PageHeader
        title={squad.name}
        back="/squads"
        description={[squad.leaderName && `Вожатий: ${squad.leaderName}`, squad.assistantName && `Помічник: ${squad.assistantName}`]
          .filter(Boolean)
          .join(" · ")}
      />

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <span className="size-4 rounded-full" style={{ backgroundColor: squad.color }} />
        <span className="inline-flex items-center gap-1">
          <Users className="size-4" /> {members.length}
        </span>
      </div>

      {members.length === 0 ? (
        <EmptyState title="У загоні ще немає учасників" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Учасник</th>
                <th className="px-2 py-2 text-center font-medium" title="Стать">Ст</th>
                <th className="px-2 py-2 text-center font-medium" title="Вік">Вік</th>
                <th className="px-2 py-2 text-center font-medium" title="Зріст">Зр</th>
                <th className="px-2 py-2 text-center font-medium" title="Статура">Стат</th>
                <th className="px-2 py-2 text-center font-medium" title="Займається спортом">Спорт</th>
                <th className="px-2 py-2 text-center font-medium" title="Фізична">💪</th>
                <th className="px-2 py-2 text-center font-medium" title="Розумова">🧠</th>
                <th className="px-2 py-2 text-center font-medium" title="Особливий">Особл</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => (
                <tr
                  key={m.id}
                  className={`border-b border-slate-100 last:border-0 ${m.isLeader ? "bg-amber-50" : ""}`}
                >
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2">
                    <Link href={`/members/${m.id}`} className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-brand-700">
                      {m.isLeader && <Crown className="size-3.5 shrink-0 text-amber-500" />}
                      <span className="truncate">{displayName(m)}</span>
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-center text-slate-600">{m.gender === "MALE" ? "Х" : m.gender === "FEMALE" ? "Д" : "—"}</td>
                  <td className="px-2 py-2 text-center text-slate-600">{ageYears(m.dateOfBirth, now) ?? "—"}</td>
                  <td className="px-2 py-2 text-center text-slate-600" title={labelOf(HEIGHT_OPTIONS, m.height)}>{m.height ? HEIGHT_SHORT[m.height] : "—"}</td>
                  <td className="px-2 py-2 text-center text-slate-600" title={labelOf(BUILD_OPTIONS, m.build)}>{m.build ? BUILD_SHORT[m.build] : "—"}</td>
                  <td className="px-2 py-2 text-center">{m.doesSports ? "✅" : "—"}</td>
                  <td className="px-2 py-2 text-center font-semibold text-sky-700">{m.physicalScore}</td>
                  <td className="px-2 py-2 text-center font-semibold text-violet-700">{m.mentalScore}</td>
                  <td className="px-2 py-2 text-center">{m.isExceptional ? "●" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
