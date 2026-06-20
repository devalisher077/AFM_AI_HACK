import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, Send, X } from "lucide-react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { navItems } from "@/lib/dashboard-data";

type AgentMessage = {
  id: number;
  role: "agent" | "user";
  text: string;
};

export function Sidebar() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 1,
      role: "agent",
      text: "Привет. Я могу помочь разобрать угрозы, источники и отчеты.",
    },
    {
      id: 2,
      role: "agent",
      text: "Напишите вопрос по текущему мониторингу.",
    },
  ]);

  async function sendMessage() {
    const nextMessage = message.trim();

    if (!nextMessage || isSending) {
      return;
    }

    setMessage("");
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: nextMessage },
    ]);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nextMessage,
          route: `${window.location.pathname}${window.location.search}`,
        }),
      });
      const data = (await response.json()) as { message?: string };

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "agent",
          text:
            data.message ??
            "Не получилось получить ответ от AI-агента. Попробуйте еще раз.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "agent",
          text: "Не удалось подключиться к AI-агенту. Проверьте dev-сервер.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <aside className="glass flex min-h-[220px] w-full shrink-0 overflow-hidden border-border/60 p-3 lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:min-h-[620px] lg:w-[200px]">
      <div
        className={`flex min-h-0 flex-1 flex-col transition-all duration-500 ease-out ${
          isAgentOpen
            ? "pointer-events-none translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        <AuthPanel />

        {/* Nav */}
        <nav className="mt-4 flex flex-wrap gap-0.5 lg:flex-col">
          {navItems.map((item) => {
            const content = (
              <>
                <span className="truncate">{item.label}</span>
              </>
            );

            if (!item.href) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className="flex min-w-fit items-center gap-2.5 px-3 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground lg:min-w-0"
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
                className="flex min-w-fit items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground lg:min-w-0 [&.active]:bg-muted/30 [&.active]:font-medium [&.active]:text-foreground [&.active]:ring-1 [&.active]:ring-border/60"
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setIsAgentOpen(true)}
          className="mt-auto flex w-full items-center justify-center gap-2 border border-border/40 bg-muted/10 px-3 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-cyan/35 hover:bg-muted/20"
        >
          AI агент
        </button>
      </div>

      <div
        className={`absolute inset-0 flex flex-col p-3 transition-transform duration-500 ease-out ${
          isAgentOpen
            ? "translate-x-0"
            : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center border border-border/40 bg-muted/10 text-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-bold text-foreground">
                AI агент
              </h2>
              <p className="truncate text-[10px] text-foreground/70">онлайн</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Закрыть AI агент"
            onClick={() => setIsAgentOpen(false)}
            className="grid h-7 w-7 shrink-0 place-items-center border border-border/40 bg-muted/10 text-foreground transition-colors hover:bg-muted/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-3">
          {messages.map((item) => (
            <div
              key={item.id}
              className={
                item.role === "agent"
                  ? "border border-border/40 bg-muted/10 p-3 text-[12px] leading-relaxed text-foreground"
                  : "border border-border/40 bg-muted/20 p-3 text-[12px] leading-relaxed text-foreground"
              }
            >
              {item.text}
            </div>
          ))}
          {isSending ? (
            <div className="border border-border/40 bg-muted/10 p-3 text-[12px] leading-relaxed text-foreground/70">
              Думаю...
            </div>
          ) : null}
        </div>

        <form
          className="mt-auto flex items-center gap-2 border-t border-border/40 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Сообщение"
            className="min-w-0 flex-1 border border-border/50 bg-muted/10 px-2.5 py-2 text-[12px] text-foreground outline-none placeholder:text-foreground/45 focus:border-cyan/50"
          />
          <button
            type="submit"
            aria-label="Отправить сообщение"
            disabled={isSending || !message.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center border border-border/40 bg-muted/10 text-foreground transition-colors hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
