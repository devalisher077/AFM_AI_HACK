import {
  type ConnectorHealth,
  type ScannedPost,
  type SourceSlice,
  type StatusLevel,
  type ThreatCardData,
} from "@/lib/dashboard-data";
import { getSupabaseClient } from "@/lib/supabase";

type JsonRecord = Record<string, unknown>;

type ScanRunRow = {
  run_id: string | null;
  generated_at: string | null;
  total_candidates: number | null;
  high_risk_items: number | null;
  kz_high_risk_items: number | null;
  review_items: number | null;
  platform_counts: unknown;
  summary: unknown;
  updated_at: string | null;
};

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
  threat_type: string | null;
  status: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type AiAnalysisRow = {
  url_hash: string | null;
  risk_score: number | null;
  threat_type: string | null;
  confidence: number | null;
  analyzed_at: string | null;
};

export type DashboardLiveData = {
  updatedLabel: string;
  totalScanned: string;
  trendLabel: string;
  threatCards: ThreatCardData[];
  scannedPosts: ScannedPost[];
  sourceDistribution: SourceSlice[];
  connectorHealth: ConnectorHealth[];
  errorMessage: string | null;
  hasData: boolean;
};

export async function fetchDashboardLiveData(): Promise<DashboardLiveData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      ...emptyDashboardData,
      errorMessage: "Supabase не настроен или недоступен в браузере.",
    };
  }

  const [runResult, mediaResult, mediaCountResult, analysisResult] = await Promise.all([
    supabase
      .from("scan_runs")
      .select(
        "run_id, generated_at, total_candidates, high_risk_items, kz_high_risk_items, review_items, platform_counts, summary, updated_at",
      )
      .order("generated_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("media_items")
      .select(
        "url_hash, url, platform, source_type, title, snippet, published_at, channel_name, risk_score, threat_type, status, updated_at, created_at",
      )
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from("media_items")
      .select("url_hash", { count: "exact", head: true }),
    supabase
      .from("ai_analyses")
      .select("url_hash, risk_score, threat_type, confidence, analyzed_at")
      .order("analyzed_at", { ascending: false, nullsFirst: false })
      .limit(120),
  ]);

  const latestRun = runResult.error ? null : (runResult.data as ScanRunRow | null);
  const mediaItems = runResult.error || mediaResult.error
    ? ((mediaResult.data ?? []) as MediaItemRow[])
    : ((mediaResult.data ?? []) as MediaItemRow[]);
  const analyses = analysisResult.error
    ? []
    : ((analysisResult.data ?? []) as AiAnalysisRow[]);
  const totalMediaItems = mediaCountResult.error
    ? mediaItems.length
    : (mediaCountResult.count ?? mediaItems.length);
  const totalScannedCount = Math.max(
    latestRun?.total_candidates ?? 0,
    totalMediaItems,
  );
  const errors = [runResult.error, mediaResult.error, mediaCountResult.error, analysisResult.error]
    .filter(Boolean)
    .map((error) => error?.message)
    .filter(Boolean);
  const hasData = Boolean(latestRun || totalMediaItems > 0 || analyses.length > 0);

  const analysisByHash = new Map(
    analyses
      .filter((analysis) => analysis.url_hash)
      .map((analysis) => [analysis.url_hash as string, analysis]),
  );

  return {
    updatedLabel: formatUpdatedLabel(
      latestRun?.generated_at ?? latestRun?.updated_at ?? mediaItems[0]?.updated_at,
    ),
    totalScanned: formatNumber(totalScannedCount),
    trendLabel: formatTrend(latestRun),
    threatCards: buildThreatCards(analyses),
    scannedPosts: buildScannedPosts(mediaItems, analysisByHash),
    sourceDistribution: buildSourceDistribution(
      latestRun?.platform_counts,
      mediaItems,
    ),
    connectorHealth: buildConnectorHealth(latestRun?.platform_counts, mediaItems),
    errorMessage: errors.length > 0 ? errors.join(" · ") : null,
    hasData,
  };
}

export const emptyDashboardData: DashboardLiveData = {
  updatedLabel: "Данные еще не загружены",
  totalScanned: "0",
  trendLabel: "нет данных",
  threatCards: [],
  scannedPosts: [],
  sourceDistribution: [],
  connectorHealth: [],
  errorMessage: null,
  hasData: false,
};

function buildThreatCards(analyses: AiAnalysisRow[]): ThreatCardData[] {
  const groups = new Map<
    string,
    {
      count: number;
      totalRisk: number;
      maxRisk: number;
      focusHash: string | null;
    }
  >();

  for (const analysis of analyses) {
    const threat = cleanLabel(analysis.threat_type ?? "Не классифицировано");
    const risk = clampScore(analysis.risk_score ?? 0);
    const current = groups.get(threat) ?? {
      count: 0,
      totalRisk: 0,
      maxRisk: 0,
      focusHash: null,
    };

    current.count += 1;
    current.totalRisk += risk;
    if (risk >= current.maxRisk) {
      current.maxRisk = risk;
      current.focusHash = analysis.url_hash;
    }
    groups.set(threat, current);
  }

  const cards = Array.from(groups.entries())
    .map(([title, group]) => {
      const averageRisk = Math.round(group.totalRisk / group.count);

      return {
        label: "Кластер угроз",
        title,
        metricLabel: "Уровень риска",
        value: `${averageRisk}/100`,
        growth: group.maxRisk >= 80 ? "требует проверки" : "под наблюдением",
        posts: `${group.count} ${pluralRu(group.count, "пост", "поста", "постов")}`,
        accent: group.maxRisk >= 75 ? "red" : "green",
        href: group.focusHash
          ? `/ai-analysis?focus=${encodeURIComponent(group.focusHash)}`
          : "/ai-analysis",
      } satisfies ThreatCardData;
    })
    .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
    .slice(0, 12);

  return cards;
}

