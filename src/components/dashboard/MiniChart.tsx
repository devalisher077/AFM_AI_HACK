interface MiniChartProps {
  accent: "cyan" | "pink";
  className?: string;
}

const CYAN_POINTS = [22, 18, 20, 14, 16, 11, 13, 8, 12, 6, 9, 4];
const PINK_POINTS = [16, 19, 14, 17, 12, 15, 10, 13, 9, 12, 7, 10];

export function MiniChart({ accent, className }: MiniChartProps) {
  const points = accent === "cyan" ? CYAN_POINTS : PINK_POINTS;
  const stroke = accent === "cyan" ? "var(--cyan)" : "var(--pink)";
  const id = `mini-${accent}`;
  const w = 240;
  const h = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = w / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / (max - min || 1)) * (h - 8) - 4;
    return [x, y] as const;
  });

  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id}-fill)`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 5px ${stroke})` }}
      />
    </svg>
  );
}
