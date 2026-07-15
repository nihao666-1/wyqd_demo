# Task Center Create Action Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将“创建审计任务”改成指标区第六个轻量操作卡，并移除原独占按钮行。

**Architecture:** 保留 `TaskList.vue` 现有组件边界、路由和响应式断点，只移动现有入口的模板位置并补充同级卡片样式。使用源码契约测试验证结构、跳转和六列布局，不引入新依赖。

**Tech Stack:** Vue 3、Vue Router、Node.js 内置测试、CSS Grid

## Global Constraints

- 只修改 `src/views/tasks/TaskList.vue` 和直接测试 `tests/taskListComponents.test.js`。
- 不修改任务数据、筛选逻辑、右侧栏或创建流程。
- 不运行全量测试，只运行本改动相关测试。

---

### Task 1: 指标区创建操作卡

**Files:**
- Create: `tests/taskListComponents.test.js`
- Modify: `src/views/tasks/TaskList.vue`

**Interfaces:**
- Consumes: Vue Router 路由 `/tasks/create`；现有 `TaskIcon` 的 `create` 图标。
- Produces: `.create-task-tile` 链接卡；六列 `.metric-strip`。

- [ ] **Step 1: Write the failing test**

```js
test('创建任务入口与五个指标同排并保持轻量卡片样式', () => {
  assert.doesNotMatch(source, /<header class="task-center-header">/);
  assert.match(source, /class="metric-strip"[\s\S]*v-for="metric in metricDefinitions"[\s\S]*class="create-task-tile" to="\/tasks\/create"/);
  assert.match(source, /<TaskIcon name="create"/);
  assert.match(source, /\.metric-strip\{[^}]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(source, /\.create-task-tile\{[^}]*border:1px solid var\(--red\)[^}]*background:#fff/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/taskListComponents.test.js`

Expected: FAIL because the current template still has `.task-center-header` and no `.create-task-tile`.

- [ ] **Step 3: Write minimal implementation**

Move the existing route link into `.metric-strip`, render `<TaskIcon name="create" :size="20" />`, set the base grid to six columns, add the light outlined tile styles, and remove styles orphaned by deleting `.task-center-header`.

- [ ] **Step 4: Run related tests**

Run: `node --test tests/taskListComponents.test.js tests/viewportBatchA.test.js`

Expected: all tests pass with zero failures.