function buildScannedPosts(
  mediaItems: MediaItemRow[],
  analysisByHash: Map<string, AiAnalysisRow>,
): ScannedPost[] {
  const posts = [...mediaItems].sort(compareMediaItemsByScanTime).map((item) => {
    const analysis = item.url_hash ? analysisByHash.get(item.url_hash) : undefined;
    const riskScore = clampScore(analysis?.risk_score ?? item.risk_score ?? 0);

    return {
      date: formatShortDate(item.created_at ?? item.updated_at ?? item.published_at),
      source: cleanLabel(item.channel_name ?? hostFromUrl(item.url) ?? item.platform ?? "Источник"),
      threat: cleanLabel(analysis?.threat_type ?? item.threat_type ?? item.title ?? "Без классификации"),
      risk: riskLevelFromScore(riskScore),
      status: statusFromValue(item.status, riskScore),
    } satisfies ScannedPost;
  });

  return posts;
}

function compareMediaItemsByScanTime(a: MediaItemRow, b: MediaItemRow) {
  return mediaItemScanTime(b) - mediaItemScanTime(a);
}

function mediaItemScanTime(item: MediaItemRow) {
  return timestampFromValue(item.created_at ?? item.updated_at ?? item.published_at);
}

function buildSourceDistribution(
  platformCounts: unknown,
  mediaItems: MediaItemRow[],
): SourceSlice[] {
  const counts = normalizeCounts(platformCounts);

  if (Object.keys(counts).length === 0) {
    for (const item of mediaItems) {
      const platform = cleanLabel(item.platform ?? item.source_type ?? "Другое");
      counts[platform] = (counts[platform] ?? 0) + 1;
    }
  }

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  if (total <= 0) return [];

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], index) => ({
      label: platformLabel(label),
      value: Math.round((count / total) * 100),
      color: sourceColor(index),
    }));
}

function buildConnectorHealth(
  platformCounts: unknown,
  mediaItems: MediaItemRow[],
): ConnectorHealth[] {
  const counts = normalizeCounts(platformCounts);

  if (Object.keys(counts).length === 0) {
    for (const item of mediaItems) {
      const platform = cleanLabel(item.platform ?? item.source_type ?? "Other");
      counts[platform] = (counts[platform] ?? 0) + 1;
    }
  }

  const connectors = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name: platformLabel(name),
      status: "active",
      detail: `${count} ${pluralRu(count, "сигнал", "сигнала", "сигналов")}`,
      latency: "live",
    }) satisfies ConnectorHealth);

  return connectors;
}

function normalizeCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const counts: Record<string, number> = {};

  for (const [key, rawCount] of Object.entries(value as JsonRecord)) {
    const count = typeof rawCount === "number" ? rawCount : Number(rawCount);

    if (Number.isFinite(count) && count > 0) {
      counts[key] = count;
    }
  }

  return counts;
}

function riskLevelFromScore(score: number): ScannedPost["risk"] {
  if (score >= 80) return "Critical";
  if (score >= 55) return "High";
  return "Medium";
}

function statusFromValue(value: string | null, score: number): StatusLevel {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("escal")) return "Escalated";
  if (normalized.includes("review")) return "Reviewing";
  if (normalized.includes("detect")) return "Detected";
  if (score >= 80) return "New Alert";
  if (score >= 55) return "Reviewing";
  return "Detected";
}

function formatTrend(run: ScanRunRow | null | undefined) {
  const highRisk = run?.high_risk_items ?? run?.kz_high_risk_items ?? run?.review_items;

  if (typeof highRisk === "number" && highRisk > 0) {
    return `${highRisk} high risk`;
  }

  return "live";
}

function formatUpdatedLabel(value: string | null | undefined) {
  if (!value) {
    return "Данные обновлены";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Данные обновлены";
  }

  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 60_000),
  );

  if (diffMinutes < 1) return "Данные обновлены только что";
  if (diffMinutes < 60) return `Данные обновлены ${diffMinutes} мин назад`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Данные обновлены ${diffHours} ч назад`;

  return `Данные обновлены ${date.toLocaleDateString("ru-RU")}`;
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function timestampFromValue(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value).replace(/\u00a0/g, " ");
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function cleanLabel(value: string) {
  return value.trim() || "Не указано";
}

function hostFromUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function platformLabel(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("telegram")) return "Telegram";
  if (normalized.includes("youtube")) return "YouTube";
  if (normalized.includes("instagram")) return "Instagram";
  if (normalized.includes("google") || normalized.includes("web")) return "Сайты";
  if (normalized.includes("tiktok")) return "TikTok";

  return cleanLabel(value);
}

function sourceColor(index: number) {
  const colors = [
    "var(--source-telegram)",
    "var(--source-sites)",
    "var(--source-youtube)",
    "var(--source-other)",
    "var(--pink)",
  ];

  return colors[index] ?? "var(--source-other)";
}

function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
