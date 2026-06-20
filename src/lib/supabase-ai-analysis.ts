import { Brain, FileText, Instagram, Radar } from "lucide-react";
import { type AnalysisSource } from "@/lib/dashboard-data";
import { getSupabaseClient } from "@/lib/supabase";

type MediaItemRow = {
  url_hash: string | null;
  url: string | null;
  platform: string | null;
  source_type: string | null;
  channel_name: string | null;
  title: string | null;
  snippet: string | null;
  risk_score: number | null;
  risk_signals: unknown;
  kz_signals: unknown;
};

type AiAnalysisRow = {
  url_hash: string | null;
  run_id: string | null;
  rank: number | null;
  model: string | null;
  confidence: number | null;
  risk_score: number | null;
  kz_relevance_score: number | null;
  threat_type: string | null;
  is_false_positive: boolean | null;
  key_signals: unknown;
  reasoning_short: string | null;
  recommended_action: string | null;
  raw_analysis: unknown;
  error: string | null;
  analyzed_at: string | null;
  updated_at: string | null;
};

export type AiAnalysisLiveData = {
  accuracy: string;
  sourcesCount: string;
  syncLabel: string;
  sources: AnalysisSource[];
};

export type AiAnalysisItem = {
  id: string;
  urlHash: string;
  runId: string;
  rank: string;
  model: string;
  riskScore: string;
  kzRelevanceScore: string;
  threatType: string;
  isFalsePositive: string;
  confidence: string;
  keySignals: string[];
  reasoningShort: string;
  recommendedAction: string;
  rawAnalysis: string;
  error: string;
  analyzedAt: string;
  updatedAt: string;
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

export const emptyAiAnalysisData: AiAnalysisLiveData = {
  accuracy: "-",
  sourcesCount: "0",
  syncLabel: "нет данных",
  sources: [],
};

export const fallbackAiAnalysisPageData: AiAnalysisPageData = {
  items: [],
  total: 0,
  page: 0,
  pageSize: 10,
  pageCount: 1,
};

export async function fetchAiAnalysisLiveData(): Promise<AiAnalysisLiveData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return emptyAiAnalysisData;
  }

  const [mediaResult, analysisResult] = await Promise.all([
    supabase
      .from("media_items")
      .select(
        "url_hash, url, platform, source_type, channel_name, title, snippet, risk_score, risk_signals, kz_signals",
      )
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(120),
    supabase
      .from("ai_analyses")
      .select(
        "url_hash, confidence, risk_score, key_signals, recommended_action",
      )
      .order("analyzed_at", { ascending: false, nullsFirst: false })
      .limit(160),
  ]);

  if (mediaResult.error || analysisResult.error) {
    return emptyAiAnalysisData;
  }

  const mediaItems = (mediaResult.data ?? []) as MediaItemRow[];
  const analyses = (analysisResult.data ?? []) as AiAnalysisRow[];

  if (mediaItems.length === 0 && analyses.length === 0) {
    return emptyAiAnalysisData;
  }

  const analysisByHash = new Map(
    analyses
      .filter((analysis) => analysis.url_hash)
      .map((analysis) => [analysis.url_hash as string, analysis]),
  );
  const confidenceValues = analyses
    .map((analysis) => analysis.confidence)
    .filter((value): value is number => typeof value === "number");
  const averageConfidence =
    confidenceValues.length > 0
      ? Math.round(
          confidenceValues.reduce((sum, value) => sum + value, 0) /
            confidenceValues.length,
        )
      : 91;
  const sources = buildAnalysisSources(mediaItems, analysisByHash);

  return {
    accuracy: `${averageConfidence}%`,
    sourcesCount: String(sources.length),
    syncLabel: "live",
    sources,
  };
}

export async function fetchAiAnalysisPage(
  page: number,
  pageSize = 10,
  riskThreshold = 0,
): Promise<AiAnalysisPageData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ...fallbackAiAnalysisPageData, page, pageSize };
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("ai_analyses")
    .select(
      "url_hash, run_id, rank, model, risk_score, kz_relevance_score, threat_type, is_false_positive, confidence, key_signals, reasoning_short, recommended_action, error, analyzed_at, updated_at",
      { count: "planned" },
    )
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
      "url_hash, run_id, rank, model, risk_score, kz_relevance_score, threat_type, is_false_positive, confidence, key_signals, reasoning_short, recommended_action, error, analyzed_at, updated_at",
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

export async function fetchAiAnalysisRaw(item: AiAnalysisItem) {
  const supabase = getSupabaseClient();

  if (!supabase || item.urlHash === "-") {
    return "-";
  }

  let query = supabase
    .from("ai_analyses")
    .select("raw_analysis")
    .eq("url_hash", item.urlHash)
    .limit(1);

  if (item.runId !== "-") {
    query = query.eq("run_id", item.runId);
  }

  if (item.rank !== "-") {
    query = query.eq("rank", Number(item.rank));
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return error.message;
  }

  return formatJson((data as { raw_analysis?: unknown } | null)?.raw_analysis);
}

