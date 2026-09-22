import {
  LayoutDashboard,
  Brain,
  Radar,
  FileText,
  Settings,
  MessageCircle,
  Globe2,
  Youtube,
  Instagram,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI-анализ", icon: Brain, href: "/ai-analysis" },
  { label: "Источники", icon: Radar, href: "/sources" },
  { label: "Отчёты", icon: FileText, href: "/reports" },
];

export type Accent = "green" | "red";

export interface ThreatCardData {
  label: string;
  title: string;
  metricLabel: string;
  value: string;
  accent: Accent;
  href?: string;
}

export const threatCards: ThreatCardData[] = [
  {
    label: "Источник",
    title: "@ai_income_kz",
    metricLabel: "Уровень риска",
    value: "92/100",
    accent: "red",
  },
  {
    label: "Источник",
    title: "@betting_signals",
    metricLabel: "Уровень риска",
    value: "87/100",
    accent: "red",
  },
  {
    label: "Источник",
    title: "crypto-bonus.kz",
    metricLabel: "Уровень риска",
    value: "81/100",
    accent: "green",
  },
];

export type RiskLevel = "Critical" | "High" | "Medium";
export type StatusLevel = "New Alert" | "Reviewing" | "Detected" | "Escalated";

export interface ScannedPost {
  date: string;
  source: string;
  sourceId?: string;
  threat: string;
  risk: RiskLevel;
  status: StatusLevel;
}

export const riskLabels: Record<RiskLevel, string> = {
  Critical: "Критический",
  High: "Высокий",
  Medium: "Средний",
};

export const statusLabels: Record<StatusLevel, string> = {
  "New Alert": "Новое оповещение",
  Reviewing: "На проверке",
  Detected: "Обнаружено",
  Escalated: "Эскалация",
};

export const scannedPosts: ScannedPost[] = [
  {
    date: "16/06/26",
    source: "@ai_income_kz",
    sourceId: "src-001",
    threat: "AI Income Bot",
    risk: "Critical",
    status: "New Alert",
  },
  {
    date: "16/06/26",
    source: "@betting_signals",
    sourceId: "src-002",
    threat: "Betting Signals",
    risk: "High",
    status: "Reviewing",
  },
  {
    date: "16/06/26",
    source: "crypto-bonus.kz",
    sourceId: "src-003",
    threat: "Crypto Bonus Scam",
    risk: "Medium",
    status: "Detected",
  },
  {
    date: "16/06/26",
    source: "@quick_profit",
    sourceId: "src-004",
    threat: "Fast Profit Matrix",
    risk: "Critical",
    status: "Escalated",
  },
];

export interface SourceSlice {
  label: string;
  value: number;
  color: string;
}

export const sourceDistribution: SourceSlice[] = [
  { label: "Telegram", value: 52, color: "var(--source-telegram)" },
  { label: "Сайты", value: 21, color: "var(--source-sites)" },
  { label: "YouTube", value: 17, color: "var(--source-youtube)" },
  { label: "Другое", value: 10, color: "var(--source-other)" },
];

export type ConnectorStatus = "active" | "limited" | "pending";

export interface ConnectorHealth {
  name: string;
  status: ConnectorStatus;
  detail: string;
  latency: string;
}

export const connectorHealth: ConnectorHealth[] = [
  {
    name: "Telegram",
    status: "active",
    detail: "42 канала",
    latency: "1 мин",
  },
  {
    name: "YouTube",
    status: "active",
    detail: "18 запросов",
    latency: "3 мин",
  },
  {
    name: "Web crawler",
    status: "limited",
    detail: "96 доменов",
    latency: "8 мин",
  },
  {
    name: "TikTok / Instagram",
    status: "pending",
    detail: "ожидает API",
    latency: "-",
  },
];

export interface AnalysisSource {
  name: string;
  type: string;
  icon: LucideIcon;
  coverage: string;
  risk: string;
  freshness: string;
  volume: string;
  accent: "cyan" | "green" | "orange" | "pink";
  summary: string;
  signals: string[];
  examples: string[];
}

