import test from 'node:test';
import assert from 'node:assert/strict';
import { strFromU8, unzipSync } from 'fflate';
import { createAuditStandardWorkbook } from '../src/domain/auditStandard/auditStandardExcel.js';

test('导出内容是真实 XLSX 包并包含规范工作表数据', () => {
  const bytes = createAuditStandardWorkbook([
    { id: 'CP-03-001', title: '费用报销审批权限验证', category: '控制测试', risk: 'high', source: '内部制度+外部法规', status: 'confirmed' }
  ]);

  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  const files = unzipSync(bytes);
  for (const path of ['[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml']) {
    assert.ok(files[path], `missing ${path}`);
  }
  const sheet = strFromU8(files['xl/worksheets/sheet1.xml']);
  assert.match(sheet, /CP-03-001/);
  assert.match(sheet, /费用报销审批权限验证/);
  assert.match(sheet, /高风险/);
});
