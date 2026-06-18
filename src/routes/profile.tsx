import {
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — AI Media Watch" },
      {
        name: "description",
        content:
          "Профиль пользователя AI Media Watch: город, пол, звание и контактные данные.",
      },
    ],
  }),
  component: ProfilePage,
});

type ProfileForm = {
  fullName: string;
  gender: string;
  city: string;
  title: string;
  organization: string;
  phone: string;
  bio: string;
};

type ProfileRow = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  gender: string | null;
  city: string | null;
  title: string | null;
  organization: string | null;
  phone: string | null;
};

const emptyProfile: ProfileForm = {
  fullName: "",
  gender: "",
  city: "",
  title: "",
  organization: "",
  phone: "",
  bio: "",
};

function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setForm(await profileFromSession(supabase, data.session));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setForm(await profileFromSession(supabase, nextSession));
    });

    return () => subscription.unsubscribe();
  }, []);

  const completedFields = useMemo(
    () => Object.values(form).filter((value) => value.trim().length > 0).length,
    [form],
  );

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

    setIsSaving(true);
    if (!session) {
      setMessage("Войдите в аккаунт, чтобы сохранить профиль.");
      return;
    }

    const payload = {
      user_id: session.user.id,
      email: session.user.email ?? null,
      full_name: form.fullName,
      gender: form.gender,
      city: form.city,
      title: form.title,
      organization: form.organization,
      phone: form.phone,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profile")
      .upsert(payload, { onConflict: "user_id" })
      .select(
        "user_id, email, full_name, gender, city, title, organization, phone",
      )
      .single();

    if (!error) {
      await supabase.auth.updateUser({
        data: {
          full_name: form.fullName,
          gender: form.gender,
          city: form.city,
          title: form.title,
          organization: form.organization,
          phone: form.phone,
          bio: form.bio,
          profile_completed_at: new Date().toISOString(),
        },
      });
    }

    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setForm(profileFromRow(data as ProfileRow, session.user));
    setMessage("Профиль сохранен в Supabase.");
  }

  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1400px] gap-5">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="glass relative overflow-hidden rounded-2xl p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(0.72_0.11_150_/_12%),transparent_32%),radial-gradient(circle_at_10%_90%,oklch(0.74_0.09_205_/_12%),transparent_34%)]" />
            <div className="relative">
              <Link
                to="/"
                className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-cyan"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад к дашборду
              </Link>

              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-[11px] font-medium text-cyan">
                    <UserRound className="h-3.5 w-3.5" />
                    Аккаунт · профиль пользователя
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Профиль
                  </h1>
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                    Заполните данные аналитика: город, пол, звание, организацию
                    и краткое описание. Информация сохраняется в Supabase Auth
                    metadata.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Metric label="полей" value={`${completedFields}/7`} />
                  <Metric label="статус" value={session ? "active" : "guest"} />
                  <Metric
                    label="auth"
                    value={isSupabaseConfigured ? "on" : "off"}
                  />
                </div>
              </div>
            </div>
          </section>

          {!isSupabaseConfigured ? (
            <Card className="glass border-orange/30 p-4">
              <div className="flex gap-3">
                <ShieldAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange"
                  strokeWidth={1.8}
                />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Supabase не настроен
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    Добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в
                    `.env.local`, затем перезапустите dev-сервер.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {!isLoading && !session ? (
            <Card className="glass border-border/60 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Нужен вход
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Зарегистрируйтесь или войдите через кнопку в левой панели,
                    чтобы заполнить профиль.
                  </p>
                </div>
                <BadgeCheck className="h-8 w-8 text-cyan" strokeWidth={1.6} />
              </div>
            </Card>
          ) : null}

          {session ? (
            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
              <Card className="glass border-border/60 p-5">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Личная информация
                    </h2>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="ФИО">
                      <Input
                        value={form.fullName}
                        placeholder="Например, Дамир Сарсенов"
                        onChange={(event) =>
                          setFormField("fullName", event.target.value, setForm)
                        }
                      />
                    </Field>

                    <Field label="Пол">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                        value={form.gender}
                        onChange={(event) =>
                          setFormField("gender", event.target.value, setForm)
                        }
                      >
                        <option value="">Не указан</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                        <option value="other">Другое</option>
                      </select>
                    </Field>

                    <Field label="Город">
                      <Input
                        value={form.city}
                        placeholder="Астана"
                        onChange={(event) =>
                          setFormField("city", event.target.value, setForm)
                        }
                      />
                    </Field>

                    <Field label="Звание / роль">
                      <Input
                        value={form.title}
                        placeholder="AI-аналитик угроз"
                        onChange={(event) =>
                          setFormField("title", event.target.value, setForm)
                        }
                      />
                    </Field>

                    <Field label="Организация">
                      <Input
                        value={form.organization}
                        placeholder="AFM / подразделение"
                        onChange={(event) =>
                          setFormField(
                            "organization",
                            event.target.value,
                            setForm,
                          )
                        }
                      />
                    </Field>

                    <Field label="Телефон">
                      <Input
                        value={form.phone}
                        placeholder="+7 ..."
                        onChange={(event) =>
                          setFormField("phone", event.target.value, setForm)
                        }
                      />
                    </Field>
                  </div>
                  {message ? (
                    <p className="rounded-lg border border-border/50 bg-muted/20 p-3 text-[12px] text-muted-foreground">
                      {message}
                    </p>
                  ) : null}

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Сохраняю..." : "Сохранить профиль"}
                  </Button>
                </form>
              </Card>

              <aside className="flex flex-col gap-4">
                <Card className="glass border-border/60 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan/10 ring-1 ring-cyan/35">
                      <UserRound
                        className="h-5 w-5 text-cyan"
                        strokeWidth={1.8}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {form.fullName || session.user.email}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {form.title || "Роль не указана"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ProfileFact
                      icon={MapPin}
                      label="Город"
                      value={form.city || "Не указан"}
                    />
                    <ProfileFact
                      icon={Building2}
                      label="Организация"
                      value={form.organization || "Не указана"}
                    />
                    <ProfileFact
                      icon={CheckCircle2}
                      label="Заполнено"
                      value={`${completedFields} из 6 полей`}
                    />
                  </div>
                </Card>
              </aside>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function profileFromUser(user?: User): ProfileForm {
  const metadata = user?.user_metadata ?? {};

  return {
    fullName: String(metadata.full_name ?? ""),
    gender: String(metadata.gender ?? ""),
    city: String(metadata.city ?? ""),
    title: String(metadata.title ?? ""),
    organization: String(metadata.organization ?? ""),
    phone: String(metadata.phone ?? ""),
    bio: String(metadata.bio ?? ""),
  };
}

async function profileFromSession(
  supabase: SupabaseClient,
  session: Session | null,
): Promise<ProfileForm> {
  if (!session) {
    return emptyProfile;
  }

  const { data, error } = await supabase
    .from("profile")
    .select("user_id, email, full_name, gender, city, title, organization, phone")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return profileFromUser(session.user);
  }

  return profileFromRow(data as ProfileRow, session.user);
}

function profileFromRow(row: ProfileRow, user?: User): ProfileForm {
  const metadataProfile = profileFromUser(user);

  return {
    fullName: String(row.full_name ?? metadataProfile.fullName),
    gender: String(row.gender ?? metadataProfile.gender),
    city: String(row.city ?? metadataProfile.city),
    title: String(row.title ?? metadataProfile.title),
    organization: String(row.organization ?? metadataProfile.organization),
    phone: String(row.phone ?? metadataProfile.phone),
    bio: metadataProfile.bio,
  };
}

function setFormField(
  key: keyof ProfileForm,
  value: string,
  setForm: Dispatch<SetStateAction<ProfileForm>>,
) {
  setForm((current) => ({ ...current, [key]: value }));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 p-3 text-center">
      <span className="block text-[18px] font-bold leading-none text-foreground">
        {value}
      </span>
      <span className="mt-1 block text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ProfileFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/45 bg-muted/10 p-2">
      <Icon className="h-4 w-4 shrink-0 text-cyan" strokeWidth={1.8} />
      <div className="min-w-0">
        <span className="block text-[10px] text-muted-foreground">{label}</span>
        <span className="block truncate text-[12px] font-medium text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}