async function fetchMediaByHash(hashes: string[]) {
  const supabase = getSupabaseClient();
  const mediaByHash = new Map<string, MediaItemRow>();

  if (!supabase || hashes.length === 0) {
    return mediaByHash;
  }

  const { data, error } = await supabase
    .from("media_items")
    .select(
      "url_hash, url, platform, source_type, channel_name, title, snippet, risk_score, risk_signals, kz_signals",
    )
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
    id: `${analysis.url_hash ?? "analysis"}-${analysis.run_id ?? index}-${analysis.rank ?? index}`,
    urlHash: cleanText(analysis.url_hash),
    runId: cleanText(analysis.run_id),
    rank: formatNullableNumber(analysis.rank),
    model: cleanText(analysis.model),
    riskScore: formatScore(analysis.risk_score),
    kzRelevanceScore: formatScore(analysis.kz_relevance_score),
    threatType: localizeThreatLabel(analysis.threat_type),
    isFalsePositive:
      typeof analysis.is_false_positive === "boolean"
        ? analysis.is_false_positive
          ? "Да"
          : "Нет"
        : "-",
    confidence: formatScore(analysis.confidence),
    keySignals: stringArray(analysis.key_signals),
    reasoningShort: cleanText(analysis.reasoning_short),
    recommendedAction: cleanText(analysis.recommended_action),
    rawAnalysis: "Нажмите, чтобы загрузить raw_analysis.",
    error: cleanText(analysis.error),
    analyzedAt: formatDateTime(analysis.analyzed_at),
    updatedAt: formatDateTime(analysis.updated_at),
    postTitle: cleanText(media?.title),
    postSnippet: cleanText(media?.snippet),
    postUrl: cleanText(media?.url),
    postPlatform: cleanText(media?.platform ?? media?.source_type),
    postSource: cleanText(media?.channel_name),
  };
}

function buildAnalysisSources(
  mediaItems: MediaItemRow[],
  analysisByHash: Map<string, AiAnalysisRow>,
) {
  const groups = new Map<
    string,
    {
      count: number;
      riskTotal: number;
      signals: string[];
      examples: string[];
    }
  >();

  for (const item of mediaItems) {
    const analysis = item.url_hash
      ? analysisByHash.get(item.url_hash)
      : undefined;
    const platform = platformLabel(item.platform ?? item.source_type ?? "Web");
    const group = groups.get(platform) ?? {
      count: 0,
      riskTotal: 0,
      signals: [],
      examples: [],
    };

    group.count += 1;
    group.riskTotal += clampScore(analysis?.risk_score ?? item.risk_score ?? 0);
    group.signals.push(
      ...stringArray(analysis?.key_signals),
      ...stringArray(item.risk_signals),
      ...stringArray(item.kz_signals),
    );

    const example = item.channel_name ?? item.title;
    if (example) {
      group.examples.push(example);
    }

    groups.set(platform, group);
  }

  const total = Array.from(groups.values()).reduce(
    (sum, group) => sum + group.count,
    0,
  );

  const sources = Array.from(groups.entries()).map(([name, group], index) => {
    const averageRisk = Math.round(group.riskTotal / group.count);
    const uniqueSignals = unique(group.signals).slice(0, 3);
    const examples = unique(group.examples).slice(0, 4);

    return {
      name,
      type: sourceType(name),
      icon: iconForSource(name),
      coverage: `${group.count} ${pluralRu(group.count, "сигнал", "сигнала", "сигналов")}`,
      risk: riskLabel(averageRisk),
      freshness: "live",
      volume: `${Math.round((group.count / total) * 100)}%`,
      accent: accentForIndex(index),
      summary: `Источник дал ${group.count} ${pluralRu(group.count, "публикацию", "публикации", "публикаций")} для AI-скоринга. Средний риск: ${averageRisk}/100.`,
      signals:
        uniqueSignals.length > 0
          ? uniqueSignals
          : ["AI выделил источник как новый сигнал для ручной проверки"],
      examples: examples.length > 0 ? examples : [name],
    } satisfies AnalysisSource;
  });

  return sources;
}

function sourceType(name: string) {
  if (name === "Telegram") return "Каналы и публичные чаты";
  if (name === "YouTube") return "Видео, описания и комментарии";
  if (name === "Instagram") return "Профили, био и сторис";
  return "Домены, лендинги и открытые страницы";
}

function iconForSource(name: string) {
  if (name === "Telegram") return Brain;
  if (name === "YouTube") return FileText;
  if (name === "Instagram") return Instagram;
  return Radar;
}

function platformLabel(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("telegram")) return "Telegram";
  if (normalized.includes("youtube")) return "YouTube";
  if (normalized.includes("instagram")) return "Instagram";

  return "Веб-сайты";
}

function riskLabel(score: number) {
  if (score >= 80) return "Критический";
  if (score >= 55) return "Высокий";
  return "Средний";
}

function accentForIndex(index: number): AnalysisSource["accent"] {
  const accents: AnalysisSource["accent"][] = [
    "cyan",
    "green",
    "orange",
    "pink",
  ];
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
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatScore(value: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(Math.round(value))
    : "-";
}

function formatNullableNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
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

function formatJson(value: unknown) {
  if (value === null || typeof value === "undefined") {
    return "-";
  }

  if (typeof value === "string") {
    return value.trim() || "-";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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

function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
