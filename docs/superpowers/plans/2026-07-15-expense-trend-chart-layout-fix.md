# Expense Trend Chart Layout Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore stable, readable rendering for the four expense trend charts without changing global viewport scaling or other pages.

**Architecture:** Keep the existing Vue component and hand-built charts. Add a focused CSS/markup contract that controls chart-row height, chart-local typography, percentage-based plot sizing, deterministic month labels, and scatter padding.

**Tech Stack:** Vue 3 SFC, scoped CSS, Node test runner, Playwright browser verification.

## Global Constraints

- Only modify the expense trend dashboard and its focused test.
- Do not change global viewport tokens or install a chart library.
- Run only expense-trend-focused automated tests plus the three requested browser viewports.

---

### Task 1: Stabilize the four chart panels

**Files:**
- Modify: `src/views/expense/ExpenseUsageDashboard.vue`
- Test: `tests/expenseTrendDashboard.test.js`

**Interfaces:**
- Consumes: existing `expenseTrendAnalysis` mock data and the `.chart-row` DOM structure.
- Produces: four equal-height chart panels with deterministic internal plot geometry.

- [x] **Step 1: Write the failing chart-layout regression test**

Add assertions for chart-local height control, deterministic two-line month labels, percentage-based bar sizing, compact rank rows, and scatter plot padding.

- [x] **Step 2: Verify the regression test fails**

Run: `node --test tests/expenseTrendDashboard.test.js`

Expected: the new chart-layout test fails because the current component still uses automatic panel height, fixed-pixel bars, automatic date wrapping, global auxiliary font sizing, and an unpadded scatter plot.

- [x] **Step 3: Implement the minimal chart-local fix**

Update only the chart template bindings and scoped chart CSS. Keep data, routes, actions, other dashboard sections, and global styles unchanged.

- [x] **Step 4: Verify the focused test passes**

Run: `node --test tests/expenseTrendDashboard.test.js`

Expected: all expense trend tests pass with zero failures.

- [x] **Step 5: Verify in the browser**

Capture and inspect `/expense/usage/dashboard` at 1366×768, 1588×995, and 2048×1061. Confirm equal panel heights, readable labels, complete ranking, unclipped scatter points, no page-level horizontal overflow, and no console errors.
