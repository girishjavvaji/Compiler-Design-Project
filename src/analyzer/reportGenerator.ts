import { AnalysisResult } from '../types/analyzer';

export function exportJSON(result: AnalysisResult): void {
  const jsonStr = JSON.stringify(result, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `${result.fileName}_metrics_${Date.now()}.json`);
}

export function exportCSV(result: AnalysisResult): void {
  const { metrics, fileName, timestamp } = result;
  const dateStr = new Date(timestamp).toISOString();

  const rows = [
    ['Metric Category', 'Metric Name', 'Value', 'Unit/Description'],
    ['Metadata', 'File Name', fileName, ''],
    ['Metadata', 'Analysis Timestamp', dateStr, 'ISO 8601'],
    ['Metadata', 'Language', result.language.toUpperCase(), ''],
    ['Size', 'Physical Lines of Code (PLOC)', metrics.size.codeLines.toString(), 'lines'],
    ['Size', 'Total Lines', metrics.size.totalLines.toString(), 'lines'],
    ['Size', 'Comment Lines', metrics.size.commentLines.toString(), 'lines'],
    ['Size', 'Blank Lines', metrics.size.blankLines.toString(), 'lines'],
    ['Size', 'Comment Ratio', `${metrics.size.commentRatio}%`, 'percentage'],
    ['Size', 'Character Count', metrics.size.characterCount.toString(), 'characters'],
    ['Size', 'Logical Statements (LLOC)', metrics.size.logicalStatements.toString(), 'statements'],
    ['Lexical', 'Total Tokens', metrics.lexical.totalTokens.toString(), 'tokens'],
    ['Lexical', 'Unique Keywords', metrics.lexical.uniqueKeywords.toString(), 'distinct keywords'],
    ['Lexical', 'Keyword Occurrences', metrics.lexical.keywordOccurrences.toString(), 'occurrences'],
    ['Lexical', 'Unique Identifiers', metrics.lexical.uniqueIdentifiers.toString(), 'distinct identifiers'],
    ['Lexical', 'Identifier Occurrences', metrics.lexical.identifierOccurrences.toString(), 'occurrences'],
    ['Lexical', 'Unique Operators', metrics.lexical.uniqueOperators.toString(), 'distinct operators'],
    ['Lexical', 'Unique Operands', metrics.lexical.uniqueOperands.toString(), 'distinct operands'],
    ['Structural', 'Functions Count', metrics.structural.functionCount.toString(), 'functions'],
    ['Structural', 'Variable Declarations', metrics.structural.variableDeclarations.toString(), 'declarations'],
    ['Structural', 'Conditional Statements', metrics.structural.conditionalCount.toString(), 'if/switch'],
    ['Structural', 'Loops Count', metrics.structural.loopCount.toString(), 'for/while/do'],
    ['Structural', 'Max Nesting Depth', metrics.structural.maxNestingDepth.toString(), 'levels'],
    ['Structural', 'Avg Function Length', `${metrics.structural.averageFunctionLength} lines`, 'lines/function'],
    ['Complexity', 'Total Cyclomatic Complexity', metrics.complexity.totalCyclomaticComplexity.toString(), 'McCabe CC'],
    ['Complexity', 'Average Cyclomatic Complexity', metrics.complexity.averageCyclomaticComplexity.toString(), 'McCabe CC'],
    ['Complexity', 'Max Function Complexity', metrics.complexity.maxCyclomaticComplexity.toString(), 'McCabe CC'],
    ['Halstead', 'Program Vocabulary (n)', metrics.halstead.vocabulary.toString(), 'n1 + n2'],
    ['Halstead', 'Program Length (N)', metrics.halstead.length.toString(), 'N1 + N2'],
    ['Halstead', 'Program Volume (V)', metrics.halstead.volume.toString(), 'bits'],
    ['Halstead', 'Difficulty (D)', metrics.halstead.difficulty.toString(), 'unitless'],
    ['Halstead', 'Effort (E)', metrics.halstead.effort.toString(), 'elementary mental discriminations'],
    ['Halstead', 'Estimated Time (T)', `${metrics.halstead.timeToImplement}s`, 'seconds'],
    ['Halstead', 'Estimated Delivered Bugs (B)', metrics.halstead.estimatedBugs.toString(), 'bugs'],
    ['Quality', 'Maintainability Index (MI)', `${metrics.quality.maintainabilityIndex}/100`, metrics.quality.maintainabilityRating],
    ['Quality', 'High Complexity Functions', metrics.quality.highComplexityFunctionsCount.toString(), 'functions CC > 10'],
    ['Quality', 'Code Smells Count', metrics.quality.codeSmellsCount.toString(), 'detected smells'],
    ['Issues', 'Total Issues', result.issues.length.toString(), 'findings'],
    ['Issues', 'Syntax/Semantic Errors', result.issues.filter((i) => i.severity === 'error').length.toString(), 'errors'],
    ['Issues', 'Warnings', result.issues.filter((i) => i.severity === 'warning').length.toString(), 'warnings']
  ];

  const csvContent = rows
    .map((row) => row.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${result.fileName}_metrics_${Date.now()}.csv`);
}

export function exportHTMLReport(result: AnalysisResult): void {
  const { metrics, fileName, timestamp, issues, symbols } = result;
  const dateStr = new Date(timestamp).toLocaleString();

  const functionRows = metrics.complexity.functionMetrics
    .map(
      (f) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #334155; font-family: monospace; font-weight: bold; color: #38bdf8;">${escapeHtml(f.name)}</td>
        <td style="padding: 8px; border: 1px solid #334155;">${escapeHtml(f.returnType)}</td>
        <td style="padding: 8px; border: 1px solid #334155;">${f.startLine} - ${f.endLine} (${f.loc} lines)</td>
        <td style="padding: 8px; border: 1px solid #334155; text-align: center; font-weight: bold; color: ${f.cyclomaticComplexity > 10 ? '#f43f5e' : f.cyclomaticComplexity > 5 ? '#f59e0b' : '#10b981'};">${f.cyclomaticComplexity}</td>
        <td style="padding: 8px; border: 1px solid #334155; text-align: center;">${f.nestingDepth}</td>
        <td style="padding: 8px; border: 1px solid #334155;"><span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; background: ${f.riskLevel === 'low' ? '#065f46; color: #34d399' : f.riskLevel === 'moderate' ? '#78350f; color: #fcd34d' : '#881337; color: #fda4af'};">${f.riskLevel.toUpperCase()}</span></td>
      </tr>
    `
    )
    .join('');

  const issueRows = issues
    .map(
      (i) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #334155;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${i.severity === 'error' ? '#881337; color: #fda4af' : i.severity === 'warning' ? '#78350f; color: #fcd34d' : '#1e3a8a; color: #93c5fd'};">${i.severity.toUpperCase()}</span></td>
        <td style="padding: 8px; border: 1px solid #334155;">${i.stage.toUpperCase()}</td>
        <td style="padding: 8px; border: 1px solid #334155; text-align: center;">${i.line}:${i.column}</td>
        <td style="padding: 8px; border: 1px solid #334155;">${escapeHtml(i.message)}</td>
        <td style="padding: 8px; border: 1px solid #334155; color: #94a3b8; font-style: italic;">${escapeHtml(i.suggestedFix || 'None')}</td>
      </tr>
    `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Source Code Metrics Report — ${escapeHtml(fileName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 32px; }
    .container { max-width: 1000px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
    h1 { margin-top: 0; color: #38bdf8; font-size: 24px; border-bottom: 2px solid #334155; padding-bottom: 12px; }
    h2 { color: #818cf8; font-size: 18px; margin-top: 28px; border-bottom: 1px solid #334155; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; }
    .card { background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; }
    .card-title { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .card-val { font-size: 26px; font-weight: bold; margin-top: 6px; color: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background-color: #0f172a; padding: 10px; border: 1px solid #334155; text-align: left; color: #94a3b8; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    @media print {
      body { background-color: #ffffff; color: #000000; padding: 0; }
      .container { border: none; background: transparent; padding: 0; }
      .card { border: 1px solid #ccc; background: #fafafa; }
      .card-val { color: #000000; }
      th { background: #f0f0f0; color: #333; }
      td { border: 1px solid #ccc !important; color: #000 !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h1>SourceMetrics — Code Analysis Report</h1>
        <p style="color: #94a3b8; margin: 4px 0;">Analyzed File: <strong>${escapeHtml(fileName)}</strong> (${result.language.toUpperCase()}) | Generated: ${dateStr}</p>
      </div>
      <div>
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save PDF</button>
      </div>
    </div>

    <h2>Executive Metrics Summary</h2>
    <div class="grid">
      <div class="card">
        <div class="card-title">Physical LOC</div>
        <div class="card-val">${metrics.size.codeLines}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Total lines: ${metrics.size.totalLines} (${metrics.size.blankLines} blank)</div>
      </div>
      <div class="card">
        <div class="card-title">Total Tokens</div>
        <div class="card-val">${metrics.lexical.totalTokens}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${metrics.lexical.uniqueKeywords} kw / ${metrics.lexical.uniqueIdentifiers} id</div>
      </div>
      <div class="card">
        <div class="card-title">Cyclomatic Complexity</div>
        <div class="card-val" style="color: ${metrics.complexity.totalCyclomaticComplexity > 15 ? '#f43f5e' : '#38bdf8'};">${metrics.complexity.totalCyclomaticComplexity}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Avg per function: ${metrics.complexity.averageCyclomaticComplexity}</div>
      </div>
      <div class="card">
        <div class="card-title">Maintainability Index</div>
        <div class="card-val" style="color: ${metrics.quality.maintainabilityIndex >= 65 ? '#10b981' : '#f59e0b'};">${metrics.quality.maintainabilityIndex}/100</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Rating: ${metrics.quality.maintainabilityRating}</div>
      </div>
    </div>

    <h2>Halstead Software Science</h2>
    <div class="grid">
      <div class="card">
        <div class="card-title">Vocabulary & Length</div>
        <div class="card-val">${metrics.halstead.vocabulary} <span style="font-size: 14px; font-weight: normal; color: #94a3b8;">(N=${metrics.halstead.length})</span></div>
      </div>
      <div class="card">
        <div class="card-title">Program Volume</div>
        <div class="card-val">${metrics.halstead.volume} <span style="font-size: 14px; font-weight: normal; color: #94a3b8;">bits</span></div>
      </div>
      <div class="card">
        <div class="card-title">Difficulty & Effort</div>
        <div class="card-val">${metrics.halstead.difficulty} <span style="font-size: 14px; font-weight: normal; color: #94a3b8;">(E=${metrics.halstead.effort})</span></div>
      </div>
      <div class="card">
        <div class="card-title">Estimated Delivered Bugs</div>
        <div class="card-val">${metrics.halstead.estimatedBugs}</div>
      </div>
    </div>

    <h2>Function Breakdown (${metrics.structural.functionCount} functions detected)</h2>
    ${
      metrics.complexity.functionMetrics.length > 0
        ? `<table>
        <thead>
          <tr>
            <th>Function Name</th>
            <th>Return Type</th>
            <th>Span</th>
            <th>Cyclomatic Complexity</th>
            <th>Max Nesting</th>
            <th>Risk Rating</th>
          </tr>
        </thead>
        <tbody>
          ${functionRows}
        </tbody>
      </table>`
        : '<p style="color: #94a3b8; font-style: italic;">No discrete function definitions detected (top-level or procedural code).</p>'
    }

    <h2>Diagnostics & Issues (${issues.length} findings)</h2>
    ${
      issues.length > 0
        ? `<table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Stage</th>
            <th>Location</th>
            <th>Description</th>
            <th>Suggested Fix</th>
          </tr>
        </thead>
        <tbody>
          ${issueRows}
        </tbody>
      </table>`
        : '<p style="color: #34d399;">Clean analysis! Zero syntax, lexical, or semantic issues detected.</p>'
    }

    <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center;">
      SourceMetrics — Compiler Design Academic Project | Generated with TypeScript Lexer, Recursive-Descent Parser & Scoped Symbol Table Engine
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${result.fileName}_report_${Date.now()}.html`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
