# 资料解析与预检工作台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/tasks/create` 第 4 步内实现与参考图一致、可交互且响应式的资料解析与预检工作台。

**Architecture:** 解析状态由纯函数模块统一管理；页面容器持有当前批次和选中文件，树、表格、详情均为受控组件。现有创建页只负责在 `parsing` 与 `template` 子阶段间切换，避免影响其他创建步骤与报告资料入库链。

**Tech Stack:** Vue 3 Composition API、Vite、Node test runner、Font Awesome Vue。

## Global Constraints

- 参考图 `codex-clipboard-2f25d8d3-80f2-484f-b477-2e9108c5d40f.png` 是唯一视觉真值；红框不进入 UI。
- 仅在解析子阶段隐藏顶栏“演示数据 有/无”，其他页面保留。
- 不修改全局 DataTable、MetricGrid、通用表格样式、store/mock 或 `/audit-report/material/*` 页面。
- 使用 Font Awesome，不新增手写 SVG、emoji 或 CSS 绘图。
- 每次改动后只运行直接相关测试；最终运行构建和浏览器验收。
- 已有文件修改前核对 SHA256；发现并发变化时先读取新版本再合并。

---

## 文件结构

- Create `src/domain/taskCreate/materialParsingState.js`：批次 fixtures、汇总、阻断和不可变状态转换。
- Create `tests/materialParsingState.test.js`：解析状态定向测试。
- Create `src/views/tasks/MaterialFileTree.vue`：目录树和批量动作。
- Create `src/views/tasks/MaterialFileTable.vue`：清单、选中、分页和行操作。
- Create `src/views/tasks/MaterialDetailRail.vue`：详情、时间线、折叠和处置动作。
- Create `src/views/tasks/MaterialParsingWorkspace.vue`：页面状态、总览、预检和响应式编排。
- Modify `src/views/tasks/TaskCreate.vue`：接入解析子阶段。
- Modify `src/components/layout/AppLayout.vue`：解析子阶段第三段面包屑和局部隐藏演示数据开关。
- Modify `docs/16-material-parsing-redline-rebuild/task_plan.md`：记录验收证据。
- Create/replace `design-qa.md`：本目标页最终视觉 QA。

### Task 1: 解析状态模型与定向测试

**Files:**
- Create: `src/domain/taskCreate/materialParsingState.js`
- Create: `tests/materialParsingState.test.js`

**Interfaces:**
- Produces: `createMaterialParsingBatch()`, `getParsingSummary(files)`, `getSelectedFile(files,id)`, `retryParsingFile(files,id)`, `replaceParsingFile(files,id,name)`, `skipParsingFile(files,id)`, `mapParsingField(files,id,source,target)`, `batchRetryParsing(files)`, `batchSkipParsing(files)`, `canContinueParsing(files)`。

- [ ] **Step 1: 写失败测试**：断言初始批次为 14 个文件，汇总固定为 76%、11/14、8/2/1/1/1，并覆盖失败、重复、格式异常和缺失必填字段。
- [ ] **Step 2: 验证红灯**：运行 `node --test tests/materialParsingState.test.js`，预期因模块不存在而失败。
- [ ] **Step 3: 实现最小纯函数**：所有转换返回新数组和新文件对象，不变异输入；跳过与字段映射解除对应阻断。
- [ ] **Step 4: 验证绿灯**：再次运行同一命令，预期全部通过。

### Task 2: 文件树与文件清单受控组件

**Files:**
- Create: `src/views/tasks/MaterialFileTree.vue`
- Create: `src/views/tasks/MaterialFileTable.vue`

**Interfaces:**
- `MaterialFileTree` consumes `files:Array`, `selectedId:String`; emits `select(id)`, `batch-retry`, `batch-skip`。
- `MaterialFileTable` consumes `files:Array`, `selectedId:String`; emits `select(id)`, `action({type,id})`, `page-change(page)`。

- [ ] **Step 1: 实现目录树**：使用原生 button/details 和 Font Awesome 文件类型图标，树正文独立滚动、批量操作固定。
- [ ] **Step 2: 实现桌面紧凑表格**：约 28px 行高，sticky 表头/操作列，状态标签同时含图标和文字，分页固定。
- [ ] **Step 3: 实现移动清单**：小于 768px 隐藏表格并显示卡片，保留文件名、状态、阻断与主要动作。
- [ ] **Step 4: 运行构建检查**：`npm run build`，预期 exit 0；不运行无关全量测试。

### Task 3: 右侧详情与处置组件

**Files:**
- Create: `src/views/tasks/MaterialDetailRail.vue`

**Interfaces:**
- Consumes `file:Object`, `open:Boolean`。
- Emits `close`, `retry(id)`, `replace({id,fileName})`, `skip(id)`, `map-field({id,source,target})`, `download-log(id)`。

