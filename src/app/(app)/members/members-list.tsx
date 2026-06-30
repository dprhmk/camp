"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Star, Crown, ChevronRight, SearchX } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/feedback";
import { cn, displayName, fullName } from "@/lib/utils";
import { STRENGTH_OPTIONS } from "@/lib/enums";

type MemberRow = {
  id: string;
  code: string;
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  isLeader: boolean;
  isProfileComplete: boolean;
  hasBirthday: boolean;
  strength: string | null;
  agilitySeconds: number | null;
  isFromBelievingFamily: boolean;
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
  const [strength, setStrength] = React.useState("");
  const [dvbOnly, setDvbOnly] = React.useState(false);
  const [maxAgility, setMaxAgility] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const agilityLimit = maxAgility.trim() === "" ? null : Number(maxAgility);
    return members.filter((m) => {
      if (squadId === "none" && m.squad) return false;
      if (squadId && squadId !== "none" && m.squad?.id !== squadId) return false;
      if (incompleteOnly && m.isProfileComplete) return false;
      if (strength && m.strength !== strength) return false;
      if (dvbOnly && !m.isFromBelievingFamily) return false;
      // Спритність: keep members at or faster than the threshold (lower = faster).
      if (agilityLimit !== null && !Number.isNaN(agilityLimit)) {
        if (m.agilitySeconds === null || m.agilitySeconds > agilityLimit) return false;
      }
      if (!q) return true;
      return (
        fullName(m).toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
      );
    });
  }, [members, query, squadId, incompleteOnly, strength, dvbOnly, maxAgility]);

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
          <Select value={strength} onChange={(e) => setStrength(e.target.value)} className="flex-1">
            <option value="">Будь-яка сила</option>
            {STRENGTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={maxAgility}
            onChange={(e) => setMaxAgility(e.target.value)}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="Спритність до (сек)"
            className="flex-1"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 px-1 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={incompleteOnly}
              onChange={(e) => setIncompleteOnly(e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-600"
            />
            Лише незаповнені анкети
          </label>
          <label className="flex items-center gap-2 px-1 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={dvbOnly}
              onChange={(e) => setDvbOnly(e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-600"
            />
            Лише ДВБ
          </label>
        </div>
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
                        {displayName(m)}
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
