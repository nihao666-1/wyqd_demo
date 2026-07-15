# Workbench Todo Item Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign each workbench todo item as a compact two-row layout without changing the surrounding panel size or hiding either action.

**Architecture:** Keep the existing todo data, `RouterLink` destinations, panel grid, and scroll container. Add semantic wrapper classes inside each `todo-item`, then scope all layout changes to those wrappers in `WorkbenchHome.vue`.

**Tech Stack:** Vue 3 single-file components, Vue Router, CSS Grid/Flexbox, Node.js built-in test runner.

## Global Constraints

- Do not change the “我的待办” panel size, outer grid allocation, tabs, or internal scroll behavior.
- Keep “去处理” and “查看详情” visible as `RouterLink` controls.
- Do not change todo data, status copy, routes, or other workbench modules.
- Preserve the existing uncommitted operation-log height changes in `WorkbenchHome.vue`.
- Run only tests related to the changed workbench todo layout and its existing viewport contract.

---

### Task 1: Two-row Todo Item

**Files:**
- Create: `tests/workbenchTodoItem.test.js`
- Modify: `src/views/workbench/WorkbenchHome.vue:125-136`
- Modify: `src/views/workbench/WorkbenchHome.vue:1034-1100`

**Interfaces:**
- Consumes: existing `todoItems` objects with `title`, `meta`, `status`, `statusClass`, `primaryTo`, and `detailTo` properties.
- Produces: `.todo-heading` and `.todo-support` layout wrappers; existing actions and routes remain unchanged.

- [x] **Step 1: Write the failing structure and style test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workbench = readFileSync(
  new URL('../src/views/workbench/WorkbenchHome.vue', import.meta.url),
  'utf8'
);

test('workbench todo items use two compact rows with both actions visible', () => {
  assert.match(workbench, /class="todo-heading"[\s\S]*item\.title[\s\S]*class="status-tag"/);
  assert.match(workbench, /class="todo-support"[\s\S]*item\.meta[\s\S]*去处理[\s\S]*查看详情/);
  assert.match(workbench, /\.todo-item\s*\{[^}]*grid-template-rows:\s*auto auto[^}]*min-height:\s*44px/s);
  assert.match(workbench, /\.todo-heading,\s*\.todo-support\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto/s);
  assert.match(workbench, /\.todo-item \.row-actions\s*\{[^}]*flex-wrap:\s*nowrap/s);
  assert.match(workbench, /\.workbench-page \.todo-item \.btn\s*\{[^}]*min-height:\s*18px[^}]*padding:\s*1px 6px/s);
  assert.match(workbench, /\.todo-item \.status-tag\s*\{[^}]*min-height:\s*18px[^}]*line-height:\s*16px/s);
});
```

- [x] **Step 2: Run the new test and verify RED**

Run: `node --test tests/workbenchTodoItem.test.js`

Expected: FAIL because `.todo-heading`, `.todo-support`, and the two-row CSS contract do not exist.

- [x] **Step 3: Implement the two-row markup**

```vue
<article v-for="item in todoItems" :key="item.id" class="todo-item">
  <div class="todo-heading">
    <strong>{{ item.title }}</strong>
    <span class="status-tag" :class="item.statusClass">{{ item.status }}</span>
  </div>
  <div class="todo-support">
    <p>{{ item.meta }}</p>
    <div class="row-actions">
      <RouterLink class="btn primary" :to="item.primaryTo">去处理</RouterLink>
      <RouterLink class="btn todo-detail-link" :to="item.detailTo">查看详情</RouterLink>
    </div>
  </div>
</article>
```

- [x] **Step 4: Implement the scoped compact layout**

```css
.todo-item {
  grid-template-rows: auto auto;
  gap: 2px;
  min-height: 44px;
  padding: 2px 6px;
}

.todo-heading,
.todo-support {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.todo-item .status-tag {
  justify-self: end;
  min-height: 18px;
  padding: 0 5px;
  line-height: 16px;
}

.todo-item .row-actions {
  flex-wrap: nowrap;
  gap: 4px;
}

.workbench-page .todo-item .btn {
  min-height: 18px;
  padding: 1px 6px;
  line-height: 14px;
}

.todo-item .todo-detail-link {
  border-color: transparent;
  background: transparent;
  color: var(--color-muted);
}
```

Remove the obsolete direct-child grid placement rules for the previous three-column todo layout. Retain ellipsis rules for title and meta text, and retain compact button/status sizing.

- [x] **Step 5: Run focused tests and verify GREEN**

Run: `node --test tests/workbenchTodoItem.test.js tests/viewportBatchA.test.js`

Expected: both test files PASS with no warnings or errors.

- [x] **Step 6: Verify the page visually**

Run: `npm run dev -- --host 127.0.0.1`

Open `/workbench` in data mode at the screenshot desktop viewport. Verify the todo panel keeps its existing bounds, both actions remain visible, long text ellipsizes, and no title/status/action overlap occurs.

- [x] **Step 7: Review the scoped implementation diff**

```powershell
git diff --check -- tests/workbenchTodoItem.test.js src/views/workbench/WorkbenchHome.vue
git diff -- tests/workbenchTodoItem.test.js src/views/workbench/WorkbenchHome.vue
```

Expected: the new test contains only the todo layout contract; the Vue diff contains the todo markup/style changes plus pre-existing or concurrent layout-height changes outside the todo selectors. Do not stage or commit the Vue file because those unrelated changes share the same file.
