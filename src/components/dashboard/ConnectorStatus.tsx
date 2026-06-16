import { CheckCircle2, Clock3, PlugZap, ShieldAlert } from "lucide-react";
import {
  connectorHealth,
  type ConnectorStatus as ConnectorStatusType,
} from "@/lib/dashboard-data";

const statusLabels: Record<ConnectorStatusType, string> = {
  active: "Работает",
  limited: "Ограничено",
  pending: "Ожидает",
};

function statusClass(status: ConnectorStatusType) {
  switch (status) {
    case "active":
      return "bg-glow-green/15 text-glow-green ring-glow-green/30";
    case "limited":
      return "bg-orange/15 text-orange ring-orange/30";
    case "pending":
      return "bg-muted/40 text-muted-foreground ring-border";
  }
}

function StatusIcon({ status }: { status: ConnectorStatusType }) {
  switch (status) {
    case "active":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "limited":
      return <ShieldAlert className="h-3.5 w-3.5" />;
    case "pending":
      return <Clock3 className="h-3.5 w-3.5" />;
  }
}

export function ConnectorStatus() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-foreground">
          Статус коннекторов
          <PlugZap className="h-3.5 w-3.5 text-cyan" />
        </h3>
        <span className="text-[11px] text-muted-foreground">live</span>
      </div>

      <div className="mt-3 space-y-2">
        {connectorHealth.map((connector) => (
          <div
            key={connector.name}
            className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-[13px] font-semibold text-foreground">
                {connector.name}
              </span>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${statusClass(
                  connector.status,
                )}`}
              >
                <StatusIcon status={connector.status} />
                {statusLabels[connector.status]}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <span className="truncate">{connector.detail}</span>
              <span className="shrink-0">sync {connector.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
