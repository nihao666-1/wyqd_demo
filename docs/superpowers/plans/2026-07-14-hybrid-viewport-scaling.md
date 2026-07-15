# Hybrid Viewport Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 2560×1440 为基准统一缩放视觉尺寸，同时让共享外壳和业务工作区原生铺满窗口，并在配置中心验证后分批推广全站。

**Architecture:** 单一缩放引擎根据视口计算无上下限的 `uiScale`，把 2560 基准令牌换算为最终 CSS 像素变量。Grid/Flex 负责宽高铺满和剩余空间分配；页面不得使用整页 `zoom`、`transform: scale()` 或固定设计画布。

**Tech Stack:** Vue 3、Vue Router、CSS Grid/Flexbox、Node `node:test`、Vite、Chromium/Playwright（仅视觉验收，不加入运行时依赖）。

## Global Constraints

- 设计基准固定为 2560×1440。
- 缩放公式固定为 `min(viewportWidth / 2560, viewportHeight / 1440)`，不设置最小或最大值。
- 1920×1080 是重点验收尺寸；1366×768、1440×900、2048×1024、3840×2160 同时纳入矩阵。
- 浏览器缩放固定为 100%。
- 1px 边框、细分隔线和焦点轮廓保持 1px。
- 不新增前端运行时依赖，不改变业务数据、路由、公开 props 或事件。
- 先完成配置中心样板并人工确认，再开始全站迁移。
- 每次改动只运行相关测试，不运行无关全量测试。
- 当前工作树的既有改动属于用户；实施时只修改和暂存本计划明确列出的行。

---

### Task 1: 用纯函数锁定缩放公式和令牌线性关系

**Files:**
- Create: `src/utils/viewportScale.js`
- Create: `tests/viewportScale.test.js`

**Interfaces:**
- Produces: `calculateViewportScale(width, height): number`
- Produces: `buildViewportTokens(width, height): { scale: number, cssVariables: Record<string, string> }`
- Produces: `installViewportScale(root, viewport): () => void`

- [ ] **Step 1: 写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UI_BASE_TOKENS,
  buildViewportTokens,
  calculateViewportScale
} from '../src/utils/viewportScale.js';

const cases = [
  [1366, 768, 768 / 1440],
  [1440, 900, 1440 / 2560],
  [1920, 1080, 0.75],
  [2048, 1024, 1024 / 1440],
  [2560, 1440, 1],
  [3840, 2160, 1.5]
];

test('viewport scale uses the smaller 2560x1440 ratio without clamping', () => {
  for (const [width, height, expected] of cases) {
    assert.ok(Math.abs(calculateViewportScale(width, height) - expected) < 0.000001);
  }
});

test('all visual tokens scale with the same coefficient', () => {
  const at1920 = buildViewportTokens(1920, 1080);
  assert.equal(at1920.scale, 0.75);
  assert.equal(at1920.cssVariables['--ui-sidebar-width'], '264px');
  assert.equal(at1920.cssVariables['--ui-topbar-height'], '58px');
  assert.equal(at1920.cssVariables['--ui-font-md'], '14px');
  assert.equal(UI_BASE_TOKENS['--ui-border-width'], 1);
  assert.equal(at1920.cssVariables['--ui-border-width'], '1px');
});
```

- [ ] **Step 2: 运行并确认 RED**

```powershell
node --test tests/viewportScale.test.js
```

Expected: FAIL，原因是 `src/utils/viewportScale.js` 尚不存在。

- [ ] **Step 3: 实现最小缩放引擎**

```js
export const VIEWPORT_BASE = Object.freeze({ width: 2560, height: 1440 });

