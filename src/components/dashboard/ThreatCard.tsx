import { ArrowUpRight } from "lucide-react";
import { MiniChart } from "./MiniChart";
import type { ThreatCardData } from "@/lib/dashboard-data";

export function ThreatCard({ data }: { data: ThreatCardData }) {
  const targetHref = data.href ?? "/ai-analysis";

  return (
    <a
      href={targetHref}
      data-threat-card-link
      className="glass group relative flex h-full min-h-[218px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/35 p-4 transition-colors hover:border-cyan/45"
      aria-label={`Открыть AI-анализ: ${data.title}`}
    >
      <div className="flex h-7 items-start justify-between">
        <span className="text-[12px] font-normal uppercase text-muted-foreground">
          {data.label}
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors group-hover:bg-muted/40 group-hover:text-cyan">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-[42px] text-[15px] font-semibold leading-snug text-foreground">
        {data.title}
      </h3>
      <span className="mt-1 text-[11px] text-muted-foreground">
        {data.metricLabel}
      </span>

      <div className="mt-1 flex min-h-9 items-center gap-2">
        <span className="shrink-0 text-[28px] font-bold leading-none text-foreground">
          {data.value}
        </span>
      </div>

      <MiniChart accent={data.accent} className="mt-auto h-12 w-full pt-3" />
    </a>
  );
}
