# Supervision Result Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the supervision-share result page uniformly denser, shorten the chart region without clipping, stabilize the three table actions, and keep the detail log readable.

**Architecture:** Keep the existing Vue template, state, and responsive breakpoints intact. Implement the change entirely through page-scoped CSS in `SupervisionShareResult.vue`, with a source-contract test in the existing integration test file and browser verification at the three established desktop viewports.

**Tech Stack:** Vue 3 SFC, scoped CSS, Node.js built-in test runner, Vite, Chrome DevTools browser verification.

## Global Constraints

- Only modify `src/views/supervision-result/SupervisionShareResult.vue` and its focused supervision-share result test.
- Do not modify routes, state data, export behavior, other pages, or the global typography tokens.
- Do not use `zoom`, `transform: scale()`, or whole-page scaling.
- Keep button hit areas and current keyboard focus behavior unchanged.
- Run only `tests/supervisionShareResult*.test.js`; do not run the full test suite.
- Preserve the existing uncommitted changes already present in `SupervisionShareResult.vue`; do not commit the implementation file as part of this task.

## File Map

- Modify `tests/supervisionShareResultIntegration.test.js`: add the focused CSS contract that must fail before implementation.
- Modify `src/views/supervision-result/SupervisionShareResult.vue`: update only page-scoped typography and layout declarations.
- Create visual evidence under `artifacts/supervision-result-density/`: screenshots and browser measurements; these files remain uncommitted.

---

### Task 1: Add the density and no-clipping CSS contract

**Files:**
- Modify: `tests/supervisionShareResultIntegration.test.js`
- Test: `tests/supervisionShareResultIntegration.test.js`

**Interfaces:**
- Consumes: the raw `resultPage` string already loaded from `SupervisionShareResult.vue`.
- Produces: one focused test named `结果页统一收紧字号、图表、操作列和详情日志`.

- [ ] **Step 1: Write the failing test**

Append this test after the existing responsive-grid test:

```js
test('结果页统一收紧字号、图表、操作列和详情日志', () => {
  assert.match(resultPage, /\.supervision-page\s*\{[^}]*--supervision-font-xs:\s*10px[^}]*--supervision-font-sm:\s*11px[^}]*--supervision-font-md:\s*12px[^}]*font-size:\s*var\(--supervision-font-sm\)/s);
  assert.match(resultPage, /\.supervision-board\s*\{[^}]*grid-template-rows:\s*72px 92px minmax\(188px, \.78fr\) minmax\(314px, 1\.25fr\) minmax\(139px, \.7fr\)/s);
  assert.match(resultPage, /\.donut\s*\{[^}]*width:\s*112px[^}]*height:\s*112px/s);
  assert.match(resultPage, /\.bar-chart,\s*\.donut-layout\s*\{[^}]*min-height:\s*142px/s);
  assert.match(resultPage, /\.dense-table th:nth-child\(9\)\s*\{\s*width:\s*13%;\s*}/s);
  assert.match(resultPage, /\.row-links\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)[^}]*overflow:\s*visible/s);
  assert.match(resultPage, /\.detail-log\s*\{[^}]*font-size:\s*9px/s);
  assert.match(resultPage, /\.detail-log td:nth-child\(1\)\s*\{[^}]*width:\s*29%/s);
  assert.match(resultPage, /\.detail-log td:nth-child\(4\)\s*\{[^}]*width:\s*16%/s);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
node --test tests\supervisionShareResultIntegration.test.js
```

Expected: the new test fails because the page does not yet declare the local font scale, compact chart sizes, three-column action grid, or percentage log columns. Existing tests remain green.

---

### Task 2: Implement the compact page-scoped typography and layout

**Files:**
- Modify: `src/views/supervision-result/SupervisionShareResult.vue:636-1970`
- Test: `tests/supervisionShareResultIntegration.test.js`

**Interfaces:**
- Consumes: the existing page DOM and current scoped class names.
- Produces: local typography variables and stable CSS layouts; no JavaScript or template API changes.

- [ ] **Step 1: Add the local font scale and shrink representative hierarchy values**

At the first `.supervision-page` rule, add:

```css
--supervision-font-xs: 10px;
--supervision-font-sm: 11px;
--supervision-font-md: 12px;
--supervision-font-lg: 13px;
--supervision-font-xl: 20px;
--ui-font-xs: var(--supervision-font-xs);
--ui-font-sm: var(--supervision-font-sm);
--ui-font-md: var(--supervision-font-md);
--ui-font-lg: var(--supervision-font-lg);
--ui-font-xl: var(--supervision-font-xl);
font-size: var(--supervision-font-sm);
```

Change the page-local hierarchy values as follows, keeping icon-only close controls unchanged:

```css
h1 { font-size: 20px; }
h2 { font-size: 13px; }
h3 { font-size: 12px; }
.filter-field { font-size: 11px; }
.filter-field select,
.filter-field input { font-size: 10px; }
.filter-actions button,
.table-tools button { font-size: 11px; }
.metric-label { font-size: 12px; }
.metric-card strong { font-size: 21px; }
.metric-card small,
.metric-card em { font-size: 11px; }
.chart-card header small,
.legend,
.donut-layout ul,
.keyword-bars { font-size: 10px; }
.chart-tooltip { font-size: 10px; }
.donut span { font-size: 11px; }
.donut strong { font-size: 14px; }
.result-tabs button { font-size: 10px; }
.pager,
.history-list,
.history-panel a { font-size: 9px; }
.new-analysis { font-size: 12px; }
.detail-content dl div,
.detail-content p,
.text-link,
.chapter-list { font-size: 10px; }
.source-detail-card footer button { font-size: 11px; }
```

