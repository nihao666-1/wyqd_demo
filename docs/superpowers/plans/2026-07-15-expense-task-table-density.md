# Expense Task Table Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the wide-screen expense task panel full-height while rendering its four populated task rows at the existing compact 42px height.

**Architecture:** Add a data-mode-only override inside the existing `min-width: 1701px` media query. The override resets the table structural elements to natural height and reasserts the existing 42px cell height, leaving the empty mode and all other sections unchanged.

**Tech Stack:** Vue 3 single-file component, scoped CSS, Node.js built-in test runner.

## Global Constraints

- Modify only the lower populated expense task table behavior.
- Preserve the full-height task panel and table wrapper.
- Preserve the existing 42px populated-row height.
- Do not modify the hero, entry cards, source panel, task data, routes, or other viewport rules.
- Run only the directly related expense workbench test file.

---

### Task 1: Restore compact populated rows on wide screens

**Files:**
- Modify: `tests/expenseWorkbenchEmpty.test.js`
- Modify: `src/views/expense/ExpenseWorkbench.vue:414-438`

**Interfaces:**
- Consumes: Existing `.expense-data-task-panel` class and the `@media (min-width: 1701px)` wide-screen layout rules.
- Produces: Data-mode table rows that remain 42px high while the surrounding task panel retains flexible height.

- [ ] **Step 1: Write the failing regression test**

Append this test to `tests/expenseWorkbenchEmpty.test.js`:

```js
test('费用审计有数据态宽屏任务行保持紧凑高度', () => {
  const content = read(workbenchUrl);
  assert.match(
    content,
    /@media \(min-width: 1701px\)[\s\S]*?\.expense-data-task-panel \.expense-table-wrap table,\s*\.expense-data-task-panel \.expense-table-wrap tbody,\s*\.expense-data-task-panel \.expense-table-wrap tr\s*\{\s*height:\s*auto;\s*\}/
  );
  assert.match(
    content,
    /@media \(min-width: 1701px\)[\s\S]*?\.expense-data-task-panel \.expense-table-wrap td\s*\{\s*height:\s*42px;\s*\}/
  );
});
```

- [ ] **Step 2: Run the focused test and verify the regression test fails**

Run:

```powershell
node --test tests/expenseWorkbenchEmpty.test.js
```

Expected: the new test fails because the wide-screen data-mode overrides do not yet exist; the pre-existing tests remain passing.

- [ ] **Step 3: Add the minimal scoped CSS override**

Inside the existing `@media (min-width: 1701px)` block in `src/views/expense/ExpenseWorkbench.vue`, immediately after the shared full-height table selector, add:

```css
  .expense-data-task-panel .expense-table-wrap table,
  .expense-data-task-panel .expense-table-wrap tbody,
  .expense-data-task-panel .expense-table-wrap tr {
    height: auto;
  }

  .expense-data-task-panel .expense-table-wrap td {
    height: 42px;
  }
```

This higher-specificity data-mode rule overrides the shared `height: 100%` table-row behavior without changing the empty-state table.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```powershell
node --test tests/expenseWorkbenchEmpty.test.js
```

Expected: all tests in `expenseWorkbenchEmpty.test.js` pass with zero failures.

- [ ] **Step 5: Verify the target page at the reported wide viewport**

Open `/expense/workbench` with demo data enabled at `2048x1050` and verify:

- The four task rows are consecutive and approximately 42px high.
- The task panel still extends to the bottom of the main content column.
- Remaining vertical space appears below the table rather than inside its rows.
- The hero, three entry cards, and right-side source panel are unchanged.
- Browser console contains no new errors.

- [ ] **Step 6: Commit only the focused implementation files**

```powershell
git add -- tests/expenseWorkbenchEmpty.test.js src/views/expense/ExpenseWorkbench.vue
git commit -m "fix: keep expense task rows compact on wide screens"
```
