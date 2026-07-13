# 任务详情“生成中”复刻实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change. Execute tasks sequentially because all agents share one dirty worktree; use read-only subagents for measurement and review, never parallel source edits.

**Goal:** 将 `/tasks/detail` 实现为与 1586×993 参考图一致、可缩放、可交互的九能力执行驾驶舱。

**Architecture:** 页面使用专属确定性快照，避免全局持久化 mock 污染；左侧执行区和右侧日志区拆成两个展示组件，父页面负责编排与轻交互；应用壳只增加详情页变体。

**Tech Stack:** Vue 3、Vue Router、Vite、Node test runner、Font Awesome、项目既有 CSS token。

## Global Constraints

- 唯一视觉基准为 `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-f3549783-9cc6-482f-bf2e-ef5aed30cf36.png`，1586×993；红框不渲染。
- 初始可见快照保留 `生成中 / 63% / 完成4 / 进行中3 / 待执行2 / 失败0`，同时保留参考图九卡的逐项状态。
- 1366×768、1440×900 保持 3×3 能力卡和右栏同排；1920×1080 不出现大面积空白。
- 不新增依赖，不引入后端、轮询或伪造计时器。
- 不修改无关业务页，不重写通用 CSS，不清理用户已有改动。
- 每次代码改动后只运行当前任务明确列出的测试。
- 仓库无初始提交且已有大量用户暂存内容；本轮不执行 commit、reset、checkout 或清理操作，以逐文件 diff 和任务书状态作为安全检查点。

---

### Task 1: 建立九能力执行快照

**Files:**
- Create: `src/views/tasks/taskDetailExecutionData.js`
- Create: `tests/taskDetailExecutionData.test.js`

**Interfaces:**
- Produces: `taskDetailExecutionSnapshot`、`getTaskDetailExecutionSnapshot(taskId)`。
- `getTaskDetailExecutionSnapshot()` 无匹配项时返回目标任务快照的新对象；能力数组字段固定包含 `id/index/name/description/status/progress/currentStep/dependency/input/output/actions`。

- [ ] **Step 1: 写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskDetailExecutionSnapshot } from '../src/views/tasks/taskDetailExecutionData.js';

test('生成中详情快照包含九能力和设计图汇总口径', () => {
  const snapshot = getTaskDetailExecutionSnapshot('TASK-20250428001');
  assert.equal(snapshot.task.progress, 63);
  assert.deepEqual(snapshot.summary.map((item) => item.value), [4, 3, 2, 0]);
  assert.equal(snapshot.capabilities.length, 9);
  assert.deepEqual(snapshot.capabilities.map((item) => item.name), [
    '制度查询', '制度变更', '制度比对', '监管案例舆情分析', '审计规范生成',
    '监督共享信息分析', '费用审计', '报告生成', '报告审核'
  ]);
});
```

- [ ] **Step 2: 验证测试因模块缺失而失败**

Run: `node --test tests/taskDetailExecutionData.test.js`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND`。

- [ ] **Step 3: 实现最小快照模块**

模块必须包含参考图中的任务元数据、11 页签、六步流程、四项汇总、九能力、6 条日志、4 步模型步骤、4 条来源快照和2条待处理事项；`getTaskDetailExecutionSnapshot` 使用 `structuredClone` 返回隔离副本。

- [ ] **Step 4: 验证数据测试通过**

Run: `node --test tests/taskDetailExecutionData.test.js`

Expected: PASS，1 个测试、0 失败。

- [ ] **Step 5: 记录安全检查点**

Run: `git diff -- src/views/tasks/taskDetailExecutionData.js tests/taskDetailExecutionData.test.js`

Expected: 只包含本任务两个新文件。

---

### Task 2: 增加任务详情专属应用壳

**Files:**
- Modify: `src/components/layout/AppLayout.vue`
- Modify: `src/styles/layout.css`
- Create: `tests/taskDetailLayout.test.js`

**Interfaces:**
- Produces: `.task-detail-shell`；`isTaskDetailRoute`；面包屑“任务中心 / 任务详情”。
- Preserves: `isTaskRoute` 仅服务 `/tasks` 与 `/tasks/create`；解析页和模板页 class 不变。

- [ ] **Step 1: 写失败结构测试**

测试读取 `AppLayout.vue` 和 `layout.css`，断言存在 `task-detail-shell`、`route.path === '/tasks/detail'`、任务详情面包屑，以及详情页隐藏 `.global-data-mode` 的专属规则。

- [ ] **Step 2: 运行测试并确认缺少专属壳**

Run: `node --test tests/taskDetailLayout.test.js`

Expected: FAIL，首个失败断言包含 `task-detail-shell`。

- [ ] **Step 3: 实现专属 class 与面包屑**

在根 class 对象增加 `'task-detail-shell': isTaskDetailRoute`；顶栏分支在通用任务创建分支之前渲染“任务中心 / 任务详情”；详情路由不显示演示数据切换。样式只限定 `.task-detail-shell`，不更改通用侧栏断点。

