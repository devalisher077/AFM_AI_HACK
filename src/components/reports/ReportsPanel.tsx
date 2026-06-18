import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportCard } from "./ReportCard";
import { ReportDetail } from "./ReportDetail";
import { Card } from "@/components/ui/card";
import {
  emptyReportsData,
  fetchReportsLiveData,
} from "@/lib/supabase-reports";

export function ReportsPanel() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["reports-live-data"],
    queryFn: fetchReportsLiveData,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const reportData = data ?? emptyReportsData;
  const reports = reportData.reports;
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) ?? reports[0];

  useEffect(() => {
    if (!selectedReportId && reports[0]) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
          {isLoading
            ? "Загрузка отчетов из Supabase..."
            : isFetching
              ? "Обновление отчетов..."
              : "Данные из Supabase"}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Детальные отчеты
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Подробная аналитика по каждому направлению угроз
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5 xl:flex-row">
        {/* Left side - Reports list */}
        <div className="flex shrink-0 flex-col gap-3 xl:w-80 xl:overflow-y-auto xl:pr-2">
          {isLoading ? (
            <ReportsLoading />
          ) : reports.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isSelected={selectedReportId === report.id}
                  onClick={() => setSelectedReportId(report.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="glass border-border/60 p-4">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {reportData.errorMessage ??
                  "Реальные отчеты из Supabase пока не найдены."}
              </p>
            </Card>
          )}
        </div>

        {/* Right side - Report details */}
        {selectedReport ? (
          <div className="min-w-0 flex-1 xl:overflow-y-auto">
            <ReportDetail report={selectedReport} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Card className="border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                Выберите отчет для просмотра деталей
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsLoading() {
  return (
    <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="glass min-h-[86px] animate-pulse border-border/60 p-3"
        >
          <div className="h-4 w-32 rounded bg-muted/40" />
          <div className="mt-3 h-3 w-24 rounded bg-muted/30" />
          <div className="mt-3 h-3 w-20 rounded bg-muted/20" />
        </Card>
      ))}
    </div>
  );
}
