import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ThreatCard } from "@/components/dashboard/ThreatCard";
import { ScannedPostsTable } from "@/components/dashboard/ScannedPostsTable";
import { ConnectorStatus } from "@/components/dashboard/ConnectorStatus";
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
      {
        property: "og:title",
        content: "AI Media Watch — Платформа аналитики угроз",
      },
      {
        property: "og:description",
        content:
          "Выявляйте подозрительные паттерны в Telegram, на сайтах, YouTube и в соцсетях до распространения угроз.",
      },
    ],
  }),
  component: Dashboard,
});

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
                      Данные обновлены 5 минут назад
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Топ новых угроз
                    </h1>
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
              <MonitoringOverview />
              <ConnectorStatus />
              <SourceDistribution />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
