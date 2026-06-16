import { ThreatReport, riskLabels } from "@/lib/dashboard-data";

export function downloadReportPDF(report: ThreatReport) {
  // Create HTML content for PDF/Print
  const html = generateReportHTML(report);
  
  // Create blob and download as HTML file (can be printed/converted to PDF from browser)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Report_${report.threat.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Give user time to download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

export function downloadReportWord(report: ThreatReport) {
  // Generate Word document content (as HTML table format)
  const html = generateReportHTML(report);
  
  // Create blob with proper MIME type for Word
  const blob = new Blob([html], { type: "application/msword" });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Report_${report.threat.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.doc`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Give user time to download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

function generateReportHTML(report: ThreatReport): string {
  const date = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Отчет: ${report.threat}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
          line-height: 1.6;
        }
        h1 {
          color: #1a1a1a;
          border-bottom: 3px solid #06b6d4;
          padding-bottom: 10px;
        }
        h2 {
          color: #1a1a1a;
          margin-top: 30px;
          border-left: 4px solid #06b6d4;
          padding-left: 10px;
        }
        h3 {
          color: #555;
          margin-top: 20px;
        }
        .header {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        .stats {
          display: flex;
          gap: 20px;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        .stat-box {
          flex: 1;
          min-width: 150px;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #06b6d4;
          border-radius: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1a1a1a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #06b6d4;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .risk-critical {
          color: #dc2626;
          font-weight: bold;
        }
        .risk-high {
          color: #ea580c;
          font-weight: bold;
        }
        .risk-medium {
          color: #eab308;
          font-weight: bold;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge-critical {
          background-color: #fecaca;
          color: #dc2626;
        }
        .badge-high {
          background-color: #fed7aa;
          color: #ea580c;
        }
        .badge-medium {
          background-color: #fef08a;
          color: #ca8a04;
        }
        .section {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .detail-item {
          margin: 10px 0;
          padding: 10px;
          background-color: white;
          border-left: 3px solid #06b6d4;
          border-radius: 2px;
        }
        .detail-label {
          color: #666;
          font-size: 12px;
          margin-bottom: 3px;
        }
        .detail-value {
          color: #1a1a1a;
          font-weight: 500;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${report.threat}</h1>
        <p>${report.description}</p>
        <p><strong>Уровень риска:</strong> <span class="badge badge-${report.riskLevel.toLowerCase()}">${riskLabels[report.riskLevel]}</span></p>
        <p><strong>Дата отчета:</strong> ${date}</p>
      </div>

      <h2>📊 Основная статистика</h2>
      <div class="stats">
        <div class="stat-box">
          <div class="stat-label">Всего постов</div>
          <div class="stat-value">${report.statistics.totalPosts}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Активных аккаунтов</div>
          <div class="stat-value">${report.statistics.activeAccounts}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Затронутых городов</div>
          <div class="stat-value">${report.statistics.citiesAffected}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Темп роста</div>
          <div class="stat-value" style="color: #22c55e;">${report.statistics.growthRate}</div>
        </div>
      </div>

      <h2>🏙️ Посты по городам</h2>
      <table>
        <thead>
          <tr>
            <th>Город</th>
            <th>Посты</th>
            <th>Аккаунтов</th>
            <th>Впервые обнаружено</th>
          </tr>
        </thead>
        <tbody>
          ${report.topCities.map(city => `
            <tr>
              <td>${city.city}</td>
              <td>${city.posts}</td>
              <td>${city.accounts}</td>
              <td>${city.firstDetected}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h2>📱 Топ аккаунтов</h2>
      <table>
        <thead>
          <tr>
            <th>Аккаунт</th>
            <th>Платформа</th>
            <th>Подписчики</th>
            <th>Постов</th>
            <th>Риск</th>
          </tr>
        </thead>
        <tbody>
          ${report.topAccounts.map(acc => `
            <tr>
              <td>${acc.name}</td>
              <td>${acc.platform}</td>
              <td>${acc.subscribers}</td>
              <td>${acc.posts}</td>
              <td><span class="badge badge-critical">${acc.riskScore}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="page-break"></div>

      <h2>👤 Детальный анализ аккаунтов</h2>
      ${report.accountAnalysis.map((account, idx) => `
        <div class="section">
          <h3>${idx + 1}. ${account.account}</h3>
          <div class="detail-item">
            <div class="detail-label">Платформа</div>
            <div class="detail-value">${account.platform}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Дата создания</div>
            <div class="detail-value">${account.createdDate}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Подписчики</div>
            <div class="detail-value">${account.subscribers.toLocaleString()}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Количество постов</div>
            <div class="detail-value">${account.postsCount}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Уровень вовлечения</div>
            <div class="detail-value">${account.engagementRate}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Факторы риска</div>
            <div class="detail-value">${account.riskFactors.join(", ")}</div>
          </div>
        </div>
      `).join("")}

      <h2>📝 Профиль угрозы</h2>
      <div class="section">
        ${report.profileDetails.map(detail => `
          <div class="detail-item">
            <div class="detail-label">${detail.label}</div>
            <div class="detail-value">${detail.value}</div>
          </div>
        `).join("")}
      </div>

      <h2>📌 Последние посты</h2>
      ${report.recentPosts.map((post, idx) => `
        <div class="section">
          <h3>${idx + 1}. ${post.account}</h3>
          <p><strong>Дата:</strong> ${post.date}</p>
          <p><strong>Платформа:</strong> ${post.platform}</p>
          <p><strong>Содержание:</strong> ${post.excerpt}</p>
          <p><strong>Вовлечение:</strong> ${post.engagement}</p>
        </div>
      `).join("")}

      <div class="footer">
        <p>Отчет сгенерирован системой AI Media Watch • ${date}</p>
        <p>Конфиденциально • Только для внутреннего использования</p>
      </div>
    </body>
    </html>
  `;
}
