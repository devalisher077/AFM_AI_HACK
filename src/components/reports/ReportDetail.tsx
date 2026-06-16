import { ThreatReport, riskLabels } from "@/lib/dashboard-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Brain,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { downloadReportPDF, downloadReportWord } from "./exportUtils";

interface ReportDetailProps {
  report: ThreatReport;
}

export function ReportDetail({ report }: ReportDetailProps) {
  const riskColors = {
    Critical: "bg-red/20 text-red border-red/40",
    High: "bg-orange/20 text-orange border-orange/40",
    Medium: "bg-yellow/20 text-yellow border-yellow/40",
  };

  const accentColorMap = {
    cyan: "text-cyan",
    green: "text-green",
    orange: "text-orange",
    pink: "text-pink",
  };

  const totalSignals = report.sourceBreakdown.reduce(
    (sum, source) => sum + source.signals,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header with title and export buttons */}
      <div className="glass relative overflow-hidden rounded-2xl p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan/60 via-glow-green/35 to-transparent" />
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`rounded-lg bg-muted/20 p-2 ${accentColorMap[report.accent]}`}
            >
              <report.icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`border ${riskColors[report.riskLevel]}`}
                >
                  {riskLabels[report.riskLevel]}
                </Badge>
                <span className="text-[12px] text-muted-foreground">
                  Обновлено сегодня
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {report.threat}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {report.description}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              onClick={() => downloadReportPDF(report)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              onClick={() => downloadReportWord(report)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Word
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card className="glass border-border/60 p-3">
          <span className="block text-[11px] text-muted-foreground">
            Всего постов
          </span>
          <span className="block text-lg font-bold text-foreground">
            {report.statistics.totalPosts}
          </span>
        </Card>
        <Card className="glass border-border/60 p-3">
          <span className="block text-[11px] text-muted-foreground">
            Активных аккаунтов
          </span>
          <span className="block text-lg font-bold text-foreground">
            {report.statistics.activeAccounts}
          </span>
        </Card>
        <Card className="glass border-border/60 p-3">
          <span className="block text-[11px] text-muted-foreground">
            Города
          </span>
          <span className="block text-lg font-bold text-foreground">
            {report.statistics.citiesAffected}
          </span>
        </Card>
        <Card className="glass border-border/60 p-3">
          <span className="block text-[11px] text-muted-foreground">Рост</span>
          <span className="block text-lg font-bold text-green">
            {report.statistics.growthRate}
          </span>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass border-border/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange" strokeWidth={1.8} />
            <h3 className="text-sm font-semibold text-foreground">
              Детальное описание угрозы
            </h3>
          </div>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {report.detailedDescription}
          </p>
        </Card>

        <Card className="glass border-border/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan" strokeWidth={1.8} />
              <h3 className="text-sm font-semibold text-foreground">
                AI-анализ
              </h3>
            </div>
            <span className="rounded-md bg-cyan/10 px-2 py-1 text-[11px] font-semibold text-cyan ring-1 ring-cyan/30">
              {report.aiSummary.confidence}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-foreground/85">
            {report.aiSummary.modelVerdict}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            {report.aiSummary.nextAction}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {report.statisticHighlights.map((item) => (
          <Card key={item.label} className="glass border-border/60 p-3">
            <span className="block text-[11px] text-muted-foreground">
              {item.label}
            </span>
            <div className="mt-1 flex items-end justify-between gap-3">
              <span className="text-xl font-bold text-foreground">
                {item.value}
              </span>
              <span className="text-[11px] font-medium text-glow-green">
                {item.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs with detailed info */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="analysis">AI-вывод</TabsTrigger>
          <TabsTrigger value="sources">Источники</TabsTrigger>
          <TabsTrigger value="cities">Города</TabsTrigger>
          <TabsTrigger value="accounts">Аккаунты</TabsTrigger>
          <TabsTrigger value="posts">Доказательства</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            {/* Profile Details */}
            <Card className="glass border-border/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Характеристики
              </h3>
              <div className="space-y-2">
                {report.profileDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <detail.icon
                      className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5"
                      strokeWidth={1.75}
                    />
                    <div className="flex-1">
                      <span className="text-[12px] text-muted-foreground">
                        {detail.label}
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity Chart */}
            <Card className="glass border-border/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Активность по дням
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={report.postActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="postsCount"
                    stroke="var(--cyan)"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top Accounts */}
          <Card className="glass border-border/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Топ аккаунтов
            </h3>
            <div className="space-y-2">
              {report.topAccounts.map((account, idx) => (
                <div
                  key={idx}
                  className="glass flex items-center justify-between rounded-lg border border-border/60 p-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {account.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {account.subscribers} подписчиков • {account.posts} постов
                    </p>
                  </div>
                  <Badge className="ml-2 bg-red/20 text-red border-0">
                    {account.riskScore}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <Card className="glass border-border/60 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Gauge className="h-4 w-4 text-cyan" strokeWidth={1.8} />
                Обнаруженные AI-паттерны
              </h3>
              <div className="space-y-3">
                {report.aiFindings.map((finding) => (
                  <div
                    key={finding}
                    className="flex gap-2 rounded-lg border border-border/50 bg-muted/10 p-3"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-glow-green"
                      strokeWidth={1.8}
                    />
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {finding}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass border-border/60 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Workflow className="h-4 w-4 text-orange" strokeWidth={1.8} />
                План реакции
              </h3>
              <div className="space-y-3">
                {report.responsePlan.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-orange/15 text-[11px] font-bold text-orange ring-1 ring-orange/35">
                      {index + 1}
                    </span>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card className="glass border-border/60 p-4">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Источники и вклад в риск
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  Всего сигналов по кластеру: {totalSignals}
                </p>
              </div>
              <Badge variant="secondary" className="w-fit bg-cyan/15 text-cyan">
                cross-source matching
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Источник</TableHead>
                  <TableHead>Платформа</TableHead>
                  <TableHead>Доля</TableHead>
                  <TableHead>Сигналы</TableHead>
                  <TableHead>Надежность</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.sourceBreakdown.map((source) => (
                  <TableRow key={source.source}>
                    <TableCell className="font-medium text-foreground">
                      {source.source}
                    </TableCell>
                    <TableCell>{source.platform}</TableCell>
                    <TableCell>{source.share}</TableCell>
                    <TableCell>{source.signals}</TableCell>
                    <TableCell>{source.reliability}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <Card className="glass border-border/60 p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Посты по городам
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.topCities}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Bar dataKey="posts" fill="var(--cyan)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="space-y-2">
            {report.topCities.map((city, idx) => (
              <Card key={idx} className="glass border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {city.city}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Впервые обнаружено: {city.firstDetected}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-cyan">
                      {city.posts} постов
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {city.accounts} аккаунтов
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {report.accountAnalysis.map((account, idx) => (
            <Card key={idx} className="glass border-border/60 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {account.account}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {account.platform} • Создан {account.createdDate}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-[10px] text-muted-foreground">
                    Подписчиков
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {account.subscribers.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-[10px] text-muted-foreground">Постов</p>
                  <p className="text-sm font-bold text-foreground">
                    {account.postsCount}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-[10px] text-muted-foreground">
                    Вовлечение
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {account.engagementRate}
                  </p>
                </div>
                <div className="rounded-lg bg-red/20 p-2">
                  <p className="text-[10px] text-red">Риск</p>
                  <p className="text-sm font-bold text-red">Высокий</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-medium text-foreground">
                  Факторы риска:
                </p>
                <div className="flex flex-wrap gap-2">
                  {account.riskFactors.map((factor, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px] bg-orange/20 text-orange border-0"
                    >
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-3">
          {report.recentPosts.map((post) => (
            <Card key={post.id} className="glass border-border/60 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {post.account}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {post.date} • {post.platform}
                  </p>
                </div>
              </div>
              <p className="mb-3 text-sm text-foreground/80">{post.excerpt}</p>
              <div className="text-[11px] text-muted-foreground">
                <span>📊 {post.engagement}</span>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
