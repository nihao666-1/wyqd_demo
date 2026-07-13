const stripInvalidXmlCharacters = (value) => String(value ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

const escapeXml = (value) => stripInvalidXmlCharacters(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const safeText = (value) => {
  const text = stripInvalidXmlCharacters(value);
  return text.replace(/^([ \t\r\n]*)([=+\-@])/, "$1'$2");
};

const stringCell = (value) => `<Cell><Data ss:Type="String">${escapeXml(safeText(value))}</Data></Cell>`;
const numberCell = (value) => `<Cell><Data ss:Type="Number">${Number(value) || 0}</Data></Cell>`;
const rowXml = (cells) => `<Row>${cells.join('')}</Row>`;

const summaryHeaders = ['异常编号', '异常类型', '部门', '员工', '金额（元）', '风险等级', '处理状态', '排除原因', '补充说明', '整改建议'];
const remediationHeaders = ['异常编号', '异常类型', '责任部门', '整改建议', '依据', '处理状态'];

export function buildExpenseWorkbookXml(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('没有可导出的费用异常');
  const summaryRows = rows.map((row) => rowXml([
    stringCell(row.anomalyId), stringCell(row.type), stringCell(row.department), stringCell(row.employee),
    numberCell(row.amount), stringCell(row.riskLevel), stringCell(row.status), stringCell(row.exclusionReason),
    stringCell(row.supplementNote), stringCell(row.remediation)
  ])).join('');
  const remediationRows = rows.filter((row) => row.remediation?.trim()).map((row) => rowXml([
    stringCell(row.anomalyId), stringCell(row.type), stringCell(row.department), stringCell(row.remediation),
    stringCell(row.basis), stringCell(row.status)
  ])).join('');

  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="异常汇总"><Table>${rowXml(summaryHeaders.map(stringCell))}${summaryRows}</Table></Worksheet>
<Worksheet ss:Name="整改建议"><Table>${rowXml(remediationHeaders.map(stringCell))}${remediationRows}</Table></Worksheet>
</Workbook>`;
}

export function exportExpenseWorkbook(rows, organization, period) {
  const cleanName = `${organization || '被审计单位'}费用异常汇总_${period || '当前期间'}`.replace(/[\\/:*?"<>|]/g, '-');
  return {
    fileName: `${cleanName}.xls`,
    mimeType: 'application/vnd.ms-excel;charset=utf-8',
    content: buildExpenseWorkbookXml(rows),
    rowCount: rows.length
  };
}

export const createExpenseWorkbookDownload = exportExpenseWorkbook;
