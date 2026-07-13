# 创建任务第 5 步“确认提交”设计

## 设计结论

采用“受控步骤组件 + 纯逻辑状态文件 + 两个聚焦展示组件”。父页面负责持有状态、保存草稿、返回上一步和处理提交；确认提交组件不直接访问 store 或 router。步骤条在本页高亮第 5 步，第 4 步显示完成态。

未采用的方案：

1. 继续把全部模板和 CSS 塞入 `TaskCreate.vue`：接入快，但会放大当前单文件职责和并发冲突。
2. 用字段 schema 自动生成八张卡：代码看似少，但参考图的首卡合并、三种卡高和 45:55 报告卡需要大量例外，维护和保真都更差。

## 文件边界

- `src/domain/taskCreate/taskTemplateOutputSettings.js`：九能力/八配置组映射、默认配置、深复制、可见组、右栏摘要、校验。
- `src/views/tasks/TaskTemplateOutputCardGrid.vue`：八张业务配置卡；直接写语义化字段，不做通用表单引擎。
- `src/views/tasks/TaskCreateConfirmationAside.vue`：任务概要、能力、资料、输出、风险五区，只展示传入摘要。
- `src/views/tasks/TaskCreateTemplateOutputStep.vue`：步骤条、主/右双栏、全局设置和底部动作；通过 emits 把意图交给父页面。
- `tests/taskTemplateOutputSettings.test.js`：纯函数定向测试。

## 唯一目标状态

黄金对照 fixture 固定为：

- 任务：上海分公司 Q1 常规审计任务；上海分公司；2025-01-01 至 2025-03-31；常规审计；张三。
- 九项能力全部选中。
- 八个配置组：制度查询/制度变更合并一组，其余能力各一组。
- 五项资料：财务报表已就绪、费用明细台账缺少 3 份、相关制度文件已就绪、预算执行情况表已就绪、监管案例与舆情库已就绪。
- 九项输出按能力顺序稳定派生。
- 资料缺口属于风险提示，不由确认提交组件自行阻断；最终是否阻断由父页面提交策略决定。

## 配置模型

```js
{
  policyKnowledge: {
    knowledgeScope: '全部制度库',
    effectiveTime: '最新有效',
    outputFormats: ['PDF', 'Excel'],
    citeToTask: true
  },
  policyCompare: {
    externalScope: '证监会+自律规则',
    internalScope: '公司制度库（全量）',
    rules: ['缺失识别', '口径差异', '时限差异'],
    output: 'Excel（差异清单）'
  },
  regulatoryAnalysis: {
    caseSource: '证监会+交易所',
    sentimentSource: '新闻+监管通报',
    riskThreshold: '中风险及以上',
    output: '监管关注点清单'
  },
  auditStandard: {
    template: '常规审计规范模板 V2.1',
    output: 'Excel',
    includeKeyPoints: true
  },
  supervisionAnalysis: {
    framework: '监督共享分析报告模板',
    taxonomy: '监管标签体系 V1.0',
    outputFormats: ['Excel', 'Word 报告']
  },
  expenseAudit: {
    ruleVersion: '费用规则库 V2.1',
    anomalyType: '全部异常类型',
    output: '异常汇总 Excel'
  },
  reportGeneration: {
    reportType: '常规审计',
    reportTemplate: '常规审计报告模板 V2.2',
    formatTemplate: '证券行业格式模板 V2.0',
    outputFormats: ['Word', 'PDF']
  },
  reportReview: {
    rules: ['字体规范', '格式规范', '标题编号', '文字优化'],
    output: '审核问题清单（Excel）'
  },
  global: {
    aiGeneratedLabel: true,
    multiModelReview: true,
    saveProcessVersions: true,
    exportAuditTrail: true
  }
}
```

## 组件合同

```vue
<TaskCreateTemplateOutputStep
  :model-value="templateOutputSettings"
  :steps="steps"
  :current-step="3"
  :task-summary="taskSummary"
  :selected-capabilities="selectedCapabilities"
  :materials="materialRows"
  @update:model-value="templateOutputSettings = $event"
  @request-save="saveDraft"
  @request-previous="step = 2"
  @request-submit="submitTask"
/>
```

- `update:modelValue` 返回完整新对象，不变异 prop。
- `request-save`、`request-previous`、`request-submit` 无 payload。
- “提交任务”直接发出提交意图；保留五步步骤条仅为参考图一致，子组件不进入第 5 步。
- “查看更多/查看详情”先使用可聚焦按钮并发出 `request-summary-detail(section)`，不得留下无反馈空链接。

## 布局合同

- 1603×1008：主列 `985±10px`，右栏 `373±5px`，间距 `12–16px`。
- 前六卡三列；第一行高 `200±6px`，第二行高 `154±6px`。
- 报告卡独立一行，列比 `45:55±1.5%`，高 `174±8px`。
- 四项全局设置等分，宽差不超过 `4px`。
- 页面、卡片、右栏全部自然高度；禁止 `100vh`、整体缩放和右栏独立滚动。
- 正式设备只有显示器与笔记本电脑两种：两者均保留主区+确认栏双栏；1366 笔记本内容容器约 1170px，普通卡宽不得低于 252px。
- 小于笔记本宽度时仍保留两列/单列安全降级，但不作为视觉复刻验收，也不为其牺牲桌面信息密度。
- 页面级 `scrollWidth <= innerWidth + 1`；短视口允许整页纵向滚动。

## 无障碍与交互

- 所有 select、checkbox、radio、toggle 使用真实原生控件和可见 label。
- checkbox/radio 使用品牌红；toggle 使用绿色；状态同时有文字，不仅靠颜色。
- 步骤当前项使用 `aria-current="step"`；所有动作均为 button。
- 配置校验至少覆盖报告模板为空、报告输出格式为空、报告审核规则为空。
- 保存草稿由父页面保存九能力、八组配置、四项全局设置和资料状态的深复制。

## 验收

- 纯逻辑定向测试先红后绿。
- 组件接入后使用 Edge/Chromium、100% zoom、DPR 1，在 1603×1008 生成全页截图及区域裁剪。
- R01–R20 的外框误差不超过 4px，间距/控件高度误差不超过 3px；不允许缺元素、错文案、裁切或与参考图不同的关键换行。
- 补充显示器 `1920×1080 / 1600×900` 与笔记本 `1440×900 / 1366×768` 验证。

## 自审

- 无 TBD/TODO；九能力/八组、资料风险、提交语义和像素阈值已锁定。
- 组件不依赖正在并发修改的父文件，接入点清晰。
- 本轮不触碰 `MaterialParsing*`、`materialParsingState.js` 或 `docs/16-material-parsing-redline-rebuild/`。