Keep `.dense-table` and its row buttons at the 9px readability floor.

- [ ] **Step 2: Shorten the chart row and resize all three chart types together**

Change the primary and repeated wide-screen board rows to:

```css
grid-template-rows: 72px 92px minmax(188px, .78fr) minmax(314px, 1.25fr) minmax(139px, .7fr);
```

Update chart internals:

```css
.chart-card { padding: 9px 12px; }
.legend { gap: 14px; margin-top: 7px; }
.bar-chart { height: 132px; margin-top: 3px; }
.bar-stack { height: 104px; }
.chart-tooltip { bottom: 24px; width: 92px; padding: 7px; line-height: 14px; }
.donut-layout { grid-template-columns: 122px minmax(0, 1fr); height: 142px; }
.donut { width: 112px; height: 112px; }
.donut::before { width: 64px; height: 64px; }
.donut-layout ul { gap: 7px; }
.keyword-bars { gap: 4px; margin-top: 8px; }
```

In the later flex-fill rule, change the minimum height to:

```css
.bar-chart,
.donut-layout {
  height: auto;
  min-height: 142px;
  flex: 1;
}
```

- [ ] **Step 3: Stabilize the result-table action column**

Replace the final four column widths with a total-preserving allocation:

```css
.dense-table th:nth-child(6) { width: 11%; }
.dense-table th:nth-child(7) { width: 11%; }
.dense-table th:nth-child(8) { width: 8%; }
.dense-table th:nth-child(9) { width: 13%; }
```

Replace `.row-links` and its button specialization with:

```css
.row-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 2px;
  min-width: 0;
  overflow: visible;
  white-space: nowrap;
}

.row-links button {
  width: 100%;
  min-width: 0;
  padding: 0;
  font-size: 9px;
}
```

- [ ] **Step 4: Rebalance the operation-log columns**

Change the log row and widths to:

```css
.detail-log { font-size: 9px; }
.detail-log td { height: 40px; padding: 4px 2px 4px 0; line-height: 13px; }
.detail-log td:nth-child(1) { width: 29%; white-space: pre-line; }
.detail-log td:nth-child(2) { width: 21%; overflow-wrap: anywhere; }
.detail-log td:nth-child(3) { width: 34%; overflow-wrap: anywhere; }
.detail-log td:nth-child(4) { width: 16%; white-space: nowrap; }
```

- [ ] **Step 5: Run the integration test to verify GREEN**

Run:

```powershell
node --test tests\supervisionShareResultIntegration.test.js
```

Expected: all integration tests pass, including the new density contract.

- [ ] **Step 6: Run only the supervision-share result test group**

Run:

```powershell
node --test tests\supervisionShareResultState.test.js tests\supervisionShareResultComponents.test.js tests\supervisionShareResultIntegration.test.js tests\supervisionShareResultExports.test.js
```

Expected: all supervision-share result tests pass with no warnings or errors attributable to this change.

---

### Task 3: Browser-check chart integrity and overflow

**Files:**
- Create: `artifacts/supervision-result-density/supervision-density-1366x768.png`
- Create: `artifacts/supervision-result-density/supervision-density-1586x994.png`
- Create: `artifacts/supervision-result-density/supervision-density-1920x1080.png`

**Interfaces:**
- Consumes: the Vite route `http://127.0.0.1:5173/tasks/detail/supervision-share`.
- Produces: three screenshots and browser measurements proving the page has no clipped charts or action/log overflow.

- [ ] **Step 1: Start the focused development server**

Run:

```powershell
npm run dev -- --port 5173
```

Expected: Vite serves the project at `http://127.0.0.1:5173` without compile errors.

- [ ] **Step 2: Inspect the three target viewports**

At 1366×768, 1586×994, and 1920×1080, open `/tasks/detail/supervision-share` and verify:

```text
document.documentElement.scrollWidth === document.documentElement.clientWidth
Each .chart-card scrollWidth <= clientWidth and scrollHeight <= clientHeight
Each .row-links scrollWidth <= clientWidth
Each .detail-log scrollWidth <= clientWidth
All three .row-links buttons have non-zero bounding boxes
```

Expected: every condition is true. Save a screenshot for each viewport under `artifacts/supervision-result-density/`.

- [ ] **Step 3: Verify interactions and console state**

Tab to one row's “原文 / 引用 / 提取” actions, click each action once, open and close the compact detail panel at 1366px if shown, and inspect the console.

Expected: focus remains visible, actions still respond, the detail panel remains usable, and no new console errors appear.

- [ ] **Step 4: Review the final diff without committing the pre-existing page work**

Run:

```powershell
git diff -- tests/supervisionShareResultIntegration.test.js src/views/supervision-result/SupervisionShareResult.vue
git status --short
```

Expected: the new test and requested CSS changes are present; no unrelated file is modified by this task. Leave implementation changes uncommitted because `SupervisionShareResult.vue` already contained user-owned uncommitted edits before this work.
