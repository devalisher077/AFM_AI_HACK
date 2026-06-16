import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { navItems, profile } from "@/lib/dashboard-data";

export function Sidebar() {
  return (
    <aside className="glass flex w-[200px] shrink-0 flex-col rounded-2xl border-border/60 p-3">
      {/* Profile */}
      <div className="glass relative mb-4 overflow-hidden rounded-xl p-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
        <div className="mb-2 flex items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan/40 to-glow-green/30 ring-1 ring-cyan/40">
            <span className="text-xs font-semibold text-foreground">ДС</span>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11px] text-cyan">{profile.username} · PRO</span>
            <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">
              {profile.name}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">{profile.role}</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const content = (
            <>
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{item.label}</span>
            </>
          );

          if (!item.href) {
            return (
              <button
                key={item.label}
                type="button"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              activeOptions={{ exact: item.href === "/" }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground [&.active]:glow-cyan [&.active]:bg-cyan/15 [&.active]:font-medium [&.active]:text-cyan [&.active]:ring-1 [&.active]:ring-cyan/40"
            >
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Bottom cards */}
      <div className="mt-4 space-y-2">
        <button className="flex w-full items-center gap-2 rounded-xl border border-dashed border-cyan/40 bg-cyan/5 p-3 text-left transition-colors hover:bg-cyan/10">
          <span className="glow-cyan grid h-7 w-7 shrink-0 place-items-center rounded-md bg-cyan text-cyan-foreground">
            <Plus className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <span className="block text-[12px] font-semibold text-foreground">Добавить источник</span>
            <span className="block truncate text-[10px] text-muted-foreground">
              Подключить источник
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