- [ ] **Step 1: 实现详情分组与折叠**：基本信息、失败原因、缺失字段、影响能力、阻断状态和六个关联折叠区。
- [ ] **Step 2: 实现流程时间线**：完成为绿、当前解析失败为红、未开始为灰；桌面双列、窄屏纵向。
- [ ] **Step 3: 实现底部动作**：重新解析、隐藏 file input 替换、跳过确认和下载日志，所有按钮具备可访问名称与焦点态。
- [ ] **Step 4: 运行构建检查**：`npm run build`，预期 exit 0。

### Task 4: 工作台编排与预检区

**Files:**
- Create: `src/views/tasks/MaterialParsingWorkspace.vue`

**Interfaces:**
- Consumes `sourceMaterials:Array`。
- Emits `save-draft`, `back`, `continue`。
- Uses Task 1 state functions and Task 2/3 components。

- [ ] **Step 1: 实现总览**：渲染 76% 和五类统计卡，数据全部来自 `getParsingSummary`。
- [ ] **Step 2: 实现三栏主区**：目录树、文件清单、字段映射/汇总/阻断建议、右详情共用 `selectedId`。
- [ ] **Step 3: 连接状态转换**：行操作、批量动作、重试、替换、跳过、字段映射与下载日志更新同一文件数组。
- [ ] **Step 4: 实现流程门禁**：`canContinueParsing(files)` 为假时禁用下一步并显示原因；无阻断时 emit `continue`。
- [ ] **Step 5: 实现双形态**：显示器保持原尺寸完整三栏；笔记本 1366/1440 以 1608 × 1014 为设计画布，按宽高较小比例整体缩放并水平居中，禁止抽屉化和信息重排。
- [ ] **Step 6: 运行定向测试与构建**：`node --test tests/materialParsingState.test.js` 和 `npm run build` 均 exit 0。

### Task 5: 接入创建流程与顶栏

**Files:**
- Modify: `src/views/tasks/TaskCreate.vue`
- Modify: `src/components/layout/AppLayout.vue`

**Interfaces:**
- `TaskCreate` imports `MaterialParsingWorkspace`。
- `TaskCreate` sets a local `stepFourStage` of `parsing | template` and exposes stage to layout through route query `phase=parse` only while parsing is visible。

- [ ] **Step 1: 复核并发哈希**：与任务开始记录的哈希比较；若变化，读取新版本并只手工合并接入点。
- [ ] **Step 2: 接入解析子阶段**：资料选择通过后进入 `step=3, stepFourStage='parsing'`；继续后显示原模板摘要；返回回到资料选择。
- [ ] **Step 3: 接入面包屑与顶栏规则**：解析子阶段显示“审计工作台 / 创建审计任务 / 资料解析”，并仅此状态隐藏演示数据开关。
- [ ] **Step 4: 运行相关测试**：`node --test tests/taskCreateForm.test.js tests/materialParsingState.test.js`，预期全部通过。
- [ ] **Step 5: 运行构建**：`npm run build`，预期 exit 0。

### Task 6: 浏览器视觉校正与验收

**Files:**
- Modify only files proven necessary by observed P0/P1/P2 differences。
- Modify: `design-qa.md`
- Modify: `docs/16-material-parsing-redline-rebuild/task_plan.md`

- [ ] **Step 1: 进入目标状态**：从 `/tasks/create` 完成基础信息、能力和资料选择，进入解析子阶段。
- [ ] **Step 2: 同尺寸捕获**：在 1608 × 1014 捕获实现图，并与参考图组合比较区域边界、字号、行高、色彩和状态。
- [ ] **Step 3: 修复 P0/P1/P2**：一次只修复一类可见差异，每次只跑受影响测试/构建。
- [ ] **Step 4: 双形态验证**：1366 × 768、1440 × 900、1608 × 1014、1920 × 1080 页面级横向溢出为 0，控制台无 error/warning。
- [ ] **Step 5: 交互验证**：选择行、展开折叠、字段映射、重试、替换、跳过、分页、批量动作、下载日志和流程门禁均可操作。
- [ ] **Step 6: 写 QA 证据**：仅当参考图与实现图均已查看且 P0/P1/P2 清零时，`design-qa.md` 写 `final result: passed`。

## 计划自审

- 规格覆盖：A–E 区域、子阶段流程、响应式、交互、图标约束和 QA 均有对应任务。
- 占位符扫描：无 TBD、TODO 或“稍后实现”项。
- 接口一致性：所有子组件 props/emits 与工作台消费关系已明确；状态函数命名在各任务中一致。
- 并发冲突：子代理仅创建新文件；已有文件只由主代理修改。
