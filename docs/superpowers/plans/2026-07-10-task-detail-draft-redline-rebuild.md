# Task Detail Draft Redline Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将任务详情新增为与参考图一致的“刚创建、草稿、无资料”状态，并与正在并行开发的生成中、待确认、归档状态安全共存。

**Architecture:** 草稿态数据和生命周期解析位于 `src/domain/taskDetail`；草稿页由一个页面组件和两个展示子组件组成，全部使用 `task-detail-draft-` 前缀 scoped 样式。现有 `TaskDetail.vue` 只增加模式分派，不重写当前待确认和归档实现；创建页通过独立入口解析函数支持三种资料来源。

**Tech Stack:** Vue 3 SFC、Vue Router 4、Vite 6、Node `node:test`、`@vue/compiler-sfc`、Playwright CLI。

## Global Constraints

- 1600×1000 为主视觉基准；同时验证 1440×900、1366×768、1920×1080。
- 草稿页固定为 `TASK-20250428001`、草稿、版本 `--`、资料为空，仅创建任务完成。
- 三个目标桌面宽度均保持 75:25 双栏；不允许页面级横向溢出。
- 不修改全局裸 `.panel`、`.btn`、`table`、`th`、`td` 样式。
- 不覆盖或删除当前生成中、待确认、归档详情组件和 domain 数据。
- 每次代码改动后只运行 `npm run test:task-detail-draft` 或对应单文件测试；最终才运行 `npm run build`。
- 不调用全局 `setDemoDataMode('data')` 来实现“使用模拟数据”。

---

## File Map

| 文件 | 职责 |
| --- | --- |
| `src/domain/taskDetail/draftTaskDetail.js` | 不可变草稿快照、标签、资料、能力、流程、日志和详情模式解析 |
| `src/views/tasks/TaskDetailDraft.vue` | 草稿页任务头、标签、双栏编排、删除确认和导航事件 |
| `src/views/tasks/task-detail-draft/TaskDetailDraftOverview.vue` | 空资料启动区、三能力卡、七步流程 |
| `src/views/tasks/task-detail-draft/TaskDetailDraftRail.vue` | 下一步提示和紧凑操作留痕 |
| `src/domain/taskCreate/taskCreateEntry.js` | `phase=materials` 与三种 `source` 的纯函数解析 |
| `src/views/tasks/TaskDetail.vue` | 在现有多状态详情外增加草稿态分派 |
| `src/views/tasks/TaskCreate.vue` | 用入口解析结果初始化资料步骤和来源 |
| `src/components/layout/AppLayout.vue` | 详情页通知角标和已存在详情壳的微调 |
| `tests/taskDetailDraftState.test.js` | 草稿数据与生命周期分派测试 |
| `tests/taskDetailDraftComponents.test.js` | SFC 编译、结构、语义和隔离样式测试 |
| `tests/taskCreateEntry.test.js` | 三个资料入口 query 解析测试 |
| `package.json` | 增加局部测试脚本 |

---

### Task 1: 草稿快照与多状态分派

