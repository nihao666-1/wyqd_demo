# 任务详情“生成结果·待确认”实施计划

> **For agentic workers:** 按任务顺序执行；每项先写失败测试，再写最小实现，并只运行该任务相关测试。

**Goal:** 在现有 Vue Demo 中精确实现可交互、可响应的任务详情待确认工作台。

**Architecture:** 纯状态逻辑位于 `src/domain/taskDetail`，真实演示数据位于任务详情数据模块，页面由六个职责单一的 Vue 组件组成。任务详情使用专属布局与 scoped 样式，只对应用壳增加最小路由变体。

**Tech Stack:** Vue 3、Vue Router 4、Vite 6、Node test runner、Vue SFC compiler、Font Awesome。

## Global Constraints

- 参考图固定为 `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-1a12c353-e4d8-47d6-92e1-1a6b6f2b23de.png`，尺寸 1589×997。
- 初始必须显示 9 项生成完成、15 项待确认、V1.0 草稿、生成结果 Tab 和打开的追溯栏。
- 1366×768 仍保持 3×3 能力卡；小于 1280px 才将追溯栏改为覆盖式。
- 不使用页面级固定宽高、空白占位或单独 transform 缩放。
- 不改动通用 panel/table/drawer 行为，不清理用户既有改动。
- 每次代码改动后只运行直接相关测试。

---

### Task 1: 待确认状态模型

**Files:**
- Create: `src/domain/taskDetail/taskResultState.js`
- Create: `tests/taskDetailResultState.test.js`

**Interfaces:**
- Produces: `createTaskResultState`, `getPendingCount`, `getAbilityStatus`, `confirmItem`, `excludeItem`, `saveItemNote`, `confirmAbility`, `canSubmitReview`, `paginateItems`。

- [ ] 写失败测试，覆盖 9 能力、15 事项、初始 V1.0、确认/排除/说明幂等、批量确认隔离、复核门禁和分页。
- [ ] 运行 `node --test tests/taskDetailResultState.test.js`，预期因模块不存在失败。
- [ ] 实现不可变状态转换：

```js
export function confirmItem(state, itemId) {
  return updateItem(state, itemId, (item) =>
    item.disposition === 'pending'
      ? { ...item, disposition: 'confirmed', decision: '确认缺失' }
      : item
  );
}
```

- [ ] 再运行同一命令，预期全部通过。

### Task 2: 页面数据与组件骨架

**Files:**
- Create: `src/views/tasks/taskDetailPendingData.js`
- Create: `src/views/tasks/task-detail/TaskDetailHeader.vue`
- Create: `src/views/tasks/task-detail/CapabilityResultGrid.vue`
- Create: `src/views/tasks/task-detail/PendingConfirmationTable.vue`
- Create: `src/views/tasks/task-detail/VersionExportPreview.vue`
- Create: `src/views/tasks/task-detail/EvidenceTracePanel.vue`
- Create: `tests/taskDetailPendingComponents.test.js`

**Interfaces:**
- Components consume plain props and emit semantic events; they do not mutate shared state。

- [ ] 写组件结构与 SFC 编译失败测试，断言六个区域、11 个标签、9 卡、8 表格列、5 个追溯标签。
- [ ] 运行 `node --test tests/taskDetailPendingComponents.test.js`，预期因组件不存在失败。
- [ ] 建立九能力、十五事项、证据、版本和文件数据。
- [ ] 实现六个展示组件，图标只使用 Font Awesome/AuditIcon，不使用字符图标或自制 SVG。
- [ ] 再运行组件测试，预期全部通过。

### Task 3: 页面编排与交互联动

**Files:**
- Modify: `src/views/tasks/TaskDetail.vue`
- Create: `tests/taskDetailPendingIntegration.test.js`

**Interfaces:**
- Consumes Task 1 状态函数和 Task 2 组件事件。

- [ ] 写失败测试，断言默认 results、状态函数导入、六组件接线、确认/排除/查看依据/保存/提交/导出/上传处理器。
- [ ] 运行 `node --test tests/taskDetailPendingIntegration.test.js`，预期旧页面结构不匹配。
- [ ] 将 TaskDetail 改为轻量编排器：

```js
const taskState = ref(createTaskResultState());
const pendingCount = computed(() => getPendingCount(taskState.value));
function handleConfirm(itemId) {
  taskState.value = confirmItem(taskState.value, itemId);
}
```

- [ ] 添加 toast、Esc 关闭、定位待确认表和抽屉 tab/事项选择。
- [ ] 再运行集成测试，预期通过。

### Task 4: 应用壳任务详情变体

**Files:**
- Modify: `src/components/layout/AppLayout.vue`
- Modify: `src/styles/layout.css`
- Test: `tests/taskDetailPendingIntegration.test.js`

**Interfaces:**
- Produces `.task-detail-shell`，只在 `route.path === '/tasks/detail'` 生效。

- [ ] 扩充集成测试，断言任务详情 class、面包屑和目标页隐藏演示数据切换。
- [ ] 运行相关测试，预期失败。
- [ ] 为详情路由增加专属 class 和面包屑分支；不改其他路由判断。
- [ ] 添加三列壳级布局变量和断点，仅限定 `.task-detail-shell`。
- [ ] 再运行相关测试，预期通过。

### Task 5: 精确视觉与响应式样式

**Files:**
- Modify: Task 2 的六个 Vue 组件 scoped style
- Modify: `src/views/tasks/TaskDetail.vue` scoped style

**Interfaces:**
- 1589×997 目标几何、1366/1440/1600/1920 视口规则。

- [ ] 根据设计规格实现任务摘要 83/75/41px、九卡 3×3、紧凑表格、底部预览和 328px 追溯栏。
- [ ] 添加 `@media (max-height:850px)` 密度压缩和 `@media (max-width:1279px)` 覆盖式追溯栏。
- [ ] 运行 `node --test tests/taskDetailPendingComponents.test.js tests/taskDetailPendingIntegration.test.js`。
- [ ] 运行 `npm run build`，预期成功且无 SFC/CSS 错误。

### Task 6: 运行时和视觉 QA

**Files:**
- Create/Update: `design-qa.md`
- Create: `docs/19-task-detail-pending-confirm-redline-rebuild/screenshots/*.png`
- Update: `docs/19-task-detail-pending-confirm-redline-rebuild/notes.md`
- Update: `docs/19-task-detail-pending-confirm-redline-rebuild/visual_acceptance.md`

- [ ] 启动目标路由并清理该演示状态的旧 localStorage 干扰。
- [ ] 在 1589×997、1600×900、1440×900、1366×768、1920×1080 捕获页面。
- [ ] 验证确认、排除、编辑说明、抽屉五标签、分页、提交复核阻断、上传检查、导出和 Esc。
- [ ] 检查控制台、页面级横向溢出和键盘焦点。
- [ ] 将参考图与同视口实现图放入同一比较图，记录 P0/P1/P2。
- [ ] 修正问题后重新捕获和比较，直到 `design-qa.md` 为 `final result: passed`。

