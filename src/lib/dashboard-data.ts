import {
  LayoutDashboard,
  Flame,
  Brain,
  Radar,
  ScanLine,
  Boxes,
  FileText,
} from "lucide-react";

export const profile = {
  username: "@damir_sa",
  name: "Дамир Сарсенов",
  role: "AI-аналитик угроз",
};

export const navItems = [
  { label: "Дашборд", icon: LayoutDashboard, active: true },
  { label: "Новые угрозы", icon: Flame },
  { label: "AI-анализ", icon: Brain },
  { label: "Источники", icon: Radar },
  { label: "Просканированные посты", icon: ScanLine },
  { label: "Кластеры угроз", icon: Boxes },
  { label: "Отчёты", icon: FileText },
];

export type Accent = "cyan" | "pink";

export interface ThreatCardData {
  label: string;
  title: string;
  metricLabel: string;
  value: string;
  growth: string;
  posts: string;
  accent: Accent;
}

export const threatCards: ThreatCardData[] = [
  {
    label: "Кластер угроз",
    title: "AI Income Bot",
    metricLabel: "Уровень риска",
    value: "92/100",
    growth: "+180%",
    posts: "26 постов",
    accent: "cyan",
  },
  {
    label: "Кластер угроз",
    title: "Betting Signals",
    metricLabel: "Уровень риска",
    value: "87/100",
    growth: "+60%",
    posts: "39 постов",
    accent: "pink",
  },
  {
    label: "Кластер угроз",
    title: "Crypto Bonus Scam",
    metricLabel: "Уровень риска",
    value: "81/100",
    growth: "+130%",
    posts: "14 постов",
    accent: "cyan",
  },
];

export type RiskLevel = "Critical" | "High" | "Medium";
export type StatusLevel = "New Alert" | "Reviewing" | "Detected" | "Escalated";

export interface ScannedPost {
  date: string;
  source: string;
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
    threat: "AI Income Bot",
    risk: "Critical",
    status: "New Alert",
  },
  {
    date: "16/06/26",
    source: "@betting_signals",
    threat: "Betting Signals",
    risk: "High",
    status: "Reviewing",
  },
  {
    date: "16/06/26",
    source: "crypto-bonus.kz",
    threat: "Crypto Bonus Scam",
    risk: "Medium",
    status: "Detected",
  },
  {
    date: "16/06/26",
    source: "@quick_profit",
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
  { label: "Telegram", value: 52, color: "var(--cyan)" },
  { label: "Сайты", value: 21, color: "var(--glow-green)" },
  { label: "YouTube", value: 17, color: "var(--purple)" },
  { label: "Другое", value: 10, color: "var(--orange)" },
];
