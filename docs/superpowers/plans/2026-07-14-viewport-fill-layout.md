# 全站可用视口填充与配置中心留白修复实施计划

> **已被替代：** 用户后续确认采用“2560×1440 基准视觉缩放 + 原生布局铺满”的混合方案。请执行 [2026-07-14-hybrid-viewport-scaling.md](./2026-07-14-hybrid-viewport-scaling.md)，不要继续按本文的“完全不缩放”前提实施。

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task by task.

**Goal:** 让工作台、列表、配置中心、结果页和编辑器真正使用路由区域的可用高度，把额外空间分配给主数据区和内部滚动区；表单、向导仍保持自然高度。

**Architecture:** 由共享布局建立唯一的纵向高度传递链：`AppLayout.main -> .route-content -> opt-in page root -> flexible workspace -> internal scroll region`。页面通过 `.route-fill-page` 明确选择“占满工作区”，不使用全局 `height: 100%`、`zoom`、`transform: scale()` 或按顶栏高度硬编码的 `calc(100dvh - Npx)`。

**Tech Stack:** Vue 3 SFC、Vue Router、CSS Grid/Flexbox、Node 定向测试、桌面 Chromium。

## 已确认根因

1. `src/styles/layout.css` 中 `.route-content` 只有 `flex: 1`，自身不是 flex/grid 容器，路由页面根节点仍按内容高度收缩。
2. `src/views/config/ConfigCenter.vue` 的 `.config-page`、`.config-grid`、`.main-stack` 没有形成可用高度传递链；三列只会被最高内容撑到自然高度。
3. 配置中心的空状态、表格和分页全部是内容驱动高度，剩余高度没有明确归属，所以截图底部显示大块灰色背景。
4. 仅给 `.config-page` 添加 `min-height` 只能把灰色空白变成白色空白，不能解决信息区没有拉伸的问题。
5. 当前响应式测试只验证共享路由容器存在 `flex: 1`，没有验证页面根节点、主网格、滚动区之间的高度传递，因此产生了“测试通过但视觉仍空”的假阳性。

## 全局约束

- 只修改确认属于“工作区型”的页面；短表单、向导、上传和预检页面保持 `height: auto`。
- 多出来的高度优先给表格主体、结果列表、编辑画布和详情栏，不拉大按钮、统计卡、字段间距或表格行高。
- 1366×768 下允许页面按现有断点重排；2K/4K 下主工作区扩展，侧栏和详情栏在内容超出时内部滚动。
- 不改变路由、公开 props、事件、业务数据和交互状态。
- 当前工作树有其他未提交改动；实施时必须逐文件核对并只暂存本计划涉及的行。
- 每完成一个任务只运行该任务列出的定向测试，不运行全量测试。

---

### Task 1: 先用测试锁定“高度传递链”

**Files:**
- Modify: `tests/responsiveLayout.test.js`
- Modify: `tests/requestedNavigationLayout.test.js`

- [ ] 在 `tests/responsiveLayout.test.js` 增加共享容器断言，要求 `.route-content` 同时具备 `display: flex`、`flex-direction: column`、`flex: 1` 和 `min-height: 0`。
- [ ] 增加 `.route-fill-page` 契约断言：它只能是 opt-in 工具类，并具备 `flex: 1 1 auto`、`min-height: 0`，不得包含 `zoom` 或 `transform: scale()`。
- [ ] 在 `tests/requestedNavigationLayout.test.js` 增加配置中心断言，覆盖 `initial`、`records`、`params` 三种模式，并验证表格存在独立 `.table-scroll` 容器。
- [ ] 运行并确认新断言在实现前失败：

```powershell
node --test tests/responsiveLayout.test.js tests/requestedNavigationLayout.test.js
```

**验收：** 失败原因只指向缺失的共享 fill 契约和配置中心滚动结构，而不是既有业务行为。

---

### Task 2: 建立共享但显式选择的工作区填充接口

**Files:**
- Modify: `src/styles/layout.css`
- Test: `tests/responsiveLayout.test.js`

- [ ] 在现有 `.route-content` 规则中补充纵向 flex 容器，不新增重复的媒体查询块：

```css
.route-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  width: 100%;
}

.route-fill-page {
  flex: 1 1 auto;
  min-height: 0;
}
```

- [ ] 不添加 `.route-content > * { height: 100% }`，避免把所有表单和向导强制拉高。
- [ ] 不再为新页面添加 `calc(100dvh - 82px)` 一类顶栏魔数；可用高度由父级 flex 计算。
- [ ] 运行：

```powershell
node --test tests/responsiveLayout.test.js
```

**验收：** 共享容器把剩余高度传给选择了 `.route-fill-page` 的页面，同时现有自然高度页面不受影响。

---

### Task 3: 修复配置中心三种模式的底部留白

**Files:**
- Modify: `src/views/config/ConfigCenter.vue`
- Test: `tests/requestedNavigationLayout.test.js`
- Test: `tests/responsiveLayout.test.js`

- [ ] 根节点改为 `class="config-page route-fill-page"`，并按模式切换行结构：顶部导航和指标区保持自然高度，主网格使用 `minmax(0, 1fr)`。
- [ ] 为 `initial`、`records`、`params` 模式中直接包裹 `<table>` 的卡片增加 `.table-scroll`，让表格主体滚动、分页固定在卡片底部：

