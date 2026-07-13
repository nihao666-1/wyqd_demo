# 创建任务第 5 步“确认提交”复刻实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增可独立接入的“模板与输出设置”状态模型和 Vue 组件，完整承载参考图的九项能力、八张配置卡、四项全局设置及右侧提交前确认，并在显示器原始比例/放大与笔记本整页缩放两档下保持同一信息结构。

**Architecture:** `TaskCreate.vue` 仍是五步状态拥有者；纯函数模块负责默认值、映射、摘要与校验，三个展示组件通过 props/emits 组成第 5 步确认提交页。第 4 步解析/模板设置完成后进入本页。

**Tech Stack:** Vue 3 `<script setup>`、Vite 6、Node `node:test`、原生 CSS。

## Global Constraints

- 不修改 `TaskCreate.vue`、`AppLayout.vue`、任何 `MaterialParsing*`、`materialParsingState.js` 或 `docs/16-material-parsing-redline-rebuild/`，直到并行资料解析任务交还接入权。
- 不新增依赖、不修改路由、不清理无关代码、不运行全量测试。
- 新增逻辑严格先写失败测试；每个增量只运行对应测试。
- 不提交当前共享脏工作树；所有新增文件保持可独立审阅和撤销。

---

### Task 1：第 4 步纯状态与摘要

**Files:**

- Create: `tests/taskTemplateOutputSettings.test.js`
- Create: `src/domain/taskCreate/taskTemplateOutputSettings.js`

**Produces:**

- `capabilityDefinitions`
- `configurationGroups`
- `referenceTaskSummary`
- `referenceMaterials`
- `createTemplateOutputSettings()`
- `cloneTemplateOutputSettings(settings)`
- `getVisibleSettingGroups(selectedCapabilityIds)`
- `createPreSubmitSummary({ taskSummary, selectedCapabilityIds, materials, settings })`
- `validateTemplateOutputSettings(settings, selectedCapabilityIds)`

- [x] **Step 1: Write failing tests** covering nine capabilities/eight groups, fresh nested arrays, nine outputs, five materials, one missing-material risk, and field-level validation.
- [x] **Step 2: Run red** with `node --test tests/taskTemplateOutputSettings.test.js`; observed `ERR_MODULE_NOT_FOUND`.
- [x] **Step 3: Implement only the named exports** with plain objects and pure functions; no Vue/store imports.
- [x] **Step 4: Run green** with the same command; six subtests pass and zero failures.

### Task 2：八张能力配置卡

**Files:**

- Create: `src/views/tasks/TaskTemplateOutputCardGrid.vue`

**Consumes:** complete settings object from Task 1.

**Produces:** `update:modelValue` with a deep-cloned complete object.

- [x] **Step 1: Add semantic source contract before implementation**: eight section headings, all exact field labels/defaults, native control types, `data-config-group` markers.
- [x] **Step 2: Implement six ordinary cards plus two report cards**; first card binds two capability IDs; do not use a schema form generator.
- [x] **Step 3: Implement immutable updates** for scalar, boolean and array fields.
- [x] **Step 4: Add scoped layout**: three columns, explicit tall/compact rows, report row `45fr 55fr`, 28px controls, 88px label track.
- [x] **Step 5: Run focused SFC compilation** through the existing Vue compiler; component compiles without error. Full app build remains in the integration task because the component is intentionally not mounted yet.

### Task 3：提交前确认右栏

**Files:**

- Create: `src/views/tasks/TaskCreateConfirmationAside.vue`

**Consumes:** `summary` returned by `createPreSubmitSummary`.

**Produces:** `request-summary-detail(section)`.

- [x] **Step 1: Render five ordered sections**: task, capabilities, materials, outputs, risk.
- [x] **Step 2: Preserve exact counts and two-column lists** with stable `data-confirm-section` markers.
- [x] **Step 3: Use buttons for 查看更多/查看详情** and emit the requested section.
- [x] **Step 4: Add compact table and warning styles** without fixed height or nested scrolling.
- [x] **Step 5: Run focused SFC compilation**; component compiles without error.

### Task 4：确认提交组合容器

**Files:**

- Create: `src/views/tasks/TaskCreateTemplateOutputStep.vue`

**Consumes:** model, steps, currentStep, taskSummary, selectedCapabilities, materials.

**Produces:** `update:modelValue`, `request-save`, `request-previous`, `request-submit`, `request-summary-detail`.

- [x] **Step 1: Render page title, five-step navigation and intro** with current step 5 and completed 1–4.
- [x] **Step 2: Compose card grid and confirmation aside** using pure derived summary.
- [x] **Step 3: Render four global setting tiles and exact bottom actions**.
- [x] **Step 4: Apply desktop base layout**: golden double column, `3 + 3 + 2` cards, `45:55` report row and fixed confirmation rail proportions.
- [x] **Step 5: Add near-submit risk repeat** for layouts where confirmation is stacked.
- [x] **Step 6: Run both new test files and focused SFC compilation**; ten tests pass and all three components compile. Full Vite build is deferred until parent integration makes the new import reachable.

### Task 5：共享文件接入

**Files:**

- Modify later: `src/views/tasks/TaskCreate.vue`
- Modify later if still required: `src/components/layout/AppLayout.vue`
- Modify later: `src/domain/taskCreate/taskCreateForm.js`
- Modify later: `tests/taskCreateForm.test.js`

**Interfaces:** mount `TaskCreateTemplateOutputStep` when `step === 3`; pass the parent-owned state; extend draft snapshot with an optional fourth argument; add `report-review`; keep the material parsing changes intact.

- [x] **Step 1: Re-read this plan and inspect the final concurrent diff before editing.**
- [x] **Step 2: Write failing integration tests** for template routing, nine abilities, independent component mounting and submit handling.
- [x] **Step 3: Make the smallest parent integration change** without reformatting or replacing material parsing work.
- [x] **Step 4: Run only task-create and template-output tests, then build.**
- [x] **Step 5: Perform real-browser multi-viewport verification and two original-image comparison rounds.**

**Scale contract:** 显示器保持原始结构并按可用画布适度放大；笔记本复用同一画布并整体等比缩放。不得为了适配笔记本把确认栏下沉、改抽屉或把能力卡改成两列/单列。

## Plan self-review

- Coverage: R01–R20 均已实现并在真实路由完成两轮原图复核。
- Consistency: all components consume the same settings and summary names defined by Task 1.
- No placeholders: parsing/template 共享流程、缩放、保存、返回、提交与详情入口均有真实接入。
