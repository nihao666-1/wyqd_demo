import test from 'node:test';
import assert from 'node:assert/strict';
import {
  confirmStandardItem,
  createAuditStandardResultState,
  editStandardItem,
  excludeStandardItem,
  exportAuditStandardExcel,
  paginateStandardItems,
  regenerateAuditStandard,
  saveAuditStandardDraft,
  selectStandardItem
} from '../src/domain/auditStandard/auditStandardResultState.js';

function assertImmutableTransition(state, transition) {
  const snapshot = structuredClone(state);
  const updated = transition(state);

  assert.notEqual(updated, state);
  assert.deepEqual(state, snapshot);
  return updated;
}

function getItem(state, itemId) {
  return state.items.find((item) => item.id === itemId);
}

function getLastTrail(state) {
  return state.operationTrail.at(-1);
}

test('初始结果对应原图的 186/320、58% 生成进度并选中首条规范', () => {
  const state = createAuditStandardResultState();

  assert.equal(state.items.length, 186);
  assert.equal(new Set(state.items.map((item) => item.id)).size, 186);
  assert.deepEqual(state.generation, {
    completed: 186,
    total: 320,
    percent: 58,
    status: 'generating'
  });
  assert.equal(state.selectedItemId, 'CP-03-001');
  assert.equal(getItem(state, state.selectedItemId).id, 'CP-03-001');
});

test('选择规范条目只更新选中项且不改变原状态', () => {
  const state = createAuditStandardResultState();
  const selected = assertImmutableTransition(state, (current) => selectStandardItem(current, 'CP-03-008'));

  assert.equal(selected.selectedItemId, 'CP-03-008');
  assert.deepEqual(selectStandardItem(selected, 'CP-03-008'), selected);
  assert.deepEqual(selectStandardItem(selected, 'CP-NOT-FOUND'), selected);
});

test('编辑规范条目保存人工调整并写入操作留痕', () => {
  const state = createAuditStandardResultState();
  const edited = assertImmutableTransition(state, (current) => editStandardItem(
    current,
    'CP-03-001',
    '费用报销审批权限及授权边界检查'
  ));

  assert.equal(getItem(edited, 'CP-03-001').title, '费用报销审批权限及授权边界检查');
  assert.equal(getLastTrail(edited).action, '编辑条目');
  assert.equal(getLastTrail(edited).itemId, 'CP-03-001');
  assert.equal(getLastTrail(edited).detail, '费用报销审批权限及授权边界检查');
});

test('确认规范条目后状态为已确认并写入操作留痕', () => {
  const state = createAuditStandardResultState();
  const confirmed = assertImmutableTransition(state, (current) => confirmStandardItem(current, 'CP-03-001'));

  assert.equal(getItem(confirmed, 'CP-03-001').status, 'confirmed');
  assert.equal(getLastTrail(confirmed).action, '确认条目');
  assert.equal(getLastTrail(confirmed).itemId, 'CP-03-001');
  assert.deepEqual(confirmStandardItem(confirmed, 'CP-03-001'), confirmed);
});

test('排除规范条目必须提供非空原因', () => {
  const state = createAuditStandardResultState();

  assert.throws(
    () => excludeStandardItem(state, 'CP-03-001', '   '),
    /排除原因不能为空/
  );
  assert.equal(getItem(state, 'CP-03-001').status, 'pending');
});

test('排除规范条目保存原因并写入操作留痕', () => {
  const state = createAuditStandardResultState();
  const excluded = assertImmutableTransition(state, (current) => excludeStandardItem(
    current,
    'CP-03-001',
    '与现行审计范围无关'
  ));

  assert.equal(getItem(excluded, 'CP-03-001').status, 'excluded');
  assert.equal(getItem(excluded, 'CP-03-001').exclusionReason, '与现行审计范围无关');
  assert.equal(getLastTrail(excluded).action, '排除条目');
  assert.equal(getLastTrail(excluded).itemId, 'CP-03-001');
  assert.equal(getLastTrail(excluded).detail, '与现行审计范围无关');
});

test('保存草稿形成已保存的 V1.0 版本并写入留痕', () => {
  const state = createAuditStandardResultState();
  const saved = assertImmutableTransition(state, saveAuditStandardDraft);

  assert.deepEqual(saved.version, {
    number: 'V1.0',
    status: 'draft',
    saved: true
  });
  assert.equal(getLastTrail(saved).action, '保存草稿');
  assert.equal(getLastTrail(saved).detail, 'V1.0');
  assert.deepEqual(saveAuditStandardDraft(saved), saved);
});

test('重新生成恢复生成态、清除人工处理结果并写入留痕', () => {
  const initial = createAuditStandardResultState();
  const edited = editStandardItem(initial, 'CP-03-001', '人工调整后的条目');
  const confirmed = confirmStandardItem(edited, 'CP-03-001');
  const saved = saveAuditStandardDraft(confirmed);
  const regenerated = assertImmutableTransition(saved, regenerateAuditStandard);

  assert.equal(regenerated.generation.status, 'generating');
  assert.equal(regenerated.version.saved, false);
  assert.equal(getItem(regenerated, 'CP-03-001').status, 'pending');
  assert.equal(getItem(regenerated, 'CP-03-001').title, getItem(initial, 'CP-03-001').title);
  assert.equal(getLastTrail(regenerated).action, '重新生成');
});

test('导出 Excel 新增下载记录并写入操作留痕', () => {
  const state = createAuditStandardResultState();
  const previousCount = state.exportRecords.length;
  const exported = assertImmutableTransition(state, exportAuditStandardExcel);
  const record = exported.exportRecords.at(-1);

  assert.equal(exported.exportRecords.length, previousCount + 1);
  assert.equal(record.type, 'xlsx');
  assert.match(record.fileName, /审计规范.*\.xlsx$/);
  assert.equal(getLastTrail(exported).action, '导出 Excel');
  assert.equal(getLastTrail(exported).detail, record.fileName);
});

test('186 条规范按每页 10 条分页且无重复遗漏', () => {
  const state = createAuditStandardResultState();
  const pages = Array.from({ length: 19 }, (_, index) => paginateStandardItems(state.items, index + 1, 10));

  assert.equal(pages[0].length, 10);
  assert.equal(pages[18].length, 6);
  assert.deepEqual(
    pages.flat().map((item) => item.id),
    state.items.map((item) => item.id)
  );
});
