# Design QA — 任务中心无数据态

- source visual truth path: `C:/Users/ZHUANZ~1/AppData/Local/Temp/codex-clipboard-373cd214-c977-4c06-9636-e6480a58cb2a.png`
- implementation screenshot path: `docs/15-task-center-empty-redline-rebuild/empty-state-final.png`
- combined comparison path: `docs/15-task-center-empty-redline-rebuild/comparison-final.png`
- viewport: source 1588 × 996；browser capture 1572 × 1008，组合对照时归一化为 1588 × 996
- state: `/tasks`, global demo data = empty
- browser: Chrome for Testing；内置浏览器附着失败后按浏览器选择规则回退

## Findings

- 无剩余 P0/P1/P2。
- [P3] 顶栏新增“演示数据 有/无”分段开关，参考图没有该控件；这是用户明确要求的功能差异。
- [P3] 空任务插画使用 Font Awesome 收件箱、消息、叶片和阴影图标组合，轮廓与参考一致，但装饰细节不是原设计资产。

## Required Fidelity Surfaces

- 字体与排版：沿用项目微软雅黑/PingFang SC后台字体栈；标题、字段、状态文案和辅助文案层级与参考一致。
- 间距与布局：筛选、6卡、列表、推荐路径和228px右栏坐标已按同尺寸截图校正，主要边界误差约0–4px。
- 颜色与令牌：品牌红、主按钮、状态色、表头灰和页面背景与参考图对齐；红框仅作为参考标注，未写入产品。
- 图像与图标：新空态使用已安装的 Font Awesome 图标库；没有 emoji、CSS绘图、手绘SVG或模糊位图。
- 文案与内容：6卡、8列表头、9状态说明、5步路径、两个创建入口和导入入口均与参考图一致。

## Comparison History

- Iteration 1：发现统计卡高度少约6px、列表少约16px、推荐路径少约34px、状态说明未撑底。
- Iteration 2：校正主要区块高度与右栏；放大空插画；发现图标底色、侧栏字号和品牌红仍有差异。
- Final：使用实色统计/状态图标、放大侧栏品牌与导航、校正品牌红；合并对照未发现P0/P1/P2。

## Focused Region Comparison

- 筛选：6字段、日期范围、动态负责人和查询/重置完整。
- 空列表：8列表头、插画、标题、说明、双按钮完整。
- 右栏：创建CTA、9状态和底部提示完整并撑至目标高度。

## Primary Interactions

- 统计卡点击同步任务状态筛选。
- 查询滚动到空列表；重置恢复默认筛选。
- 两个创建按钮进入 `/tasks/create`。
- 导入模拟任务切换到全局有数据态，显示28条任务；顶栏“无”可恢复空态。

## Responsive Evidence

- 1588/1366/1024/768/390px 页面级横向溢出均为 false。
- 1366px：筛选和统计卡3列；1024px以下右栏下移；390px统计卡2列、筛选单列。

## Console

- errors/warnings: 0

final result: passed
