import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportDetail } from "./ReportDetail";
import { emptyReportsData, fetchReportsLiveData } from "@/lib/supabase-reports";

const timeFilters = [
  { label: "24ч", days: 1 },
  { label: "7д", days: 7 },
  { label: "30д", days: 30 },
  { label: "Все", days: undefined },
];

export function ReportsPanel() {
  const [activeTimeFilter, setActiveTimeFilter] = useState(1);
  const selectedTimeFilter = timeFilters[activeTimeFilter] ?? timeFilters[1];
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["reports-live-data", selectedTimeFilter.days ?? "all"],
    queryFn: () => fetchReportsLiveData(selectedTimeFilter.days),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const reportData = data ?? emptyReportsData;
  const reports = reportData.reports;
  const report = reports[0];

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
            {isLoading
              ? "Загрузка отчетов из Supabase..."
              : isFetching
                ? "Обновление отчетов..."
                : "Данные из Supabase"}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Аналитический отчет
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Сводная аналитика по просканированным материалам
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="text-sm text-muted-foreground">
            Просканировано:{" "}
            <span className="font-semibold text-foreground">
              {reportData.totalScanned}
            </span>
          </div>
          <div className="flex w-fit border border-border/60 bg-muted/20 p-1">
            {timeFilters.map((filter, index) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setActiveTimeFilter(index)}
                className={`px-3 py-1 text-[12px] font-medium transition-colors ${
                  activeTimeFilter === index
                    ? "border border-border/60 bg-muted/30 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <ReportsLoading />
      ) : report ? (
        <ReportDetail report={report} />
      ) : (
        <div className="glass border border-border/60 bg-card/35 p-6">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {reportData.errorMessage ??
              "Реальные отчеты из Supabase пока не найдены."}
          </p>
        </div>
      )}
    </div>
  );
}

function ReportsLoading() {
  return (
    <div className="glass min-h-[420px] animate-pulse border border-border/60 bg-card/35 p-6">
      <div className="h-4 w-48 bg-muted/40" />
      <div className="mt-4 h-8 w-72 bg-muted/35" />
      <div className="mt-3 h-3 max-w-3xl bg-muted/30" />
      <div className="mt-8 grid gap-px overflow-hidden bg-border/40 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-background/35 p-4">
            <div className="h-3 w-24 bg-muted/30" />
            <div className="mt-3 h-6 w-16 bg-muted/40" />
          </div>
        ))}
      </div>
      <div className="mt-8 h-36 bg-muted/20" />
    </div>
  );
}
