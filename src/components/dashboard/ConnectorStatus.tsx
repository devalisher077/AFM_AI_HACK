import {
  connectorHealth,
  type ConnectorHealth,
  type ConnectorStatus as ConnectorStatusType,
} from "@/lib/dashboard-data";

const statusLabels: Record<ConnectorStatusType, string> = {
  active: "Работает",
  limited: "Ограничено",
  pending: "Ожидает",
};

export function ConnectorStatus() {
  return <ConnectorStatusView connectors={connectorHealth} />;
}

export function ConnectorStatusView({
  connectors,
}: {
  connectors: ConnectorHealth[];
}) {
  return (
    <section className="mt-4 border-t border-border/50 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-foreground">
          Статус коннекторов
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        {connectors.map((connector) => (
          <div
            key={connector.name}
            className="border border-border/40 bg-muted/10 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-[13px] font-semibold text-foreground">
                {connector.name}
              </span>
              <span className="shrink-0 text-[13px] font-medium text-foreground">
                {statusLabels[connector.status]}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              <span className="truncate">{connector.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
