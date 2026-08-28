<template>
  <div class="audit-standard-generate-page route-fill-page">
    <PageHeader
      eyebrow="审计规范智能化"
      title="审计规范生成与版本处理"
      description="围绕规范生成、规范修改、规范存储三类场景配置业务字段，并复用报告定稿后的回传比对能力沉淀新旧差异。"
    >
      <RouterLink class="btn" to="/audit-standard/workbench">返回工作台</RouterLink>
      <button class="btn" type="button" @click="store.setNotice('已按三类业务场景刷新配置字段。')">刷新字段</button>
      <RouterLink class="btn primary" to="/audit-standard/draft">进入规范草稿</RouterLink>
    </PageHeader>

    <section v-if="route.query.step === 'precheck'" class="panel merge-hint">
      <strong>生成前预检已并入智能化配置页</strong>
      <p>请先确认法规、内规、资料支撑、版本命名和回传字段，再进入审计规范草稿。</p>
    </section>

    <section class="scenario-strip" aria-label="核心业务场景">
      <article v-for="scenario in scenarioCards" :key="scenario.id" class="scenario-card" :class="{ active: scenario.id === activeScenario }">
        <div>
          <span>{{ scenario.badge }}</span>
          <h3>{{ scenario.title }}</h3>
        </div>
        <p>{{ scenario.description }}</p>
        <ul>
          <li v-for="item in scenario.points" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <section class="panel">
      <div class="panel-title">
        <div>
          <h3>场景一：规范生成</h3>
          <p>结合选定的法规、内规和资料支撑，生成特定审计场景的规范草稿。</p>
        </div>
        <span class="state-chip ready">待资料确认</span>
      </div>
      <div class="field-matrix">
        <label v-for="field in generationFields" :key="field.label" :class="{ wide: field.wide }">
          <span>{{ field.label }}</span>
          <p class="value-box">{{ field.value }}</p>
        </label>
      </div>
      <div class="logic-panel">
        <div>
          <strong>生成逻辑支撑</strong>
          <p>陈老师资料包用于补齐生成规则、条款映射口径、场景适配逻辑和示例规范结构。</p>
        </div>
        <button class="btn" type="button" @click="store.setNotice('已标记陈老师资料包为生成逻辑依赖。')">标记资料依赖</button>
      </div>
    </section>

    <section class="two-col">
      <div class="panel">
        <div class="panel-title">
          <div>
            <h3>场景二：规范修改</h3>
            <p>法规或内规变化后，系统先给出修改意见，人工回传后自动比对新旧版本。</p>
          </div>
          <span class="state-chip warning">需人工回传</span>
        </div>
        <div class="field-stack">
          <label v-for="field in modificationFields" :key="field.label">
            <span>{{ field.label }}</span>
            <p class="value-box">{{ field.value }}</p>
          </label>
        </div>
        <DataTable :columns="diffColumns" :rows="diffRows" row-key="field" />
      </div>

      <div class="panel">
        <div class="panel-title">
          <div>
            <h3>场景三：规范存储</h3>
            <p>新规范直接入库备查；新版本必须按版本号递增命名触发自动比对。</p>
          </div>
          <span class="state-chip ready">版本校验中</span>
        </div>
        <div class="field-stack">
          <label v-for="field in storageFields" :key="field.label">
            <span>{{ field.label }}</span>
            <p class="value-box">{{ field.value }}</p>
          </label>
        </div>
        <div class="version-rule">
          <strong>版本命名规则</strong>
          <p>同名规范新版本需使用“规范名称_V主版本.次版本”格式，且版本号必须大于库内当前有效版本。</p>
          <code>费用报销审计规范_V2.2.docx</code>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <div>
          <h3>回传比对通用能力</h3>
          <p>将审计报告定稿后的回传比对抽象为通用链路，规范修改、报告定稿和后续智能体自进化共用。</p>
        </div>
        <button class="btn" type="button" @click="store.setNotice('回传比对能力已加入通用能力复用清单。')">加入复用清单</button>
      </div>
      <div class="reuse-flow">
        <article v-for="step in reuseSteps" :key="step.title">
          <span>{{ step.order }}</span>
          <strong>{{ step.title }}</strong>
          <p>{{ step.text }}</p>
        </article>
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <div>
          <h3>来源与资料清单</h3>
          <p>本页保留原来源选择能力，并补充资料用途、变更触发和引用状态。</p>
        </div>
        <RouterLink class="btn" to="/audit-standard/library">查看规范库</RouterLink>
      </div>
      <DataTable :columns="sourceColumns" :rows="sourceRows" row-key="sourceId" />
    </section>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const route = useRoute();
