import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  scannedPosts,
  riskLabels,
  statusLabels,
  type RiskLevel,
  type StatusLevel,
} from "@/lib/dashboard-data";

type ScannedPostItem = (typeof scannedPosts)[number];

const tabs = [
  {
    label: "Все",
    matches: () => true,
  },
  {
    label: "Высокий риск",
    matches: (post: ScannedPostItem) =>
      post.risk === "Critical" || post.risk === "High",
  },
  {
    label: "Новые оповещения",
    matches: (post: ScannedPostItem) => post.status === "New Alert",
  },
  {
    label: "Проверено",
    matches: (post: ScannedPostItem) => post.status === "Detected",
  },
];

function riskClass(risk: RiskLevel) {
  switch (risk) {
    case "Critical":
      return "text-pink";
    case "High":
      return "text-orange";
    case "Medium":
      return "text-cyan";
  }
}

function statusClass(status: StatusLevel) {
  switch (status) {
    case "New Alert":
      return "text-cyan";
    case "Reviewing":
      return "text-muted-foreground";
    case "Detected":
      return "text-glow-green";
    case "Escalated":
      return "text-purple";
  }
}

export function ScannedPostsTable() {
  return <ScannedPostsTableView posts={scannedPosts} />;
}

export function ScannedPostsTableView({ posts }: { posts: typeof scannedPosts }) {
  const [activeTab, setActiveTab] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const loopHeightRef = useRef(0);
  const positionRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeFilter = tabs[activeTab] ?? tabs[0];
  const filteredPosts = useMemo(
    () => posts.filter(activeFilter.matches),
    [activeFilter, posts],
  );
  const repeatCount = filteredPosts.length > 0 ? 4 : 0;
  const trackPosts =
    repeatCount > 0
      ? Array.from({ length: repeatCount }, () => filteredPosts).flat()
      : [];
  const loopKey = filteredPosts
    .map((post) => `${post.date}-${post.source}-${post.threat}-${post.status}`)
    .join("|");

  function pauseAutoScroll() {
    pausedRef.current = true;
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function resumeAutoScroll(delay = 350) {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
      resumeTimerRef.current = null;
    }, delay);
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    draggingRef.current = true;
    dragStartYRef.current = event.clientY;
    dragStartScrollRef.current = viewport.scrollTop;
    activePointerIdRef.current = event.pointerId;
    viewport.setPointerCapture(event.pointerId);
    pauseAutoScroll();
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (!viewport || !draggingRef.current) return;
    if (activePointerIdRef.current !== event.pointerId) return;

    const deltaY = event.clientY - dragStartYRef.current;
    const nextScrollTop = dragStartScrollRef.current - deltaY;
    viewport.scrollTop = nextScrollTop;
    positionRef.current = nextScrollTop;
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
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || filteredPosts.length === 0) {
      return;
    }

    const syncLoopHeight = () => {
      const loopHeight = track.scrollHeight / repeatCount;
      if (loopHeight > 0) {
        loopHeightRef.current = loopHeight;
        const current = viewport.scrollTop || loopHeight;
        const maxStart = loopHeight * 2;
        positionRef.current =
          current >= loopHeight && current < maxStart ? current : loopHeight;
        viewport.scrollTop = positionRef.current;
      }
    };

    syncLoopHeight();

    const ro = new ResizeObserver(syncLoopHeight);
    ro.observe(track);

    const tick = () => {
      if (!pausedRef.current) {
        const loopHeight = loopHeightRef.current;
        if (loopHeight > 0) {
          positionRef.current += 0.55;

          if (positionRef.current >= loopHeight * 2) {
            positionRef.current -= loopHeight;
          } else if (positionRef.current < loopHeight) {
            positionRef.current += loopHeight;
          }

          viewport.scrollTop = positionRef.current;
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
  }, [filteredPosts.length, loopKey, repeatCount]);

  return (
    <div className="glass flex flex-1 flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Недавние просканированные посты
        </h2>
        <span className="rounded-lg px-3 py-1.5 text-[12px] text-cyan">
          {filteredPosts.length}
        </span>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex items-center gap-5 border-b border-border/50 pb-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => {
              setActiveTab(i);
            }}
            type="button"
            className={
              i === activeTab
                ? "relative pb-1.5 text-[13px] font-semibold text-foreground after:absolute after:inset-x-0 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-cyan after:shadow-[0_0_8px_var(--cyan)]"
                : "pb-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-1">
        <div className="grid grid-cols-[1fr_1.4fr_1.4fr_0.9fr_1fr] gap-2 px-2 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Дата</span>
          <span>Источник</span>
          <span>Угроза</span>
          <span>Риск</span>
          <span>Статус</span>
        </div>

        {trackPosts.length > 0 ? (
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-card/95 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-card/95 to-transparent" />
            <div
              ref={viewportRef}
              className="dashboard-post-scroll h-[340px] overflow-y-auto overflow-x-hidden"
              onMouseEnter={pauseAutoScroll}
              onMouseLeave={() => resumeAutoScroll(150)}
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onTouchStart={pauseAutoScroll}
              onTouchEnd={() => resumeAutoScroll(150)}
              onWheel={() => {
                pauseAutoScroll();
                resumeAutoScroll(900);
              }}
              onScroll={() => {
                const viewport = viewportRef.current;
                const loopHeight = loopHeightRef.current;
                if (!viewport || loopHeight <= 0) return;

                let nextScrollTop = viewport.scrollTop;
                if (nextScrollTop >= loopHeight * 2) {
                  nextScrollTop -= loopHeight;
                  viewport.scrollTop = nextScrollTop;
                } else if (nextScrollTop < loopHeight * 0.5) {
                  nextScrollTop += loopHeight;
                  viewport.scrollTop = nextScrollTop;
                }
                positionRef.current = nextScrollTop;
              }}
            >
              <div ref={trackRef}>
                {trackPosts.map((post, i) => (
                  <ScannedPostRow
                    key={`${post.date}-${post.source}-${post.threat}-${i}`}
                    post={post}
                    ariaHidden={i >= filteredPosts.length}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-border/40 px-2 py-6 text-center text-[13px] text-muted-foreground">
            По этому фильтру пока нет записей
          </div>
        )}
      </div>
    </div>
  );
}

function ScannedPostRow({
  post,
  ariaHidden,
}: {
  post: ScannedPostItem;
  ariaHidden: boolean;
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="grid grid-cols-[1fr_1.4fr_1.4fr_0.9fr_1fr] items-center gap-2 border-t border-border/40 px-2 py-3.5 text-[13px] transition-colors hover:bg-muted/20"
    >
      <span className="text-muted-foreground">{post.date}</span>
      <span className="truncate font-medium text-foreground">{post.source}</span>
      <span className="truncate text-foreground/90">{post.threat}</span>
      <span className={`font-semibold ${riskClass(post.risk)}`}>
        {riskLabels[post.risk]}
      </span>
      <span className={`truncate text-[12px] font-medium ${statusClass(post.status)}`}>
        {statusLabels[post.status]}
      </span>
    </div>
  );
}
