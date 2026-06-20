import { ThreatReport } from "@/lib/dashboard-data";
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
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { downloadReportPDF, downloadReportWord } from "./exportUtils";

interface ReportDetailProps {
  report: ThreatReport;
}

export function ReportDetail({ report }: ReportDetailProps) {
  const totalSignals = report.sourceBreakdown.reduce(
    (sum, source) => sum + source.signals,
    0,
  );

  return (
    <article className="glass overflow-hidden border border-border/60 bg-card/35">
      <header className="border-b border-border/50 px-6 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>Аналитический отчет</span>
              <span className="h-px w-4 bg-muted-foreground/50" />
              <span>{report.statistics.totalPosts} просканировано</span>
              <span className="h-px w-4 bg-muted-foreground/50" />
              <span>Обновлено сегодня</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {report.threat}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              {report.description}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              onClick={() => downloadReportPDF(report)}
              variant="outline"
              size="sm"
              className="gap-2 rounded-none"
            >
              PDF
            </Button>
            <Button
              onClick={() => downloadReportWord(report)}
              variant="outline"
              size="sm"
              className="gap-2 rounded-none"
            >
              Word
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-px border-b border-border/50 bg-border/40 md:grid-cols-3">
        <ReportMetric
          label="Просканировано"
          value={report.statistics.totalPosts}
        />
        <ReportMetric
          label="Активных источников"
          value={report.statistics.activeAccounts}
        />
        <ReportMetric label="Динамика" value={report.statistics.growthRate} />
      </section>

      <div className="px-6 py-5">
        <section>
          <div>
            <SectionHeading title="Описание ситуации" />
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {report.detailedDescription}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-px overflow-hidden bg-border/40 md:grid-cols-3">
          {report.statisticHighlights.map((item) => (
            <div key={item.label} className="bg-background/35 px-4 py-3">
              <span className="block text-[11px] text-muted-foreground">
                {item.label}
              </span>
              <div className="mt-1 flex items-end justify-between gap-3">
                <span className="text-xl font-bold text-foreground">
                  {item.value}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.delta}
                </span>
              </div>
            </div>
          ))}
        </section>

        <Tabs defaultValue="overview" className="mt-6 w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-none bg-muted/20">
            <TabsTrigger className="rounded-none" value="overview">
              Обзор
            </TabsTrigger>
            <TabsTrigger className="rounded-none" value="sources">
              Источники
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-8">
            <section className="grid gap-8 xl:grid-cols-2">
              <div>
                <SectionHeading title="Характеристики" />
                <dl className="mt-3 divide-y divide-border/45">
                  {report.profileDetails.map((detail) => (
                    <div
                      key={detail.label}
                      className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]"
                    >
                      <dt className="text-[12px] text-muted-foreground">
                        {detail.label}
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <SectionHeading title="Активность по дням" />
                <div className="mt-3 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.postActivity}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
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
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="postsCount"
                        stroke="var(--foreground)"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

          </TabsContent>

          <TabsContent value="sources" className="mt-5">
            <section>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionHeading title="Источники и сигналы" />
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Всего сигналов по кластеру: {totalSignals}
                  </p>
                </div>
                <span className="text-[12px] font-medium text-muted-foreground">
                  cross-source matching
                </span>
              </div>

              <div className="mt-4 overflow-hidden border border-border/45">
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
              </div>
            </section>
          </TabsContent>

        </Tabs>
      </div>
    </article>
  );
}

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-background/35 px-4 py-3">
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <span className="mt-1 block text-lg font-bold text-foreground">
        {value}
      </span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      {title}
    </h3>
  );
}