export const analysisSources: AnalysisSource[] = [
  {
    name: "Telegram",
    type: "Каналы и публичные чаты",
    icon: Brain,
    coverage: "42 канала",
    risk: "Высокий",
    freshness: "1 мин",
    volume: "52%",
    accent: "cyan",
    summary:
      "Главный слой ранних сигналов: рекламные воронки, закрытые клубы, боты заработка и повторяющиеся призывы к быстрым вложениям.",
    signals: [
      "резкий рост одинаковых сообщений в нескольких каналах",
      "ссылки на ботов с обещанием дохода без риска",
      "смена админов, контактов и платежных реквизитов",
    ],
    examples: ["@ai_income_kz", "@betting_signals", "@quick_profit"],
  },
  {
    name: "Веб-сайты",
    type: "Домены, лендинги и зеркала",
    icon: Radar,
    coverage: "96 доменов",
    risk: "Средний",
    freshness: "8 мин",
    volume: "21%",
    accent: "green",
    summary:
      "ИИ сопоставляет лендинги, формы заявок и тексты оферт, чтобы находить новые зеркала уже известных схем.",
    signals: [
      "похожие шаблоны страниц и повторяющиеся блоки доверия",
      "новые домены с коротким сроком жизни",
      "перенаправления на мессенджеры и платежные формы",
    ],
    examples: ["crypto-bonus.kz", "fast-income.kz", "bonus-matrix.site"],
  },
  {
    name: "YouTube",
    type: "Видео, описания и комментарии",
    icon: FileText,
    coverage: "18 запросов",
    risk: "Высокий",
    freshness: "3 мин",
    volume: "17%",
    accent: "orange",
    summary:
      "Модель отслеживает обучающие ролики, обзоры платформ и комментарии, где мошеннические ссылки часто появляются раньше жалоб.",
    signals: [
      "массовые комментарии с одинаковыми промокодами",
      "обещания гарантированного заработка в описаниях",
      "перелив аудитории в Telegram-каналы и боты",
    ],
    examples: ["AI income обзор", "ставки сигналы KZ", "crypto bonus guide"],
  },
  {
    name: "Соцсети",
    type: "TikTok, Instagram и открытые профили",
    icon: Settings,
    coverage: "ожидает API",
    risk: "Наблюдение",
    freshness: "-",
    volume: "10%",
    accent: "pink",
    summary:
      "Резервный контур для вирусных публикаций: короткие видео, сторис и профили, которые ведут пользователя к внешним схемам.",
    signals: [
      "быстрое появление однотипных роликов и аккаунтов",
      "скрытые ссылки через био, сторис и комментарии",
      "креативы с давлением на срочность и дефицит",
    ],
    examples: ["short profit clips", "bonus stories", "creator funnels"],
  },
];

export type SourcePlatform = "Telegram" | "Web" | "YouTube" | "Instagram";

export interface FoundSourcePost {
  id: string;
  platform: SourcePlatform;
  icon: LucideIcon;
  account: string;
  sourceHref: string | null;
  sourceUrl: string;
  city: string;
  foundAt: string;
  threat: string;
  risk: RiskLevel;
  excerpt: string;
  evidence: string[];
}

