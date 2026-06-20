import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  type AiAnalysisItem,
  fallbackAiAnalysisPageData,
  fetchAiAnalysisByHash,
  fetchAiAnalysisPage,
} from "@/lib/supabase-ai-analysis";
import type { DashboardPeriod } from "@/lib/supabase-dashboard";

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

const pageSize = 10;
const periodFilters: { label: string; value: DashboardPeriod }[] = [
  { label: "6 ч", value: "6h" },
  { label: "12 ч", value: "12h" },
  { label: "24 ч", value: "24h" },
  { label: "7 д", value: "7d" },
  { label: "30 д", value: "30d" },
];
const riskFilters = [
  { label: "Все", value: 0 },
  { label: "Риск > 50", value: 50 },
  { label: "Риск > 70", value: 70 },
  { label: "Риск > 90", value: 90 },
];

function AiAnalysisPage() {
  const [page, setPage] = useState(0);
  const [period, setPeriod] = useState<DashboardPeriod>("6h");
  const [riskThreshold, setRiskThreshold] = useState(0);
  const [focusHash, setFocusHash] = useState<string | null>(null);
  const analysisListTopRef = useRef<HTMLDivElement | null>(null);
  const focusPanelRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToListRef = useRef(false);
  const {
    data: analysisPage,
    isLoading: isPageLoading,
  } = useQuery({
    queryKey: ["ai-analysis-page", page, pageSize, riskThreshold, period],
    queryFn: () => fetchAiAnalysisPage(page, pageSize, riskThreshold, period),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
  const { data: focusedAnalysis, isLoading: isFocusLoading } = useQuery({
    queryKey: ["ai-analysis-focus", focusHash],
    queryFn: () => fetchAiAnalysisByHash(focusHash ?? ""),
    enabled: Boolean(focusHash),
    staleTime: 60_000,
  });
  const pageData = analysisPage ?? fallbackAiAnalysisPageData;
  const isInitialPageLoading = isPageLoading && !analysisPage;
  const canGoBack = page > 0;
  const canGoNext = page + 1 < pageData.pageCount;

  useEffect(() => {
    const searchFocus = new URLSearchParams(window.location.search).get(
      "focus",
    );
    const pendingFocus = window.sessionStorage.getItem(
      "pending-ai-analysis-focus",
    );
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

  function changePeriod(nextPeriod: DashboardPeriod) {
    shouldScrollToListRef.current = true;
    setPeriod(nextPeriod);
    setPage(0);
  }

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-none flex-col gap-4 md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] lg:flex-row lg:gap-5">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="glass border border-border/60 bg-card/35 p-5">
            <div>
              <Link
                to="/"
                className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад к дашборду
              </Link>

              <div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    AI-анализ источников угроз
                  </h1>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    Система объединяет открытые источники, выделяет
                    повторяющиеся признаки мошеннических схем и показывает,
                    откуда именно пришел рискованный сигнал.
                  </p>
                  <div className="mt-4 overflow-hidden border border-border/45 bg-muted/10">
                    <div className="flex gap-3 px-4 py-3">
                      <AlertTriangle
                        className="mt-0.5 h-5 w-5 shrink-0 text-yellow-300"
                        strokeWidth={2.1}
                      />
                      <p className="text-[13px] font-semibold leading-relaxed text-foreground">
                        Исскуственный интеллект формирует предположение на
                        основе найденных признаков. Итоговое решение принимает
                        сотрудник после проверки контекста и доказательств.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass border border-border/60 bg-card/35 p-4">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-foreground">
                  Все AI-анализы
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Новые записи всегда сверху. Можно отфильтровать по времени и
                  risk_score.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-[34px] cursor-pointer border border-border/50 bg-muted/10 px-2.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted/20 hover:text-foreground focus:border-cyan/40 focus:text-cyan"
                  value={period}
                  onChange={(event) =>
                    changePeriod(event.target.value as DashboardPeriod)
                  }
                >
                  {periodFilters.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-[34px] cursor-pointer border border-border/50 bg-muted/10 px-2.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted/20 hover:text-foreground focus:border-cyan/40 focus:text-cyan"
                  value={riskThreshold}
                  onChange={(event) =>
                    changeRiskThreshold(Number(event.target.value))
                  }
                >
                  {riskFilters.map((filter) => (
                    <option
                      key={filter.value}
                      value={filter.value}
                    >
                      {filter.label}
                    </option>
                  ))}
                </select>
                <Metric
                  label="всего"
                  value={isInitialPageLoading ? "-" : String(pageData.total)}
                />
                <Metric
                  label="страница"
                  value={
                    isInitialPageLoading
                      ? "-"
                      : `${page + 1}/${pageData.pageCount}`
                  }
                />
              </div>
            </div>

            <div ref={analysisListTopRef} className="scroll-mt-4" />
            {focusHash ? (
              <div
                ref={focusPanelRef}
                className="mb-4 border border-border/45 bg-muted/10 p-3"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-bold text-foreground">
                      Открытая запись из кластера угроз
                    </h3>
                    <p className="mt-1 break-all text-[11px] text-muted-foreground">
                      url_hash: {focusHash}
                    </p>
                  </div>
                  <Link
                    to="/ai-analysis"
                    onClick={() => setFocusHash(null)}
                    className="border border-border/60 bg-muted/10 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
                  >
                    убрать фокус
                  </Link>
                </div>
                {isFocusLoading ? (
                  <div className="min-h-[160px] animate-pulse border border-border/45 bg-muted/10 p-3">
                    <div className="h-4 w-40 bg-muted/40" />
                    <div className="mt-4 h-3 w-full bg-muted/30" />
                    <div className="mt-2 h-3 w-2/3 bg-muted/30" />
                  </div>
                ) : focusedAnalysis ? (
                  <AiAnalysisCard item={focusedAnalysis} />
                ) : (
                  <EmptyPanel text="Запись по этому url_hash не найдена или недоступна." />
                )}
              </div>
            ) : null}
            <div className="space-y-3">
              {isInitialPageLoading ? (
                <AiAnalysisListLoading />
              ) : pageData.items.length > 0 ? (
                pageData.items.map((item) => (
                  <AiAnalysisCard key={item.id} item={item} />
                ))
              ) : (
                <div className="border border-border/45 bg-muted/10 p-4 text-[13px] text-muted-foreground">
                  В `ai_analyses` пока нет доступных записей или они закрыты
                  RLS.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => goToPage(page - 1)}
                className="inline-flex h-9 items-center gap-1.5 border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
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
                className="inline-flex h-9 items-center gap-1.5 border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Дальше
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function AiAnalysisListLoading() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[220px] animate-pulse border border-border/45 bg-muted/10 p-3"
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-muted/40" />
            <div className="h-6 w-20 bg-muted/30" />
            <div className="h-6 w-32 bg-muted/30" />
          </div>
          <div className="h-4 w-56 bg-muted/40" />
          <div className="mt-3 h-3 w-full bg-muted/30" />
          <div className="mt-2 h-3 w-3/4 bg-muted/30" />
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-24 border border-border/40 bg-card/30" />
            <div className="h-24 border border-border/40 bg-card/30" />
          </div>
        </div>
      ))}
    </>
  );
}

function AiAnalysisCard({ item }: { item: AiAnalysisItem }) {
  return (
    <article className="min-w-0 overflow-hidden border border-border/45 bg-muted/10 p-3">
      <div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-red-600">
              <ShieldAlert className="h-[18px] w-[18px]" strokeWidth={2.1} />
              <span className="text-[19px]">риск</span>
              <span className="text-[18px] leading-none text-red-500">
                = {item.riskScore}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[18px] font-bold text-foreground">
              <MapPin className="h-[18px] w-[18px]" strokeWidth={2.1} />
              KZ = {item.kzRelevanceScore}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {item.analyzedAt}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-foreground">
            {item.threatType}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
            <span className="font-semibold text-blue-400">Рекомендация:</span>{" "}
            {localizeRecommendedAction(item.recommendedAction)}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            {item.reasoningShort}
          </p>
          {item.error !== "-" ? (
            <p className="mt-2 break-words border border-border/50 bg-muted/10 p-2 text-[11px] text-foreground">
              {item.error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 min-w-0">
        <div className="min-w-0 overflow-hidden border border-border/40 bg-card/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="text-[12px] font-semibold text-foreground">
              Пост / источник
            </h4>
            {item.postUrl !== "-" ? (
              <a
                href={item.postUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                открыть
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
          <p className="break-words text-[13px] font-medium text-foreground">
            {item.postTitle}
          </p>
          <p className="mt-1 break-words text-[12px] leading-relaxed text-muted-foreground">
            {previewText(item.postSnippet, 260)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag>{item.postPlatform}</Tag>
            <Tag>{item.postSource}</Tag>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="border border-border/45 bg-muted/10 p-4 text-[13px] leading-relaxed text-muted-foreground">
      {text}
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="min-w-0 max-w-full break-all border border-border/50 bg-card/70 px-2 py-1 text-[11px] text-foreground">
      {children}
    </span>
  );
}

function previewText(value: string, maxLength: number) {
  if (value.length <= maxLength || value === "-") {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function localizeRecommendedAction(value: string) {
  if (value === "-") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  const translations: Record<string, string> = {
    monitor: "Продолжить мониторинг.",
    "continue monitoring": "Продолжить мониторинг.",
    review: "Передать на ручную проверку.",
    "manual review": "Передать на ручную проверку.",
    investigate: "Провести дополнительную проверку источника.",
    escalate: "Передать на эскалацию.",
    block: "Рассмотреть блокировку источника.",
    ignore: "Не предпринимать действий без дополнительных подтверждений.",
  };

  return translations[normalized] ?? value;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/50 bg-muted/10 p-3 text-center">
      <span className="block text-[20px] font-bold leading-none text-foreground">
        {value}
      </span>
      <span className="mt-1 block text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
