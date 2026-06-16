import { ArrowRight, Send } from "lucide-react";
import radar from "@/assets/ai-radar.jpg";

export function AnalysisPanel() {
  return (
    <div className="glass overflow-hidden rounded-2xl p-3">
      {/* Visual */}
      <div className="relative overflow-hidden rounded-xl">
        <div className="flex items-center justify-between px-1 pb-2 pt-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_6px_var(--cyan)]" />
            AI Media Watch
          </span>
          <span className="rounded-md bg-glow-green/15 px-2 py-0.5 text-[10px] font-medium text-glow-green ring-1 ring-glow-green/30">
            Новое
          </span>
        </div>
        <div className="relative h-40 overflow-hidden rounded-xl">
          <img
            src={radar}
            alt="Визуализация AI-радара сканирования угроз"
            width={1024}
            height={1024}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="px-1 pt-3">
        <h3 className="text-[17px] font-bold text-foreground">AI-анализ угроз</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          ИИ выявляет подозрительные паттерны в открытых источниках и обнаруживает новые угрозы до
          того, как они распространятся.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="glow-cyan inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan to-glow-green px-3 py-2 text-[12px] font-semibold text-cyan-foreground transition-opacity hover:opacity-90">
            <ArrowRight className="h-3.5 w-3.5" />
            Подробнее
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan/40 bg-cyan/5 px-3 py-2 text-[12px] font-medium text-cyan transition-colors hover:bg-cyan/10">
            <Send className="h-3.5 w-3.5" />
            Аналитику
          </button>
        </div>
      </div>
    </div>
  );
}
