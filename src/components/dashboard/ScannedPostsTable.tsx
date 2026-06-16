import {
  scannedPosts,
  riskLabels,
  statusLabels,
  type RiskLevel,
  type StatusLevel,
} from "@/lib/dashboard-data";

const tabs = ["Высокий риск", "Новые оповещения", "Проверено"];

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
  return (
    <div className="glass flex flex-1 flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Недавние просканированные посты
        </h2>
        <button className="rounded-lg px-3 py-1.5 text-[12px] text-cyan transition-colors hover:bg-cyan/10">
          Все ›
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex items-center gap-5 border-b border-border/50 pb-2">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={
              i === 0
                ? "relative pb-1.5 text-[13px] font-semibold text-foreground after:absolute after:inset-x-0 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-cyan after:shadow-[0_0_8px_var(--cyan)]"
                : "pb-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {tab}
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

        {scannedPosts.map((post, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.4fr_1.4fr_0.9fr_1fr] items-center gap-2 border-t border-border/40 px-2 py-3.5 text-[13px] transition-colors hover:bg-muted/20"
          >
            <span className="text-muted-foreground">{post.date}</span>
            <span className="truncate font-medium text-foreground">
              {post.source}
            </span>
            <span className="truncate text-foreground/90">{post.threat}</span>
            <span className={`font-semibold ${riskClass(post.risk)}`}>
              {riskLabels[post.risk]}
            </span>
            <span
              className={`truncate text-[12px] font-medium ${statusClass(
                post.status,
              )}`}
            >
              {statusLabels[post.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
