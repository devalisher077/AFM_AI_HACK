import { Brain, FileText, Globe2, MessageCircle, Radar, ShieldAlert } from "lucide-react";
import {
  type RiskLevel,
  type SourcePlatform,
  type ThreatReport,
} from "@/lib/dashboard-data";
import { getSupabaseClient } from "@/lib/supabase";

type MediaItemRow = {
  url_hash: string | null;
  url: string | null;
  platform: string | null;
  source_type: string | null;
  title: string | null;
  snippet: string | null;
  published_at: string | null;
  channel_name: string | null;
  risk_score: number | null;
  risk_signals: unknown;
  threat_type: string | null;
  created_at: string | null;
};

type AiAnalysisRow = {
  url_hash: string | null;
  risk_score: number | null;
  threat_type: string | null;
  confidence: number | null;
  key_signals: unknown;
  reasoning_short: string | null;
  recommended_action: string | null;
};

export type ReportsLiveData = {
  reports: ThreatReport[];
  errorMessage: string | null;
};

export const emptyReportsData: ReportsLiveData = {
  reports: [],
  errorMessage: null,
};

export async function fetchReportsLiveData(): Promise<ReportsLiveData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      ...emptyReportsData,
      errorMessage: "Supabase не настроен или недоступен в браузере.",
    };
  }

  const [mediaResult, analysisResult] = await Promise.all([
    supabase
      .from("media_items")
      .select(
        "url_hash, url, platform, source_type, title, snippet, published_at, channel_name, risk_score, risk_signals, threat_type, created_at",
      )
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(160),
    supabase
      .from("ai_analyses")
      .select(
        "url_hash, risk_score, threat_type, confidence, key_signals, reasoning_short, recommended_action",
      )
      .order("analyzed_at", { ascending: false, nullsFirst: false })
      .limit(240),
  ]);

  if (mediaResult.error) {
    return {
      ...emptyReportsData,
      errorMessage: mediaResult.error.message,
    };
  }

  const mediaItems = (mediaResult.data ?? []) as MediaItemRow[];
  const analyses = analysisResult.error
    ? []
    : ((analysisResult.data ?? []) as AiAnalysisRow[]);

  if (mediaItems.length === 0 && analyses.length === 0) {
    return {
      ...emptyReportsData,
      errorMessage: analysisResult.error?.message ?? null,
    };
  }

  const analysisByHash = new Map(
    analyses
      .filter((analysis) => analysis.url_hash)
      .map((analysis) => [analysis.url_hash as string, analysis]),
  );
  const reports = buildReports(mediaItems, analysisByHash);

  return {
    reports,
    errorMessage: analysisResult.error?.message ?? null,
  };
}

function buildReports(
  mediaItems: MediaItemRow[],
  analysisByHash: Map<string, AiAnalysisRow>,
) {
  const groups = new Map<string, MediaItemRow[]>();

  for (const item of mediaItems) {
    const analysis = item.url_hash ? analysisByHash.get(item.url_hash) : undefined;
    const threat = cleanLabel(
      analysis?.threat_type ?? item.threat_type ?? "Без классификации",
    );
    const items = groups.get(threat) ?? [];

    items.push(item);
    groups.set(threat, items);
  }

  return Array.from(groups.entries())
    .map(([threat, items], index) => reportFromGroup(threat, items, analysisByHash, index))
    .sort((a, b) => b.statistics.totalPosts - a.statistics.totalPosts);
}

