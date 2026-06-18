import { sourceDistribution, type SourceSlice } from "@/lib/dashboard-data";

export function SourceDistribution({
  data = sourceDistribution,
}: {
  data?: SourceSlice[];
}) {
  const size = 150;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const gap = 3; // percent gap between slices

  let offset = 0;
  const segments = data.map((slice) => {
    const len = (slice.value / 100) * circ;
    const seg = {
      ...slice,
      dasharray: `${Math.max(len - gap, 0)} ${circ - Math.max(len - gap, 0)}`,
      dashoffset: -offset,
    };
    offset += len;
    return seg;
  });

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.28_0.035_205_/_14%),transparent_62%)]" />
      <div className="relative flex items-center gap-4">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={stroke}
              opacity={0.35}
            />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
                opacity={0.92}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <span className="block text-[18px] font-bold leading-none text-foreground">
                {data.length}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                Источника
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {data.map((slice) => (
            <div
              key={slice.label}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2 text-[12px] text-foreground/90">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                {slice.label}
              </span>
              <span className="text-[12px] font-semibold text-foreground">
                {slice.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
