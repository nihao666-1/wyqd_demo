# 费用趋势分析页设计 QA

## 对照基准

- 原始设计图：`C:\Users\ZhuanZ（无密码）\.codex\attachments\4746df43-3664-482e-a61e-806b2a3c0b44\image-1.png`
- 目标路由：`/expense/usage/dashboard`
- 基准视口：`1588x995`
- 最终截图：`docs/25-expense-trend-fidelity/screenshots/expense-trend-1588x995-final.png`

## 已对齐项

- 左侧导航、顶部面包屑、通知角标与费用趋势当前项高亮已对齐。
- 筛选区包含被审计单位、对比周期、费用类别、部门、预算口径、数据来源和查询、重置、收起。
- 五个指标卡、四图一行、摘要双表、明细表和分页完整。
- 右侧洞察栏包含关键结论、异常波动原因、预算偏差说明、预测结果、建议关注点，以及两按钮加导出按钮。
- 1588 和 1920 宽度保持右侧洞察栏并列；1500 以下洞察栏下移，避免主区被压缩裁切。

## 修正过的问题

- `/expense/usage/dashboard` 原先指向新建任务页，已改为趋势分析看板。
- 右侧预测表被全局 `table { min-width: 860px }` 撑宽，导致按钮和页面横向溢出；已在右栏局部覆盖 `min-width:0` 和 `table-layout:fixed`。
- 1366 宽度下右栏并列会压缩筛选和指标区；已增加 1500px 响应式断点。

## 验证结果

- `node --test tests/expenseTrendDashboard.test.js`：通过。
- `npm run build`：通过，保留既有 chunk size 警告。
- Playwright 视口检查：`1366x768`、`1440x900`、`1588x995`、`1920x1080` 均无横向溢出和控制台 error。
