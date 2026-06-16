import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Brain,
  CheckCircle2,
  DatabaseZap,
  Gauge,
  ListChecks,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { analysisSources } from "@/lib/dashboard-data";

export const Route = createFileRoute("/ai-analysis")({
  head: () => ({
    meta: [
      { title: "AI-анализ источников — AI Media Watch" },
      {
        name: "description",
        content:
          "Подробное описание источников AI Media Watch: Telegram, веб-сайты, YouTube и социальные сети.",
      },
    ],
  }),
  component: AiAnalysisPage,
});

const accentClass = {
  cyan: {
    dot: "bg-cyan shadow-[0_0_10px_var(--cyan)]",
    text: "text-cyan",
    ring: "ring-cyan/35 bg-cyan/10",
    line: "from-cyan/60",
  },
  green: {
    dot: "bg-glow-green shadow-[0_0_10px_var(--glow-green)]",
    text: "text-glow-green",
    ring: "ring-glow-green/35 bg-glow-green/10",
    line: "from-glow-green/60",
  },
  orange: {
    dot: "bg-orange shadow-[0_0_10px_var(--orange)]",
    text: "text-orange",
    ring: "ring-orange/35 bg-orange/10",
    line: "from-orange/60",
  },
  pink: {
    dot: "bg-pink shadow-[0_0_10px_var(--pink)]",
    text: "text-pink",
    ring: "ring-pink/35 bg-pink/10",
    line: "from-pink/60",
  },
};

const modelSteps = [
  {
    label: "Сбор",
    icon: DatabaseZap,
    detail: "Коннекторы подтягивают новые посты, страницы, описания и комментарии.",
  },
  {
    label: "Нормализация",
    icon: ListChecks,
    detail: "Текст, ссылки, авторы и временные метки приводятся к единому формату.",
  },
  {
    label: "AI-скоринг",
    icon: Brain,
    detail: "Модель ищет обещания дохода, повторяющиеся воронки и рискованные паттерны.",
  },
  {
    label: "Эскалация",
    icon: ShieldAlert,
    detail: "Сигналы с высоким риском попадают в очередь аналитика и карточки угроз.",
  },
];

function AiAnalysisPage() {
  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1400px] gap-5">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="glass relative overflow-hidden rounded-2xl p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,oklch(0.72_0.11_150_/_12%),transparent_34%),radial-gradient(circle_at_14%_8%,oklch(0.74_0.09_205_/_14%),transparent_30%)]" />
            <div className="relative">
              <Link
                to="/"
                className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-cyan"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад к дашборду
              </Link>

              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-[11px] font-medium text-cyan">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Media Watch · подробный разбор
                  </div>
                  <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground">
                    AI-анализ источников угроз
                  </h1>
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                    Система объединяет открытые источники, выделяет повторяющиеся признаки
                    мошеннических схем и показывает, откуда именно пришел рискованный сигнал.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Metric label="точность" value="91%" />
                  <Metric label="источника" value="4" />
                  <Metric label="синхр." value="live" />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {analysisSources.map((source) => {
              const Icon = source.icon;
              const accent = accentClass[source.accent];

              return (
                <article key={source.name} className="glass relative overflow-hidden rounded-2xl p-4">
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line} via-transparent to-transparent`}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${accent.ring}`}
                      >
                        <Icon className={`h-5 w-5 ${accent.text}`} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {source.type}
                          </span>
                        </div>
                        <h2 className="mt-1 text-[18px] font-bold text-foreground">
                          {source.name}
                        </h2>
                      </div>
                    </div>
                    <span className="rounded-md bg-muted/30 px-2 py-1 text-[11px] font-semibold text-foreground ring-1 ring-border/60">
                      {source.volume}
                    </span>
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                    {source.summary}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <SourceStat label="Охват" value={source.coverage} />
                    <SourceStat label="Риск" value={source.risk} />
                    <SourceStat label="Sync" value={source.freshness} />
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/45 bg-muted/10 p-3">
                      <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                        <Gauge className={`h-3.5 w-3.5 ${accent.text}`} />
                        Что проверяет AI
                      </h3>
                      <ul className="space-y-2">
                        {source.signals.map((signal) => (
                          <li
                            key={signal}
                            className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground"
                          >
                            <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent.text}`} />
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-border/45 bg-muted/10 p-3">
                      <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                        <Activity className={`h-3.5 w-3.5 ${accent.text}`} />
                        Примеры сигналов
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {source.examples.map((example) => (
                          <span
                            key={example}
                            className="rounded-md bg-card/70 px-2 py-1 text-[11px] text-foreground ring-1 ring-border/50"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold text-foreground">Как формируется вывод</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Каждый источник проходит одинаковый pipeline, поэтому риск можно сравнивать между каналами.
                </p>
              </div>
              <span className="rounded-md bg-glow-green/15 px-2 py-1 text-[11px] font-medium text-glow-green ring-1 ring-glow-green/30">
                4 этапа
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {modelSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.label} className="rounded-xl border border-border/45 bg-muted/10 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 ring-1 ring-cyan/30">
                        <Icon className="h-4.5 w-4.5 text-cyan" />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-[13px] font-semibold text-foreground">{step.label}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 p-3 text-center">
      <span className="block text-[20px] font-bold leading-none text-foreground">{value}</span>
      <span className="mt-1 block text-[10px] uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

function SourceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/45 bg-card/35 px-3 py-2">
      <span className="block truncate text-[10px] text-muted-foreground">{label}</span>
      <span className="mt-0.5 block truncate text-[12px] font-semibold text-foreground">{value}</span>
    </div>
  );
}
