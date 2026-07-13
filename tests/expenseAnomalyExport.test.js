import test from 'node:test';
import assert from 'node:assert/strict';
import * as expenseWorkbook from '../src/domain/expense/expenseWorkbook.js';

const { buildExpenseWorkbookXml, createExpenseWorkbookDownload } = expenseWorkbook;

const rows = [
  { anomalyId: 'AN-001', type: '费用违规报销', department: '销售部', employee: '李娜', amount: 17850, riskLevel: '高', status: '待确认', exclusionReason: '', supplementNote: '已补凭证', remediation: '退回超标准部分', basis: '办法第55条' },
  { anomalyId: 'AN-002', type: '=HYPERLINK("bad")', department: '市场部', employee: '张伟', amount: 12650, riskLevel: '高', status: '已排除', exclusionReason: '规则误命中', supplementNote: '', remediation: '补办预算审批', basis: '预算办法第18条' }
];

test('费用导出工作簿包含异常汇总和整改建议两个工作表', () => {
  const xml = buildExpenseWorkbookXml(rows);
  assert.match(xml, /ss:Name="异常汇总"/);
  assert.match(xml, /ss:Name="整改建议"/);
  for (const label of ['异常编号', '异常类型', '金额（元）', '风险等级', '处理状态', '排除原因', '补充说明', '整改建议']) {
    assert.match(xml, new RegExp(label.replace(/[（）]/g, '\\$&')));
  }
  assert.match(xml, /AN-001/);
  assert.match(xml, /退回超标准部分/);
});

test('工作簿转义 XML 并阻止可疑文本成为 Excel 公式', () => {
  const xml = buildExpenseWorkbookXml(rows);
  assert.doesNotMatch(xml, /<Data[^>]*>=HYPERLINK/);
  assert.match(xml, /&apos;=HYPERLINK\(&quot;bad&quot;\)/);
});

test('工作簿移除 XML 1.0 非法控制字符并识别前置空白后的公式', () => {
  const xml = buildExpenseWorkbookXml([{
    ...rows[0],
    type: '\u0000\u0008正常\u000B文本',
    employee: ' \t\r\n=CMD()'
  }]);

  assert.doesNotMatch(xml, /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
  assert.match(xml, /正常文本/);
  assert.match(xml, / \t\r\n&apos;=CMD\(\)/);
});

test('空结果拒绝生成伪成功导出', () => {
  assert.throws(() => buildExpenseWorkbookXml([]), /没有可导出的费用异常/);
});

test('下载描述冻结当前范围并使用 Excel 兼容扩展名', () => {
  assert.equal(typeof expenseWorkbook.exportExpenseWorkbook, 'function');
  const result = expenseWorkbook.exportExpenseWorkbook(rows, '上海分公司', '2025Q1');
  assert.equal(result.rowCount, 2);
  assert.equal(result.mimeType, 'application/vnd.ms-excel;charset=utf-8');
  assert.equal(result.fileName, '上海分公司费用异常汇总_2025Q1.xls');
  assert.match(result.content, /^<\?xml/);
  assert.deepEqual(createExpenseWorkbookDownload(rows, '上海分公司', '2025Q1'), result);
});
