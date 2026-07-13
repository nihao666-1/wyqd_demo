# 创建审计任务首步重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `/tasks/create` 从可跳过的只读能力卡页面变为严格对齐审计后台视觉的、可填写的“基础信息”第一步，并在四种视口下稳定进入下一步。

**Architecture:** 将任务类型推荐和首步校验从 Vue 模板抽到一个无依赖的纯逻辑模块；`TaskCreate.vue` 只负责表单绑定、页面分区和步骤显示。这样类型联动、草稿快照和校验可由 Node 内置测试直接覆盖，不引入测试框架或新运行依赖。

**Tech Stack:** Vue 3 `<script setup>`、Vue Router 4、Vite 6、Node `node:test`、原生 CSS。

## 全局约束

- 仅实现并验收 `/tasks/create` 的第一步；已有步骤 2–5 必须仍可显示。
- 不触碰 `src/views/workbench/WorkbenchHome.vue`、`docs/12-workbench-redline-rebuild/`、全局侧栏、路由定义和其它业务页面。
- 不新增第三方依赖；不升级 Vue/Vite；不将静态检查伪装成行为测试。
- 第一步初始值必须是 `step === 0`，步骤 2–5 不得可越级点击。
- 必填字段为任务名称、被审计单位、审计期间、任务类型、负责人；参与人员与任务说明可留空。
- 类型可选常规审计、专项审计、制度比对、费用审计；每种类型均展示推荐能力、建议资料、默认模板。
- 组件须在 1440×900、1024×768、768×1024、390×844 无横向溢出、无字段重叠、无无意义大面积空白。
- `保存草稿` 不校验必填、不跳转，调用现有 `store.saveTaskDraft()` 并显示页面内成功反馈；`下一步` 校验后才显示第二步。
- 当前仓库 `main` 没有提交且已有用户改动；不创建提交、不回退、不格式化无关文件。

---

## 文件职责图

- 创建 `src/domain/taskCreate/taskCreateForm.js`：任务类型推荐配置、首步初始表单和纯校验函数。
- 创建 `tests/taskCreateForm.test.js`：使用 Node 内置测试覆盖类型推荐与首步校验。
- 修改 `package.json`：仅增加 `test:task-create`，调用 Node 内置测试。
- 修改 `src/views/tasks/TaskCreate.vue`：绑定纯逻辑、重做首步表单、保留后续四步内容、添加 scoped 响应式规则。
- 修改 `scripts/check-demo-contract.js`：将“能力卡片页”文字契约替换为首步稳定标记，保留后续步骤存在性检查。
- 修改 `docs/13-task-create-redline-rebuild/01-task-book.md`：仅勾选经过测试/浏览器验证的任务并记录证据。

## Task 1：可测试的首步业务模型

**Files:**

- Create: `src/domain/taskCreate/taskCreateForm.js`
- Create: `tests/taskCreateForm.test.js`
- Modify: `package.json`

**Interfaces:**

```js
export const initialTaskCreateForm = {
  taskName: '', auditedUnit: '上海分公司', auditPeriod: '2025Q1',
  taskType: '常规审计', owner: '审计管理员', participants: [],
  auditScope: '经纪业务部、计划财务部', description: ''
};

export const taskTypeProfiles = {
  '常规审计': { abilities: ['制度查询', '制度比对', '费用审计'], materials: ['审计通知书', '财务报表', '费用明细台账'], template: '常规审计报告模板' },
  '专项审计': { abilities: ['监督共享信息分析', '审计规范生成'], materials: ['专项审计方案', '业务台账'], template: '专项审计报告模板' },
  '制度比对': { abilities: ['制度查询', '制度变更', '制度比对'], materials: ['新旧制度版本', '适用范围说明'], template: '制度差异分析模板' },
  '费用审计': { abilities: ['费用审计', '报告生成'], materials: ['费用明细台账', '预算执行情况表', '发票清单'], template: '费用审计分析模板' }
};

export function validateTaskCreateForm(form) // returns { taskName?: string, auditedUnit?: string, auditPeriod?: string, taskType?: string, owner?: string }
export function getTaskTypeProfile(taskType) // returns a profile, falling back to 常规审计
```

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskTypeProfile, initialTaskCreateForm, validateTaskCreateForm } from '../src/domain/taskCreate/taskCreateForm.js';

