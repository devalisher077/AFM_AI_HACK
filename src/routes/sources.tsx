import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { riskLabels, type RiskLevel } from "@/lib/dashboard-data";
import {
  emptySourcesData,
  fetchSourcePostById,
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

const riskClass: Record<RiskLevel, string> = {
  Critical: "border-border/50 bg-muted/20 text-foreground",
  High: "border-border/50 bg-muted/20 text-foreground",
  Medium: "border-border/50 bg-muted/20 text-foreground",
};

function SourcesPage() {
  const pageSize = 10;
  const [page, setPage] = useState(0);
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["sources-live-data"],
    queryFn: fetchSourcesLiveData,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const { data: focusedSourcePost, isLoading: isFocusedSourceLoading } =
    useQuery({
      queryKey: ["source-post-focus", focusedPostId],
      queryFn: () => fetchSourcePostById(focusedPostId ?? ""),
      enabled: Boolean(focusedPostId),
      staleTime: 60_000,
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
  const focusedPost = useMemo(
    () =>
      focusedPostId
        ? (sourceData.posts.find((post) => post.id === focusedPostId) ??
          focusedSourcePost ??
          null)
        : null,
    [focusedPostId, focusedSourcePost, sourceData.posts],
  );
  const visiblePosts = focusedPostId
    ? focusedPost
      ? [focusedPost]
      : []
    : pagedPosts;
  const isFocusedView = Boolean(focusedPostId);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  useEffect(() => {
    setFocusedPostId(new URLSearchParams(window.location.search).get("focus"));
  }, []);

  useEffect(() => {
    if (!focusedPostId || sourceData.posts.length === 0) {
      return;
    }

    const focusedIndex = sourceData.posts.findIndex(
      (post) => post.id === focusedPostId,
    );

    if (focusedIndex >= 0) {
      setPage(Math.floor(focusedIndex / pageSize));
    }
  }, [focusedPostId, pageSize, sourceData.posts]);

  useEffect(() => {
    if (!focusedPostId || !focusedPost || isLoading || isFocusedSourceLoading) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`source-post-${focusedPostId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);

    return () => window.clearTimeout(scrollTimer);
  }, [focusedPost, focusedPostId, isFocusedSourceLoading, isLoading]);

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-none flex-col gap-4 md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] lg:flex-row lg:gap-5">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="glass border border-border/60 bg-card/35 p-5">
            <div>
              <Link
                to="/"
                className="mb-5 inline-flex text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Назад к дашборду
              </Link>

              <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <div>
                  <div className="mb-2 inline-flex border border-border/50 bg-muted/10 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Источники · live география
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Где найден каждый пост
                  </h1>
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                    Раздел показывает исходный аккаунт, ссылку, город
                    обнаружения и признаки, которые помогли связать публикацию с
                    кластером угроз.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Metric label="городов" value="0" />
                  <Metric
                    label="постов"
                    value={String(sourceData.totalPosts)}
                  />
                  <Metric
                    label="критич."
                    value={String(sourceData.criticalPosts)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="glass border border-border/60 bg-card/35 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold text-foreground">
                  {isFocusedView
                    ? "Выбранный источник"
                    : "Найденные публикации"}
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {isLoading
                    ? "Загрузка публикаций из Supabase..."
                    : isFocusedSourceLoading
                      ? "Ищем выбранный источник в базе..."
                      : isFocusedView
                        ? "Подробности по источнику, выбранному на дашборде."
                        : "Аккаунт, путь нахождения и доказательные признаки по каждому сигналу."}
                  {isFetching && !isLoading ? " Обновляется..." : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="border border-border/60 bg-muted/10 px-3 py-2 text-[11px] font-medium text-muted-foreground">
                  {isFocusedView
                    ? focusedPost
                      ? `1 из ${sourceData.posts.length}`
                      : "Источник не найден"
                    : sourceData.posts.length === 0
                      ? "0 записей"
                      : `${currentPage * pageSize + 1}-${Math.min(
                          (currentPage + 1) * pageSize,
                          sourceData.posts.length,
                        )} из ${sourceData.posts.length}`}
                </div>
                {isFocusedView ? (
                  <a
                    href="/sources"
                    className="inline-flex h-9 items-center border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground"
                  >
                    Все источники
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => setPage((value) => Math.max(0, value - 1))}
                      disabled={
                        currentPage === 0 || sourceData.posts.length === 0
                      }
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() =>
                        setPage((value) => Math.min(totalPages - 1, value + 1))
                      }
                      disabled={
                        currentPage >= totalPages - 1 ||
                        sourceData.posts.length === 0
                      }
                    >
                      Дальше
                    </button>
                    <button className="inline-flex h-9 items-center border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground">
                      Поиск
                    </button>
                    <button className="inline-flex h-9 items-center border border-border/60 bg-muted/10 px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground">
                      Фильтр
                    </button>
                  </>
                )}
              </div>
            </div>

            {sourceData.errorMessage ? (
              <EmptyPanel text={sourceData.errorMessage} />
            ) : null}

            {isLoading || isFocusedSourceLoading ? (
              <LoadingGrid />
            ) : visiblePosts.length > 0 ? (
              <div className="space-y-3">
                {visiblePosts.map((post, index) => {
                  const openHref = post.sourceHref ?? undefined;
                  const focusedIndex = sourceData.posts.findIndex(
                    (item) => item.id === post.id,
                  );
                  const rowNumber = focusedPostId
                    ? focusedIndex >= 0
                      ? focusedIndex + 1
                      : 1
                    : currentPage * pageSize + index + 1;

                  return (
                    <article
                      key={post.id}
                      id={`source-post-${post.id}`}
                      className={`border p-3 transition-colors ${
                        post.id === focusedPostId
                          ? "border-border/70 bg-muted/20"
                          : "border-border/45 bg-muted/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {String(rowNumber).padStart(2, "0")}
                              </span>
                              <h3 className="truncate text-[14px] font-bold text-foreground">
                                {post.account}
                              </h3>
                              <span
                                className={`border px-2 py-0.5 text-[10px] font-medium ${riskClass[post.risk]}`}
                              >
                                {riskLabels[post.risk]}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                              <span>{post.platform}</span>
                              <span>{post.city}</span>
                              <span>{post.foundAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.evidence.map((item) => (
                          <span
                            key={item}
                            className="border border-border/50 bg-card/70 px-2 py-1 text-[11px] text-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 border border-border/40 bg-card/35 px-3 py-2">
                        {openHref ? (
                          <a
                            href={openHref}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 truncate text-[11px] text-muted-foreground transition-colors hover:text-foreground"
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
                            className="inline-flex border border-border/60 bg-muted/10 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
                          >
                            Открыть
                          </a>
                        ) : (
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            нет ссылки
                          </span>
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

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[180px] animate-pulse border border-border/45 bg-muted/10 p-3"
        >
          <div className="h-4 w-32 bg-muted/40" />
          <div className="mt-4 h-3 w-full bg-muted/30" />
          <div className="mt-2 h-3 w-2/3 bg-muted/30" />
          <div className="mt-6 h-8 bg-muted/20" />
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="border border-border/45 bg-muted/10 p-4 text-[13px] leading-relaxed text-muted-foreground">
      {text}
    </div>
  );
}
