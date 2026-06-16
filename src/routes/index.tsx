import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ThreatCard } from "@/components/dashboard/ThreatCard";
import { ScannedPostsTable } from "@/components/dashboard/ScannedPostsTable";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { MonitoringOverview } from "@/components/dashboard/MonitoringOverview";
import { SourceDistribution } from "@/components/dashboard/SourceDistribution";
import { threatCards } from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Media Watch — Платформа аналитики угроз" },
      {
        name: "description",
        content:
          "AI-платформа мониторинга и раннего предупреждения, сканирующая открытые источники для выявления новых финансовых и цифровых угроз.",
      },
      { property: "og:title", content: "AI Media Watch — Платформа аналитики угроз" },
      {
        property: "og:description",
        content:
          "Выявляйте подозрительные паттерны в Telegram, на сайтах, YouTube и в соцсетях до распространения угроз.",
      },
    ],
  }),
  component: Dashboard,
});

const filterPills = ["24Ч", "Уровень риска", "Убыв."];

function Dashboard() {
  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1400px] gap-5">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <div className="flex min-w-0 flex-1 gap-5">
            {/* Main column */}
            <main className="flex min-w-0 flex-1 flex-col gap-5">
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                      Рекомендовано за последние 24 часа
                      <span className="rounded-md bg-cyan/15 px-2 py-0.5 text-[10px] font-medium text-cyan ring-1 ring-cyan/30">
                        5 оповещений
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Топ новых угроз
                    </h1>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {filterPills.map((pill) => (
                      <button
                        key={pill}
                        className="glass inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ChevronDown className="h-3 w-3" />
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {threatCards.map((card) => (
                    <ThreatCard key={card.title} data={card} />
                  ))}
                </div>
              </section>

              <ScannedPostsTable />
            </main>

            {/* Right column */}
            <aside className="flex w-[340px] shrink-0 flex-col gap-4">
              <AnalysisPanel />
              <MonitoringOverview />
              <SourceDistribution />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
