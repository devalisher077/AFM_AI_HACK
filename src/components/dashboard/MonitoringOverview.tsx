import { ChevronDown, TrendingUp, Radar, Bell, FileText } from "lucide-react";

export function MonitoringOverview() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-foreground">
          Обзор мониторинга
          <Radar className="h-3.5 w-3.5 text-cyan" />
        </h3>
        <button className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
          24Ч
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-[34px] font-bold leading-none tracking-tight text-foreground">
          1 248
        </span>
        <span className="mb-1 inline-flex items-center gap-1 rounded-md bg-glow-green/15 px-1.5 py-0.5 text-[11px] font-medium text-glow-green">
          <TrendingUp className="h-3 w-3" />
          +6.3%
        </span>
      </div>
      <span className="text-[12px] text-muted-foreground">Просканировано постов</span>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="glass flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium text-foreground transition-colors hover:bg-cyan/10 hover:text-cyan">
          <Radar className="h-3.5 w-3.5" />
          Источники
        </button>
        <button className="glass flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium text-foreground transition-colors hover:bg-cyan/10 hover:text-cyan">
          <Bell className="h-3.5 w-3.5" />
          Оповещения
        </button>
        <button className="glass flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium text-foreground transition-colors hover:bg-cyan/10 hover:text-cyan">
          <FileText className="h-3.5 w-3.5" />
          Отчёты
        </button>
      </div>
    </div>
  );
}