const store = inject('store');

const activeScenario = computed(() => {
  if (route.query.mode === '1-2') return 'modify';
  if (route.query.mode === 'upload') return 'storage';
  return 'generate';
});

const scenarioCards = [
  {
    id: 'generate',
    badge: '场景一',
    title: '规范生成',
    description: '选择法规和内规，面向特定审计场景生成规范草稿。',
    points: ['法规/内规双来源', '陈老师资料支撑生成逻辑', '输出规范草稿与引用依据']
  },
  {
    id: 'modify',
    badge: '场景二',
    title: '规范修改',
    description: '制度变动触发修改建议，用户回传后输出新旧差异。',
    points: ['识别外规或内规变动', '系统生成修改意见', '回传任务后自动比对']
  },
  {
    id: 'storage',
    badge: '场景三',
    title: '规范存储',
    description: '新规范入库备查，新版本按递增命名触发比对。',
    points: ['新规范直接入库', '新版本严格校验版本号', '自动比对并留痕']
  }
];

const generationFields = [
  { label: '审计场景', value: '费用报销专项审计', wide: true },
  { label: '适用单位', value: '上海分公司' },
  { label: '适用部门', value: '经纪业务部、计划财务部' },
  { label: '规范类型', value: '专项审计规范' },
  { label: '法规来源', value: '外部法规库：财政部/证监会/交易所现行文件', wide: true },
  { label: '内规来源', value: '公司制度库：费用管理办法、业务招待管理细则', wide: true },
  { label: '资料支撑人', value: '陈老师' },
  { label: '资料状态', value: '待补充生成逻辑材料' },
  { label: '生成依据字段', value: '条款依据、适用范围、检查程序、证据要求、风险提示', wide: true },
  { label: '输出去向', value: '任务详情 / 审计规范草稿 / 规范库待确认区', wide: true }
];

const modificationFields = [
  { label: '变动来源', value: '外部法规或公司内规变动' },
  { label: '触发方式', value: '制度变更监测 / 人工指定版本' },
  { label: '当前规范版本', value: '费用报销审计规范_V2.1' },
  { label: '目标规范版本', value: '费用报销审计规范_V2.2' },
  { label: '系统输出', value: '规范修改意见、影响条款、建议调整字段' },
  { label: '用户动作', value: '按意见修改后回传至任务' },
  { label: '比对对象', value: '回传新版本 vs 当前有效旧版本' },
  { label: '差异输出位置', value: '任务指定字段：版本差异、影响说明、待确认事项' }
];

const storageFields = [
  { label: '上传类型', value: '新规范 / 新版本规范' },
  { label: '入库位置', value: '审计规范库' },
  { label: '新规范处理', value: '直接上传入库备查' },
  { label: '新版本处理', value: '校验名称前缀与递增版本号' },
  { label: '自动比对触发', value: '同名规范且版本号高于当前有效版本' },
  { label: '失败提示', value: '版本号未递增或命名不合规时阻断入库' },
  { label: '留痕字段', value: '上传人、确认人、版本号、比对结果、引用状态' },
  { label: '后续状态', value: '待比对 / 待确认 / 当前有效' }
];

const diffColumns = [
  { key: 'field', label: '指定字段' },
  { key: 'oldValue', label: '旧版本' },
  { key: 'newValue', label: '新版本' },
  { key: 'result', label: '输出结果' }
];

