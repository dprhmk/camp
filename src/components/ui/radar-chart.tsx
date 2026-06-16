// Dota-style radar (spider) chart. Pure SVG, no hooks — safe to render from
// server components. Each axis is normalised to its own max so dimensions with
// different ceilings stay comparable.
//
// The drawing uses a fixed internal coordinate system (VIEW_W × VIEW_H) with
// padding reserved for the axis labels, and is displayed at `width` px (capped
// to the container) so it never stretches to fill its parent.

export type RadarAxis = { label: string; value: number; max: number };

const VIEW_W = 360; // extra horizontal room for long side labels
const VIEW_H = 260;
const CX = VIEW_W / 2;
const CY = 122;
const RADIUS = 82;

export function RadarChart({
  axes,
  width = 280,
  color = "#2563eb",
  className,
}: {
  axes: RadarAxis[];
  width?: number;
  color?: string;
  className?: string;
}) {
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const frac = (a: RadarAxis) => {
    if (!a.max || !Number.isFinite(a.value)) return 0;
    return Math.max(0, Math.min(1, a.value / a.max));
  };

  // Vertex for axis i at a 0..1 fraction of the radius.
  const point = (i: number, f: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [CX + RADIUS * f * Math.cos(angle), CY + RADIUS * f * Math.sin(angle)] as const;
  };

  const poly = (f: (i: number) => number) =>
    axes.map((_, i) => point(i, f(i)).join(",")).join(" ");

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={width}
      style={{ maxWidth: "100%", height: "auto" }}
      className={className}
      role="img"
      aria-label="Характеристики"
    >
      {rings.map((r) => (
        <polygon key={r} points={poly(() => r)} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      <polygon
        points={poly((i) => frac(axes[i]))}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={2}
      />
      {axes.map((a, i) => {
        const [x, y] = point(i, frac(a));
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      {axes.map((a, i) => {
        const [lx, ly] = point(i, 1);
        const dx = lx - CX;
        const dy = ly - CY;
        const anchor = Math.abs(dx) < 4 ? "middle" : dx > 0 ? "start" : "end";
        // Push the label just outside its vertex.
        const x = lx + (anchor === "middle" ? 0 : dx > 0 ? 8 : -8);
        const y = ly + (Math.abs(dy) < 4 ? 0 : dy > 0 ? 18 : -12);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-slate-600"
            fontSize={11}
            fontWeight={600}
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
