import { defaultScoringConfig } from "@/lib/scoring";

const SCALE_MAX = defaultScoringConfig.scaleMax;
const safe = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

/**
 * The two balanced scales shown as separate gauges: a physical scale and a
 * mental / creative ("розумова") scale, each 0..scaleMax. Pass a member's own
 * scores, or a squad's per-member averages.
 */
export function StatsScales({
  physicalScore,
  mentalScore,
}: {
  physicalScore: number;
  mentalScore: number;
}) {
  return (
    <div className="grid w-full gap-3">
      <ScaleBar label="Фізична" value={safe(physicalScore)} color="#0ea5e9" />
      <ScaleBar label="Розумова" value={safe(mentalScore)} color="#a855f7" />
    </div>
  );
}

function ScaleBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / SCALE_MAX) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          {Math.round(value * 10) / 10} / {SCALE_MAX}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