export const foundSourcePosts: FoundSourcePost[] = [
  {
    id: "src-001",
    platform: "Telegram",
    icon: MessageCircle,
    account: "@ai_income_kz",
    sourceUrl: "t.me/ai_income_kz/1842",
    city: "Астана",
    foundAt: "16/06/26 · 09:12",
    threat: "AI Income Bot",
    risk: "Critical",
    excerpt:
      "Запуск бота с доходностью до 35% в неделю и входом через закрытую форму.",
    evidence: ["бот оплаты", "повтор промокода", "массовый репост"],
  },
  {
    id: "src-002",
    platform: "Telegram",
    icon: MessageCircle,
    account: "@betting_signals",
    sourceUrl: "t.me/betting_signals/778",
    city: "Алматы",
    foundAt: "16/06/26 · 09:24",
    threat: "Betting Signals",
    risk: "High",
    excerpt:
      "Пост с гарантиями прохода ставки и переводом аудитории в VIP-чат.",
    evidence: ["VIP-чат", "гарантия дохода", "одинаковые отзывы"],
  },
  {
    id: "src-003",
    platform: "Web",
    icon: Globe2,
    account: "crypto-bonus.kz",
    sourceUrl: "crypto-bonus.kz/claim",
    city: "Шымкент",
    foundAt: "16/06/26 · 09:31",
    threat: "Crypto Bonus Scam",
    risk: "Medium",
    excerpt:
      "Лендинг просит кошелек и телефон для получения бонуса после короткой регистрации.",
    evidence: ["новый домен", "форма заявки", "переход в Telegram"],
  },
  {
    id: "src-004",
    platform: "Telegram",
    icon: MessageCircle,
    account: "@quick_profit",
    sourceUrl: "t.me/quick_profit/129",
    city: "Караганда",
    foundAt: "16/06/26 · 09:43",
    threat: "Fast Profit Matrix",
    risk: "Critical",
    excerpt:
      "Схема матрицы с обещанием удвоения взноса после приглашения трех участников.",
    evidence: ["реферальная сетка", "срочный взнос", "смена реквизитов"],
  },
  {
    id: "src-005",
    platform: "YouTube",
    icon: Youtube,
    account: "KZ Bonus Review",
    sourceUrl: "youtube.com/watch?v=ai-bonus-kz",
    city: "Актобе",
    foundAt: "16/06/26 · 10:05",
    threat: "AI Income Bot",
    risk: "High",
    excerpt:
      "Описание видео ведет на тот же бот, что и Telegram-кластер AI Income Bot.",
    evidence: ["ссылка в описании", "повтор CTA", "комментарии-спам"],
  },
  {
    id: "src-006",
    platform: "Instagram",
    icon: Instagram,
    account: "@bonus.story.kz",
    sourceUrl: "instagram.com/bonus.story.kz",
    city: "Павлодар",
    foundAt: "16/06/26 · 10:18",
    threat: "Crypto Bonus Scam",
    risk: "Medium",
    excerpt:
      "Профиль ведет пользователей через сторис к зеркалу бонусного лендинга.",
    evidence: ["ссылка в био", "серия сторис", "одинаковый креатив"],
  },
];

export interface ThreatReport {
  id: string;
  threat: string;
  description: string;
  detailedDescription: string;
  riskLevel: RiskLevel;
  icon: LucideIcon;
  accent: "cyan" | "green" | "orange" | "pink";
  aiSummary: {
    confidence: string;
    modelVerdict: string;
    nextAction: string;
  };
  aiFindings: string[];
  sourceBreakdown: {
    source: string;
    platform: SourcePlatform;
    share: string;
    signals: number;
    reliability: string;
  }[];
  statisticHighlights: {
    label: string;
    value: string;
    delta: string;
  }[];
  responsePlan: string[];
  statistics: {
    totalPosts: number;
    activeAccounts: number;
    citiesAffected: number;
    growthRate: string;
    detectedSince: string;
  };
  topCities: {
    city: string;
    posts: number;
    accounts: number;
    firstDetected: string;
  }[];
  topAccounts: {
    name: string;
    platform: SourcePlatform;
    subscribers: string;
    posts: number;
    riskScore: string;
  }[];
  accountAnalysis: {
    account: string;
    platform: SourcePlatform;
    createdDate: string;
    subscribers: number;
    postsCount: number;
    engagementRate: string;
    riskFactors: string[];
  }[];
  profileDetails: {
    label: string;
    value: string;
    icon: LucideIcon;
  }[];
  postActivity: {
    date: string;
    postsCount: number;
  }[];
  recentPosts: {
    id: string;
    account: string;
    date: string;
    platform: SourcePlatform;
    excerpt: string;
    engagement: string;
  }[];
}

