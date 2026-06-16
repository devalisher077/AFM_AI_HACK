import { Bell, Settings, Search, Sparkles, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="glow-cyan grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan to-glow-green text-cyan-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-lg font-bold tracking-tight text-foreground">
          AI Media<span className="text-cyan text-glow"> Watch</span>
        </span>
        <button className="glow-cyan ml-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan to-glow-green px-4 py-1.5 text-[13px] font-semibold text-cyan-foreground transition-opacity hover:opacity-90">
          <Zap className="h-3.5 w-3.5" />
          Запустить AI-скан
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
            2
          </span>
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
          <Settings className="h-4 w-4" />
          Настройки
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск угроз..."
            className="glass h-9 w-48 rounded-lg pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan/50"
          />
        </div>
      </div>
    </header>
  );
}
