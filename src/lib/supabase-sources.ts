import {
  Globe2,
  Instagram,
  MessageCircle,
  RadioTower,
  Youtube,
} from "lucide-react";
import {
  type FoundSourcePost,
  type RiskLevel,
  type SourcePlatform,
} from "@/lib/dashboard-data";
import {
  periodToCutoffIso,
  type DashboardPeriod,
} from "@/lib/supabase-dashboard";
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
  channel_url: string | null;
  risk_score: number | null;
  risk_signals: unknown;
  kz_signals: unknown;
  bookmaker_brands: unknown;
  threat_type: string | null;
  status: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type AiAnalysisRow = {
  url_hash: string | null;
  risk_score: number | null;
  threat_type: string | null;
  key_signals: unknown;
};

export type SourcesLiveData = {
  posts: FoundSourcePost[];
  totalPosts: number;
  criticalPosts: number;
  errorMessage: string | null;
};

export const emptySourcesData: SourcesLiveData = {
  posts: [],
  totalPosts: 0,
  criticalPosts: 0,
  errorMessage: null,
};

export async function fetchSourcesLiveData(
  period: DashboardPeriod = "6h",
): Promise<SourcesLiveData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      ...emptySourcesData,
      errorMessage: "Supabase не настроен или недоступен в браузере.",
    };
  }

  const cutoffIso = periodToCutoffIso(period);
  const [mediaResult, mediaCountResult, analysisResult] = await Promise.all([
    supabase
      .from("media_items")
      .select(
        "url_hash, url, platform, source_type, title, snippet, published_at, channel_name, channel_url, risk_score, risk_signals, kz_signals, bookmaker_brands, threat_type, status, updated_at, created_at",
      )
      .gte("created_at", cutoffIso)
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(80),
    supabase
      .from("media_items")
      .select("url_hash", { count: "exact", head: true })
      .gte("created_at", cutoffIso),
    supabase
      .from("ai_analyses")
      .select("url_hash, risk_score, threat_type, key_signals")
      .gte("analyzed_at", cutoffIso)
      .order("analyzed_at", { ascending: false, nullsFirst: false })
      .limit(160),
  ]);

  if (mediaResult.error) {
    return {
      ...emptySourcesData,
      errorMessage: mediaResult.error.message,
    };
  }

  const mediaItems = (mediaResult.data ?? []) as MediaItemRow[];
  const analyses = analysisResult.error
    ? []
    : ((analysisResult.data ?? []) as AiAnalysisRow[]);

  if (mediaItems.length === 0) {
    return {
      ...emptySourcesData,
      errorMessage: analysisResult.error?.message ?? null,
    };
  }

  const analysisByHash = new Map(
    analyses
      .filter((analysis) => analysis.url_hash)
      .map((analysis) => [analysis.url_hash as string, analysis]),
  );

  const posts = mediaItems.map((item, index) =>
    buildFoundSourcePost(item, analysisByHash.get(item.url_hash ?? ""), index),
  );

  return {
    posts,
    totalPosts: mediaCountResult.error
      ? posts.length
      : (mediaCountResult.count ?? posts.length),
    criticalPosts: posts.filter((post) => post.risk === "Critical").length,
    errorMessage:
      mediaCountResult.error?.message ?? analysisResult.error?.message ?? null,
  };
}

export async function fetchSourcePostById(
  sourceId: string,
): Promise<FoundSourcePost | null> {
  const supabase = getSupabaseClient();

  if (!supabase || !sourceId) {
    return null;
  }

  const [mediaResult, analysisResult] = await Promise.all([
    supabase
      .from("media_items")
      .select(
        "url_hash, url, platform, source_type, title, snippet, published_at, channel_name, channel_url, risk_score, risk_signals, kz_signals, bookmaker_brands, threat_type, status, updated_at, created_at",
      )
      .eq("url_hash", sourceId)
      .maybeSingle(),
    supabase
      .from("ai_analyses")
      .select("url_hash, risk_score, threat_type, key_signals")
      .eq("url_hash", sourceId)
      .order("analyzed_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (mediaResult.error || !mediaResult.data) {
    return null;
  }

  return buildFoundSourcePost(
    mediaResult.data as MediaItemRow,
    analysisResult.error ? undefined : ((analysisResult.data ?? undefined) as AiAnalysisRow | undefined),
    0,
  );
}

function buildFoundSourcePost(
  item: MediaItemRow,
  analysis: AiAnalysisRow | undefined,
  index: number,
) {
  const platform = platformFromValue(item.platform ?? item.source_type);
  const riskScore = clampScore(analysis?.risk_score ?? item.risk_score ?? 0);
  const evidence = evidenceFromItem(item, analysis);

  return {
    id: item.url_hash ?? `source-${index}`,
    platform,
    icon: iconForPlatform(platform),
    account: cleanLabel(
      item.channel_name ??
        hostFromUrl(item.channel_url) ??
        hostFromUrl(item.url) ??
        "Источник",
    ),
    sourceHref: normalizeUrl(item.url ?? item.channel_url),
    sourceUrl: cleanLabel(item.url ?? item.channel_url ?? "-"),
    city: "Казахстан",
    foundAt: formatFoundAt(
      item.published_at ?? item.updated_at ?? item.created_at,
    ),
    threat: cleanLabel(
      analysis?.threat_type ?? item.threat_type ?? "Без классификации",
    ),
    risk: riskLevelFromScore(riskScore),
    excerpt: cleanLabel(
      item.snippet ?? item.title ?? "Текст публикации не указан.",
    ),
    evidence,
  } satisfies FoundSourcePost;
}

function evidenceFromItem(item: MediaItemRow, analysis?: AiAnalysisRow) {
  const values = [
    ...stringArray(item.risk_signals),
    ...stringArray(item.kz_signals),
    ...stringArray(item.bookmaker_brands),
    ...stringArray(analysis?.key_signals),
  ];

  const unique = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

  if (unique.length > 0) {
    return unique.slice(0, 4);
  }

  return [platformFromValue(item.platform ?? item.source_type), "новый сигнал"];
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "label" in item) {
          return String((item as { label: unknown }).label);
        }
        return "";
      })
      .filter(Boolean);
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

function platformFromValue(value: string | null | undefined): SourcePlatform {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("telegram")) return "Telegram";
  if (normalized.includes("youtube")) return "YouTube";
  if (normalized.includes("instagram")) return "Instagram";

  return "Web";
}

function iconForPlatform(platform: SourcePlatform) {
  switch (platform) {
    case "Telegram":
      return MessageCircle;
    case "YouTube":
      return Youtube;
    case "Instagram":
      return Instagram;
    case "Web":
      return Globe2;
    default:
      return RadioTower;
  }
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "Critical";
  if (score >= 55) return "High";
  return "Medium";
}

function formatFoundAt(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function normalizeUrl(value: string | null) {
  if (!value) return null;

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(`https://${value}`).toString();
    } catch {
      return null;
    }
  }
}

function cleanLabel(value: string) {
  return value.trim() || "Не указано";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