test('费用审计类型提供费用能力、资料和默认模板', () => {
  assert.deepEqual(getTaskTypeProfile('费用审计'), {
    abilities: ['费用审计', '报告生成'],
    materials: ['费用明细台账', '预算执行情况表', '发票清单'],
    template: '费用审计分析模板'
  });
});

test('基础信息缺少必填项时返回逐字段错误', () => {
  assert.deepEqual(validateTaskCreateForm({ ...initialTaskCreateForm, taskName: '', auditedUnit: '', auditPeriod: '', taskType: '', owner: '' }), {
    taskName: '请输入任务名称', auditedUnit: '请选择被审计单位', auditPeriod: '请选择审计期间', taskType: '请选择任务类型', owner: '请选择负责人'
  });
});

test('完整基础信息可进入下一步', () => {
  assert.deepEqual(validateTaskCreateForm({ ...initialTaskCreateForm, taskName: '上海分公司 Q1 常规审计任务' }), {});
});
```

- [ ] **Step 2: Verify the test fails correctly**

Run: `node --test tests/taskCreateForm.test.js`

Expected: `ERR_MODULE_NOT_FOUND` because the business model does not exist yet.

- [ ] **Step 3: Add the smallest production implementation**

Create exactly the exported profile map, initial form object, `getTaskTypeProfile`, and five-field `validateTaskCreateForm` described in the interface. `validateTaskCreateForm` must trim string values before deciding whether they are empty. It must not validate participants or description.

- [ ] **Step 4: Add the test script**

Add this script without changing existing scripts:

```json
"test:task-create": "node --test tests/taskCreateForm.test.js"
```

- [ ] **Step 5: Verify green**

Run: `npm run test:task-create`

Expected: three passing subtests and zero failures.

## Task 2：第一步页面、状态和自适应布局

**Files:**

- Modify: `src/views/tasks/TaskCreate.vue`

**Consumes:** `initialTaskCreateForm`, `taskTypeProfiles`, `getTaskTypeProfile`, `validateTaskCreateForm` from Task 1 and existing injected `store.saveTaskDraft()`.

**Produces:** Stable page markers `data-page="task-create"`, `data-step="basic-info"`, `data-role="task-type-profile"`; a first-step form that changes `step` from 0 to 1 only when validation returns no errors.

- [ ] **Step 1: Write the expected implementation checks before editing**

Create a local checklist in the task report and prove from the unmodified source that each item is absent: `step = ref(0)`, `textarea` for task description, `validateTaskCreateForm`, `data-step="basic-info"`, and a scoped `@media (max-width: 768px)` rule. This is the Vue-template equivalent of a red phase because no DOM test runner exists.

- [ ] **Step 2: Replace the page header and step navigation**

Render a compact `create-page` root with `data-page="task-create"`; show breadcrumb `任务中心 / 创建审计任务`, one `h2`, one descriptive sentence, and a secondary `RouterLink` to `/tasks`. Render all five step labels in a `nav` with `aria-label="创建审计任务步骤"`.

Use `step = ref(0)`. The step buttons must have `type="button"`, `:aria-current="step === index ? 'step' : undefined"`, and only call `step = index` when `index <= step`; this prevents skipping forward.

- [ ] **Step 3: Implement the basic-information form**

When `step === 0`, render one `form` with `novalidate` and `@submit.prevent="goNext"`; use native editable controls bound with `v-model` to a local reactive copy of `initialTaskCreateForm`. Use exact labels `任务名称`、`被审计单位`、`审计期间`、`任务类型`、`负责人`、`参与人员`、`审计范围`、`任务说明`.

Use `aria-describedby` for five field errors, `<p v-if="errors.field" class="field-error" role="alert">{{ errors.field }}</p>`, and `ref` bindings on the first five controls so `goNext` can focus the first invalid field. The description must be a `textarea` with `maxlength="300"` and a live count in the format `{{ form.description.length }}/300`.

- [ ] **Step 4: Implement type profile and actions**

Compute `profile = computed(() => getTaskTypeProfile(form.taskType))`; the right-hand `aside` must carry `data-role="task-type-profile"` and separately render `后续推荐能力`、`建议资料`、`默认模板` from that profile.

Implement `saveDraft()` as `draftSaved.value = true; store.saveTaskDraft();` without validation or navigation. Implement `goNext()` as: set `errors.value = validateTaskCreateForm(form)`; focus the first key in `['taskName', 'auditedUnit', 'auditPeriod', 'taskType', 'owner']` with an error; otherwise set `draftSaved.value = false` and `step.value = 1`.

- [ ] **Step 5: Preserve existing downstream pages**

Keep the existing ability-card content for `step === 1`, material cards for `step === 2`, template cards for `step === 3`, and submit panel for `step === 4`. Replace direct `step += 1` in the footer with `goNext` only for step 0; use a separate `nextStep` function for later steps. Do not remove any capability records or existing output calculations.

- [ ] **Step 6: Apply exact responsive rules**

Use `max-width: 1440px` on the content root. At width `<= 1100px`, change the page grid to `minmax(0, 1fr) 280px`; at `<= 860px`, change it to one column and the profile after the form; at `<= 768px`, make form fields one column, make the action bar column-reverse/full width, and allow the step navigation to scroll horizontally; at `<= 480px`, reduce page padding to 12px and allow participant tags and action buttons to wrap. Do not set fixed viewport heights.

- [ ] **Step 7: Verify the relevant checks**

Run: `npm run test:task-create && npm run build`

Expected: three Node tests pass; Vite production build completes without error.

## Task 3：创建页契约和任务书进度

**Files:**

- Modify: `scripts/check-demo-contract.js`
- Modify: `docs/13-task-create-redline-rebuild/01-task-book.md`

**Consumes:** Task 2 stable markers.

**Produces:** `npm run check` verifies the correct initial-page contract rather than old capability-card-only text.

- [ ] **Step 1: Write a failing contract assertion list**

Before editing, identify that the old markers include `选择审计能力` and `selectedIds` but do not require first-step markers. Add assertions for these strings: `data-page="task-create"`, `data-step="basic-info"`, `任务说明`, `后续推荐能力`, `建议资料`, `默认模板`, `validateTaskCreateForm`, and `@media (max-width: 768px)`.

- [ ] **Step 2: Replace the outdated static contract**

Remove the assertion text that labels the page as `任务创建能力卡片页`; retain only assertions necessary to prove that the five labels and the downstream ability selection still exist. Add the new first-step markers from Step 1.

- [ ] **Step 3: Verify green**

Run: `npm run check && npm run test:task-create`

Expected: the contract check reports zero failures; all three Node tests pass.

- [ ] **Step 4: Update the persistent task book**

Only after the preceding commands are green, check P1-1 through P1-5 and P2-1 as complete. Add the exact command output summary and untouched-file boundary to the execution record.

## Task 4：真实浏览器验收

**Files:**

- Modify: `docs/13-task-create-redline-rebuild/01-task-book.md`
- Create: `docs/13-task-create-redline-rebuild/screenshots/task-create-1440.png`
- Create: `docs/13-task-create-redline-rebuild/screenshots/task-create-1024.png`
- Create: `docs/13-task-create-redline-rebuild/screenshots/task-create-768.png`
- Create: `docs/13-task-create-redline-rebuild/screenshots/task-create-390.png`

**Consumes:** Built page from Tasks 1–3 and local Vite server.

- [ ] **Step 1: Run local application**

Run: `npm run dev -- --host 127.0.0.1` from `app/`; visit only the known local URL `/tasks/create`.

- [ ] **Step 2: Verify layout at four exact viewports**

Capture screenshots at 1440×900, 1024×768, 768×1024 and 390×844. At each viewport inspect the DOM scroll width against client width, inspect the form and action bar bounds, and record no overlap or clipping. The 390px result must have one-column fields and full-width primary action.

- [ ] **Step 3: Verify interactions and accessibility**

In the local browser, click `下一步` with an empty task name and confirm it stays on step 1 and announces `请输入任务名称`; change type to `费用审计` and confirm the aside lists `费用审计分析模板`; click `保存草稿` and confirm no navigation; complete all five required fields and confirm step 2 is active. Inspect the accessibility tree for labeled fields, step navigation name and button names. Confirm console errors and warnings are zero.

- [ ] **Step 4: Record evidence**

After all four screenshots and interactions pass, check P2-2 in the task book and record the exact screenshots, test commands and known limitation: sidebar itself is retained from the existing global layout and is outside this page-only change scope.

## Plan self-review

- **Coverage:** tasks map to every task-book item: model/test (P1-1), page structure/interaction (P1-2/P1-3/P1-5), responsive CSS (P1-4), related checks (P2-1), browser evidence (P2-2).
- **Consistency:** every task imports only the Task 1 named exports; Task 2 provides the exact markers Task 3 checks.
- **Scope:** workbench, global layout and route files are explicitly excluded; no new packages or unrequested back-end persistence are introduced.