```vue
<section class="table-card">
  <div class="section-head">...</div>
  <div class="table-scroll">
    <table>...</table>
  </div>
  <div class="pager">...</div>
</section>
```

- [ ] 使用以下结构规则；只落到已有类名，不重排业务模板：

```css
.config-page.mode-initial,
.config-page.mode-records {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

.config-page.mode-params {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.config-grid,
.main-stack,
.data-panel,
.setup-side,
.trace-side,
.param-side {
  min-height: 0;
}

.initial-grid .main-stack,
.params-grid .main-stack {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.table-card,
.data-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.table-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.setup-side,
.trace-side,
.param-side {
  overflow: auto;
}

.setup-side {
  display: flex;
  flex-direction: column;
}

.setup-side .info-note {
  margin-top: auto;
}
```

- [ ] 对三种模式分别确认额外高度的归属：
  - `initial`：统计卡和空状态保持自然高度，配置表格主体填充；左分类栏和右初始化检查栏与主网格等高。
  - `records`：筛选区保持自然高度，记录表格主体填充，追溯栏独立滚动。
  - `params`：参数表单保持自然高度，预览/列表区域填充，参数说明栏独立滚动。
- [ ] 在现有窄屏断点内恢复内容驱动布局，避免多栏折叠后产生超长空白；不修改本次桌面目标之外的组件尺寸。
- [ ] 运行：

```powershell
node --test tests/requestedNavigationLayout.test.js tests/responsiveLayout.test.js
```

**验收：** 在 1366×768 至 3840×2160，配置中心主三列延伸到路由区域底部；分页可见，表格或侧栏内容超出时只在对应区域滚动，无横向溢出。

---

### Task 4: 按页面类型完成全站盘点，避免“一刀切”

**Files:**
- Modify: `tests/responsiveLayout.test.js`
- Modify only after visual confirmation:
  - `src/views/tasks/TaskList.vue`
  - `src/views/files/FileCenter.vue`
  - `src/views/audit-standard/AuditStandardWorkbench.vue`
  - `src/views/audit-standard/AuditStandardLibrary.vue`
  - `src/views/audit-standard/AuditStandardPolicy.vue`
  - `src/views/audit-report/AuditReportWorkbench.vue`
  - `src/views/audit-report/AuditReportDiff.vue`
  - `src/views/regulatory/RegulatoryWorkbench.vue`
  - `src/views/regulatory/RegulatoryHistory.vue`
  - `src/views/supervision/SupervisionWorkbench.vue`
  - `src/views/supervision/SupervisionReportDraft.vue`
  - `src/views/expense/ExpenseWorkbench.vue`
  - `src/views/expense/ExpenseAnomalyDashboard.vue`

- [ ] 建立路由页面清单，将 56 个路由视图逐一标记为：`fill-workspace`、`natural-content`、`already-compliant`；清单作为测试用例数据保存在 `tests/responsiveLayout.test.js`，避免新增运行时接口。
- [ ] 仅对经视觉检查确认的 `fill-workspace` 页面添加 `.route-fill-page`，并把页面内部一个明确的主区域改为 `minmax(0, 1fr)` 或 `flex: 1`。
- [ ] 对列表/中心页，把额外高度交给表格或列表滚动区；对工作台/仪表盘，把额外高度交给主图表或结果区；对编辑/对比页，把额外高度交给编辑画布或差异区。
- [ ] 保持以下页面族为自然高度：创建表单、上传、资料选择、字段编辑、元数据、预检、向导；除非单页视觉检查证明它本身是编辑工作区。
- [ ] 每修改一个页面族，只运行该页面族的既有测试和 `tests/responsiveLayout.test.js`，不批量改完后再找问题。

**验收：** 每个新增 `.route-fill-page` 的页面都有一个明确的内部弹性区域；不存在只把页面背景拉到底、内容仍停在上半屏的伪修复。

---

### Task 5: 五档视口的定向浏览器验收

**Files:**
- Test only；除非现有测试基础设施已经支持，否则不新增依赖。

- [ ] 在 100% 浏览器缩放下依次验证：1366×768、1440×900、1920×1080、2560×1440、3840×2160。
- [ ] 配置中心三种模式必须全部检查，不只检查截图中的 `initial` 模式。
- [ ] 每档尺寸记录以下 DOM 指标：`documentElement.scrollWidth <= clientWidth`；工作区主表面底边与 `.route-content` 底边差值不超过页面设计边距；内部滚动容器 `scrollHeight > clientHeight` 时分页和顶栏仍可见。
- [ ] 对代表性自然高度页面做反向检查：字段间距没有被拉大，短表单允许出现与内容量相符的自然空白。
- [ ] 最后只运行本计划涉及的定向测试：

```powershell
node --test tests/responsiveLayout.test.js tests/requestedNavigationLayout.test.js
```

**验收：** 没有整页缩放、横向溢出、内容裁切或页面级 700–900px 高度上限；工作区型页面利用高屏空间，内容型页面保持自然排版。

## 实施顺序与停线条件

1. 先完成 Task 1–3，只交付配置中心作为基准页。
2. 配置中心五档视口通过后，再执行 Task 4 的逐页分类和迁移。
3. 任一页面需要改动业务模板结构、路由或状态管理才能填充时立即停线，先重新评估；本计划不授权借布局问题重构业务代码。
4. 任一定向测试出现与本次布局无关的失败，只记录，不顺手修复。
