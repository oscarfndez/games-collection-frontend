const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const reportsDir = path.join(process.cwd(), 'e2e', 'reports');
const jsonReport = path.join(reportsDir, 'cucumber-report.json');
const htmlReport = path.join(reportsDir, 'cucumber-report.html');
const jsonReportFormatterPath = 'e2e/reports/cucumber-report.json';

fs.mkdirSync(reportsDir, { recursive: true });

const cucumberBin = path.join(process.cwd(), 'node_modules', '@cucumber', 'cucumber', 'bin', 'cucumber.js');

const cucumberArgs = [
  'e2e/features',
  '--require',
  'e2e/support/**/*.js',
  '--require',
  'e2e/steps/**/*.js',
  '--format',
  'progress',
  '--format',
  `json:${jsonReportFormatterPath}`,
  ...process.argv.slice(2)
];

const result = spawnSync(process.execPath, [cucumberBin, ...cucumberArgs], {
  shell: false,
  stdio: 'inherit'
});

generateStaticHtmlReport(jsonReport, htmlReport);
process.exit(result.status ?? 1);

function generateStaticHtmlReport(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    fs.writeFileSync(outputPath, emptyReportHtml('Cucumber did not produce a JSON report.'), 'utf8');
    return;
  }

  const features = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const scenarios = features.flatMap((feature) =>
    (feature.elements || [])
      .filter((element) => element.type === 'scenario')
      .map((scenario) => ({
        feature: feature.name,
        name: scenario.name,
        status: scenarioStatus(scenario),
        durationMs: scenarioDurationMs(scenario),
        steps: (scenario.steps || []).map((step) => ({
          keyword: step.keyword,
          name: step.name,
          status: step.result?.status || 'unknown',
          error: step.result?.error_message || ''
        }))
      }))
  );

  const total = scenarios.length;
  const passed = scenarios.filter((scenario) => scenario.status === 'passed').length;
  const failed = scenarios.filter((scenario) => scenario.status === 'failed').length;
  const skipped = scenarios.filter((scenario) => scenario.status === 'skipped').length;

  fs.writeFileSync(outputPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cucumber Smoke Report</title>
  <style>
    body { background: #f6f8fb; color: #172033; font-family: Arial, sans-serif; margin: 0; padding: 32px; }
    .container { max-width: 1180px; margin: 0 auto; }
    h1 { color: #143263; margin-bottom: 6px; }
    .muted { color: #64748b; margin-top: 0; }
    .summary { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 28px 0; }
    .card { background: #fff; border: 1px solid #d9e2f1; border-radius: 14px; box-shadow: 0 10px 28px rgba(15,23,42,.08); padding: 18px; }
    .metric { font-size: 2rem; font-weight: 800; }
    .passed { color: #15803d; }
    .failed { color: #b91c1c; }
    .skipped { color: #a16207; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; vertical-align: top; }
    th { color: #475569; font-size: .82rem; text-transform: uppercase; }
    .badge { border-radius: 999px; display: inline-block; font-weight: 700; padding: 4px 10px; text-transform: uppercase; }
    .badge-passed { background: #dcfce7; color: #166534; }
    .badge-failed { background: #fee2e2; color: #991b1b; }
    .badge-skipped { background: #fef3c7; color: #92400e; }
    details { margin-top: 8px; }
    pre { background: #111827; border-radius: 10px; color: #f8fafc; overflow: auto; padding: 12px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <main class="container">
    <h1>Cucumber Smoke Report</h1>
    <p class="muted">Generated at ${escapeHtml(new Date().toISOString())}</p>
    <section class="summary">
      ${metricCard('Total', total, '')}
      ${metricCard('Passed', passed, 'passed')}
      ${metricCard('Failed', failed, 'failed')}
      ${metricCard('Skipped', skipped, 'skipped')}
    </section>
    <section class="card">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Scenario</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Steps</th>
          </tr>
        </thead>
        <tbody>
          ${scenarios.map(scenarioRow).join('')}
        </tbody>
      </table>
    </section>
  </main>
</body>
</html>`, 'utf8');
}

function emptyReportHtml(message) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Cucumber Smoke Report</title></head><body><h1>Cucumber Smoke Report</h1><p>${escapeHtml(message)}</p></body></html>`;
}

function scenarioStatus(scenario) {
  const steps = scenario.steps || [];
  if (steps.some((step) => step.result?.status === 'failed')) {
    return 'failed';
  }
  if (steps.some((step) => step.result?.status === 'skipped' || step.result?.status === 'undefined')) {
    return 'skipped';
  }
  return 'passed';
}

function scenarioDurationMs(scenario) {
  const nanos = (scenario.steps || []).reduce((total, step) => total + Number(step.result?.duration || 0), 0);
  return Math.round(nanos / 1_000_000);
}

function metricCard(label, value, status) {
  return `<div class="card"><div class="muted">${escapeHtml(label)}</div><div class="metric ${status}">${value}</div></div>`;
}

function scenarioRow(scenario) {
  const badgeClass = `badge-${scenario.status}`;
  return `<tr>
    <td>${escapeHtml(scenario.feature)}</td>
    <td>${escapeHtml(scenario.name)}</td>
    <td><span class="badge ${badgeClass}">${escapeHtml(scenario.status)}</span></td>
    <td>${scenario.durationMs} ms</td>
    <td>${stepsHtml(scenario.steps)}</td>
  </tr>`;
}

function stepsHtml(steps) {
  return `<details><summary>${steps.length} steps</summary>${steps.map((step) => {
    const error = step.error ? `<pre>${escapeHtml(step.error)}</pre>` : '';
    return `<p><strong>${escapeHtml(step.status)}</strong> ${escapeHtml(step.keyword)}${escapeHtml(step.name)}</p>${error}`;
  }).join('')}</details>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
