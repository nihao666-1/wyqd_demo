import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canSubmitReview,
  confirmAbility,
  confirmItem,
  createTaskResultState,
  excludeItem,
  getAbilityStatus,
  getPendingCount,
  paginateItems,
  saveItemNote
} from '../src/domain/taskDetail/taskResultState.js';

function getAbilityByName(state, name) {
  return state.abilities.find((ability) => ability.name === name);
}

function getItemsForAbility(state, abilityId) {
  return state.items.filter((item) => item.abilityId === abilityId);
}

function assertImmutableTransition(state, transition) {
  const snapshot = structuredClone(state);
  const updated = transition(state);

  assert.notEqual(updated, state);
  assert.deepEqual(state, snapshot);
  return updated;
}

test('初始状态包含 9 类能力、15 条待确认事项和 V1.0 草稿', () => {
  const state = createTaskResultState();

  assert.equal(state.abilities.length, 9);
  assert.equal(new Set(state.abilities.map((ability) => ability.id)).size, 9);
  assert.equal(state.items.length, 15);
  assert.equal(new Set(state.items.map((item) => item.id)).size, 15);
  assert.equal(state.items.every((item) => item.disposition === 'pending'), true);
  assert.equal(getPendingCount(state), 15);
  assert.deepEqual(state.version, {
    number: 'V1.0',
    status: 'draft',
    saved: false
  });
  assert.equal(state.selectedItemId, 'CONF-001');
});

test('确认单项返回不可变状态，且重复确认保持相同结果', () => {
  const state = createTaskResultState();
  const itemId = state.items[0].id;
  const confirmed = assertImmutableTransition(state, (current) => confirmItem(current, itemId));

  assert.equal(confirmed.items.find((item) => item.id === itemId).disposition, 'confirmed');
  assert.equal(getPendingCount(confirmed), 14);
  assert.deepEqual(confirmItem(confirmed, itemId), confirmed);
});

test('排除单项返回不可变状态，且重复排除保持相同结果', () => {
  const state = createTaskResultState();
  const itemId = state.items[1].id;
  const excluded = assertImmutableTransition(state, (current) => excludeItem(current, itemId));

  assert.equal(excluded.items.find((item) => item.id === itemId).disposition, 'excluded');
  assert.equal(getPendingCount(excluded), 14);
  assert.deepEqual(excludeItem(excluded, itemId), excluded);
});

test('保存说明返回不可变状态，且重复保存相同说明保持相同结果', () => {
  const state = createTaskResultState();
  const itemId = state.items[2].id;
  const noted = assertImmutableTransition(state, (current) => saveItemNote(current, itemId, '已核对原始制度，等待业务补充材料。'));

  assert.equal(noted.items.find((item) => item.id === itemId).note, '已核对原始制度，等待业务补充材料。');
  assert.equal(noted.items.find((item) => item.id === itemId).disposition, 'annotated');
  assert.equal(getPendingCount(noted), 14);
  assert.deepEqual(saveItemNote(noted, itemId, '已核对原始制度，等待业务补充材料。'), noted);
});

test('清空或只输入空格会让仅靠说明处理的事项恢复待确认', () => {
  const state = createTaskResultState();
  const itemId = state.items[2].id;
  const noted = saveItemNote(state, itemId, '已核对原始制度');
  const cleared = saveItemNote(noted, itemId, '   ');

  assert.equal(cleared.items.find((item) => item.id === itemId).note, '');
  assert.equal(cleared.items.find((item) => item.id === itemId).disposition, 'pending');
  assert.equal(getPendingCount(cleared), 15);
});

test('批量确认只处理指定能力的待确认事项', () => {
  const state = createTaskResultState();
  const targetAbility = getAbilityByName(state, '制度比对');
  const otherAbility = getAbilityByName(state, '费用审计');
  const targetBefore = getItemsForAbility(state, targetAbility.id);
  const otherBefore = getItemsForAbility(state, otherAbility.id);

  assert.ok(targetBefore.length > 0);
  assert.ok(otherBefore.length > 0);

  const updated = assertImmutableTransition(state, (current) => confirmAbility(current, targetAbility.id));

  assert.equal(getItemsForAbility(updated, targetAbility.id).every((item) => item.disposition === 'confirmed'), true);
  assert.deepEqual(getItemsForAbility(updated, otherAbility.id), otherBefore);
  assert.equal(getPendingCount(updated), 15 - targetBefore.length);
  assert.deepEqual(confirmAbility(updated, targetAbility.id), updated);
});

test('能力状态由该能力的事项处理结果派生', () => {
  const state = createTaskResultState();
  const targetAbility = getAbilityByName(state, '制度比对');

  assert.equal(getAbilityStatus(state, targetAbility.id), 'pending');

  const confirmed = confirmAbility(state, targetAbility.id);
  assert.equal(getAbilityStatus(confirmed, targetAbility.id), 'confirmed');
});

test('复核门禁同时要求无待确认事项且当前版本已保存', () => {
  const state = createTaskResultState();
  const allConfirmed = state.items.reduce((current, item) => confirmItem(current, item.id), state);

  assert.equal(canSubmitReview(state), false);
  assert.equal(getPendingCount(allConfirmed), 0);
  assert.equal(canSubmitReview(allConfirmed), false);
  assert.equal(canSubmitReview({
    ...allConfirmed,
    version: { ...allConfirmed.version, saved: true }
  }), true);
});

test('保存版本后再次处理事项会使草稿重新变脏并关闭复核门禁', () => {
  const initial = createTaskResultState();
  const saved = {
    ...initial,
    draftState: 'saved',
    version: { ...initial.version, saved: true }
  };
  const updated = confirmItem(saved, saved.items[0].id);

  assert.equal(updated.draftState, 'dirty');
  assert.equal(updated.version.saved, false);
  assert.equal(canSubmitReview(updated), false);
});

test('15 条事项按每页 10 条分页且无重复遗漏', () => {
  const state = createTaskResultState();
  const firstPage = paginateItems(state.items, 1, 10);
  const secondPage = paginateItems(state.items, 2, 10);

  assert.equal(firstPage.length, 10);
  assert.equal(secondPage.length, 5);
  assert.deepEqual(
    [...firstPage, ...secondPage].map((item) => item.id),
    state.items.map((item) => item.id)
  );
});
