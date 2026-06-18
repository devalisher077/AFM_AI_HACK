import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  MapPin,
  RadioTower,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  riskLabels,
  type KazakhstanCitySignal,
  type RiskLevel,
} from "@/lib/dashboard-data";
import {
  emptySourcesData,
  fetchSourcesLiveData,
} from "@/lib/supabase-sources";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Источники сигналов — AI Media Watch" },
      {
        name: "description",
        content:
          "Детальное нахождение источников угроз: аккаунты, ссылки, города и карта сигналов по Казахстану.",
      },
    ],
  }),
  component: SourcesPage,
});

const cityAccent = {
  cyan: "bg-cyan text-cyan shadow-[0_0_16px_var(--cyan)]",
  green: "bg-glow-green text-glow-green shadow-[0_0_16px_var(--glow-green)]",
  orange: "bg-orange text-orange shadow-[0_0_16px_var(--orange)]",
  pink: "bg-pink text-pink shadow-[0_0_16px_var(--pink)]",
};

const riskClass: Record<RiskLevel, string> = {
  Critical: "bg-pink/15 text-pink ring-pink/35",
  High: "bg-orange/15 text-orange ring-orange/35",
  Medium: "bg-glow-green/15 text-glow-green ring-glow-green/35",
};

function SourcesPage() {
  const pageSize = 10;
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["sources-live-data"],
    queryFn: fetchSourcesLiveData,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const sourceData = data ?? emptySourcesData;
  const totalPages = Math.max(1, Math.ceil(sourceData.posts.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedPosts = useMemo(
    () =>
      sourceData.posts.slice(
        currentPage * pageSize,
        currentPage * pageSize + pageSize,
      ),
    [currentPage, pageSize, sourceData.posts],
  );

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1400px] gap-5">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="glass relative overflow-hidden rounded-2xl p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,oklch(0.74_0.09_205_/_12%),transparent_32%),radial-gradient(circle_at_12%_86%,oklch(0.72_0.11_150_/_11%),transparent_34%)]" />
            <div className="relative">
              <Link
                to="/"
                className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-cyan"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад к дашборду
              </Link>

              <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-[11px] font-medium text-cyan">
                    <RadioTower className="h-3.5 w-3.5" />
                    Источники · live география
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Где найден каждый пост
                  </h1>
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                    Раздел показывает исходный аккаунт, ссылку, город обнаружения и признаки,
                    которые помогли связать публикацию с кластером угроз.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Metric label="городов" value="0" />
                  <Metric label="постов" value={String(sourceData.totalPosts)} />
                  <Metric label="критич." value={String(sourceData.criticalPosts)} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <KazakhstanSignalMap />

            <div className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-bold text-foreground">Города</h2>
                  <p className="mt-1 text-[12px] text-muted-foreground">Активность по локациям</p>
                </div>
                <MapPin className="h-4 w-4 text-cyan" />
              </div>

              <div className="space-y-2">
                <EmptyPanel text="В текущей схеме Supabase нет отдельного поля city, поэтому география не строится из реальных данных." />
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold text-foreground">Найденные публикации</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {isLoading
                    ? "Загрузка публикаций из Supabase..."
                    : "Аккаунт, путь нахождения и доказательные признаки по каждому сигналу."}
                  {isFetching && !isLoading ? " Обновляется..." : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2 text-[11px] font-medium text-muted-foreground">
                  {sourceData.posts.length === 0
                    ? "0 записей"
                    : `${currentPage * pageSize + 1}-${Math.min(
                        (currentPage + 1) * pageSize,
                        sourceData.posts.length,
                      )} из ${sourceData.posts.length}`}
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  disabled={currentPage === 0 || sourceData.posts.length === 0}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Назад
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-cyan/35 bg-cyan/10 px-3 text-[12px] font-medium text-cyan transition-colors hover:bg-cyan/15 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
                  disabled={currentPage >= totalPages - 1 || sourceData.posts.length === 0}
                >
                  Дальше
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground">
                  <Search className="h-3.5 w-3.5" />
                  Поиск
                </button>
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-cyan/35 bg-cyan/10 px-3 text-[12px] font-medium text-cyan transition-colors hover:bg-cyan/15">
                  Фильтр
                </button>
              </div>
            </div>

            {sourceData.errorMessage ? (
              <EmptyPanel text={sourceData.errorMessage} />
            ) : null}

            {isLoading ? (
              <LoadingGrid />
            ) : pagedPosts.length > 0 ? (
              <div className="space-y-3">
                {pagedPosts.map((post, index) => {
                  const Icon = post.icon;
                  const openHref = post.sourceHref ?? undefined;

                  return (
                    <article
                      key={post.id}
                      className="rounded-xl border border-border/45 bg-muted/10 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan/10 ring-1 ring-cyan/30">
                            <Icon className="h-5 w-5 text-cyan" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border/50">
                                {String(currentPage * pageSize + index + 1).padStart(2, "0")}
                              </span>
                              <h3 className="truncate text-[14px] font-bold text-foreground">
                                {post.account}
                              </h3>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${riskClass[post.risk]}`}
                              >
                                {riskLabels[post.risk]}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                              <span>{post.platform}</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-cyan" />
                                {post.city}
                              </span>
                              <span>{post.foundAt}</span>
                            </div>
                          </div>
                        </div>
                        <ShieldAlert className="h-4 w-4 shrink-0 text-orange" />
                      </div>

                      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.evidence.map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-card/70 px-2 py-1 text-[11px] text-foreground ring-1 ring-border/50"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/35 px-3 py-2">
                      {openHref ? (
                        <a
                          href={openHref}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 truncate text-[11px] text-muted-foreground transition-colors hover:text-cyan"
                        >
                          {post.sourceUrl}
                        </a>
                      ) : (
                        <span className="min-w-0 truncate text-[11px] text-muted-foreground">
                          {post.sourceUrl}
                        </span>
                      )}
                      {openHref ? (
                        <a
                          href={openHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-cyan/35 bg-cyan/10 px-2 py-1 text-[11px] font-medium text-cyan transition-colors hover:bg-cyan/15"
                        >
                          Открыть
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-cyan" />
                      )}
                    </div>
                  </article>
                );
              })}
              </div>
            ) : (
              <EmptyPanel text="Реальные публикации из Supabase пока не найдены или закрыты политиками RLS." />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function KazakhstanSignalMap() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,oklch(0.74_0.09_205_/_11%),transparent_55%)]" />
      <div className="relative mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-foreground">Карта Казахстана</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Метки показывают количество найденных постов по городам.
          </p>
        </div>
        <span className="rounded-md bg-glow-green/15 px-2 py-1 text-[11px] font-medium text-glow-green ring-1 ring-glow-green/30">
          live map
        </span>
      </div>

      <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-border/45 bg-card/30">
        <svg
          viewBox="0 0 900 520"
          role="img"
          aria-label="Карта Казахстана с метками городов"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="kazakhstan-fill" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.27 0.04 205 / 0.86)" />
              <stop offset="55%" stopColor="oklch(0.2 0.025 190 / 0.82)" />
              <stop offset="100%" stopColor="oklch(0.16 0.018 245 / 0.92)" />
            </linearGradient>
          </defs>
          <path
            d="M94 254L128 198L214 166L298 132L394 118L476 132L548 116L648 148L724 184L806 214L842 266L808 312L724 340L666 386L560 388L488 424L404 402L322 426L252 384L174 368L130 318Z"
            fill="url(#kazakhstan-fill)"
            stroke="oklch(0.74 0.09 205 / 0.48)"
            strokeWidth="2"
          />
          <path
            d="M170 294C260 254 350 244 448 262C560 282 654 274 764 238"
            fill="none"
            stroke="oklch(0.72 0.11 150 / 0.18)"
            strokeDasharray="8 10"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute inset-0 grid place-items-center px-6 text-center text-[12px] leading-relaxed text-muted-foreground">
          Геометки появятся после добавления поля city или извлечения города из JSON-данных.
        </div>
      </div>
    </div>
  );
}

function MapMarker({ city }: { city: KazakhstanCitySignal }) {
  const accent = cityAccent[city.accent];

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
    >
      <div className="relative flex items-center gap-2">
        <span className={`absolute h-8 w-8 animate-ping rounded-full opacity-20 ${accent}`} />
        <span className={`relative h-3 w-3 rounded-full ${accent}`} />
        <span className="rounded-lg border border-border/60 bg-background/85 px-2 py-1 text-[11px] font-semibold text-foreground shadow-lg backdrop-blur">
          {city.city} · {city.posts}
        </span>
      </div>
    </div>
  );
}

function CityRow({ city }: { city: KazakhstanCitySignal }) {
  return (
    <div className="rounded-xl border border-border/45 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${cityAccent[city.accent]}`} />
            <span className="truncate text-[13px] font-semibold text-foreground">{city.city}</span>
          </div>
          <span className="mt-1 block truncate text-[11px] text-muted-foreground">
            {city.topThreat}
          </span>
        </div>
        <span className="shrink-0 rounded-md bg-card/70 px-2 py-1 text-[12px] font-bold text-foreground ring-1 ring-border/50">
          {city.posts} постов
        </span>
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

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[180px] animate-pulse rounded-xl border border-border/45 bg-muted/10 p-3"
        >
          <div className="h-4 w-32 rounded bg-muted/40" />
          <div className="mt-4 h-3 w-full rounded bg-muted/30" />
          <div className="mt-2 h-3 w-2/3 rounded bg-muted/30" />
          <div className="mt-6 h-8 rounded bg-muted/20" />
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border/45 bg-muted/10 p-4 text-[13px] leading-relaxed text-muted-foreground">
      {text}
    </div>
  );
}