**Files:**
- Create: `src/domain/taskDetail/draftTaskDetail.js`
- Create: `tests/taskDetailDraftState.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `DRAFT_TASK_ID: string`、`draftTaskDetail: Readonly<object>`、`resolveTaskDetailMode(input): 'draft'|'generating'|'pending'|'archived'`。
- Consumes: 路由 query 中的 `state/tab` 和任务行的 `statusKey`；不依赖 Vue 或 store。

- [ ] **Step 1: 写失败测试，锁定全部业务契约**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { draftTaskDetail, resolveTaskDetailMode } from '../src/domain/taskDetail/draftTaskDetail.js';

test('草稿详情快照严格对应参考图', () => {
  assert.equal(draftTaskDetail.id, 'TASK-20250428001');
  assert.equal(draftTaskDetail.status, '草稿');
  assert.equal(draftTaskDetail.version, '--');
  assert.deepEqual(draftTaskDetail.materials, []);
  assert.deepEqual(draftTaskDetail.tabs.map(({ label }) => label), [
    '任务概览', '输入资料', '分析过程', '生成结果', '智能体会话', '报告与附件',
    '修改记录', '复核记录', '版本记录', '导出记录', '操作留痕'
  ]);
  assert.deepEqual(draftTaskDetail.capabilities.map(({ name }) => name), ['制度比对', '费用审计', '报告生成']);
  assert.equal(draftTaskDetail.timeline.length, 7);
  assert.equal(draftTaskDetail.timeline.filter(({ complete }) => complete).length, 1);
  assert.equal(draftTaskDetail.logs.length, 1);
});

test('详情模式优先显式 state，再按任务状态分派，无上下文时为草稿', () => {
  assert.equal(resolveTaskDetailMode({ explicitState: 'archived', statusKey: 'draft' }), 'archived');
  assert.equal(resolveTaskDetailMode({ explicitState: '', statusKey: 'generating' }), 'generating');
  assert.equal(resolveTaskDetailMode({ explicitState: '', statusKey: 'confirming' }), 'pending');
  assert.equal(resolveTaskDetailMode({ explicitState: '', statusKey: '', tab: '' }), 'draft');
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `node --test tests/taskDetailDraftState.test.js`

Expected: FAIL，提示 `draftTaskDetail.js` 不存在。

- [ ] **Step 3: 实现不可变草稿快照与解析函数**

```js
export const DRAFT_TASK_ID = 'TASK-20250428001';

export const draftTaskDetail = Object.freeze({
  id: DRAFT_TASK_ID,
  title: '上海分公司 Q1 常规审计任务',
  organization: '上海分公司',
  period: '2025Q1',
  type: '常规审计',
  owner: '张三',
  status: '草稿',
  version: '--',
  createdAt: '2025-04-28 09:15:32',
  materials: Object.freeze([]),
  tabs: Object.freeze([
    ['overview', '任务概览'], ['materials', '输入资料'], ['analysis', '分析过程'],
    ['results', '生成结果'], ['agent', '智能体会话'], ['reports', '报告与附件'],
    ['changes', '修改记录'], ['reviews', '复核记录'], ['versions', '版本记录'],
    ['exports', '导出记录'], ['logs', '操作留痕']
  ].map(([id, label]) => Object.freeze({ id, label }))),
  requiredMaterials: Object.freeze([
    { name: '财务报表（2025Q1）', status: '未上传' },
    { name: '费用明细台账（2025Q1）', status: '未上传' },
    { name: '相关制度文件（最新版本）', status: '未上传' }
  ]),
  outputs: Object.freeze([
    { name: '制度差异分析报告', status: '待生成' },
    { name: '费用审计分析报告', status: '待生成' },
    { name: '审计报告（草稿）', status: '待生成' }
  ]),
  capabilities: Object.freeze([
    { id: 'policy-compare', name: '制度比对', tone: 'green', description: '对比内外部制度差异，生成差异清单与风险提示。', output: '差异清单（Excel）' },
    { id: 'expense-audit', name: '费用审计', tone: 'orange', description: '识别费用异常交易，生成异常汇总与整改建议。', output: '异常汇总报告（Excel）' },
    { id: 'report-generate', name: '报告生成', tone: 'blue', description: '基于分析结果生成审计报告草稿与附件。', output: '审计报告（Word/PDF）' }
  ]),
  timeline: Object.freeze(['创建任务', '上传资料', '解析资料', '生成分析', '人工确认', '保存版本', '导出归档']
    .map((label, index) => Object.freeze({ label, complete: index === 0, state: index === 0 ? '已完成' : '待开始', occurredAt: index === 0 ? '2025-04-28 09:15:32' : '' }))),
  logs: Object.freeze([{ time: '2025-04-28 09:15:32', operator: '审计管理员', action: '创建任务', result: '成功' }])
});