export const UI_BASE_TOKENS = Object.freeze({
  '--ui-font-xs': 16,
  '--ui-font-sm': 17.333333,
  '--ui-font-md': 18.666667,
  '--ui-font-lg': 21.333333,
  '--ui-font-xl': 26.666667,
  '--ui-space-1': 5.333333,
  '--ui-space-2': 8,
  '--ui-space-3': 10.666667,
  '--ui-space-4': 16,
  '--ui-space-5': 21.333333,
  '--ui-space-6': 32,
  '--ui-icon-sm': 21.333333,
  '--ui-icon-md': 24,
  '--ui-icon-lg': 32,
  '--ui-control-sm': 40,
  '--ui-control-md': 48,
  '--ui-topbar-height': 77.333333,
  '--ui-sidebar-width': 352,
  '--ui-page-gutter': 18.666667,
  '--ui-radius-sm': 5.333333,
  '--ui-radius-md': 8,
  '--ui-border-width': 1
});

const UNSCALED_TOKENS = new Set(['--ui-border-width']);
const toPixel = (value) => `${Number(value.toFixed(4))}px`;

export function calculateViewportScale(width, height) {
  return Math.min(width / VIEWPORT_BASE.width, height / VIEWPORT_BASE.height);
}

export function buildViewportTokens(width, height) {
  const scale = calculateViewportScale(width, height);
  const cssVariables = Object.fromEntries(
    Object.entries(UI_BASE_TOKENS).map(([name, value]) => [
      name,
      toPixel(UNSCALED_TOKENS.has(name) ? value : value * scale)
    ])
  );
  return { scale, cssVariables };
}

export function applyViewportScale(root, width, height) {
  const result = buildViewportTokens(width, height);
  for (const [name, value] of Object.entries(result.cssVariables)) {
    root.style.setProperty(name, value);
  }
  root.dataset.uiScale = result.scale.toFixed(6);
  return result.scale;
}

export function installViewportScale(root = document.documentElement, viewport = window) {
  let frame = 0;
  const update = () => {
    viewport.cancelAnimationFrame(frame);
    frame = viewport.requestAnimationFrame(() => {
      applyViewportScale(root, viewport.innerWidth, viewport.innerHeight);
    });
  };
  applyViewportScale(root, viewport.innerWidth, viewport.innerHeight);
  viewport.addEventListener('resize', update, { passive: true });
  return () => {
    viewport.cancelAnimationFrame(frame);
    viewport.removeEventListener('resize', update);
  };
}
```

- [ ] **Step 4: 运行并确认 GREEN**

```powershell
node --test tests/viewportScale.test.js
```

Expected: PASS，两个测试均通过。

---

### Task 2: 在 Vue 启动前安装缩放令牌

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles/tokens.css`
- Modify: `tests/viewportScale.test.js`

**Interfaces:**
- Consumes: `installViewportScale()` from Task 1
- Produces: `document.documentElement.dataset.uiScale`

- [ ] **Step 1: 增加失败断言**，检查 `main.js` 在 `createApp()` 前调用 `installViewportScale()`，并检查 `tokens.css` 提供 1920 密度的安全回退值：

```js
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

test('app installs viewport tokens before Vue mounts', () => {
  const installIndex = mainSource.indexOf('installViewportScale()');
  const mountIndex = mainSource.indexOf('createApp(App)');
  assert.ok(installIndex >= 0 && installIndex < mountIndex);
  assert.match(tokenSource, /--ui-sidebar-width:\s*264px/);
  assert.match(tokenSource, /--ui-font-md:\s*14px/);
});
```
- [ ] **Step 2: 运行 `node --test tests/viewportScale.test.js`，确认因入口尚未接入而失败。**
- [ ] **Step 3: 在 `main.js` 中加入以下入口代码：**

```js
import { installViewportScale } from './utils/viewportScale.js';

const stopViewportScale = installViewportScale();
window.addEventListener('pagehide', stopViewportScale, { once: true });
```

- [ ] **Step 4: 在 `tokens.css` 的 `:root` 增加下列安全回退值：**

