import { ArrowUpRight, TrendingUp } from "lucide-react";
import { MiniChart } from "./MiniChart";
import type { ThreatCardData } from "@/lib/dashboard-data";

export function ThreatCard({ data }: { data: ThreatCardData }) {
  const isCyan = data.accent === "cyan";
  return (
    <div className="glass group relative flex flex-col overflow-hidden rounded-2xl p-4 transition-shadow hover:shadow-[0_0_28px_-8px_oklch(0.82_0.15_185_/_40%)]">
      {/* top row */}
      <div className="flex items-start justify-between">
        <span
          className={
            isCyan
              ? "rounded-md bg-cyan/15 px-2 py-1 text-[10px] font-medium text-cyan ring-1 ring-cyan/30"
              : "rounded-md bg-pink/15 px-2 py-1 text-[10px] font-medium text-pink ring-1 ring-pink/30"
          }
        >
          {data.label}
        </span>
        <button className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-cyan">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold text-foreground">{data.title}</h3>
      <span className="mt-1 text-[11px] text-muted-foreground">{data.metricLabel}</span>

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
          isCyan
            ? "mt-2 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-glow-green"
            : "mt-2 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-pink"
        }
      >
        <TrendingUp className="h-3 w-3" />
        {data.growth}
      </span>

      <MiniChart accent={data.accent} className="mt-3 h-12 w-full" />
    </div>
  );
}
