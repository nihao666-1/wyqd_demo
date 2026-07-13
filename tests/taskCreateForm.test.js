import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMaterialSource, createMaterialSelectionRows, createTaskDraftSnapshot, filterTaskPersonnel, getMaterialSelectionProgress, getTaskMaterialRequirements, getTaskTypeProfile, initialTaskCreateForm, validateTaskCreateForm } from '../src/domain/taskCreate/taskCreateForm.js';

test('费用审计类型提供费用能力、资料和默认模板', () => {
  assert.deepEqual(getTaskTypeProfile('费用审计'), {
    abilities: ['费用审计', '报告生成'],
    materials: ['费用明细台账', '预算执行情况表', '发票清单'],
    template: '费用审计分析模板'
  });
});

test('未知及继承属性类型回退到常规审计', () => {
  const standardProfile = getTaskTypeProfile('常规审计');

  for (const taskType of ['未知类型', 'toString', 'constructor', '__proto__']) {
    assert.deepEqual(getTaskTypeProfile(taskType), standardProfile);
  }
});

test('基础信息缺少必填项时返回逐字段错误', () => {
  assert.deepEqual(validateTaskCreateForm({ ...initialTaskCreateForm, taskName: '', auditedUnit: '', auditStart: '', auditEnd: '', taskType: '', owner: '' }), {
    taskName: '请输入任务名称', auditedUnit: '请选择被审计单位', auditPeriod: '请选择完整的审计期间', taskType: '请选择任务类型', owner: '请选择负责人'
  });
});

test('五个必填项仅含空白字符时返回逐字段错误', () => {
  assert.deepEqual(validateTaskCreateForm({ ...initialTaskCreateForm, taskName: ' ', auditedUnit: '\t', auditStart: '', auditEnd: '', taskType: '  ', owner: '　' }), {
    taskName: '请输入任务名称', auditedUnit: '请选择被审计单位', auditPeriod: '请选择完整的审计期间', taskType: '请选择任务类型', owner: '请选择负责人'
  });
});

test('完整基础信息可进入下一步', () => {
  assert.deepEqual(validateTaskCreateForm({ ...initialTaskCreateForm, taskName: '上海分公司 Q1 常规审计任务', owner: '王审计' }), {});
});

test('保存草稿时复制参与人员和类型推荐', () => {
  const form = { ...initialTaskCreateForm, participants: ['李四'] };
  const sourceProfile = getTaskTypeProfile('费用审计');
  const profile = { ...sourceProfile, abilities: [...sourceProfile.abilities], materials: [...sourceProfile.materials] };
  const snapshot = createTaskDraftSnapshot(form, profile);

  form.participants.push('王五');
  profile.abilities.push('临时能力');

  assert.deepEqual(snapshot.participants, ['李四']);
  assert.deepEqual(snapshot.recommendedProfile.abilities, ['费用审计', '报告生成']);
});

test('人员目录按搜索词筛选且排除负责人', () => {
  const directory = [
    { userId: 'U-01', name: '王审计', department: '审计部', active: true },
    { userId: 'U-02', name: '李审计', department: '审计部', active: true },
    { userId: 'U-03', name: '赵复核', department: '风险管理部', active: false }
  ];

  assert.deepEqual(filterTaskPersonnel(directory, { query: '审计', owner: '王审计' }).map((person) => person.name), ['李审计']);
});

test('首步默认提供数据范围与常规风险等级', () => {
  assert.deepEqual(initialTaskCreateForm.dataScope, ['财务数据', '费用明细', '制度文件', '监管案例', '共享信息']);
  assert.equal(initialTaskCreateForm.riskLevel, '常规');
});

test('审计期间缺少任一日期时不能进入下一步', () => {
  assert.deepEqual(validateTaskCreateForm({
    ...initialTaskCreateForm,
    taskName: '上海分公司 Q1 常规审计任务',
    owner: '王审计',
    auditStart: '',
    auditEnd: ''
  }), { auditPeriod: '请选择完整的审计期间' });
});

test('任务类型资料映射保留必填与可选状态', () => {
  assert.deepEqual(getTaskMaterialRequirements('费用审计'), [
    { name: '财务报表', required: true },
    { name: '费用明细台账', required: true },
    { name: '相关制度文件', required: true },
    { name: '预算执行情况表', required: false },
    { name: '监管通报与案例库', required: false }
  ]);
});

test('资料选择生成五项必填、四项可选且保留能力来源', () => {
  const rows = createMaterialSelectionRows('常规审计', ['制度查询', '费用审计']);

  assert.equal(rows.length, 9);
  assert.equal(rows.filter((row) => row.required).length, 5);
  assert.equal(rows.filter((row) => !row.required).length, 4);
  assert.equal(rows.find((row) => row.id === 'financial-statement').ability, '费用审计');
});

test('仅必填资料全部补齐时允许进入模板设置', () => {
  const rows = createMaterialSelectionRows('费用审计', ['费用审计', '报告生成']);
  const requiredIds = rows.filter((row) => row.required).map((row) => row.id);
  const incomplete = getMaterialSelectionProgress(rows);
  const completed = getMaterialSelectionProgress(applyMaterialSource(rows, requiredIds, 'local'));

  assert.equal(incomplete.canProceed, false);
  assert.equal(incomplete.blockingItems.length, 2);
  assert.equal(completed.required.completed, 5);
  assert.equal(completed.optional.completed, 1);
  assert.equal(completed.canProceed, true);
});

test('补齐资料不会变异原始资料清单', () => {
  const rows = createMaterialSelectionRows('常规审计', []);
  const updated = applyMaterialSource(rows, ['financial-statement'], 'simulation');

  assert.equal(rows[0].uploadStatus, '未上传');
  assert.equal(updated[0].source, '系统模拟数据');
  assert.equal(updated[0].uploadStatus, '已上传');
  assert.equal(updated[0].parseStatus, '待解析');
});