export function resolveTaskDetailMode({ explicitState = '', statusKey = '', tab = '' } = {}) {
  if (['draft', 'generating', 'pending', 'archived'].includes(explicitState)) return explicitState;
  if (statusKey === 'archived') return 'archived';
  if (statusKey === 'generating') return 'generating';
  if (['confirming', 'reviewing', 'completed'].includes(statusKey) || ['results', 'reviews'].includes(tab)) return 'pending';
  return 'draft';
}
```

- [ ] **Step 4: 增加局部测试脚本并验证 GREEN**

```json
"test:task-detail-draft": "node --test tests/taskDetailDraftState.test.js tests/taskDetailDraftComponents.test.js tests/taskCreateEntry.test.js"
```

Run: `node --test tests/taskDetailDraftState.test.js`

Expected: 2 tests PASS。

- [ ] **Step 5: 提交独立数据切片**

```powershell
git add src/domain/taskDetail/draftTaskDetail.js tests/taskDetailDraftState.test.js package.json
git commit -m "feat: add draft task detail snapshot"
```

---

### Task 2: 空资料启动区、能力卡与流程

**Files:**
- Create: `src/views/tasks/task-detail-draft/TaskDetailDraftOverview.vue`
- Create: `tests/taskDetailDraftComponents.test.js`

**Interfaces:**
- Consumes: `task.capabilities`、`task.timeline`。
- Emits: `open-material-source`，payload 为 `'local'|'fileCenter'|'simulation'`。

- [ ] **Step 1: 写失败的 SFC 结构与编译测试**

```js
test('草稿主区包含三个资料入口、三能力和七步流程', () => {
  const content = source('task-detail-draft/TaskDetailDraftOverview.vue');
  for (const marker of ['local', 'fileCenter', 'simulation']) assert.match(content, new RegExp(`data-source="${marker}"`));
  for (const label of ['任务已创建，尚未添加资料', '制度比对', '费用审计', '报告生成', '创建任务', '导出归档']) assert.match(content, new RegExp(label));
  compileComponent('task-detail-draft/TaskDetailDraftOverview.vue');
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: FAIL，组件文件不存在。

- [ ] **Step 3: 实现组件模板和局部样式**

模板必须包含：装饰性内联 SVG、标题说明、三种 source 按钮、`v-for` 三能力卡、`v-for` 七步时间线。所有类以 `task-detail-draft-` 开头；插画 `aria-hidden="true"`；入口使用原生 `button`。

关键布局：

```css
.task-detail-draft-start{display:grid;grid-template-columns:minmax(250px,36%) minmax(0,1fr);min-height:272px;align-items:center}
.task-detail-draft-actions{display:flex;gap:18px;align-items:center}
.task-detail-draft-capabilities{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.task-detail-draft-timeline-list{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
```

- [ ] **Step 4: 运行组件测试确认 GREEN**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: 结构测试和 SFC 编译 PASS。

- [ ] **Step 5: 提交主区组件切片**

```powershell
git add src/views/tasks/task-detail-draft/TaskDetailDraftOverview.vue tests/taskDetailDraftComponents.test.js
git commit -m "feat: build draft task overview"
```

---

### Task 3: 下一步提示与操作留痕

**Files:**
- Create: `src/views/tasks/task-detail-draft/TaskDetailDraftRail.vue`
- Modify: `tests/taskDetailDraftComponents.test.js`

**Interfaces:**
- Consumes: `task.requiredMaterials`、`task.outputs`、`task.logs`、`task.id`。
- Emits: `edit-materials`。

- [ ] **Step 1: 增加失败结构测试**

```js
test('草稿右栏包含资料输出阻断和当前任务日志', () => {
  const content = source('task-detail-draft/TaskDetailDraftRail.vue');
  for (const label of ['下一步提示', '待补充资料', '所需输出', '阻断项', '操作留痕', '全部日志', '10 条/页']) assert.match(content, new RegExp(label));
  assert.doesNotMatch(content, /DataTable/);
  compileComponent('task-detail-draft/TaskDetailDraftRail.vue');
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: FAIL，右栏组件不存在。

- [ ] **Step 3: 实现右栏**

右栏使用两个独立 section。日志使用语义化 `<table>`，不设置全局类名；“全部日志”使用 `RouterLink :to="{ path: '/records', query: { taskId: task.id } }"`；资料编辑按钮发出 `edit-materials`。

关键尺寸：提示区目标高约 462px，日志目标高约 189px，列表行约 40px；在宽屏中右栏宽度由父栅格控制。

- [ ] **Step 4: 运行测试确认 GREEN**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: 两个组件编译及结构测试 PASS。

- [ ] **Step 5: 提交右栏切片**

```powershell
git add src/views/tasks/task-detail-draft/TaskDetailDraftRail.vue tests/taskDetailDraftComponents.test.js
git commit -m "feat: add draft task guidance rail"
```

---

### Task 4: 草稿页任务头、标签、双栏与删除确认

**Files:**
- Create: `src/views/tasks/TaskDetailDraft.vue`
- Modify: `tests/taskDetailDraftComponents.test.js`

**Interfaces:**
- Consumes: `task`，默认值为 `draftTaskDetail`。
- Emits/navigates: 创建页资料入口 query、继续编辑、记录中心；删除只在确认后发出 `delete-draft`。

- [ ] **Step 1: 写失败结构测试**

```js
test('草稿页包含任务头、11标签、75比25双栏和删除确认', () => {
  const content = source('TaskDetailDraft.vue');
  for (const label of ['继续编辑', '上传资料', '删除草稿', '任务概览']) assert.match(content, new RegExp(label));
  assert.match(content, /role="tablist"/);
  assert.match(content, /TaskDetailDraftOverview/);
  assert.match(content, /TaskDetailDraftRail/);
  assert.match(content, /role="dialog"/);
  assert.match(content, /grid-template-columns:minmax\(0,3fr\) minmax\(286px,1fr\)/);
  compileComponent('TaskDetailDraft.vue');
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: FAIL，页面组件不存在。

- [ ] **Step 3: 实现页面编排和交互**

页面持有 `activeTab = ref('overview')` 与 `deleteOpen = ref(false)`。任务概览渲染双栏；其他标签显示紧凑占位承载页，不回退到当前待确认组件。入口导航统一使用：

```js
function materialRoute(source) {
  return { path: '/tasks/create', query: { phase: 'materials', source } };
}
```

任务头元数据严格为编号、被审计单位、审计期间、任务类型、负责人、状态、当前版本。删除按钮只打开确认层；确认按钮发出事件并返回任务中心。

页面根布局：

```css
.task-detail-draft-page{--draft-red:#b40000;--draft-line:#dfe5ec;padding:0 2px 18px;color:#252c37}
.task-detail-draft-grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(286px,1fr);gap:10px;align-items:start}
```

- [ ] **Step 4: 运行组件测试确认 GREEN**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: 所有 SFC 编译与结构断言 PASS。

- [ ] **Step 5: 提交页面切片**

```powershell
git add src/views/tasks/TaskDetailDraft.vue tests/taskDetailDraftComponents.test.js
git commit -m "feat: compose draft task detail page"
```

---

### Task 5: 接入现有多状态 TaskDetail

**Files:**
- Modify: `src/views/tasks/TaskDetail.vue`
- Modify: `tests/taskDetailDraftComponents.test.js`

**Interfaces:**
- Consumes: `resolveTaskDetailMode()`、`TaskDetailDraft`，以及现有 `TaskDetailArchived`、待确认页面、后续生成中组件。
- Produces: `detailMode` computed，默认无上下文时为 `draft`。

- [ ] **Step 1: 记录共享文件当前 hash 并确认并行改动已稳定**

Run twice, at least one meaningful review interval apart:

```powershell
Get-FileHash src/views/tasks/TaskDetail.vue
git diff -- src/views/tasks/TaskDetail.vue
```

Expected: 两次 hash 相同；若仍变化，只继续独立文件任务，不编辑共享入口。

- [ ] **Step 2: 写失败集成测试**

```js
test('TaskDetail按草稿生成中待确认归档分派且保留现有实现', () => {
  const content = source('TaskDetail.vue');
  assert.match(content, /TaskDetailDraft/);
  assert.match(content, /resolveTaskDetailMode/);
  assert.match(content, /detailMode === 'draft'/);
  assert.match(content, /TaskDetailArchived/);
  assert.match(content, /pending-task-detail/);
});
```

- [ ] **Step 3: 运行测试确认 RED**

Run: `node --test tests/taskDetailDraftComponents.test.js`

Expected: FAIL，缺少草稿分派。

- [ ] **Step 4: 做最小模板与 script 接线**

模板第一层调整为：

```vue
<TaskDetailDraft v-if="detailMode === 'draft'" />
<TaskDetailArchived v-else-if="detailMode === 'archived' && showArchivedState" />
<div v-else class="pending-task-detail" :class="{ 'trace-closed': !traceOpen }">
  <!-- 完整保留现有待确认实现 -->
</div>
```

script 新增：

```js
import TaskDetailDraft from './TaskDetailDraft.vue';
import { resolveTaskDetailMode } from '../../domain/taskDetail/draftTaskDetail.js';

const detailMode = computed(() => resolveTaskDetailMode({
  explicitState: String(route.query.state || ''),
  statusKey: selectedTask.value?.statusKey || '',
  tab: String(route.query.tab || '')
}));
```

若生成中组件已接入，保留它的独立 `detailMode === 'generating'` 分支；不得用草稿分支吞掉它。

- [ ] **Step 5: 运行局部测试确认 GREEN**

Run: `npm run test:task-detail-draft`

Expected: 全部局部测试 PASS。

- [ ] **Step 6: 检查 diff 只增加分派**

Run: `git diff -- src/views/tasks/TaskDetail.vue`

Expected: 不删除现有待确认/归档组件、处理函数或 scoped 样式。

- [ ] **Step 7: 提交接入切片**

```powershell
git add src/views/tasks/TaskDetail.vue tests/taskDetailDraftComponents.test.js
git commit -m "feat: route draft task detail state"
```

---

### Task 6: 三个资料入口与应用壳细节

**Files:**
- Create: `src/domain/taskCreate/taskCreateEntry.js`
- Create: `tests/taskCreateEntry.test.js`
- Modify: `src/views/tasks/TaskCreate.vue`
- Modify: `src/components/layout/AppLayout.vue`

**Interfaces:**
- Produces: `resolveTaskCreateEntry(query): { step: number, stage: string, source: string }`。
- Valid source: `local|fileCenter|simulation`；无效 source 回退 `local`。

- [ ] **Step 1: 写失败入口测试**

```js
test('资料入口解析三种来源并保持旧parse和confirm兼容', () => {
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'materials', source: 'fileCenter' }), { step: 2, stage: 'materials', source: 'fileCenter' });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'materials', source: 'simulation' }), { step: 2, stage: 'materials', source: 'simulation' });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'parse' }), { step: 3, stage: 'parsing', source: 'local' });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'confirm' }), { step: 4, stage: 'template', source: 'local' });
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `node --test tests/taskCreateEntry.test.js`

Expected: FAIL，入口解析模块不存在。

- [ ] **Step 3: 实现纯函数并验证 GREEN**

```js
export function resolveTaskCreateEntry(query = {}) {
  const source = ['local', 'fileCenter', 'simulation'].includes(query.source) ? query.source : 'local';
  if (query.phase === 'materials') return { step: 2, stage: 'materials', source };
  if (query.phase === 'parse') return { step: 3, stage: 'parsing', source };
  if (query.phase === 'confirm' || query.phase === 'template') return { step: 4, stage: 'template', source };
  return { step: 0, stage: 'basic', source };
}
```

Run: `node --test tests/taskCreateEntry.test.js`

Expected: PASS。

- [ ] **Step 4: 等待 TaskCreate/AppLayout hash 稳定后做最小接线**

`TaskCreate.vue` 用解析结果初始化 `step`、`stepFourStage`、`materialSource`；当 `source === 'simulation'` 时调用已有 `simulateFillMaterials()`，但只在 materialRows 初始化后执行一次。

`AppLayout.vue` 只把通知角标条件调整为：

```vue
<span v-if="!isEmptyMode || isTaskDetailRoute" class="notice-dot">12</span>
```

详情面包屑、隐藏数据切换和其他已存在的并行改动全部保留。

- [ ] **Step 5: 运行相关测试**

Run: `npm run test:task-detail-draft`

Expected: PASS。

- [ ] **Step 6: 提交入口切片**

```powershell
git add src/domain/taskCreate/taskCreateEntry.js tests/taskCreateEntry.test.js src/views/tasks/TaskCreate.vue src/components/layout/AppLayout.vue
git commit -m "feat: connect draft material entry routes"
```

---

### Task 7: 四视口视觉迭代与完成验收

**Files:**
- Modify only as evidence requires: `src/views/tasks/TaskDetailDraft.vue`
- Modify only as evidence requires: `src/views/tasks/task-detail-draft/TaskDetailDraftOverview.vue`
- Modify only as evidence requires: `src/views/tasks/task-detail-draft/TaskDetailDraftRail.vue`
- Modify: `docs/17-task-detail-redline-rebuild/notes.md`
- Modify: `docs/17-task-detail-redline-rebuild/visual_acceptance.md`
- Create: `docs/17-task-detail-redline-rebuild/screenshots/*.png`

**Interfaces:**
- Target route: `/tasks/detail?state=draft`；无 query 也必须解析为草稿。
- Browser assertions: 无横向溢出、双栏同排、标签单行、能力三列、任务流程七列、控制台干净。

- [ ] **Step 1: 运行局部自动测试和构建**

```powershell
npm run test:task-detail-draft
npm run build
```

Expected: 所有局部测试 PASS；Vite build 成功。

- [ ] **Step 2: 启动或复用本地服务并采集 1600×1000 基准**

访问 `http://127.0.0.1:5173/tasks/detail?state=draft`，浏览器 zoom 100%、DPR 1。截图保存为 `task-detail-draft-1600x1000-v1.png`。

读取以下 DOM 证据：

```js
({
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  pageHeight: document.documentElement.scrollHeight,
  gridColumns: getComputedStyle(document.querySelector('.task-detail-draft-grid')).gridTemplateColumns,
  tabsHeight: document.querySelector('.task-detail-draft-tabs').getBoundingClientRect().height,
  timelineCount: document.querySelectorAll('.task-detail-draft-timeline-item').length
})
```

Expected: `overflowX === 0`、timelineCount 7，底部流程和日志完整可见。

- [ ] **Step 3: 与参考图逐区比对并只修 P0 差异**

优先顺序：应用壳/任务头 → 标签 → 75:25 栅格 → 空状态 → 能力卡 → 右栏 → 流程/日志。每次修改后只重截受影响视口并在 `notes.md` 记录像素差异。

- [ ] **Step 4: 验证 1440×900 和 1366×768**

Expected: 右栏不掉落、三能力不换行、标签保持单行、无水平滚动；1366 允许纵向滚动但关键入口首屏可操作，正文物理字号不低于 12px。

- [ ] **Step 5: 验证 1920×1080**

Expected: 右栏约 390–410px，左列吸收新增宽度，启动区内部内容不被过度拉散，页面两侧无 300px 级空带。

- [ ] **Step 6: 检查控制台、键盘和删除确认**

Expected: 0 error、0 warning；Tab 顺序覆盖顶部动作、11 标签、三资料入口、编辑/日志、分页；Escape 或取消可关闭删除确认，未确认时数据不变。

- [ ] **Step 7: 最终相关测试与证据更新**

代码最后一次改动后运行：

```powershell
npm run test:task-detail-draft
npm run build
```

更新验收矩阵，将每项标为通过或记录明确残余差异。不得用“看起来接近”替代截图与 DOM 证据。

- [ ] **Step 8: 提交视觉收尾**

```powershell
git add src/views/tasks/TaskDetailDraft.vue src/views/tasks/task-detail-draft docs/17-task-detail-redline-rebuild
git commit -m "fix: align draft task detail with redline"
```

---

## Completion Evidence Matrix

| 用户要求 | 权威证据 |
| --- | --- |
| 红框区域完全复刻 | 1600×1000 原图与最终截图逐区对照记录 |
| 刚创建草稿态 | `taskDetailDraftState.test.js` + 浏览器文案/状态 |
| 三资料入口 | 组件结构测试 + `taskCreateEntry.test.js` + 点击路由验证 |
| 右侧资料/输出/阻断 | 右栏组件测试 + 目标截图 |
| 仅创建任务完成 | fixture 测试 + 7 节点 DOM 断言 |
| 自适应和缩放协调 | 四视口截图与 grid computed style |
| 无大面积空白 | 1600/1920 全页高度与最后内容边界数据 |
| 不破坏其他详情状态 | TaskDetail diff 审查 + 生成中/待确认/归档入口抽查 |
| 只跑相关测试 | 命令记录：`test:task-detail-draft`、`build` |

