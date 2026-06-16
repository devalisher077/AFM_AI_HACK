import { useState } from "react";
import { threatReports } from "@/lib/dashboard-data";
import { ReportCard } from "./ReportCard";
import { ReportDetail } from "./ReportDetail";
import { Card } from "@/components/ui/card";

export function ReportsPanel() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    threatReports[0]?.id || null,
  );

  const selectedReport = threatReports.find((r) => r.id === selectedReportId);

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
          Данные обновлены 5 минут назад
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
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
            {threatReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedReportId === report.id}
                onClick={() => setSelectedReportId(report.id)}
              />
            ))}
          </div>
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
