import { FormEvent, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { LogIn, LogOut, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

export function AuthPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfileName(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadProfileName(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfileName(nextSession: Session | null) {
    setDisplayName(
      String(nextSession?.user.user_metadata?.full_name ?? "").trim(),
    );

    if (!nextSession) {
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const { data } = await supabase
      .from("profile")
      .select("full_name")
      .eq("user_id", nextSession.user.id)
      .maybeSingle();

    setDisplayName(data?.full_name?.trim() || "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const supabase = getSupabaseClient();

    if (!supabase) {
      setMessage(
        "Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env.local.",
      );
      return;
    }

    setIsLoading(true);

    const result =
      mode === "sign-up"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage(
        "Регистрация создана. Проверьте почту для подтверждения аккаунта.",
      );
      return;
    }

    setMessage(
      mode === "sign-up" ? "Аккаунт создан, вход выполнен." : "Вход выполнен.",
    );
    setPassword("");
    setIsOpen(false);
  }

  async function handleSignOut() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    setMessage("Вы вышли из аккаунта.");
  }

  if (session) {
    return (
      <div className="glass relative mb-4 overflow-hidden p-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow-green/60 to-transparent" />
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-glow-green/15 ring-1 ring-glow-green/35">
            <ShieldCheck
              className="h-4 w-4 text-glow-green"
              strokeWidth={1.8}
            />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">
              {displayName || session.user.email}
            </span>
            {displayName ? (
              <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                {session.user.email}
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="justify-start rounded-none"
          >
            <Link to="/profile">
              <UserRound className="h-4 w-4" />
              Профиль
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start rounded-none"
            disabled={isLoading}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass relative mb-4 overflow-hidden p-3">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 border border-border/40 bg-muted/10 px-2.5 py-2 text-left text-foreground shadow transition-colors hover:border-cyan/35 hover:bg-muted/20"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block text-[15px] font-semibold">Вход</span>
              <span className="block truncate text-[15px] opacity-80">
                Регистрация
              </span>
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className="glass max-w-[420px] border-border/60 bg-card/95 p-5 text-foreground sm:rounded-none">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {mode === "sign-up" ? "Регистрация" : "Вход"}
            </DialogTitle>
            <DialogDescription className="text-foreground/75">
              Подключение аккаунта через Supabase Auth
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-1 border border-border/40 bg-muted/10 p-1">
              <button
                type="button"
                className={`px-2 py-2 text-[12px] font-medium transition-colors ${
                  mode === "sign-up"
                    ? "border border-cyan/35 bg-muted/20 text-foreground"
                    : "text-foreground/70 hover:bg-muted/20 hover:text-foreground"
                }`}
                onClick={() => {
                  setMode("sign-up");
                  setMessage("");
                }}
              >
                <UserPlus className="mr-1 inline h-3.5 w-3.5" />
                Создать
              </button>
              <button
                type="button"
                className={`px-2 py-2 text-[12px] font-medium transition-colors ${
                  mode === "sign-in"
                    ? "border border-cyan/35 bg-muted/20 text-foreground"
                    : "text-foreground/70 hover:bg-muted/20 hover:text-foreground"
                }`}
                onClick={() => {
                  setMode("sign-in");
                  setMessage("");
                }}
              >
                <LogIn className="mr-1 inline h-3.5 w-3.5" />
                Войти
              </button>
            </div>

            <div className="space-y-2">
              <Input
                type="email"
                autoComplete="email"
                placeholder="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-none bg-muted/10 text-foreground placeholder:text-foreground/45"
                required
              />
              <Input
                type="password"
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                minLength={6}
                placeholder="пароль"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-none bg-muted/10 text-foreground placeholder:text-foreground/45"
                required
              />
            </div>

            {!isSupabaseConfigured ? (
              <p className="border border-orange/30 bg-orange/10 p-2 text-[11px] leading-relaxed text-orange">
                Нужны ключи Supabase в .env.local.
              </p>
            ) : null}

            {message ? (
              <p className="border border-border/50 bg-muted/20 p-2 text-[11px] leading-relaxed text-foreground/75">
                {message}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-none bg-muted/20 text-foreground hover:bg-muted/30"
              disabled={isLoading}
            >
              {isLoading
                ? "..."
                : mode === "sign-up"
                  ? "Создать аккаунт"
                  : "Войти"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
