import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupervisionShareResultState } from '../src/views/supervision-result/supervisionShareResultData.js';
import {
  createSupervisionExcelExport,
  createSupervisionWordExport,
  downloadSupervisionExport
} from '../src/views/supervision-result/supervisionShareExports.js';

function createExportState() {
  const state = createSupervisionShareResultState();
  return {
    ...state,
    task: {
      ...state.task,
      organization: '上海分公司 & <专项> "审计" \'组\'',
      period: '2025Q1 & 后续'
    },
    selectedFiles: [
      { id: 'file-special', name: '来源 & <清单> "一" \'号\'.xlsx', department: '合规法务部' }
    ],
    resultRows: [
      {
        ...state.resultRows[0],
        filename: '中文 & <文件> "甲" \'版\'.xlsx',
        department: '合规 & 风险部',
        tags: ['重点 <关注>', 'A & B'],
        keywords: ['关联 "交易"', '甲 \'乙\''],
        summary: '摘要包含 & < > " \' 五类字符',
        referenced: true
      },
      {
        ...state.resultRows[1],
        filename: '未引用资料.docx',
        referenced: false
      }
    ]
  };
}

test('Excel 导出提供 Office 可打开的 Spreadsheet XML、中文表头和引用状态', () => {
  const result = createSupervisionExcelExport(createExportState());

  assert.equal(result.filename, '监督共享汇总表.xls');
  assert.equal(result.mimeType, 'application/vnd.ms-excel;charset=utf-8');
  assert.match(result.content, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(result.content, /<Workbook\b/);
  assert.match(result.content, /<Worksheet\b/);
  assert.match(result.content, /<Table\b/);
  for (const header of ['文件名称', '来源部门', '命中标签', '关键词', '摘要', '引用状态']) {
    assert.match(result.content, new RegExp(header));
  }
  assert.match(result.content, /中文/);
  assert.equal((result.content.match(/<Row>/g) ?? []).length, 3);
  assert.match(result.content, /已引用/);
  assert.match(result.content, /未引用/);
});

test('Excel 导出安全转义每个用户数据字段', () => {
  const { content } = createSupervisionExcelExport(createExportState());

  assert.match(content, /中文 &amp; &lt;文件&gt; &quot;甲&quot; &apos;版&apos;\.xlsx/);
  assert.match(content, /合规 &amp; 风险部/);
  assert.match(content, /重点 &lt;关注&gt;、A &amp; B/);
  assert.match(content, /关联 &quot;交易&quot;、甲 &apos;乙&apos;/);
  assert.match(content, /摘要包含 &amp; &lt; &gt; &quot; &apos; 五类字符/);
  assert.doesNotMatch(content, /中文 & <文件>/);
});

test('Excel 导出移除 XML 1.0 禁止的 C0 控制字符', () => {
  const state = createExportState();
  state.resultRows[0] = {
    ...state.resultRows[0],
    filename: '\u0000正\u0008常\u000B文\u000C件\u001F.xlsx'
  };

  const { content } = createSupervisionExcelExport(state);

  assert.match(content, /正常文件\.xlsx/);
  assert.doesNotMatch(content, /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
});

test('Word 导出是完整 UTF-8 HTML，包含任务信息、五项框架、结果表和来源文件', () => {
  const result = createSupervisionWordExport(createExportState());

  assert.equal(result.filename, '监督共享分析报告.doc');
  assert.equal(result.mimeType, 'application/msword;charset=utf-8');
  assert.match(result.content, /^<!DOCTYPE html>/i);
  assert.match(result.content, /<html[^>]*>/i);
  assert.match(result.content, /<meta charset="UTF-8">/i);
  assert.match(result.content, /监督共享信息分析报告/);
  assert.match(result.content, /上海分公司/);
  assert.match(result.content, /2025Q1/);
  for (const section of ['综合摘要', '审计发现', '合规分析', '风险分析', '报告附录']) {
    assert.match(result.content, new RegExp(section));
  }
  assert.match(result.content, /中文/);
  assert.match(result.content, /未引用资料\.docx/);
  assert.match(result.content, /来源.*清单/s);
  assert.match(result.content, /<\/html>$/i);
});

test('Word 导出安全转义任务、结果和来源文件中的用户数据', () => {
  const { content } = createSupervisionWordExport(createExportState());

  assert.match(content, /上海分公司 &amp; &lt;专项&gt; &quot;审计&quot; &#39;组&#39;/);
  assert.match(content, /中文 &amp; &lt;文件&gt; &quot;甲&quot; &#39;版&#39;\.xlsx/);
  assert.match(content, /摘要包含 &amp; &lt; &gt; &quot; &#39; 五类字符/);
  assert.match(content, /来源 &amp; &lt;清单&gt; &quot;一&quot; &#39;号&#39;\.xlsx/);
  assert.doesNotMatch(content, /上海分公司 & <专项>/);
});

test('下载 helper 创建正确 Blob，点击并移除链接，最后撤销对象 URL', () => {
  const calls = [];
  let capturedBlob;
  const anchor = {
    href: '',
    download: '',
    click() { calls.push('click'); },
    remove() { calls.push('remove'); }
  };
  const environment = {
    Blob,
    URL: {
      createObjectURL(blob) {
        calls.push('create');
        capturedBlob = blob;
        return 'blob:supervision-export';
      },
      revokeObjectURL(url) { calls.push(`revoke:${url}`); }
    },
    document: {
      createElement(tagName) {
        assert.equal(tagName, 'a');
        calls.push('element');
        return anchor;
      },
      body: {
        append(node) {
          assert.equal(node, anchor);
          calls.push('append');
        }
      }
    }
  };
  const exportFile = {
    filename: '监督共享汇总表.xls',
    mimeType: 'application/vnd.ms-excel;charset=utf-8',
    content: '中文 export content'
  };

  downloadSupervisionExport(exportFile, environment);

  assert.equal(anchor.href, 'blob:supervision-export');
  assert.equal(anchor.download, exportFile.filename);
  assert.equal(capturedBlob.type, exportFile.mimeType);
  assert.equal(capturedBlob.size, new Blob([exportFile.content]).size);
  assert.deepEqual(calls, [
    'create',
    'element',
    'append',
    'click',
    'remove',
    'revoke:blob:supervision-export'
  ]);
});

test('下载 helper 拒绝缺少非空文件名或内容的对象', () => {
  const environment = { document: {}, URL: {}, Blob };

  assert.throws(() => downloadSupervisionExport(null, environment), TypeError);
  assert.throws(() => downloadSupervisionExport({ filename: '', content: 'x' }, environment), TypeError);
  assert.throws(() => downloadSupervisionExport({ filename: 'x.xls', content: '' }, environment), TypeError);
  assert.throws(() => downloadSupervisionExport({ filename: '  ', content: 'x' }, environment), TypeError);
  assert.throws(() => downloadSupervisionExport({ filename: 'x.xls', content: '  ' }, environment), TypeError);
});

function createFailingDownloadEnvironment(failures) {
  const calls = [];
  const errors = Object.fromEntries(
    failures.map((stage) => [stage, new Error(`${stage} failed`)])
  );
  const anchor = {
    href: '',
    download: '',
    click() {
      calls.push('click');
      if (errors.click) throw errors.click;
    },
    remove() {
      calls.push('remove');
      if (errors.remove) throw errors.remove;
    }
  };
  const environment = {
    Blob,
    URL: {
      createObjectURL() {
        calls.push('create');
        return 'blob:failing-export';
      },
      revokeObjectURL() {
        calls.push('revoke');
        if (errors.revoke) throw errors.revoke;
      }
    },
    document: {
      createElement() {
        calls.push('element');
        if (errors.createElement) throw errors.createElement;
        return anchor;
      },
      body: {
        append() {
          calls.push('append');
          if (errors.append) throw errors.append;
        }
      }
    }
  };
  const exportFile = { filename: '结果.xls', mimeType: 'text/plain', content: '内容' };

  return { calls, errors, environment, exportFile };
}

for (const stage of ['createElement', 'append', 'click', 'remove']) {
  test(`下载 helper 在 ${stage} 抛错后仍撤销已创建的对象 URL`, () => {
    const fixture = createFailingDownloadEnvironment([stage]);

    assert.throws(
      () => downloadSupervisionExport(fixture.exportFile, fixture.environment),
      (error) => error === fixture.errors[stage]
    );
    assert.equal(fixture.calls.at(-1), 'revoke');
    if (stage === 'append' || stage === 'click' || stage === 'remove') {
      assert.ok(fixture.calls.includes('remove'));
    }
  });
}

test('下载 helper 的清理异常不覆盖原始操作异常且撤销 URL', () => {
  const fixture = createFailingDownloadEnvironment(['click', 'remove', 'revoke']);

  assert.throws(
    () => downloadSupervisionExport(fixture.exportFile, fixture.environment),
    (error) => error === fixture.errors.click
  );
  assert.deepEqual(fixture.calls.slice(-3), ['click', 'remove', 'revoke']);
});
