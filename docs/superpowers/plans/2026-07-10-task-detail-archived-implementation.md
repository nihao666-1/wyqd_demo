# Task Detail Archived Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `test-driven-development` and `incremental-implementation` task-by-task. This worktree contains unrelated user changes; do not commit, reset, clean, or modify files outside the listed scope.

**Goal:** Build a responsive, read-only archived task detail matching the 1600×995 reference and synchronize `TASK-20250428001` with the archived state in the task list.

**Architecture:** A single immutable archive snapshot drives all repeated values. `TaskDetail.vue` dispatches the target archived task to a dedicated `TaskDetailArchived.vue`, while `AppLayout.vue` adds a route-scoped shell class. All dense visual styles remain component-scoped.

**Tech Stack:** Vue 3, Vue Router 4, Vite 6, Node test runner, `@vue/compiler-sfc`, existing Font Awesome icons.

## Global Constraints

- Use the 1600×995 reference as the only pixel baseline; red boxes are annotations only.
- Keep 6 outcomes, 5 versions, 6 exports, 1 review, and 8 timeline nodes.
- Keep `V1.2`, `2025-04-28 16:30`, `已通过`, and `6 份` consistent everywhere.
- Allow view/download/copy/reference actions only; unlock is disabled; no write actions.
- Preserve other task states and routes.
- Do not introduce dependencies or change global table/panel styles.
- Test only files directly affected by each increment; run one final production build.

---

### Task 1: Archived snapshot and task-list consistency

**Files:**
- Create: `src/domain/taskDetail/archivedTaskDetail.js`
- Modify: `src/views/tasks/taskCenterData.js`
- Test: `tests/taskDetailArchivedState.test.js`

**Interfaces:**
- Produces: `ARCHIVED_TASK_ID`, `archivedTaskDetail`, `archivedAllowedActions`, `isArchivedTask(task)`.
- `archivedTaskDetail` exposes `meta`, `tabs`, `outcomes`, `versions`, `exports`, `review`, `timeline`, `relations`, and `sidebar`.

- [ ] Write tests asserting target task `statusKey === 'archived'`, `progress === 100`, counts `6/5/6/1/8`, shared summary values, and exact allowed actions.
- [ ] Run `node --test tests/taskDetailArchivedState.test.js`; expect failure because the module does not exist and the task is still generating.
- [ ] Add the immutable snapshot and update only the target row in `taskCenterData.js`.
- [ ] Re-run the same test; expect all assertions to pass.

### Task 2: Archived detail component structure and read-only semantics

**Files:**
- Create: `src/views/tasks/TaskDetailArchived.vue`
- Test: `tests/taskDetailArchivedComponents.test.js`

**Interfaces:**
- Consumes: `archivedTaskDetail` from Task 1.
- Produces: `data-archive-region` markers for `header`, `metadata`, `tabs`, `notice`, `outcomes`, `records`, `review-trail`, `relations`, and `sidebar`.
- Emits no mutation events; interaction feedback stays local in an `aria-live` region.

- [ ] Write a compile/structure test using `@vue/compiler-sfc`; assert all nine region markers, six outcome iterations, both tables, eight timeline nodes, and a disabled unlock button.
- [ ] Run `node --test tests/taskDetailArchivedComponents.test.js`; expect failure because the component does not exist.
- [ ] Implement semantic template and minimal scoped styles for the reference information architecture.
- [ ] Re-run the same test; expect all assertions to pass.

### Task 3: Detail dispatch and route-scoped application shell

**Files:**
- Modify: `src/views/tasks/TaskDetail.vue`
- Modify: `src/components/layout/AppLayout.vue`
- Test: `tests/taskDetailArchivedComponents.test.js`

**Interfaces:**
- `TaskDetail.vue` renders `<TaskDetailArchived />` when `isArchivedTask(selectedTask)` is true, otherwise renders the existing detail body.
- `AppLayout.vue` adds `task-archived-shell` only when route path is `/tasks/detail` and the target task is archived.

- [ ] Extend the component test to assert the import/dispatch and shell class/breadcrumb markers.
- [ ] Run the test and verify the new assertions fail.
- [ ] Add the smallest conditional wrapper around the current detail and the route-specific shell class.
- [ ] Re-run `node --test tests/taskDetailArchivedComponents.test.js` and `node --test tests/taskListState.test.js`; expect passes.

### Task 4: Pixel-density styling and responsive scaling

**Files:**
- Modify: `src/views/tasks/TaskDetailArchived.vue`
- Modify: `src/components/layout/AppLayout.vue`
- Modify: `src/styles/layout.css`
- Test: `tests/taskDetailArchivedComponents.test.js`

**Interfaces:**
- Root provides `--archive-scale` from viewport width with a minimum of 0.85 and maximum of 1.
- Route-scoped shell fixes 208px sidebar and 62px topbar without changing other routes.

- [ ] Extend structure tests for the 1600px design width, 249px sidebar, six-column outcome grid, dual-record grid, and `clamp(0.85` scaling rule.
- [ ] Run the component test and verify the style assertions fail.
- [ ] Implement the scoped visual system and route-limited shell overrides.
- [ ] Re-run the component test; expect pass.

### Task 5: Browser visual convergence

**Files:**
- Modify as evidence requires: `src/views/tasks/TaskDetailArchived.vue`, `src/components/layout/AppLayout.vue`, `src/styles/layout.css`
- Update: `docs/19-task-detail-archived-redline-rebuild/visual_acceptance.md`
- Update: `design-qa.md`

- [ ] At 1600×995 capture the implementation; record DOM bounds and compare every region with the reference target, classifying P0/P1/P2 differences.
- [ ] Fix one visual cluster at a time and re-run only `tests/taskDetailArchivedComponents.test.js` after source edits.
- [ ] Repeat at 1440×900, 1366×768, and 1920×1080; assert no body horizontal overflow and no right-column drop.
- [ ] Check console error/warning output and keyboard focus order.
- [ ] Update acceptance evidence only with observed values.

### Task 6: Final related verification

**Files:**
- Review only the files listed above plus task documents.

- [ ] Run `node --test tests/taskDetailArchivedState.test.js`.
- [ ] Run `node --test tests/taskDetailArchivedComponents.test.js`.
- [ ] Run `node --test tests/taskListState.test.js` because the target row changed.
- [ ] Run `npm run build` once after the final source edit.
- [ ] Re-read the reference, design spec, task book, and acceptance matrix; verify every explicit requirement has current evidence.
- [ ] Inspect `git diff` only for the listed scope and confirm unrelated user changes were preserved.