- [ ] **Step 4: 验证壳层测试**

Run: `node --test tests/taskDetailLayout.test.js`

Expected: PASS，0 失败。

- [ ] **Step 5: 检查只改必要行**

Run: `git diff -- src/components/layout/AppLayout.vue src/styles/layout.css tests/taskDetailLayout.test.js`

Expected: 不包含其他路由、导航项目或通用面板重构。

---

### Task 3: 实现左侧执行区

**Files:**
- Create: `src/views/tasks/TaskCapabilityExecutionGrid.vue`
- Create: `tests/taskDetailComponents.test.js`

**Interfaces:**
- Consumes: `stages`、`summary`、`capabilities` props。
- Emits: `view-log(capability)`、`view-result(capability)`、`run-background(capability)`。
- Produces data markers: `data-detail-region="stage-summary"`、`capability-grid`、`execution-table`。

- [ ] **Step 1: 写失败 SFC 测试**

测试使用 `@vue/compiler-sfc` 解析组件，断言三个区域标记、三个 `v-for`、九能力动作事件、语义化 `<table>` 和 `grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.18fr)`。

- [ ] **Step 2: 验证组件缺失失败**

Run: `node --test tests/taskDetailComponents.test.js`

Expected: FAIL，错误包含 `ENOENT`。

- [ ] **Step 3: 实现流程与汇总**

六节点流程使用有序列表；完成节点、当前节点和待开始节点均有文字状态。四项汇总使用四列定义列表，不从能力数组重新计算。

- [ ] **Step 4: 实现 3×3 能力卡**

卡片使用 `article`；状态、进度和依赖均为文字；完成态提供查看日志/结果，进行态提供查看日志/后台运行，待执行两按钮禁用。按钮事件只向父级上抛。

- [ ] **Step 5: 实现执行明细**

表格七列：能力、当前步骤、输入资料、输出结果、进度、状态、操作。每行从同一 `capabilities` 生成；使用局部滚动容器隔离全局表格宽度。

- [ ] **Step 6: 运行组件测试**

Run: `node --test tests/taskDetailComponents.test.js`

Expected: PASS，0 失败。

---

### Task 4: 实现右侧实时日志栏

**Files:**
- Create: `src/views/tasks/TaskExecutionLogRail.vue`
- Modify: `tests/taskDetailComponents.test.js`

**Interfaces:**
- Consumes: `logs`、`modelSteps`、`sources`、`failures`、`pendingItems`、`activeCapabilityId` props。
- Emits: `show-all-logs`、`view-source(source)`、`handle-pending(item)`。
- Produces data markers: `execution-log`、`failure-retry`、`pending-reminders`。

- [ ] **Step 1: 增加失败测试**

断言右栏三个区域标记、6 条日志循环、4 步模型轨道、来源“查看”按钮、失败空状态和两条待办按钮均存在。

- [ ] **Step 2: 运行并确认新增断言失败**

Run: `node --test tests/taskDetailComponents.test.js`

Expected: FAIL，首个失败断言包含 `execution-log`。

- [ ] **Step 3: 实现右栏组件**

主面板内部用三个 section 和细分隔线；日志圆点使用 class 与文本能力名；模型当前步骤提供 `aria-current="step"`；来源与待办使用语义按钮；失败空状态为绿色文字。

- [ ] **Step 4: 运行组件测试**

Run: `node --test tests/taskDetailComponents.test.js`

Expected: PASS，0 失败。

---

### Task 5: 重写任务详情编排与交互

**Files:**
- Modify: `src/views/tasks/TaskDetail.vue`
- Create: `tests/taskDetailIntegration.test.js`

**Interfaces:**
- Consumes: `getTaskDetailExecutionSnapshot`、`TaskCapabilityExecutionGrid`、`TaskExecutionLogRail`。
- Produces: 顶部 `data-detail-region="task-header"`、11 页签、`.task-detail-workspace`、结果/阻断抽屉和 `aria-live` 状态。

- [ ] **Step 1: 写失败集成测试**

断言旧 `PageHeader/PageState/MetricGrid/DataTable` 不再导入；新数据函数和两个组件已导入；任务头包含 `生成中`、`63%`、`V0.9`；存在后台运行、暂停任务、查看日志；初始页签为 `analysis`；存在抽屉和事件处理函数。

- [ ] **Step 2: 运行并确认旧页面不满足契约**

Run: `node --test tests/taskDetailIntegration.test.js`

Expected: FAIL，首个失败断言为新数据函数或新组件缺失。

- [ ] **Step 3: 重写模板和本地状态**

移除通用台账组件；使用目标快照渲染任务头、元数据、进度、版本、动作、页签和双栏。创建 `isPaused`、`activeCapabilityId`、`drawerState`、`liveMessage` 四个本地状态。

- [ ] **Step 4: 实现确定性交互**

暂停切换只改变按钮和 `aria-live`；后台运行设置关注能力；查看日志聚焦右栏；查看结果/来源/待办打开同一抽屉；关闭抽屉恢复触发按钮焦点。不得添加定时器。