export const threatReports: ThreatReport[] = [
  {
    id: "ai-income-bot",
    threat: "AI Income Bot",
    description:
      "Сеть Telegram-ботов и видеообзоров с обещанием автоматического заработка через ИИ.",
    detailedDescription:
      "Кластер продвигает псевдоинвестиционный бот, который обещает доходность до 35% в неделю без раскрытия юридического лица, модели дохода и правил вывода средств. AI-система связала Telegram-посты, YouTube-описания и повторяющиеся промокоды в единую воронку привлечения.",
    riskLevel: "Critical",
    icon: Brain,
    accent: "cyan",
    aiSummary: {
      confidence: "94%",
      modelVerdict:
        "Высокая вероятность организованной мошеннической кампании с быстрым масштабированием.",
      nextAction:
        "Зафиксировать источники, передать домены и боты на ручную проверку, усилить мониторинг зеркал.",
    },
    aiFindings: [
      "Повторяется один и тот же CTA в Telegram, YouTube и комментариях.",
      "Ссылки ведут на бота оплаты, а не на проверяемую платформу или договор.",
      "Аккаунты используют одинаковые скриншоты выплат и шаблонные отзывы.",
    ],
    sourceBreakdown: [
      {
        source: "@ai_income_kz",
        platform: "Telegram",
        share: "48%",
        signals: 18,
        reliability: "высокая",
      },
      {
        source: "KZ Bonus Review",
        platform: "YouTube",
        share: "27%",
        signals: 6,
        reliability: "средняя",
      },
      {
        source: "@quick_profit",
        platform: "Telegram",
        share: "15%",
        signals: 5,
        reliability: "высокая",
      },
      {
        source: "fast-income.kz",
        platform: "Web",
        share: "10%",
        signals: 3,
        reliability: "средняя",
      },
    ],
    statisticHighlights: [
      { label: "Средний риск", value: "92/100", delta: "+14 за сутки" },
      { label: "Дубли CTA", value: "31", delta: "+180%" },
      { label: "Новые зеркала", value: "4", delta: "+2 сегодня" },
    ],
    responsePlan: [
      "Сохранить HTML-снимки страниц и экспортировать отчет для эскалации.",
      "Проверить платежные реквизиты и совпадения с ранее обнаруженными кластерами.",
      "Добавить ключевые промокоды в правила раннего обнаружения.",
    ],
    statistics: {
      totalPosts: 26,
      activeAccounts: 7,
      citiesAffected: 4,
      growthRate: "+180%",
      detectedSince: "14/06/26",
    },
    topCities: [
      { city: "Астана", posts: 9, accounts: 3, firstDetected: "14/06/26" },
      { city: "Актобе", posts: 6, accounts: 2, firstDetected: "15/06/26" },
      { city: "Алматы", posts: 5, accounts: 1, firstDetected: "15/06/26" },
      { city: "Караганда", posts: 3, accounts: 1, firstDetected: "16/06/26" },
    ],
    topAccounts: [
      {
        name: "@ai_income_kz",
        platform: "Telegram",
        subscribers: "18.4K",
        posts: 12,
        riskScore: "92",
      },
      {
        name: "KZ Bonus Review",
        platform: "YouTube",
        subscribers: "9.1K",
        posts: 4,
        riskScore: "86",
      },
      {
        name: "@quick_profit",
        platform: "Telegram",
        subscribers: "12.8K",
        posts: 5,
        riskScore: "84",
      },
    ],
    accountAnalysis: [
      {
        account: "@ai_income_kz",
        platform: "Telegram",
        createdDate: "03/05/26",
        subscribers: 18400,
        postsCount: 12,
        engagementRate: "7.8%",
        riskFactors: ["обещание доходности", "бот оплаты", "однотипные отзывы"],
      },
      {
        account: "KZ Bonus Review",
        platform: "YouTube",
        createdDate: "22/04/26",
        subscribers: 9100,
        postsCount: 4,
        engagementRate: "5.1%",
        riskFactors: [
          "ссылка в описании",
          "комментарии-спам",
          "повтор промокода",
        ],
      },
    ],
    profileDetails: [
      {
        label: "Основной паттерн",
        value:
          "Автоматический заработок через ИИ без проверяемой бизнес-модели",
        icon: Brain,
      },
      {
        label: "Канал распространения",
        value: "Telegram-боты, YouTube-обзоры и лендинги-зеркала",
        icon: Radar,
      },
      {
        label: "Целевая аудитория",
        value: "Пользователи, ищущие быстрый доход и пассивные инвестиции",
        icon: MessageCircle,
      },
      {
        label: "Ключевой индикатор",
        value: "Повтор промокодов и скриншотов выплат в разных источниках",
        icon: FileText,
      },
    ],
    postActivity: [
      { date: "11/06", postsCount: 2 },
      { date: "12/06", postsCount: 4 },
      { date: "13/06", postsCount: 5 },
      { date: "14/06", postsCount: 8 },
      { date: "15/06", postsCount: 12 },
      { date: "16/06", postsCount: 26 },
    ],
    recentPosts: [
      {
        id: "post-ai-1",
        account: "@ai_income_kz",
        date: "16/06/26 · 09:12",
        platform: "Telegram",
        excerpt:
          "Запуск бота с доходностью до 35% в неделю и входом через закрытую форму.",
        engagement: "1.2K просмотров, 84 реакции",
      },
      {
        id: "post-ai-2",
        account: "KZ Bonus Review",
        date: "16/06/26 · 10:05",
        platform: "YouTube",
        excerpt:
          "Описание видео ведет на тот же бот, что и Telegram-кластер AI Income Bot.",
        engagement: "5.8K просмотров, 126 комментариев",
      },
    ],
  },
  {
    id: "betting-signals",
    threat: "Betting Signals",
    description:
      "Продвижение VIP-чатов со ставками, гарантиями прохода и фальшивыми отзывами.",
    detailedDescription:
      "Кампания строится вокруг закрытого доступа к платным прогнозам и давления на срочность. AI-анализ показывает совпадения текстов, отзывов и изображений выигрышей в нескольких каналах, что указывает на координированную схему привлечения.",
    riskLevel: "High",
    icon: Radar,
    accent: "orange",
    aiSummary: {
      confidence: "88%",
      modelVerdict:
        "Вероятна агрессивная монетизация через платный VIP-доступ и манипулятивные гарантии.",
      nextAction:
        "Проверить администраторов каналов, сохранить рекламу и добавить гарантийные формулировки в правила.",
    },
    aiFindings: [
      "Фразы о гарантированном проходе ставок повторяются в разных публикациях.",
      "Отзывы выглядят синтетическими: одинаковые суммы, даты и структура сообщений.",
      "Пик активности совпадает с вечерними спортивными событиями.",
    ],
    sourceBreakdown: [
      {
        source: "@betting_signals",
        platform: "Telegram",
        share: "72%",
        signals: 24,
        reliability: "высокая",
      },
      {
        source: "ставки сигналы KZ",
        platform: "YouTube",
        share: "18%",
        signals: 8,
        reliability: "средняя",
      },
      {
        source: "@bonus.story.kz",
        platform: "Instagram",
        share: "10%",
        signals: 3,
        reliability: "низкая",
      },
    ],
    statisticHighlights: [
      { label: "Средний риск", value: "87/100", delta: "+8 за сутки" },
      { label: "VIP-упоминания", value: "22", delta: "+60%" },
      { label: "Дубликаты отзывов", value: "11", delta: "+5 сегодня" },
    ],
    responsePlan: [
      "Отметить публикации с гарантиями результата как приоритетные.",
      "Сопоставить админ-контакты и платежные реквизиты между каналами.",
      "Отследить повторные всплески за 2 часа до спортивных событий.",
    ],
    statistics: {
      totalPosts: 39,
      activeAccounts: 5,
      citiesAffected: 3,
      growthRate: "+60%",
      detectedSince: "12/06/26",
    },
    topCities: [
      { city: "Алматы", posts: 16, accounts: 2, firstDetected: "12/06/26" },
      { city: "Астана", posts: 11, accounts: 2, firstDetected: "13/06/26" },
      { city: "Шымкент", posts: 7, accounts: 1, firstDetected: "15/06/26" },
    ],
    topAccounts: [
      {
        name: "@betting_signals",
        platform: "Telegram",
        subscribers: "24.7K",
        posts: 19,
        riskScore: "87",
      },
      {
        name: "ставки сигналы KZ",
        platform: "YouTube",
        subscribers: "7.6K",
        posts: 6,
        riskScore: "79",
      },
      {
        name: "@bonus.story.kz",
        platform: "Instagram",
        subscribers: "11.2K",
        posts: 4,
        riskScore: "73",
      },
    ],
    accountAnalysis: [
      {
        account: "@betting_signals",
        platform: "Telegram",
        createdDate: "18/02/26",
        subscribers: 24700,
        postsCount: 19,
        engagementRate: "9.2%",
        riskFactors: ["гарантия прохода", "платный VIP", "давление срочности"],
      },
      {
        account: "ставки сигналы KZ",
        platform: "YouTube",
        createdDate: "11/03/26",
        subscribers: 7600,
        postsCount: 6,
        engagementRate: "4.4%",
        riskFactors: [
          "одинаковые промокоды",
          "перелив в Telegram",
          "комментарии-боты",
        ],
      },
    ],
    profileDetails: [
      {
        label: "Основной паттерн",
        value: "Гарантированные ставки и продажа доступа в закрытые чаты",
        icon: Radar,
      },
      {
        label: "Канал распространения",
        value: "Telegram-реклама, YouTube-описания и сторис",
        icon: MessageCircle,
      },
      {
        label: "Триггер риска",
        value: "Обещание результата без раскрытия методики и ответственности",
        icon: ShieldAlert,
      },
      {
        label: "Ключевой индикатор",
        value: "Повторяющиеся отзывы с одинаковой структурой выигрыша",
        icon: FileText,
      },
    ],
    postActivity: [
      { date: "11/06", postsCount: 6 },
      { date: "12/06", postsCount: 9 },
      { date: "13/06", postsCount: 13 },
      { date: "14/06", postsCount: 20 },
      { date: "15/06", postsCount: 28 },
      { date: "16/06", postsCount: 39 },
    ],
    recentPosts: [
      {
        id: "post-bet-1",
        account: "@betting_signals",
        date: "16/06/26 · 09:24",
        platform: "Telegram",
        excerpt:
          "Пост с гарантиями прохода ставки и переводом аудитории в VIP-чат.",
        engagement: "2.4K просмотров, 113 реакций",
      },
      {
        id: "post-bet-2",
        account: "ставки сигналы KZ",
        date: "16/06/26 · 11:20",
        platform: "YouTube",
        excerpt:
          "Видео обещает точный прогноз и закрепляет ссылку на закрытый Telegram-канал.",
        engagement: "3.1K просмотров, 62 комментария",
      },
    ],
  },
  {
    id: "crypto-bonus-scam",
    threat: "Crypto Bonus Scam",
    description:
      "Лендинги и соцсети с бонусами за регистрацию, сбором кошельков и переводом в мессенджеры.",
    detailedDescription:
      "Схема маскируется под бонусную кампанию криптосервиса. Источники используют короткие формы, обещают начисление после регистрации и затем переводят пользователя в Telegram, где запрашивают дополнительные данные или оплату комиссии.",
    riskLevel: "Medium",
    icon: Globe2,
    accent: "green",
    aiSummary: {
      confidence: "81%",
      modelVerdict:
        "Обнаружена развивающаяся сеть зеркал с умеренным текущим охватом, но высоким потенциалом роста.",
      nextAction:
        "Мониторить новые домены, проверить формы сбора данных и связать зеркала по шаблонам страниц.",
    },
    aiFindings: [
      "Лендинги используют одинаковые блоки доверия и похожие формы.",
      "Новые домены ведут на один и тот же Telegram-контакт.",
      "Сторис и био в Instagram повторяют дизайн веб-страницы.",
    ],
    sourceBreakdown: [
      {
        source: "crypto-bonus.kz",
        platform: "Web",
        share: "54%",
        signals: 9,
        reliability: "высокая",
      },
      {
        source: "@bonus.story.kz",
        platform: "Instagram",
        share: "28%",
        signals: 4,
        reliability: "средняя",
      },
      {
        source: "bonus-matrix.site",
        platform: "Web",
        share: "18%",
        signals: 3,
        reliability: "средняя",
      },
    ],
    statisticHighlights: [
      { label: "Средний риск", value: "81/100", delta: "+11 за сутки" },
      { label: "Новые домены", value: "3", delta: "+130%" },
      { label: "Формы сбора", value: "6", delta: "+2 сегодня" },
    ],
    responsePlan: [
      "Собрать снимки форм регистрации и связанных Telegram-переходов.",
      "Добавить хэши шаблонов страниц в поиск похожих доменов.",
      "Отследить новые профили, которые используют тот же визуальный креатив.",
    ],
    statistics: {
      totalPosts: 14,
      activeAccounts: 4,
      citiesAffected: 3,
      growthRate: "+130%",
      detectedSince: "15/06/26",
    },
    topCities: [
      { city: "Шымкент", posts: 5, accounts: 1, firstDetected: "15/06/26" },
      { city: "Павлодар", posts: 4, accounts: 1, firstDetected: "16/06/26" },
      { city: "Алматы", posts: 3, accounts: 2, firstDetected: "16/06/26" },
    ],
    topAccounts: [
      {
        name: "crypto-bonus.kz",
        platform: "Web",
        subscribers: "-",
        posts: 5,
        riskScore: "81",
      },
      {
        name: "@bonus.story.kz",
        platform: "Instagram",
        subscribers: "6.4K",
        posts: 4,
        riskScore: "76",
      },
      {
        name: "bonus-matrix.site",
        platform: "Web",
        subscribers: "-",
        posts: 3,
        riskScore: "74",
      },
    ],
    accountAnalysis: [
      {
        account: "crypto-bonus.kz",
        platform: "Web",
        createdDate: "13/06/26",
        subscribers: 0,
        postsCount: 5,
        engagementRate: "форма 18%",
        riskFactors: ["новый домен", "сбор кошелька", "переход в Telegram"],
      },
      {
        account: "@bonus.story.kz",
        platform: "Instagram",
        createdDate: "29/05/26",
        subscribers: 6400,
        postsCount: 4,
        engagementRate: "6.2%",
        riskFactors: ["ссылка в био", "серия сторис", "одинаковый креатив"],
      },
    ],
    profileDetails: [
      {
        label: "Основной паттерн",
        value:
          "Бонус за регистрацию с последующим сбором контактов и кошельков",
        icon: Globe2,
      },
      {
        label: "Канал распространения",
        value: "Лендинги-зеркала, Instagram-профили и Telegram-переходы",
        icon: Instagram,
      },
      {
        label: "Триггер риска",
        value:
          "Запрос персональных данных до подтверждения легальности сервиса",
        icon: ShieldAlert,
      },
      {
        label: "Ключевой индикатор",
        value: "Одинаковые шаблоны страниц на новых доменах",
        icon: FileText,
      },
    ],
    postActivity: [
      { date: "11/06", postsCount: 0 },
      { date: "12/06", postsCount: 1 },
      { date: "13/06", postsCount: 2 },
      { date: "14/06", postsCount: 4 },
      { date: "15/06", postsCount: 8 },
      { date: "16/06", postsCount: 14 },
    ],
    recentPosts: [
      {
        id: "post-crypto-1",
        account: "crypto-bonus.kz",
        date: "16/06/26 · 09:31",
        platform: "Web",
        excerpt:
          "Лендинг просит кошелек и телефон для получения бонуса после короткой регистрации.",
        engagement: "312 переходов, 56 отправок формы",
      },
      {
        id: "post-crypto-2",
        account: "@bonus.story.kz",
        date: "16/06/26 · 10:18",
        platform: "Instagram",
        excerpt:
          "Профиль ведет пользователей через сторис к зеркалу бонусного лендинга.",
        engagement: "1.7K просмотров сторис",
      },
    ],
  },
];

export interface KazakhstanCitySignal {
  city: string;
  posts: number;
  topThreat: string;
  x: number;
  y: number;
  accent: "cyan" | "green" | "orange" | "pink";
}

export const kazakhstanCitySignals: KazakhstanCitySignal[] = [
  {
    city: "Астана",
    posts: 5,
    topThreat: "AI Income Bot",
    x: 54,
    y: 36,
    accent: "cyan",
  },
  {
    city: "Алматы",
    posts: 6,
    topThreat: "Betting Signals",
    x: 72,
    y: 74,
    accent: "green",
  },
  {
    city: "Шымкент",
    posts: 4,
    topThreat: "Crypto Bonus Scam",
    x: 57,
    y: 80,
    accent: "orange",
  },
  {
    city: "Караганда",
    posts: 3,
    topThreat: "Fast Profit Matrix",
    x: 57,
    y: 52,
    accent: "pink",
  },
  {
    city: "Актобе",
    posts: 2,
    topThreat: "AI Income Bot",
    x: 25,
    y: 55,
    accent: "cyan",
  },
  {
    city: "Павлодар",
    posts: 2,
    topThreat: "Crypto Bonus Scam",
    x: 69,
    y: 32,
    accent: "green",
  },
];
