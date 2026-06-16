import { ArrowUpRight, TrendingUp } from "lucide-react";
import { MiniChart } from "./MiniChart";
import type { ThreatCardData } from "@/lib/dashboard-data";

export function ThreatCard({ data }: { data: ThreatCardData }) {
  const isEscalating = data.accent === "red";

  return (
    <div className="glass group relative flex flex-col overflow-hidden rounded-2xl p-4 transition-colors hover:border-cyan/45">
      {/* top row */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-glow-green">
          <span className="h-1.5 w-1.5 rounded-full bg-glow-green" />
          {data.label}
        </span>
        <button className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-cyan">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold text-foreground">
        {data.title}
      </h3>
      <span className="mt-1 text-[11px] text-muted-foreground">
        {data.metricLabel}
      </span>

      <div className="mt-1 flex items-center gap-2">
        <span className="text-[28px] font-bold leading-none tracking-tight text-foreground">
          {data.value}
        </span>
        <span className="rounded-md bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
          {data.posts}
        </span>
      </div>

      <span
        className={
          isEscalating
            ? "mt-2 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-pink"
            : "mt-2 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-glow-green"
        }
      >
        <TrendingUp className="h-3 w-3" />
        {data.growth}
      </span>

      <MiniChart accent={data.accent} className="mt-3 h-12 w-full" />
    </div>
  );
}
