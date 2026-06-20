import type { DashboardPeriod } from "@/lib/supabase-dashboard";

type MonitoringOverviewProps = {
  period: DashboardPeriod;
  totalScanned?: string;
  onPeriodChange: (period: DashboardPeriod) => void;
};

const periods: { label: string; value: DashboardPeriod }[] = [
  { label: "6 ч", value: "6h" },
  { label: "12 ч", value: "12h" },
  { label: "24 ч", value: "24h" },
  { label: "7 д", value: "7d" },
  { label: "30 д", value: "30d" },
];

export function MonitoringOverview({
  period,
  totalScanned = "1 248",
  onPeriodChange,
}: MonitoringOverviewProps) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-foreground">
          Обзор мониторинга
        </h3>
        <select
          className="cursor-pointer border border-border/45 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus:border-cyan/40 focus:text-cyan"
          value={period}
          onChange={(event) =>
            onPeriodChange(event.target.value as DashboardPeriod)
          }
        >
          {periods.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-[34px] font-bold leading-none tracking-tight text-foreground">
          {totalScanned}
        </span>
      </div>
      <span className="text-[12px] text-muted-foreground">
        Всего найдено иссточников
      </span>
    </section>
  );
}
