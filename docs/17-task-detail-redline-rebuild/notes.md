# 调研与迭代笔记

## 已确认事实

- 参考图为 1600×1000。
- 当前历史截图 `docs/10-final-acceptance/screenshots/tasks__detail.png` 显示的是深色侧栏、处理中任务台账，业务状态和布局均与目标不符。
- 目标页是任务刚创建后的草稿空资料状态，不是现有的进行中任务。
- 当前目标路由是 `/tasks/detail`，主要实现位于 `src/views/tasks/TaskDetail.vue`。

## 待回填

- 设计取舍和用户确认结果。
- 每轮截图差异与修正记录。

## 视觉测量 agent 结论

- 参考文件实像素 1593×999，按 1600×1000 基准处理。
- 基准骨架：左导航约 212px、顶栏约 60px、主内容约 1353px；主工作区与右栏约 75:25，间距约 9–12px。
- 目标内容持续填充到 y≈964；基准页不是长页。
- 主要区域尺寸：任务头约 1379×159、标签栏约 1064×41、左主区约 1003×450、右提示约 335×462、流程约 986×205、日志约 338×189。
- 三个目标桌面视口都应保留双栏；1366 可少量纵向滚动，但不能横向溢出或让右栏掉落。

## 代码审计 agent 结论

- `TaskDetail.vue` 当前是“处理中台账”拓扑，模板与数据模型均和目标相反，应整体重写页面主体。
- 必须新增独立草稿详情 fixture，不能清空共享 mock 集合，也不能改任务列表现有任务。
- `AppLayout.vue` 需要独立识别 `/tasks/detail`：显示“任务中心 / 任务详情”、隐藏演示数据切换，并保持通知数量。
- 详情页使用局部前缀类和 scoped 样式，避免修改全局 `.panel/.btn/table` 造成跨路由副作用。
- 相关测试只新增并运行 `tests/taskDetailEmptyState.test.js`，最终再运行一次 `npm run build`。

## 运行基线 agent 结论

- 现有服务：`http://127.0.0.1:5173/tasks/detail`，控制台 0 error、0 warning。
- 当前 1600×1000 文档高约 1578px，详情主体从 y≈744px 开始；1366×768 仅露出约 24px 主体。
- 现有四视口无横向溢出且右栏未掉落，但首屏被页头、状态板、4 指标和两行页签耗尽。
- 当前 URL 无 taskId，`selectedTask` 为空；页面又回退到“待确认/办理中”硬编码，并且不响应全局空数据模式，因此状态错误。
- 后续必须断言无横向溢出、双栏同排、草稿状态一致、主工作区进入首屏，以及末尾无异常留白。

## 当前设计判断

- 这是结构重建，不是继续给旧页加补丁。
- 保留路由、应用壳、AuditIcon 和基础 tokens；停止在本页使用 PageHeader、PageState、MetricGrid、DataTable。
- 优先采用 CSS 流体栅格 + 三档密度变量；仅在 1366 桌面档做有限比例压缩，不用 JS 持续测量每个节点。

## 入口行为复核

- “继续编辑”：现有创建页仅识别 `phase=parse|confirm|template`；继续编辑草稿可安全映射到 `/tasks/create?phase=confirm`。
- “上传资料”：现有资料选择实际位于 `TaskCreate.vue` 的 step 2，但当前没有可直达该步骤的 query；若要求真正直达，需要以相关测试保护后新增 `phase=materials`，不能伪装成已支持。
- “从文件中心选择”：现有 `/files` 路由可直接复用，但只是进入文件中心；若要带回选择结果，需要额外定义选择模式和回跳协议，超出本次截图状态范围。
- “使用模拟数据”：不应直接调用全局 `setDemoDataMode('data')`，因为它会持久化全局状态并插入 notice，导致详情页整体下移；更安全的是把它作为资料选择页的 `source=simulation` 入口。
- “删除草稿”：涉及破坏性状态变化；本次设计只呈现按钮，正式实现若要删除必须增加二次确认，不能单击即删。

## 建议的最小交互口径

