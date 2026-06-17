import { Card, CardContent } from "@/components/ui/card";
import { AGE_BANDS } from "@/lib/member-utils";

export type SquadSummary = {
  id: string;
  name: string;
  color: string;
  count: number;
  male: number;
  female: number;
  building: number;
  home: number;
  ageBands: Record<string, number>;
  avgPhysical: number;
  avgMental: number;
  avgCreativity: number;
  avgCommunication: number;
};

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Side-by-side team tiles for eyeballing balance after a generation. */
export function SquadSummaries({ squads }: { squads: SquadSummary[] }) {
  if (squads.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 mt-6 text-base font-semibold text-slate-900">Характеристики команд</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {squads.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="size-4 rounded-full" style={{ backgroundColor: s.color }} />
                <h3 className="flex-1 truncate font-semibold text-slate-900">{s.name}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-700">
                  👥 {s.count}
                </span>
              </div>

              <Bar label="Фізична" value={s.avgPhysical} color="#0ea5e9" />
              <Bar label="Розумова" value={s.avgMental} color="#a855f7" />

              <div className="flex justify-between text-xs text-slate-600">
                <span>Творчість: <b>{r1(s.avgCreativity)}</b></span>
                <span>Комунікація: <b>{r1(s.avgCommunication)}</b></span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>♂ Хлопці: <b>{s.male}</b></span>
                <span>♀ Дівчата: <b>{s.female}</b></span>
                <span>🏠 Корпус: <b>{s.building}</b></span>
                <span>🚶 Вдома: <b>{s.home}</b></span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {AGE_BANDS.map((band) => (
                  <span key={band} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                    {band}: <b>{s.ageBands[band] ?? 0}</b>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="tabular-nums font-medium text-slate-800">{r1(value)} / 10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