```css
--ui-font-xs: 12px;
--ui-font-sm: 13px;
--ui-font-md: 14px;
--ui-font-lg: 16px;
--ui-font-xl: 20px;
--ui-space-1: 4px;
--ui-space-2: 6px;
--ui-space-3: 8px;
--ui-space-4: 12px;
--ui-space-5: 16px;
--ui-space-6: 24px;
--ui-icon-sm: 16px;
--ui-icon-md: 18px;
--ui-icon-lg: 24px;
--ui-control-sm: 30px;
--ui-control-md: 36px;
--ui-topbar-height: 58px;
--ui-sidebar-width: 264px;
--ui-page-gutter: 14px;
--ui-radius-sm: 4px;
--ui-radius-md: 6px;
--ui-border-width: 1px;
```

- [ ] **Step 5: 运行 `node --test tests/viewportScale.test.js`，Expected: PASS。**

---

### Task 3: 建立路由内容的铺满契约

**Files:**
- Modify: `src/styles/layout.css`
- Modify: `tests/responsiveLayout.test.js`

**Interfaces:**
- Produces: `.route-content` flex container
- Produces: `.route-fill-page` opt-in contract

- [ ] **Step 1: 增加失败测试**，要求 `.route-content` 具备 `display:flex` 和 `flex-direction:column`，要求 `.route-fill-page` 具备 `flex:1 1 auto`、`min-height:0`，并继续禁止 `zoom` 与整页 `transform:scale()`：

```js
test('shared route content passes remaining height only to opt-in pages', () => {
  assert.match(layoutCss, /\.route-content\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(layoutCss, /\.route-fill-page\s*\{[^}]*min-height:\s*0[^}]*flex:\s*1 1 auto/s);
  assert.doesNotMatch(layoutCss, /\bzoom\s*:/);
  assert.doesNotMatch(layoutCss, /transform:\s*scale\(/);
});
```
- [ ] **Step 2: 运行 `node --test tests/responsiveLayout.test.js`，确认新断言失败。**
- [ ] **Step 3: 最小实现：**

```css
.route-content {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.route-fill-page {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
}
```

- [ ] **Step 4: 运行 `node --test tests/responsiveLayout.test.js`，Expected: PASS。**

---

### Task 4: 配置中心样板页同时完成缩放和铺满

**Files:**
- Modify: `src/views/config/ConfigCenter.vue`
- Modify: `tests/requestedNavigationLayout.test.js`
- Test: `tests/responsiveLayout.test.js`

**Interfaces:**
- Consumes: global `--ui-*` tokens
- Consumes: `.route-fill-page`
- Produces: `.table-scroll` internal scroll region

- [ ] **Step 1: 写失败测试**，覆盖 `/config?mode=initial`、`records`、`params` 三种模板分支，要求根节点包含 `route-fill-page`，三个主表格都有 `.table-scroll`，分页在滚动区之外：

```js
test('config center exposes one fill workspace and three independent table scrollers', () => {
  const config = read(configUrl);
  assert.match(config, /class="config-page route-fill-page"/);
  assert.equal((config.match(/class="table-scroll"/g) || []).length, 3);
  assert.equal((config.match(/<\/div>\s*<footer class="pager">/g) || []).length, 3);
  assert.match(config, /\.config-page\.mode-initial[\s\S]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/);
  assert.match(config, /\.config-page\.mode-params[\s\S]*grid-template-rows:\s*auto minmax\(0,\s*1fr\)/);
  compileVue(configUrl);
});
```
- [ ] **Step 2: 运行 `node --test tests/requestedNavigationLayout.test.js tests/responsiveLayout.test.js`，确认失败原因正确。**
- [ ] **Step 3: 将根节点改为：**

```vue
<div class="config-page route-fill-page" :class="`mode-${currentMode}`">
```

- [ ] **Step 4: 分别用 `<div class="table-scroll">` 包裹 initial、records、params 的主表格，不包裹右栏 `.mini-table`。**
- [ ] **Step 5: 添加高度分配规则：**

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
.table-card,
.data-panel,
.setup-side,
.trace-side,
.param-side,
.table-scroll {
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
  flex-direction: column;
}

