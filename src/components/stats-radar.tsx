import { RadarChart } from "@/components/ui/radar-chart";
import { defaultScoringConfig } from "@/lib/scoring";
import { RADAR_TRAITS, type TraitKey } from "@/lib/enums";

export type TraitValues = Partial<Record<TraitKey, number | null>>;

const SCALE_MAX = defaultScoringConfig.scaleMax;
const safe = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/**
 * Dota-style stats: a radar over the eight individual traits (1..5) plus the
 * two balanced summary scales (physical / mental, 0..scaleMax) as bars. Pass a
 * member's own values, or a squad's per-trait / per-scale averages.
 */
export function StatsRadar({
  traits,
  physicalScore,
  mentalScore,
  width = 300,
  color = "#2563eb",
}: {
  traits: TraitValues;
  physicalScore: number;
  mentalScore: number;
  width?: number;
  color?: string;
}) {
  const axes = RADAR_TRAITS.map((t) => ({
    label: t.label,
    value: safe(traits[t.key]),
    max: 5,
  }));

  return (
    <div className="flex flex-col items-center gap-4">
      <RadarChart axes={axes} width={width} color={color} />
      <div className="grid w-full max-w-sm gap-2">
        <ScaleBar label="Фізична" value={safe(physicalScore)} color="#0ea5e9" />
        <ScaleBar label="Розумова" value={safe(mentalScore)} color="#a855f7" />
      </div>
    </div>
  );
}

function ScaleBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / SCALE_MAX) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {Math.round(value * 10) / 10} / {SCALE_MAX}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
