import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ThreatCard } from "@/components/dashboard/ThreatCard";
import { ScannedPostsTableView } from "@/components/dashboard/ScannedPostsTable";
import { ConnectorStatusView } from "@/components/dashboard/ConnectorStatus";
import { MonitoringOverview } from "@/components/dashboard/MonitoringOverview";
import {
  type DashboardPeriod,
  emptyDashboardData,
  fetchDashboardLiveData,
} from "@/lib/supabase-dashboard";

const threatClusterAutoScrollStep = 0.35;

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
  const [period, setPeriod] = useState<DashboardPeriod>("6h");
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard-live-data", period],
    queryFn: () => fetchDashboardLiveData(period),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const dashboardData = data ?? emptyDashboardData;
  const highRiskCount = dashboardData.scannedPosts.filter(
    (post) => post.risk === "Critical" || post.risk === "High",
  ).length;
  const statusLine = isLoading
    ? "Загрузка данных из Supabase..."
    : [
        dashboardData.updatedLabel,
        `просканировано ${dashboardData.totalScanned}`,
        highRiskCount > 0
          ? `высокий риск ${highRiskCount}`
          : "высокий риск не найден",
      ].join(" · ");

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-none flex-col gap-4 md:min-h-[calc(100vh-2rem)] lg:h-[calc(100vh-2.5rem)] lg:min-h-0 lg:flex-row lg:gap-5">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch gap-5 xl:flex-row">
            {/* Main column */}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                      {statusLine}
                      {isFetching && !isLoading ? (
                        <span className="rounded-md bg-cyan/10 px-1.5 py-0.5 text-[10px] text-cyan ring-1 ring-cyan/25">
                          sync
                        </span>
                      ) : null}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Мониторинг угроз проанализированные ИИ
                    </h1>
                  </div>
                </div>

                {isLoading ? (
                  <DashboardLoading />
                ) : dashboardData.threatCards.length > 0 ? (
                  <ThreatClusterMarquee cards={dashboardData.threatCards} />
                ) : (
                  <DashboardEmpty
                    title="Кластеры угроз не найдены"
                    detail="В Supabase пока нет данных для карточек или таблицы закрыты RLS."
                  />
                )}
              </section>

              {dashboardData.errorMessage ? (
                <DashboardEmpty
                  title="Supabase вернул ошибку"
                  detail={dashboardData.errorMessage}
                />
              ) : null}

              {!isLoading && dashboardData.scannedPosts.length > 0 ? (
                <ScannedPostsTableView posts={dashboardData.scannedPosts} />
              ) : null}
            </main>

            {/* Right column */}
            <aside className="glass flex w-full shrink-0 flex-col border border-border/60 bg-card/35 p-4 xl:h-full xl:w-[320px] 2xl:w-[340px]">
              <MonitoringOverview
                period={period}
                totalScanned={dashboardData.totalScanned}
                onPeriodChange={setPeriod}
                onParsingStarted={() => refetch()}
              />
              {dashboardData.connectorHealth.length > 0 ? (
                <ConnectorStatusView
                  connectors={dashboardData.connectorHealth}
                />
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreatClusterMarquee({
  cards,
}: {
  cards: typeof emptyDashboardData.threatCards;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const loopWidthRef = useRef(0);
  const positionRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const draggedDistanceRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const pendingHrefRef = useRef<string | null>(null);
  const didNavigateRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const repeatCount = cards.length > 0 ? 4 : 0;
  const trackCards =
    repeatCount > 0
      ? Array.from({ length: repeatCount }, () => cards).flat()
      : [];

  function pauseAutoScroll() {
    pausedRef.current = true;
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    draggingRef.current = true;
    draggedDistanceRef.current = 0;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = viewport.scrollLeft;
    activePointerIdRef.current = event.pointerId;
    pendingHrefRef.current =
      event.target instanceof Element
        ? (event.target.closest<HTMLAnchorElement>("a[data-threat-card-link]")
            ?.href ?? null)
        : null;
    didNavigateRef.current = false;

    viewport.setPointerCapture(event.pointerId);
    pauseAutoScroll();
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (!viewport || !draggingRef.current) return;
    if (activePointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - dragStartXRef.current;
    draggedDistanceRef.current = Math.max(
      draggedDistanceRef.current,
      Math.abs(deltaX),
    );

    const nextScrollLeft = dragStartScrollRef.current - deltaX;
    viewport.scrollLeft = nextScrollLeft;
    positionRef.current = nextScrollLeft;
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (!viewport || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    draggingRef.current = false;
    activePointerIdRef.current = null;

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    resumeAutoScroll();

    if (pendingHrefRef.current && draggedDistanceRef.current <= 6) {
      openThreatCardLink(pendingHrefRef.current);
      return;
    }

    window.setTimeout(() => {
      draggedDistanceRef.current = 0;
      pendingHrefRef.current = null;
    }, 0);
  }

  function openThreatCardLink(href: string) {
    if (didNavigateRef.current) {
      return;
    }

    didNavigateRef.current = true;
    const focusHash = new URL(href).searchParams.get("focus");
    if (focusHash) {
      window.sessionStorage.setItem("pending-ai-analysis-focus", focusHash);
    }
    window.location.assign(href);
  }

  function resumeAutoScroll() {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
      resumeTimerRef.current = null;
    }, 250);
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || cards.length === 0) {
      return;
    }

    const syncLoopWidth = () => {
      const loopWidth = track.scrollWidth / repeatCount;
      if (loopWidth > 0) {
        loopWidthRef.current = loopWidth;
        const maxStart = loopWidth * 2;
        const current = viewport.scrollLeft || loopWidth;
        positionRef.current =
          current >= loopWidth && current < maxStart ? current : loopWidth;
        viewport.scrollLeft = positionRef.current;
      }
    };

    syncLoopWidth();

    const ro = new ResizeObserver(syncLoopWidth);
    ro.observe(track);

    const tick = () => {
      if (!pausedRef.current) {
        const loopWidth = loopWidthRef.current;
        if (loopWidth > 0) {
          positionRef.current += threatClusterAutoScrollStep;

          if (positionRef.current >= loopWidth * 2) {
            positionRef.current -= loopWidth;
          } else if (positionRef.current >= loopWidth) {
            positionRef.current -= loopWidth;
          }

          viewport.scrollLeft = positionRef.current;
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, [cards.length, repeatCount]);

  return (
    <div className="relative rounded-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
      <div
        ref={viewportRef}
        className="dashboard-threat-scroll overflow-x-auto overflow-y-hidden rounded-2xl"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onTouchStart={pauseAutoScroll}
        onTouchEnd={resumeAutoScroll}
        onWheel={pauseAutoScroll}
        onScroll={() => {
          if (viewportRef.current) {
            positionRef.current = viewportRef.current.scrollLeft;
          }
        }}
        onClickCapture={(event) => {
          if (draggedDistanceRef.current > 6) {
            event.preventDefault();
            event.stopPropagation();
            draggedDistanceRef.current = 0;
            return;
          }

          const target = event.target;
          const link =
            target instanceof Element
              ? target.closest<HTMLAnchorElement>("a[data-threat-card-link]")
              : null;

          if (link?.href) {
            event.preventDefault();
            event.stopPropagation();
            openThreatCardLink(link.href);
          }
        }}
      >
        <div ref={trackRef} className="flex w-max gap-4 py-1">
          {trackCards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="w-[300px] shrink-0 sm:w-[330px]"
              aria-hidden={index >= cards.length}
            >
              <ThreatCard data={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="glass min-h-[190px] animate-pulse rounded-2xl p-4"
        >
          <div className="h-3 w-24 rounded bg-muted/40" />
          <div className="mt-6 h-4 w-36 rounded bg-muted/40" />
          <div className="mt-4 h-8 w-28 rounded bg-muted/40" />
          <div className="mt-8 h-10 rounded bg-muted/30" />
        </div>
      ))}
    </div>
  );
}

function DashboardEmpty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="glass rounded-2xl border border-border/60 p-5">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}
