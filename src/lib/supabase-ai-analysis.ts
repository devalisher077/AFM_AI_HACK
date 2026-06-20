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
  channel_name: string | null;
  title: string | null;
  snippet: string | null;
};

type AiAnalysisRow = {
  url_hash: string | null;
  risk_score: number | null;
  kz_relevance_score: number | null;
  threat_type: string | null;
  reasoning_short: string | null;
  recommended_action: string | null;
  error: string | null;
  analyzed_at: string | null;
  updated_at: string | null;
};

export type AiAnalysisItem = {
  id: string;
  urlHash: string;
  riskScore: string;
  kzRelevanceScore: string;
  threatType: string;
  reasoningShort: string;
  recommendedAction: string;
  error: string;
  analyzedAt: string;
  postTitle: string;
  postSnippet: string;
  postUrl: string;
  postPlatform: string;
  postSource: string;
};

export type AiAnalysisPageData = {
  items: AiAnalysisItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const fallbackAiAnalysisPageData: AiAnalysisPageData = {
  items: [],
  total: 0,
  page: 0,
  pageSize: 10,
  pageCount: 1,
};

export async function fetchAiAnalysisPage(
  page: number,
  pageSize = 10,
  riskThreshold = 0,
  period: DashboardPeriod = "6h",
): Promise<AiAnalysisPageData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ...fallbackAiAnalysisPageData, page, pageSize };
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const cutoffIso = periodToCutoffIso(period);
  let query = supabase
    .from("ai_analyses")
    .select(
      "url_hash, risk_score, kz_relevance_score, threat_type, reasoning_short, recommended_action, error, analyzed_at, updated_at",
      { count: "planned" },
    )
    .gte("analyzed_at", cutoffIso)
    .order("analyzed_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (riskThreshold > 0) {
    query = query.gt("risk_score", riskThreshold);
  }

  const analysisResult = await query.range(from, to);

  if (analysisResult.error) {
    return { ...fallbackAiAnalysisPageData, page, pageSize };
  }

  const analyses = (analysisResult.data ?? []) as AiAnalysisRow[];
  const hashes = Array.from(
    new Set(
      analyses
        .map((analysis) => analysis.url_hash)
        .filter((hash): hash is string => Boolean(hash)),
    ),
  );
  const mediaByHash = await fetchMediaByHash(hashes);
  const total = analysisResult.count ?? analyses.length;

  return {
    items: analyses.map((analysis, index) =>
      analysisItemFromRow(
        analysis,
        mediaByHash.get(analysis.url_hash ?? ""),
        from + index,
      ),
    ),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function fetchAiAnalysisByHash(
  urlHash: string,
): Promise<AiAnalysisItem | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("ai_analyses")
    .select(
      "url_hash, risk_score, kz_relevance_score, threat_type, reasoning_short, recommended_action, error, analyzed_at, updated_at",
    )
    .eq("url_hash", urlHash)
    .order("analyzed_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const mediaByHash = await fetchMediaByHash([urlHash]);

  return analysisItemFromRow(
    data as AiAnalysisRow,
    mediaByHash.get(urlHash),
    0,
  );
}

async function fetchMediaByHash(hashes: string[]) {
  const supabase = getSupabaseClient();
  const mediaByHash = new Map<string, MediaItemRow>();

  if (!supabase || hashes.length === 0) {
    return mediaByHash;
  }

  const { data, error } = await supabase
    .from("media_items")
    .select("url_hash, url, platform, source_type, channel_name, title, snippet")
    .in("url_hash", hashes);

  if (error) {
    return mediaByHash;
  }

  for (const item of (data ?? []) as MediaItemRow[]) {
    if (item.url_hash) {
      mediaByHash.set(item.url_hash, item);
    }
  }

  return mediaByHash;
}

function analysisItemFromRow(
  analysis: AiAnalysisRow,
  media: MediaItemRow | undefined,
  index: number,
): AiAnalysisItem {
  return {
    id: `${analysis.url_hash ?? "analysis"}-${analysis.analyzed_at ?? index}`,
    urlHash: cleanText(analysis.url_hash),
    riskScore: formatScore(analysis.risk_score),
    kzRelevanceScore: formatScore(analysis.kz_relevance_score),
    threatType: localizeThreatLabel(analysis.threat_type),
    reasoningShort: cleanText(analysis.reasoning_short),
    recommendedAction: cleanText(analysis.recommended_action),
    error: cleanText(analysis.error),
    analyzedAt: formatDateTime(analysis.analyzed_at),
    postTitle: cleanText(media?.title),
    postSnippet: cleanText(media?.snippet),
    postUrl: cleanText(media?.url),
    postPlatform: cleanText(media?.platform ?? media?.source_type),
    postSource: cleanText(media?.channel_name),
  };
}

function formatScore(value: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(Math.round(value))
    : "-";
}

function cleanText(value: string | null | undefined) {
  return value?.trim() || "-";
}

function localizeThreatLabel(value: string | null | undefined) {
  const label = cleanText(value);
  const normalized = label
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const exactTranslations: Record<string, string> = {
    "possible illegal casino": "Возможное нелегальное казино",
    "illegal casino": "Нелегальное казино",
    "online casino": "Онлайн-казино",
    "possible scam": "Возможное мошенничество",
    scam: "Мошенничество",
    phishing: "Фишинг",
    "crypto scam": "Криптомошенничество",
    "betting scam": "Мошеннические ставки",
    "financial scam": "Финансовое мошенничество",
    "investment scam": "Инвестиционное мошенничество",
    gambling: "Азартные игры",
    betting: "Ставки",
  };

  if (exactTranslations[normalized]) {
    return exactTranslations[normalized];
  }

  if (normalized.includes("illegal") && normalized.includes("casino")) {
    return "Возможное нелегальное казино";
  }
  if (normalized.includes("casino")) return "Онлайн-казино";
  if (normalized.includes("betting") || normalized.includes("bookmaker")) {
    return "Ставки и букмекерские схемы";
  }
  if (normalized.includes("crypto")) return "Криптовалютная схема";
  if (normalized.includes("phishing")) return "Фишинг";
  if (normalized.includes("investment")) return "Инвестиционная схема";
  if (normalized.includes("scam") || normalized.includes("fraud")) {
    return "Мошенническая схема";
  }

  return label;
}

function formatDateTime(value: string | null) {
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