function reportFromGroup(
  threat: string,
  items: MediaItemRow[],
  analysisByHash: Map<string, AiAnalysisRow>,
  index: number,
): ThreatReport {
  const analyses = items
    .map((item) => (item.url_hash ? analysisByHash.get(item.url_hash) : undefined))
    .filter((analysis): analysis is AiAnalysisRow => Boolean(analysis));
  const riskScores = items.map((item) => {
    const analysis = item.url_hash ? analysisByHash.get(item.url_hash) : undefined;
    return clampScore(analysis?.risk_score ?? item.risk_score ?? 0);
  });
  const averageRisk = average(riskScores);
  const riskLevel = riskLevelFromScore(averageRisk);
  const confidence = average(
    analyses
      .map((analysis) => analysis.confidence)
      .filter((value): value is number => typeof value === "number"),
  );
  const aiFindings = unique([
    ...analyses.flatMap((analysis) => stringArray(analysis.key_signals)),
    ...items.flatMap((item) => stringArray(item.risk_signals)),
  ]).slice(0, 5);
  const sourceBreakdown = buildSourceBreakdown(items);
  const accounts = buildAccounts(items, riskScores);
  const recentPosts = items.slice(0, 8).map((item, itemIndex) => ({
    id: item.url_hash ?? `${slug(threat)}-${itemIndex}`,
    account: cleanLabel(item.channel_name ?? hostFromUrl(item.url) ?? "Источник"),
    date: formatDateTime(item.published_at ?? item.created_at),
    platform: platformFromValue(item.platform ?? item.source_type),
    excerpt: cleanLabel(item.snippet ?? item.title ?? "Описание публикации отсутствует."),
    engagement: "зафиксировано системой мониторинга",
  }));
  const firstDate = oldestDate(items.map((item) => item.published_at ?? item.created_at));

  return {
    id: slug(threat),
    threat,
    description: `${items.length} ${pluralRu(items.length, "сигнал", "сигнала", "сигналов")} по кластеру. Средний риск: ${averageRisk}/100.`,
    detailedDescription:
      analyses.find((analysis) => analysis.reasoning_short)?.reasoning_short ??
      `Кластер сформирован из публикаций и страниц, где совпадают признаки риска, источники и тип угрозы "${threat}".`,
    riskLevel,
    icon: iconForThreat(index),
    accent: accentForIndex(index),
    aiSummary: {
      confidence: `${confidence || 0}%`,
      modelVerdict:
        analyses.find((analysis) => analysis.reasoning_short)?.reasoning_short ??
        `AI выделил кластер "${threat}" для приоритетной проверки.`,
      nextAction:
        analyses.find((analysis) => analysis.recommended_action)?.recommended_action ??
        "Проверить источники, сохранить доказательства и обновить правила мониторинга.",
    },
    aiFindings:
      aiFindings.length > 0
        ? aiFindings
        : ["Повторяются риск-сигналы, связанные с этим типом угрозы."],
    sourceBreakdown,
    statisticHighlights: [
      { label: "Средний риск", value: `${averageRisk}/100`, delta: "live" },
      { label: "Сигналы", value: String(items.length), delta: "из базы" },
      { label: "Источники", value: String(sourceBreakdown.length), delta: "активно" },
    ],
    responsePlan: [
      analyses.find((analysis) => analysis.recommended_action)?.recommended_action ??
        "Провести ручную верификацию публикаций с максимальным риском.",
      "Сохранить ссылки, тексты и признаки для доказательной базы.",
      "Сопоставить аккаунты и домены с похожими кластерами.",
    ],
    statistics: {
      totalPosts: items.length,
      activeAccounts: accounts.length,
      citiesAffected: 1,
      growthRate: "live",
      detectedSince: firstDate,
    },
    topCities: [
      {
        city: "Казахстан",
        posts: items.length,
        accounts: accounts.length,
        firstDetected: firstDate,
      },
    ],
    topAccounts: accounts.slice(0, 5).map((account) => ({
      name: account.account,
      platform: account.platform,
      subscribers: "-",
      posts: account.postsCount,
      riskScore: String(account.riskScore),
    })),
    accountAnalysis: accounts.slice(0, 6).map((account) => ({
      account: account.account,
      platform: account.platform,
      createdDate: firstDate,
      subscribers: 0,
      postsCount: account.postsCount,
      engagementRate: "n/a",
      riskFactors: account.riskFactors,
    })),
    profileDetails: [
      {
        label: "Основной паттерн",
        value: threat,
        icon: Brain,
      },
      {
        label: "Канал распространения",
        value: sourceBreakdown.map((source) => source.platform).join(", "),
        icon: Radar,
      },
      {
        label: "Триггер риска",
        value: `${averageRisk}/100 по AI и rule-based сигналам`,
        icon: ShieldAlert,
      },
      {
        label: "Ключевой индикатор",
        value: aiFindings[0] ?? "Повторяющиеся признаки риска",
        icon: FileText,
      },
    ],
    postActivity: buildActivity(items),
    recentPosts,
  };
}

function buildSourceBreakdown(items: MediaItemRow[]) {
  const counts = new Map<string, { platform: SourcePlatform; count: number }>();

  for (const item of items) {
    const source = cleanLabel(item.channel_name ?? hostFromUrl(item.url) ?? "Источник");
    const current = counts.get(source) ?? {
      platform: platformFromValue(item.platform ?? item.source_type),
      count: 0,
    };

    current.count += 1;
    counts.set(source, current);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([source, value]) => ({
      source,
      platform: value.platform,
      share: `${Math.round((value.count / items.length) * 100)}%`,
      signals: value.count,
      reliability: value.count > 2 ? "высокая" : "средняя",
    }));
}

function buildAccounts(items: MediaItemRow[], riskScores: number[]) {
  const accounts = new Map<
    string,
    {
      account: string;
      platform: SourcePlatform;
      postsCount: number;
      riskTotal: number;
      riskFactors: string[];
    }
  >();

  items.forEach((item, index) => {
    const account = cleanLabel(item.channel_name ?? hostFromUrl(item.url) ?? "Источник");
    const current = accounts.get(account) ?? {
      account,
      platform: platformFromValue(item.platform ?? item.source_type),
      postsCount: 0,
      riskTotal: 0,
      riskFactors: [],
    };

    current.postsCount += 1;
    current.riskTotal += riskScores[index] ?? 0;
    current.riskFactors.push(...stringArray(item.risk_signals));
    accounts.set(account, current);
  });

  return Array.from(accounts.values())
    .map((account) => ({
      ...account,
      riskScore: Math.round(account.riskTotal / account.postsCount),
      riskFactors: unique(account.riskFactors).slice(0, 4),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);
}

function buildActivity(items: MediaItemRow[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const date = formatShortDate(item.published_at ?? item.created_at);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .slice(0, 7)
    .reverse()
    .map(([date, postsCount]) => ({ date, postsCount }));
}

function platformFromValue(value: string | null | undefined): SourcePlatform {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("telegram")) return "Telegram";
  if (normalized.includes("youtube")) return "YouTube";
  if (normalized.includes("instagram")) return "Instagram";

  return "Web";
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "Critical";
  if (score >= 55) return "High";
  return "Medium";
}

function iconForThreat(index: number) {
  const icons = [Brain, Radar, Globe2, MessageCircle];
  return icons[index % icons.length];
}

function accentForIndex(index: number): ThreatReport["accent"] {
  const accents: ThreatReport["accent"][] = ["cyan", "orange", "green", "pink"];
  return accents[index % accents.length];
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return [value];
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, entryValue]) => Boolean(entryValue))
      .map(([key]) => key);
  }

  return [];
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
}

function oldestDate(values: Array<string | null | undefined>) {
  const dates = values
    .map((value) => (value ? new Date(value) : null))
    .filter((date): date is Date => Boolean(date) && !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!dates[0]) {
    return "-";
  }

  return dates[0].toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function hostFromUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function cleanLabel(value: string) {
  return value.trim() || "Не указано";
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-|-$/g, "");
}

function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
