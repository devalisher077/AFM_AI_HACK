import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  DatabaseZap,
  ExternalLink,
  Gauge,
  ListChecks,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  type AiAnalysisItem,
  fallbackAiAnalysisPageData,
  emptyAiAnalysisData,
  fetchAiAnalysisByHash,
  fetchAiAnalysisPage,
  fetchAiAnalysisLiveData,
  fetchAiAnalysisRaw,
} from "@/lib/supabase-ai-analysis";

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

const pageSize = 10;
const riskFilters = [
  { label: "Все", value: 0 },
  { label: ">50", value: 50 },
  { label: ">70", value: 70 },
  { label: ">90", value: 90 },
];

function AiAnalysisPage() {
  const [page, setPage] = useState(0);
  const [riskThreshold, setRiskThreshold] = useState(0);
  const [focusHash, setFocusHash] = useState<string | null>(null);
  const analysisListTopRef = useRef<HTMLDivElement | null>(null);
  const focusPanelRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToListRef = useRef(false);
  const { data, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["ai-analysis-live-data"],
    queryFn: fetchAiAnalysisLiveData,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const { data: analysisPage, isFetching } = useQuery({
    queryKey: ["ai-analysis-page", page, pageSize, riskThreshold],
    queryFn: () => fetchAiAnalysisPage(page, pageSize, riskThreshold),
    placeholderData: (previousData) => previousData,
    initialData:
      page === 0 && riskThreshold === 0 ? fallbackAiAnalysisPageData : undefined,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
  const { data: focusedAnalysis, isLoading: isFocusLoading } = useQuery({
    queryKey: ["ai-analysis-focus", focusHash],
    queryFn: () => fetchAiAnalysisByHash(focusHash ?? ""),
    enabled: Boolean(focusHash),
    staleTime: 60_000,
  });
  const summaryData = data ?? emptyAiAnalysisData;
  const pageData = analysisPage ?? fallbackAiAnalysisPageData;
  const canGoBack = page > 0;
  const canGoNext = page + 1 < pageData.pageCount;

  useEffect(() => {
    const searchFocus = new URLSearchParams(window.location.search).get("focus");
    const pendingFocus = window.sessionStorage.getItem("pending-ai-analysis-focus");
    const nextFocus = searchFocus ?? pendingFocus;

    if (pendingFocus) {
      window.sessionStorage.removeItem("pending-ai-analysis-focus");
    }

    setFocusHash(nextFocus);
  }, []);

  useEffect(() => {
    if (!shouldScrollToListRef.current) {
      return;
    }

    shouldScrollToListRef.current = false;
    analysisListTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  useEffect(() => {
    if (!focusHash) {
      return;
    }

    window.requestAnimationFrame(() => {
      focusPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [focusHash, focusedAnalysis]);

  function goToPage(nextPage: number) {
    shouldScrollToListRef.current = true;
    setPage(Math.max(0, Math.min(nextPage, pageData.pageCount - 1)));
  }

  function changeRiskThreshold(nextThreshold: number) {
    shouldScrollToListRef.current = true;
    setRiskThreshold(nextThreshold);
    setPage(0);
  }

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
                  <Metric label="точность" value={summaryData.accuracy} />
                  <Metric label="источника" value={summaryData.sourcesCount} />
                  <Metric label="синхр." value={summaryData.syncLabel} />
                </div>
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-foreground">
                  Все AI-анализы
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Новые записи всегда сверху. Можно отфильтровать по risk_score.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-lg border border-border/50 bg-muted/10 p-1">
                  {riskFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => changeRiskThreshold(filter.value)}
                      className={
                        riskThreshold === filter.value
                          ? "h-7 rounded-md bg-blue-700 px-2.5 text-[11px] font-bold text-white shadow-sm"
                          : "h-7 rounded-md px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                      }
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <Metric label="всего" value={String(pageData.total)} />
                <Metric
                  label="страница"
                  value={`${page + 1}/${pageData.pageCount}`}
                />
                <span className="rounded-md bg-cyan/10 px-2 py-1 text-[11px] font-medium text-cyan ring-1 ring-cyan/30">
                  {isFetching ? "обновление..." : "auto refresh"}
                </span>
              </div>
            </div>

            <div ref={analysisListTopRef} className="scroll-mt-4" />
            {focusHash ? (
              <div ref={focusPanelRef} className="mb-4 rounded-xl border border-cyan/35 bg-cyan/5 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Открытая запись из кластера угроз
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      url_hash: {focusHash}
                    </p>
                  </div>
                  <Link
                    to="/ai-analysis"
                    onClick={() => setFocusHash(null)}
                    className="rounded-md border border-border/60 bg-muted/10 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    убрать фокус
                  </Link>
                </div>
                {isFocusLoading ? (
                  <div className="min-h-[160px] animate-pulse rounded-xl border border-border/45 bg-muted/10 p-3">
                    <div className="h-4 w-40 rounded bg-muted/40" />
                    <div className="mt-4 h-3 w-full rounded bg-muted/30" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-muted/30" />
                  </div>
                ) : focusedAnalysis ? (
                  <AiAnalysisCard item={focusedAnalysis} />
                ) : (
                  <EmptyPanel text="Запись по этому url_hash не найдена или недоступна." />
                )}
              </div>
            ) : null}
            <div className="space-y-3">
              {pageData.items.length > 0 ? (
                pageData.items.map((item) => (
                  <AiAnalysisCard key={item.id} item={item} />
                ))
              ) : (
                <div className="rounded-xl border border-border/45 bg-muted/10 p-4 text-[13px] text-muted-foreground">
                  В `ai_analyses` пока нет доступных записей или они закрыты RLS.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => goToPage(page - 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Назад
              </button>
              <span className="text-[12px] text-muted-foreground">
                {pageData.total > 0
                  ? `${page * pageSize + 1}-${Math.min(
                      (page + 1) * pageSize,
                      pageData.total,
                    )} из ${pageData.total}`
                  : "0 из 0"}
              </span>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => goToPage(page + 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-cyan/35 bg-cyan/10 px-3 text-[12px] font-medium text-cyan transition-colors hover:bg-cyan/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Дальше
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {isSummaryLoading ? (
              <AnalysisSourceLoading />
            ) : summaryData.sources.length > 0 ? (
              summaryData.sources.map((source) => {
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
              })
            ) : (
              <div className="xl:col-span-2">
                <EmptyPanel text="AI-сводка по источникам пока не построена: реальные данные не найдены или недоступны." />
              </div>
            )}
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

function AiAnalysisCard({ item }: { item: AiAnalysisItem }) {
  const [isRawOpen, setIsRawOpen] = useState(false);
  const { data: rawAnalysis, isFetching: isRawFetching } = useQuery({
    queryKey: ["ai-analysis-raw", item.id],
    queryFn: () => fetchAiAnalysisRaw(item),
    enabled: isRawOpen,
    staleTime: 5 * 60_000,
  });

  return (
    <article className="rounded-xl border border-border/45 bg-muted/10 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-red-600">
              <ShieldAlert className="h-[18px] w-[18px]" strokeWidth={2.1} />
              <span className="text-[19px]">риск</span>
              <span className="text-[18px] leading-none text-red-500">
                = {item.riskScore}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[18px] font-bold text-blue-400">
              <MapPin className="h-[18px] w-[18px]" strokeWidth={2.1} />
              KZ = {item.kzRelevanceScore}
            </span>
            <span className="rounded-md bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border/50">
              confidence {item.confidence}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {item.analyzedAt}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-foreground">
            {item.threatType}
          </h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            {item.reasoningShort}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 text-[11px] xl:w-[280px]">
          <MiniFact label="run" value={item.runId} />
          <MiniFact label="rank" value={item.rank} />
          <MiniFact label="model" value={item.model} />
          <MiniFact label="false +" value={item.isFalsePositive} />
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-border/40 bg-card/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="text-[12px] font-semibold text-foreground">
              Пост / источник
            </h4>
            {item.postUrl !== "-" ? (
              <a
                href={item.postUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan hover:text-foreground"
              >
                открыть
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
          <p className="truncate text-[13px] font-medium text-foreground">
            {item.postTitle}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {item.postSnippet}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag>{item.postPlatform}</Tag>
            <Tag>{item.postSource}</Tag>
            <Tag>hash {item.urlHash}</Tag>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card/30 p-3">
          <h4 className="text-[12px] font-semibold text-foreground">
            Действие
          </h4>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {item.recommendedAction}
          </p>
          {item.error !== "-" ? (
            <p className="mt-2 rounded-md border border-pink/30 bg-pink/10 p-2 text-[11px] text-pink">
              {item.error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.keySignals.length > 0 ? (
          item.keySignals.map((signal) => <Tag key={signal}>{signal}</Tag>)
        ) : (
          <Tag>key_signals пусто</Tag>
        )}
      </div>

      <details
        className="mt-3 rounded-lg border border-border/40 bg-card/25 p-3"
        onToggle={(event) => setIsRawOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer text-[12px] font-semibold text-foreground">
          raw_analysis / все JSON-данные
        </summary>
        <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
          {isRawFetching
            ? "Загрузка raw_analysis..."
            : rawAnalysis ?? item.rawAnalysis}
        </pre>
        <div className="mt-3 grid gap-2 text-[11px] text-muted-foreground md:grid-cols-2">
          <MiniFact label="updated_at" value={item.updatedAt} />
          <MiniFact label="url_hash" value={item.urlHash} />
        </div>
      </details>
    </article>
  );
}

function AnalysisSourceLoading() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="glass min-h-[260px] animate-pulse rounded-2xl p-4"
        >
          <div className="h-10 w-10 rounded-xl bg-muted/40" />
          <div className="mt-4 h-5 w-36 rounded bg-muted/40" />
          <div className="mt-4 h-3 w-full rounded bg-muted/30" />
          <div className="mt-2 h-3 w-2/3 rounded bg-muted/30" />
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="h-14 rounded bg-muted/20" />
            <div className="h-14 rounded bg-muted/20" />
            <div className="h-14 rounded bg-muted/20" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border/45 bg-muted/10 p-4 text-[13px] leading-relaxed text-muted-foreground">
      {text}
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border/40 bg-muted/10 px-2 py-1.5">
      <span className="block text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="block truncate text-[11px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-card/70 px-2 py-1 text-[11px] text-foreground ring-1 ring-border/50">
      {children}
    </span>
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
