import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ReportsPanel } from "@/components/reports/ReportsPanel";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Отчёты — AI Media Watch" },
      {
        name: "description",
        content: "Детальные отчеты по направлениям угроз, статистика по городам и аккаунтам",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1400px] gap-5">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <ReportsPanel />
        </div>
      </div>
    </div>
  );
}
