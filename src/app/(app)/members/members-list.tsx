"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Star, Crown, ChevronRight, SearchX } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/feedback";
import { cn, fullName } from "@/lib/utils";

type MemberRow = {
  id: string;
  code: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  isLeader: boolean;
  isProfileComplete: boolean;
  hasBirthday: boolean;
  physicalScore: number;
  mentalScore: number;
  squad: { id: string; name: string; color: string } | null;
};

export function MembersList({
  members,
  squads,
}: {
  members: MemberRow[];
  squads: { id: string; name: string }[];
}) {
  const [query, setQuery] = React.useState("");
  const [squadId, setSquadId] = React.useState("");
  const [incompleteOnly, setIncompleteOnly] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (squadId === "none" && m.squad) return false;
      if (squadId && squadId !== "none" && m.squad?.id !== squadId) return false;
      if (incompleteOnly && m.isProfileComplete) return false;
      if (!q) return true;
      return (
        fullName(m).toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
      );
    });
  }, [members, query, squadId, incompleteOnly]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за іменем або кодом"
            className="pl-11"
            inputMode="search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={squadId} onChange={(e) => setSquadId(e.target.value)} className="flex-1">
            <option value="">Усі загони</option>
            {squads.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value="none">Без загону</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 px-1 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={incompleteOnly}
            onChange={(e) => setIncompleteOnly(e.target.checked)}
            className="size-4 rounded border-slate-300 text-brand-600"
          />
          Лише незаповнені анкети
        </label>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title="Ще немає учасників"
          description="Додайте першого учасника табору кнопкою «Додати» вгорі."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Нічого не знайдено" description="Спробуйте змінити пошук або фільтри." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((m) => {
            const birthday = m.hasBirthday;
            return (
              <li key={m.id}>
                <Link
                  href={`/members/${m.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition active:scale-[0.99]",
                    birthday ? "border-green-300 bg-green-50" : "border-slate-200",
                  )}
                >
                  {m.squad ? (
                    <span
                      className="size-10 shrink-0 rounded-full"
                      style={{ backgroundColor: m.squad.color }}
                      title={m.squad.name}
                    />
                  ) : (
                    <span className="size-10 shrink-0 rounded-full bg-slate-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "truncate font-medium",
                          !m.isProfileComplete ? "text-red-600" : "text-slate-900",
                        )}
                      >
                        {fullName(m)}
                      </span>
                      {m.isLeader && <Crown className="size-4 shrink-0 text-amber-500" />}
                      {birthday && <span title="День народження цього тижня">🎂</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono">{m.code}</span>
                      {m.squad && <span>· {m.squad.name}</span>}
                      {!m.isProfileComplete && (
                        <span className="font-medium text-red-500">· анкета не заповнена</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                    <span className="inline-flex items-center gap-0.5" title="Фізичний бал">
                      💪 {m.physicalScore}
                    </span>
                    <span className="inline-flex items-center gap-0.5" title="Ментальний бал">
                      <Star className="size-3.5 text-violet-500" />
                      {m.mentalScore}
                    </span>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-slate-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