1. 继续编辑 → `/tasks/create?phase=confirm`。
2. 上传资料 → `/tasks/create?phase=materials&source=local`，同时给创建页补充受测的 query 初始化。
3. 从文件中心选择 → `/tasks/create?phase=materials&source=fileCenter`。
4. 使用模拟数据 → `/tasks/create?phase=materials&source=simulation`。
5. 删除草稿 → 打开本页二次确认，不在未确认时改变数据。

此口径既使参考图中的三个入口真实可用，又不污染全局演示模式；它会比纯视觉复刻多触及 `TaskCreate.vue` 的少量初始化逻辑，因此需要用户在设计确认时一并确认。

## 实施进度

- Task 1 完成：新增不可变草稿快照与 `resolveTaskDetailMode`，commit `6a42c28`。
- TDD 证据：生产模块不存在时测试 RED；实现后 `tests/taskDetailDraftState.test.js` 2/2 通过。
- 独立审查结论：Spec PASS，Task quality Approved，无 Critical/Important/Minor 问题。
- Task 2 完成：新增空资料启动区、三资料入口、三能力卡与七步流程，commits `b2cd787`、`38b56bd`。
- 审查修复：局部根节点由嵌套 `main` 改为 `section`，增强两个数据循环和三种 payload 的测试，展开 scoped CSS；复审通过。
- Task 3 完成：新增下一步提示与当前任务操作留痕右栏，commit `ec1528c`；定向组件测试 2/2 通过，独立审查 Approved。
- Task 4 完成：组合草稿页任务头、7 元数据、3 动作、11 标签、75:25 双栏与删除确认，commits `909be1c`、`6558841`。
- 审查修复：11 个标签全部进入自然 Tab 顺序；删除确认支持初始聚焦、Escape、Tab/Shift+Tab 焦点循环及关闭后焦点归还；复审 Approved。
- Task 5 完成：草稿态已最小接入现有生成中、待确认、归档生命周期入口，commit `63d1cd4`；兼容测试 11/11 通过。
- 可复现性修复：commit `a1ff7cc` 精确跟踪共享 TaskDetail 已依赖的 21 个生产文件和 package/lock；补交后 `npm run build` 成功，复审 Approved。
- Task 6 完成：commits `5a10287`、`fd1b79b` 新增资料入口解析器并接入创建页；local/fileCenter/simulation、parse、confirm/template 和无效 source 回退均受测试保护。
- 模拟数据入口仅在材料行首次初始化后自动填充一次；`AppLayout.vue` 已具备目标通知角标和详情壳逻辑，本轮未做多余修改。
- Task 6 验证：`npm run test:task-detail-draft` 10/10 通过，`npm run build` 成功转换 171 modules；独立审查 Approved。
- 1600×1000 视觉基线：overflowX=0、文档高=1000、11 tabs、3 能力卡、7 流程节点、控制台 0 error/0 warning；当前主体栅格为左 1025.3px / 右 341.8px。

## 最终视觉迭代

- 草稿详情专属壳调整为 1600 基准侧栏 212px、顶栏 68px；不修改共享 `AppLayout.vue` 或 `layout.css`，通过草稿页局部全局覆盖隔离其他详情状态。
- 1600×1000 最终实测：摘要 `228/133/1346/92`、Tabs `y=245 h=41`、空状态 `226/294/1001/274`、能力卡 `y=609 h=126`、流程 `226/760/1001/204`、右栏 `1237/294/337`、日志 `y=770 h=189`。
- 空资料说明固定为两行，三入口扩大到参考图密度；能力卡移除强制描述占高；流程节点改为 52px 线性图标；资料、阻断与操作入口不再使用文本占位符。
- 操作留痕覆盖全局表格 `min-width:860px`，以 `44/24/20/12` 分配列宽；四视口的时间、操作人、操作和结果均无内容溢出。
- 四视口均 `overflowX=0`、11 tabs 单行、3 能力卡同排、7 流程节点完整、控制台 0 error/0 warning。1440 与 1366 由 `.main` 独立纵向滚动承载 986px 内容，不裁切底部；1920 右栏 405px。
- 最终截图：`task-detail-draft-1600x1000-final.png`、`task-detail-draft-1440x900-final.png`、`task-detail-draft-1366x768-final.png`、`task-detail-draft-1920x1080-final.png`。
