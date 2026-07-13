const EXCEL_FILENAME = '监督共享汇总表.xls';
const EXCEL_MIME_TYPE = 'application/vnd.ms-excel;charset=utf-8';
const WORD_FILENAME = '监督共享分析报告.doc';
const WORD_MIME_TYPE = 'application/msword;charset=utf-8';
const REPORT_SECTIONS = ['综合摘要', '审计发现', '合规分析', '风险分析', '报告附录'];

function toSafeText(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function escapeXml(value) {
  return toSafeText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function escapeHtml(value) {
  return toSafeText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function excelCell(value) {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function resultValues(row) {
  return [
    row.filename,
    row.department,
    Array.isArray(row.tags) ? row.tags.join('、') : row.tags,
    Array.isArray(row.keywords) ? row.keywords.join('、') : row.keywords,
    row.summary,
    row.referenced ? '已引用' : '未引用'
  ];
}

export function createSupervisionExcelExport(state) {
  const headers = ['文件名称', '来源部门', '命中标签', '关键词', '摘要', '引用状态'];
  const rows = Array.isArray(state?.resultRows) ? state.resultRows : [];
  const tableRows = [headers, ...rows.map(resultValues)]
    .map((values) => `<Row>${values.map(excelCell).join('')}</Row>`)
    .join('');
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="监督共享汇总"><Table>${tableRows}</Table></Worksheet>
</Workbook>`;

  return { filename: EXCEL_FILENAME, mimeType: EXCEL_MIME_TYPE, content };
}

function htmlCells(values, tagName) {
  return values.map((value) => `<${tagName}>${escapeHtml(value)}</${tagName}>`).join('');
}

export function createSupervisionWordExport(state) {
  const rows = Array.isArray(state?.resultRows) ? state.resultRows : [];
  const files = Array.isArray(state?.selectedFiles) ? state.selectedFiles : [];
  const headers = ['文件名称', '来源部门', '命中标签', '关键词', '摘要', '引用状态'];
  const resultRows = rows
    .map((row) => `<tr>${htmlCells(resultValues(row), 'td')}</tr>`)
    .join('');
  const sourceFiles = files
    .map((file) => `<li>${escapeHtml(file.name)}（${escapeHtml(file.department)}）</li>`)
    .join('');
  const outline = REPORT_SECTIONS
    .map((section) => `<h2>${section}</h2><p>本章节根据监督共享分析结果生成。</p>`)
    .join('');
  const content = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>监督共享信息分析报告</title>
</head>
<body>
<h1>监督共享信息分析报告</h1>
<p>任务组织：${escapeHtml(state?.task?.organization)}</p>
<p>任务期间：${escapeHtml(state?.task?.period)}</p>
${outline}
<h2>分析结果汇总</h2>
<table border="1"><thead><tr>${htmlCells(headers, 'th')}</tr></thead><tbody>${resultRows}</tbody></table>
<h2>来源文件列表</h2>
<ul>${sourceFiles}</ul>
</body>
</html>`;

  return { filename: WORD_FILENAME, mimeType: WORD_MIME_TYPE, content };
}

export function downloadSupervisionExport(exportFile, environment = window) {
  if (
    !exportFile
    || typeof exportFile.filename !== 'string'
    || exportFile.filename.trim() === ''
    || typeof exportFile.content !== 'string'
    || exportFile.content.trim() === ''
  ) {
    throw new TypeError('Export file requires a non-empty filename and content.');
  }

  const blob = new environment.Blob([exportFile.content], { type: exportFile.mimeType });
  const objectUrl = environment.URL.createObjectURL(blob);
  let anchor = null;
  let appendAttempted = false;
  let operationFailed = false;
  let operationError;
  let cleanupFailed = false;
  let cleanupError;

  try {
    anchor = environment.document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = exportFile.filename;
    appendAttempted = true;
    environment.document.body.append(anchor);
    anchor.click();
  } catch (error) {
    operationFailed = true;
    operationError = error;
  } finally {
    try {
      if (anchor && appendAttempted) anchor.remove();
    } catch (error) {
      cleanupFailed = true;
      cleanupError = error;
    } finally {
      try {
        environment.URL.revokeObjectURL(objectUrl);
      } catch (error) {
        if (!cleanupFailed) {
          cleanupFailed = true;
          cleanupError = error;
        }
      }
    }
  }

  if (operationFailed) throw operationError;
  if (cleanupFailed) throw cleanupError;
}
