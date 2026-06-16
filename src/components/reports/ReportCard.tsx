import { ThreatReport } from "@/lib/dashboard-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { riskLabels } from "@/lib/dashboard-data";
import { TrendingUp } from "lucide-react";

interface ReportCardProps {
  report: ThreatReport;
  isSelected: boolean;
  onClick: () => void;
}

export function ReportCard({ report, isSelected, onClick }: ReportCardProps) {
  const accentColors = {
    cyan: "bg-cyan/15 border-cyan/40 [&.selected]:ring-cyan/40",
    green: "bg-green/15 border-green/40 [&.selected]:ring-green/40",
    orange: "bg-orange/15 border-orange/40 [&.selected]:ring-orange/40",
    pink: "bg-pink/15 border-pink/40 [&.selected]:ring-pink/40",
  };

  const textColors = {
    cyan: "text-cyan",
    green: "text-green",
    orange: "text-orange",
    pink: "text-pink",
  };

  const riskColors = {
    Critical: "bg-red/20 text-red",
    High: "bg-orange/20 text-orange",
    Medium: "bg-yellow/20 text-yellow",
  };

  return (
    <Card
      onClick={onClick}
      className={`glass cursor-pointer border-border/60 p-3 transition-all ${
        isSelected ? `selected ring-1 ${accentColors[report.accent]}` : accentColors[report.accent]
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 shrink-0`}>
          <report.icon className={`h-4 w-4 ${textColors[report.accent]}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{report.threat}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`${riskColors[report.riskLevel]} border-0 text-[11px]`}
            >
              {riskLabels[report.riskLevel]}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{report.statistics.totalPosts} постов</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{report.statistics.growthRate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