.table-scroll {
  flex: 1 1 auto;
  overflow: auto;
}

.setup-side,
.trace-side,
.param-side {
  overflow: auto;
}
```

- [ ] **Step 6: 将配置中心可见尺寸迁移到令牌。** 使用下列确定映射，不修改颜色和业务结构：

| 现有尺寸类型 | 新值 |
|---|---|
| 12px 辅助文字 | `var(--ui-font-xs)` |
| 13px 表格/导航 | `var(--ui-font-sm)` |
| 14px 正文/标题 | `var(--ui-font-md)` |
| 16px 小标题 | `var(--ui-font-lg)` |
| 4/6/8/12/16/24px 间距 | `--ui-space-1/2/3/4/5/6` |
| 30px 紧凑输入 | `var(--ui-control-sm)` |
| 36px 标准按钮/导航项 | `var(--ui-control-md)` |
| 4px/6px 圆角 | `var(--ui-radius-sm/md)` |
| 1px 边框 | `var(--ui-border-width)` |

- [ ] **Step 7: 运行 `node --test tests/requestedNavigationLayout.test.js tests/responsiveLayout.test.js tests/viewportScale.test.js`，Expected: PASS。**

---

### Task 5: 四档真实浏览器校准配置中心

**Files:**
- Create during verification: `artifacts/viewport-audit/config/*.png`
- Create during verification: `artifacts/viewport-audit/config/metrics.json`
- Modify only if calibration fails: `src/utils/viewportScale.js`

**Interfaces:**
- Consumes: `data-ui-scale` and `--ui-*` computed variables
- Produces: approved first-version token table

- [ ] **Step 1: 隐藏窗口启动 Vite：**

```powershell
$vite = Start-Process npm -ArgumentList 'run','dev','--','--port','4173' -PassThru -WindowStyle Hidden
```

- [ ] **Step 2: 经用户允许后，使用工作区自带 Playwright 打开以下 URL：**
  - `http://127.0.0.1:4173/config?mode=initial`
  - `http://127.0.0.1:4173/config?mode=records`
  - `http://127.0.0.1:4173/config?mode=params`

- [ ] **Step 3: 每个 URL 截取 1366×768、1920×1080、2560×1440、3840×2160，共 12 张截图。**
- [ ] **Step 4: 每张截图记录以下 DOM 指标：**

```js
({
  scale: Number(document.documentElement.dataset.uiScale),
  viewport: [window.innerWidth, window.innerHeight],
  horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  routeBottomGap: Math.abs(
    document.querySelector('.route-content').getBoundingClientRect().bottom -
    document.querySelector('.config-page').getBoundingClientRect().bottom
  ),
  bodyFont: getComputedStyle(document.body).fontSize,
  sidebarWidth: document.querySelector('.sidebar').getBoundingClientRect().width,
  tableRegions: [...document.querySelectorAll('.table-scroll')].map((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    overflowY: getComputedStyle(node).overflowY
  })),
  pagersVisible: [...document.querySelectorAll('.pager')].every((node) => {
    const rect = node.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  })
})
```

- [ ] **Step 5: 按以下硬标准判定：**
  - `scale` 与公式值误差小于 `0.001`。
  - `horizontalOverflow <= 1`。
  - `routeBottomGap <= 1`。
  - 每个 `tableRegions.clientHeight > 0` 且 `overflowY` 为 `auto` 或 `scroll`。
  - `pagersVisible === true`。
  - 1366 下正文不小于 10px、主要按钮可见且可点击。
  - 1920 下正文 13–16px，侧栏约 264px。
  - 2560 下信息密度明显放大但不遮挡。
  - 4K 下不得出现裁切、固定栏错位或大块未归属背景。
- [ ] **Step 6: 如失败，只调整 `UI_BASE_TOKENS` 的基准值并同步更新 `tests/viewportScale.test.js` 中对应的精确期望值，然后重复 Task 1、Task 4 的测试和本任务截图；不得改变缩放公式。**
- [ ] **Step 7: 用户确认 12 张截图后冻结第一版令牌，才进入 Task 6。**

---

### Task 6: 迁移共享外壳并移除重复尺寸来源

**Files:**
- Modify: `src/styles/layout.css`
- Modify: `src/styles/components.css`
- Modify: `src/components/layout/AppLayout.vue`
- Modify: `tests/responsiveLayout.test.js`

**Interfaces:**
- Consumes: approved `--ui-sidebar-width`、`--ui-topbar-height`、字体、图标、间距令牌
- Produces: one shared shell sizing source

- [ ] **Step 1: 增加失败测试**，要求默认和专项 shell 都引用共享令牌，禁止再次声明 224px/264px 等侧栏常量，禁止页面级 `zoom`。
- [ ] **Step 2: 运行 `node --test tests/responsiveLayout.test.js tests/requestedNavigationLayout.test.js`，确认 RED。**
- [ ] **Step 3: 把侧栏、品牌栏、顶栏、导航项、图标和主区 gutter 迁移到 `--ui-*`；保留路由特有颜色和状态样式。**
- [ ] **Step 4: 删除已经被令牌替代的重复 shell 宽高声明；不整理无关媒体查询。**
- [ ] **Step 5: 运行上述两个测试，Expected: PASS。**
- [ ] **Checkpoint:** 对 `/config?mode=initial` 和 `/tasks` 重跑四档截图；共享外壳必须与配置中心样板一致。

---

### Task 7: 建立全路由分类清单和静态防回归

**Files:**
- Create: `tests/viewportLayoutInventory.test.js`
- Read: `src/router/index.js`

**Interfaces:**
- Produces: `fillRoutes`、`naturalRoutes`、`conditionalRoutes` 测试清单

- [ ] **Step 1: 把当前 56 个组件路由完整列入测试清单。**
- [ ] **Step 2: 分类规则固定为：**
  - `fillRoutes`：工作台、中心、列表、结果、编辑器、差异比较、报告草稿。
  - `naturalRoutes`：首次引导、创建表单、上传、字段补全、元数据、预检。
  - `conditionalRoutes`：`/tasks/create` 和 `/tasks/detail`，按 query/state 决定填充方式。
- [ ] **Step 3: 测试必须验证每个非 redirect 路由恰好出现一次，新增路由未分类时直接失败。**
- [ ] **Step 4: 运行 `node --test tests/viewportLayoutInventory.test.js`，Expected: PASS。**

---

### Task 8: 分批迁移业务页面

**Files:**
- Batch A: `src/views/workbench/WorkbenchHome.vue`, `src/views/tasks/TaskList.vue`, `src/views/files/FileCenter.vue`, `src/views/records/RecordCenter.vue`
- Batch B: `src/views/regulatory/*.vue`, `src/views/audit-standard/*.vue`
- Batch C: `src/views/supervision/*.vue`, `src/views/supervision-result/*.vue`
- Batch D: `src/views/expense/*.vue`, `src/views/expense/components/*.vue`
- Batch E: `src/views/audit-report/*.vue`
- Batch F: `src/views/tasks/TaskCreate.vue`, `src/views/tasks/TaskDetail*.vue`, `src/views/tasks/task-detail/*.vue`, `src/views/tasks/task-detail-draft/*.vue`
- Test: only the existing tests that import the files in the active batch, plus `tests/viewportScale.test.js`, `tests/responsiveLayout.test.js`, `tests/viewportLayoutInventory.test.js`

**Interfaces:**
- Consumes: shared shell and approved tokens
- Produces: no page-level whole-screen scale implementations

- [ ] **Step 1: 每批先写静态失败断言**，要求可见字体、图标、间距、控件尺寸引用令牌；工作区页面含 `.route-fill-page` 或等价明确契约；自然页面不得强制填满字段区域。
- [ ] **Step 2: 每次只迁移一个批次，修改后立即运行该批现有测试和三项共享布局测试。**
- [ ] **Step 3: 删除该批内旧的 `DESIGN_WIDTH`、页面级 scale 监听、`zoom`、整页 `transform:scale()`；不删除与缩放无关的逻辑。**
- [ ] **Step 4: 对工作区页面把剩余空间交给一个明确的 `minmax(0,1fr)` 或 `flex:1` 主区域；对自然页面保持 `height:auto`。**
- [ ] **Step 5: 每批在 1920×1080 和 2560×1440 做全路由截图；代表页再补 1366×768 和 3840×2160。**
- [ ] **Checkpoint:** 任一批出现页面级横向滚动、双滚动条、固定操作遮挡或字号异常，停止下一批并回到该批修复。

---

### Task 9: 完整测试矩阵与最终验收

**Files:**
- Test: `tests/viewportScale.test.js`
- Test: `tests/responsiveLayout.test.js`
- Test: `tests/requestedNavigationLayout.test.js`
- Test: `tests/viewportLayoutInventory.test.js`
- Verification output: `artifacts/viewport-audit/final/`

- [ ] **Unit 层：** 验证 6 个视口的 scale、令牌线性关系、1px 例外和 resize 更新。
- [ ] **结构层：** 验证共享 shell、route-content、fill/natural/conditional 分类以及全局禁止整页缩放。
- [ ] **编译层：** 只对本批修改的 `.vue` 文件运行现有 SFC 编译测试。
- [ ] **运行时层：** 全部非 redirect 路由在 1920×1080、2560×1440 加载；代表路由在 1366×768、1440×900、2048×1024、3840×2160 加载。
- [ ] **视觉层：** 检查无裁切、无未归属底部背景、无页面级横向滚动、侧栏/顶栏不重叠、工作区内部滚动正确。
- [ ] **交互层：** 检查侧栏导航、配置中心三模式、任务详情状态、抽屉、标签、分页和固定操作仍可使用。
- [ ] **可访问性层：** 键盘焦点可见；1366 下文本可辨。浏览器缩放非 100% 不在本轮视觉缩放验收范围内，不能据此声称满足浏览器缩放可访问性。
- [ ] **性能层：** resize 使用单一 `requestAnimationFrame`，连续改变窗口尺寸时无控制台错误、无明显布局抖动。
- [ ] **运行定向自动化：**

```powershell
node --test tests/viewportScale.test.js tests/responsiveLayout.test.js tests/requestedNavigationLayout.test.js tests/viewportLayoutInventory.test.js
```

- [ ] **只在用户确认最终截图后建立视觉基线。** 未确认前不得把当前实验截图当成 golden image。

## 后续修改顺序

1. Task 1–5：配置中心样板与视觉参数校准。
2. Task 6–7：共享外壳和路由分类。
3. Task 8：按 A→F 顺序迁移，每批独立测试和截图。
4. Task 9：定向自动化、全路由双基准分辨率、代表页六档验收。
5. 用户批准最终截图后才提交全站迁移分支；不把实验参数直接推到远端。

## 风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| 1366 按 0.533 缩放导致文字过小 | 高 | 只提高 2560 基准字体令牌，不加缩放下限 |
| 旧页面存在局部 scale/zoom | 高 | 路由清单逐批扫描，迁移时删除同批旧实现 |
| 全局令牌与大量固定 px 混用 | 高 | 配置中心先验证，随后按域迁移，不一次性机械替换 |
| 非 16:9 出现剩余空白 | 中 | 额外轴只分配给主工作区，使用 `minmax(0,1fr)` |
| 当前工作树有大量既有修改 | 高 | 实施前确认归属；逐文件 diff，禁止覆盖和混合提交 |
| 浏览器截图工具未获授权 | 中 | 自动化截图前单独确认；未授权时只完成静态和单元测试，不声称视觉通过 |