- [ ] **Step 5: 实现详情页专属样式**

根部定义设计宽度、颜色和缩放变量；双栏使用约 3.23:1；任务头、页签、区块间距严格按设计文档；所有选择器以 `.task-detail-` 开头或组件 scoped。

- [ ] **Step 6: 运行集成测试**

Run: `node --test tests/taskDetailIntegration.test.js`

Expected: PASS，0 失败。

---

### Task 6: 完成缩放与低高度规则

**Files:**
- Modify: `src/views/tasks/TaskDetail.vue`
- Modify: `tests/taskDetailIntegration.test.js`

**Interfaces:**
- Produces: `updateTaskDetailScale()`；CSS 变量 `--task-detail-scale`、`--task-detail-offset-x`、`--task-detail-density`。

- [ ] **Step 1: 增加失败测试**

断言设计宽度为 1586；1366 和 1440 以宽度比计算缩放；1586 以上不缩小；存在低高度 class/变量；1200px 以下才重排右栏和能力列。

- [ ] **Step 2: 运行并确认缩放契约失败**

Run: `node --test tests/taskDetailIntegration.test.js`

Expected: FAIL，错误包含 `DESIGN_WIDTH` 或缩放变量。

- [ ] **Step 3: 实现缩放函数与清理**

组件挂载时连接 `.task-detail-shell`，监听 resize，卸载时移除监听与 CSS 变量；1366–1585 根据视口宽度缩放，低高度设置紧凑密度，1586 以上恢复 1。

- [ ] **Step 4: 实现媒体查询**

1366×768 紧凑任务头、流程、卡片和表格行高；1440×900 只轻度紧凑；1920 限制内容约 1600px；1199 以下右栏下移、能力两列。页面根不设置固定最小宽。

- [ ] **Step 5: 运行直接相关测试和构建**

Run: `node --test tests/taskDetailExecutionData.test.js tests/taskDetailLayout.test.js tests/taskDetailComponents.test.js tests/taskDetailIntegration.test.js`

Expected: 所有任务详情测试 PASS、0 失败。

Run: `npm run build`

Expected: Vite build exit code 0。

---

### Task 7: 浏览器视觉 QA 与差异循环

**Files:**
- Create: `docs/18-task-detail-generating-redline-rebuild/screenshots/`
- Modify: `design-qa.md`
- Modify: `docs/18-task-detail-generating-redline-rebuild/visual_acceptance.md`
- Modify: `docs/18-task-detail-generating-redline-rebuild/notes.md`
- Modify: `docs/18-task-detail-generating-redline-rebuild/task_plan.md`

**Interfaces:**
- Consumes: 本地 `/tasks/detail?taskId=TASK-20250428001`。
- Produces: 五视口截图、同尺寸对照图、DOM/控制台证据和最终 QA 结论。

- [ ] **Step 1: 启动本地页面**

Run: `npm run dev -- --port 5173 --strictPort`

Expected: Vite 报告本地服务已启动；记录进程并在验收后终止。

- [ ] **Step 2: 用内置浏览器检查交互和控制台**

依次验证顶部动作、能力日志过滤、查看结果抽屉、来源查看和待处理项；记录 console error/warning 数量。

- [ ] **Step 3: 截取五个视口**

尺寸：1586×993、1600×1000、1366×768、1440×900、1920×1080。每个视口断言：

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

并保存截图到本轮 screenshots 目录。

- [ ] **Step 4: 进行同视口设计对照**

把 1586×993 参考图与实现截图放入同一对照图；按任务头、流程统计、九卡、明细、日志、失败、待办七组记录 P0/P1/P2/P3。

- [ ] **Step 5: 修复 P0/P1/P2 并重复相关测试**

每次只重跑受影响的任务详情测试和受影响视口截图；不为 P3 无限循环。

- [ ] **Step 6: 最终验证**

Run: `node --test tests/taskDetailExecutionData.test.js tests/taskDetailLayout.test.js tests/taskDetailComponents.test.js tests/taskDetailIntegration.test.js`

Run: `npm run build`

Expected: 两条命令均 exit code 0；浏览器 console 0 error；五视口无页面横滚。

- [ ] **Step 7: 更新证据文档**

`design-qa.md` 写入本轮 source、实现截图、各视口证据、差异循环和 `final result: passed`；任务书阶段全部勾选，notes 记录最终缩放系数与剩余 P3。

## 计划自审

- 规格覆盖：任务头、流程、四项统计、九能力、右栏三面板、执行明细、交互、响应式和视觉对照均有独立任务。
- 范围检查：未引入后端、新路由、UI 框架或全局重构。
- 类型一致：九能力从 `taskDetailExecutionSnapshot.capabilities` 同时提供给卡片和明细；右栏事件全部由 `TaskDetail.vue` 处理。
- 测试纪律：每个生产代码任务先写失败测试并观察预期失败，再实现最小代码。
- 安全检查：由于无可用 Git 基线且用户已有大量暂存文件，计划明确不提交、不重置，只做逐文件 diff。

