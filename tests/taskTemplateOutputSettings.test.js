import test from 'node:test';
import assert from 'node:assert/strict';
import {
  capabilityDefinitions,
  configurationGroups,
  createPreSubmitSummary,
  createTemplateOutputSettings,
  getVisibleSettingGroups,
  referenceMaterials,
  referenceTaskSummary,
  validateTemplateOutputSettings
} from '../src/domain/taskCreate/taskTemplateOutputSettings.js';

const allCapabilityIds = capabilityDefinitions.map((item) => item.id);

test('九项能力映射为八个配置组且制度查询与制度变更共用首组', () => {
  assert.equal(capabilityDefinitions.length, 9);
  assert.equal(configurationGroups.length, 8);
  assert.deepEqual(configurationGroups[0].capabilityIds, ['policy-query', 'policy-change']);
  assert.deepEqual(getVisibleSettingGroups(allCapabilityIds).map((item) => item.key), configurationGroups.map((item) => item.key));
});

test('每次创建默认设置都返回互不共享的嵌套数组', () => {
  const first = createTemplateOutputSettings();
  const second = createTemplateOutputSettings();

  first.reportReview.rules.pop();
  first.global.aiGeneratedLabel = false;

  assert.deepEqual(second.reportReview.rules, ['字体规范', '格式规范', '标题编号', '文字优化']);
  assert.equal(second.global.aiGeneratedLabel, true);
});

test('黄金参考状态派生九项能力五项资料九项输出和唯一风险', () => {
  const summary = createPreSubmitSummary({
    taskSummary: referenceTaskSummary,
    selectedCapabilityIds: allCapabilityIds,
    materials: referenceMaterials,
    settings: createTemplateOutputSettings()
  });

  assert.equal(summary.capabilities.length, 9);
  assert.equal(summary.materials.length, 5);
  assert.equal(summary.outputs.length, 9);
  assert.deepEqual(summary.capabilities.map((item) => item.name), [
    '制度查询', '制度变更', '制度比对', '监管案例舆情分析', '审计规范生成',
    '监督共享信息分析', '费用审计', '报告生成', '报告审核'
  ]);
  assert.equal(summary.materials[1].status, '缺少 3 份');
  assert.deepEqual(summary.risks, [
    '当前存在 1 项资料未就绪，将影响部分能力执行与结果生成。建议在提交前补充完整资料以确保分析质量。'
  ]);
});

test('隐藏报告审核能力不会隐藏报告生成配置组', () => {
  const ids = allCapabilityIds.filter((id) => id !== 'report-review');
  const visibleKeys = getVisibleSettingGroups(ids).map((item) => item.key);

  assert.equal(visibleKeys.includes('reportGeneration'), true);
  assert.equal(visibleKeys.includes('reportReview'), false);
});

test('模板输出校验定位缺失模板输出格式和审核规则', () => {
  const settings = createTemplateOutputSettings();
  settings.reportGeneration.reportTemplate = '';
  settings.reportGeneration.outputFormats = [];
  settings.reportReview.rules = [];

  assert.deepEqual(validateTemplateOutputSettings(settings, allCapabilityIds), {
    'reportGeneration.reportTemplate': '请选择报告模板',
    'reportGeneration.outputFormats': '请至少选择一种报告输出格式',
    'reportReview.rules': '请至少选择一项报告审核规则'
  });
});

test('移除报告能力后不校验对应的隐藏配置', () => {
  const settings = createTemplateOutputSettings();
  settings.reportGeneration.reportTemplate = '';
  settings.reportReview.rules = [];
  const ids = allCapabilityIds.filter((id) => !['report-generate', 'report-review'].includes(id));

  assert.deepEqual(validateTemplateOutputSettings(settings, ids), {});
});

test('能力卡输出选择变化会同步进入右栏输出摘要', () => {
  const settings = createTemplateOutputSettings();
  settings.policyCompare.output = 'Word（差异报告）';
  settings.regulatoryAnalysis.output = '风险事件摘要';
  settings.auditStandard.output = 'Word';
  settings.expenseAudit.output = '费用审计报告';
  const summary = createPreSubmitSummary({ selectedCapabilityIds: allCapabilityIds, settings });
  const outputs = Object.fromEntries(summary.outputs.map((item) => [item.capabilityId, item.label]));

  assert.equal(outputs['policy-compare'], '缺失点与差错清单（Word）');
  assert.equal(outputs.regulatory, '风险事件摘要（Excel）');
  assert.equal(outputs.standard, '审计规范与整改建议（Word）');
  assert.equal(outputs.expense, '费用审计报告');
});