const diffRows = [
  { field: '版本差异', oldValue: 'V2.1 招待费条款', newValue: 'V2.2 新增高档消费限制', result: '生成差异摘要' },
  { field: '影响说明', oldValue: '仅提示发票金额', newValue: '增加小票和同行人员校验', result: '写入任务字段' },
  { field: '待确认事项', oldValue: '无', newValue: '需确认陈老师资料口径', result: '进入人工确认' }
];

const reuseSteps = [
  { order: '01', title: '回传接收', text: '接收用户修改后的规范或审计报告定稿文件，绑定来源任务。' },
  { order: '02', title: '版本识别', text: '解析文件名前缀、版本号、对象类型和当前有效版本关系。' },
  { order: '03', title: '新旧比对', text: '输出条款级、字段级、段落级差异，并写入指定业务字段。' },
  { order: '04', title: '能力沉淀', text: '将确认后的差异、修改意见和采纳结果回流为智能体自进化样本。' }
];

const sourceColumns = [
  { key: 'sourceType', label: '来源类型' },
  { key: 'title', label: '名称' },
  { key: 'period', label: '时间范围' },
  { key: 'version', label: '版本' },
  { key: 'usage', label: '本页用途' },
  { key: 'status', label: '可引用状态' }
];

const sourceRows = computed(() => store.db.standardSources.map((source) => ({
  ...source,
  usage: usageByType[source.sourceType] || '生成依据'
})));

const usageByType = {
  内部制度: '内规选择与变更触发',
  外部法规: '法规选择与修改意见',
  法规库: '外规补充检索',
  案例库: '审计场景样例',
  历史规范: '旧版比对与复用'
};
</script>

<style scoped>
.audit-standard-generate-page {
  height: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.audit-standard-generate-page > .panel {
  flex: 0 0 auto;
}

.merge-hint {
  border-left: 4px solid var(--color-primary);
  background: #fff8f8;
}

.merge-hint p,
.panel-title p,
.logic-panel p,
.version-rule p,
.reuse-flow p,
.scenario-card p,
.scenario-card li {
  color: var(--color-muted);
}

.scenario-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: var(--ui-space-5);
}

.scenario-card {
  min-height: 208px;
  padding: 18px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: 12px;
  align-content: start;
}

.scenario-card.active {
  border-color: rgba(166, 25, 46, 0.5);
  box-shadow: 0 12px 28px rgba(166, 25, 46, 0.12);
}

.scenario-card span,
.state-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 24px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.scenario-card span {
  color: var(--color-primary);
  background: #fff5f6;
}

.scenario-card h3 {
  margin-top: 8px;
  font-size: 17px;
}

.scenario-card ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
}

.field-matrix {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.field-matrix label,
.field-stack label {
  display: grid;
  gap: 6px;
  color: var(--color-muted);
  font-size: 12px;
}

.field-matrix label.wide {
  grid-column: span 2;
}

.value-box {
  width: 100%;
  min-height: 38px;
  border: 1px solid #c8d2df;
  border-radius: 6px;
  padding: 9px 10px;
  color: var(--color-text);
  background: var(--color-surface-strong);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.field-stack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.logic-panel,
.version-rule {
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid #ead1d6;
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius);
  background: #fff8f8;
}

.logic-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.state-chip.ready {
  color: var(--color-primary);
  background: #fff5f6;
}

.state-chip.warning {
  color: var(--color-warning);
  background: #fff7e8;
}

.version-rule code {
  display: block;
  width: fit-content;
  margin-top: 10px;
  padding: 7px 10px;
  border-radius: 6px;
  background: #f2f4f7;
  color: var(--color-text);
  font-size: 12px;
}

.reuse-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.reuse-flow article {
  min-height: 132px;
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface-strong);
}

.reuse-flow span {
  display: block;
  margin-bottom: 12px;
  color: var(--color-primary);
  font-weight: 800;
}

.reuse-flow strong {
  display: block;
  margin-bottom: 8px;
}

@media (max-width: 1200px) {
  .scenario-strip,
  .reuse-flow,
  .field-matrix {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .scenario-strip,
  .reuse-flow,
  .field-matrix,
  .field-stack {
    grid-template-columns: 1fr;
  }

  .field-matrix label.wide {
    grid-column: auto;
  }

  .logic-panel {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
