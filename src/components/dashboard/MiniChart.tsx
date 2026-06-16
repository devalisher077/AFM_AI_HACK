interface MiniChartProps {
  accent: "green" | "red";
  className?: string;
}

const GREEN_POINTS = [18, 17, 18, 16, 17, 15, 16, 14, 15, 14, 13, 13];
const RED_POINTS = [5, 7, 6, 10, 12, 15, 14, 19, 21, 25, 28, 32];

export function MiniChart({ accent, className }: MiniChartProps) {
  const points = accent === "green" ? GREEN_POINTS : RED_POINTS;
  const stroke = accent === "green" ? "var(--glow-green)" : "var(--pink)";
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
          <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
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
      />
    </svg>
  );
}
