import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ReportsPanel } from "@/components/reports/ReportsPanel";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Отчёты — AI Media Watch" },
      {
        name: "description",
        content:
          "Детальные отчеты по направлениям угроз, статистика по городам и аккаунтам",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-none flex-col gap-4 md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] lg:flex-row lg:gap-5">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <ReportsPanel />
        </div>
      </div>
    </div>
  );
}
