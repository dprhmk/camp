"use client";

import * as React from "react";
import { Phone, MapPin, Crown, AtSign, Send, Search, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/input";
import { fullName } from "@/lib/utils";

export type ContactRow = {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  isLeader: boolean;
  childPhone: string | null;
  parentsPhone: string | null;
  guardianName: string | null;
  additionalContact: string | null;
  address: string | null;
  instagram: string | null;
  telegram: string | null;
  otherSocial: string | null;
  squad: { id: string; name: string; color: string } | null;
};

export function ContactsList({
  members,
  squads,
}: {
  members: ContactRow[];
  squads: { id: string; name: string }[];
}) {
  const [query, setQuery] = React.useState("");
  const [squadId, setSquadId] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (squadId === "none" && m.squad) return false;
      if (squadId && squadId !== "none" && m.squad?.id !== squadId) return false;
      if (!q) return true;
      const haystack = [
        fullName(m),
        m.squad?.name,
        m.childPhone,
        m.parentsPhone,
        m.guardianName,
        m.additionalContact,
        m.address,
        m.instagram,
        m.telegram,
        m.otherSocial,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [members, query, squadId]);

  // Group by squad; unassigned last (leaders already sorted first server-side).
  const groups = React.useMemo(() => {
    const map = new Map<string, { name: string; color: string | null; members: ContactRow[] }>();
    for (const m of filtered) {
      const key = m.squad?.id ?? "none";
      if (!map.has(key)) {
        map.set(key, { name: m.squad?.name ?? "Без загону", color: m.squad?.color ?? null, members: [] });
      }
      map.get(key)!.members.push(m);
    }
    return [...map.values()].sort((a, b) =>
      a.name === "Без загону" ? 1 : b.name === "Без загону" ? -1 : a.name.localeCompare(b.name),
    );
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за іменем, телефоном, загоном…"
            className="pl-11"
            inputMode="search"
          />
        </div>
        <Select value={squadId} onChange={(e) => setSquadId(e.target.value)}>
          <option value="">Усі загони</option>
          {squads.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value="none">Без загону</option>
        </Select>
      </div>

      {members.length === 0 ? (
        <EmptyState icon={Phone} title="Немає контактів" description="Додайте учасників, щоб побачити контакти." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Нічого не знайдено" description="Спробуйте інший запит." />
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.name}>
              <div className="mb-2 flex items-center gap-2">
                {group.color && (
                  <span className="size-3 rounded-full" style={{ backgroundColor: group.color }} />
                )}
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {group.name}
                </h2>
                <span className="text-xs text-slate-400">{group.members.length}</span>
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
    </div>
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
