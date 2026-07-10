<template>
  <PageHeader eyebrow="全过程追溯" title="任务详情台账" description="任务、资料、能力运行、结果、报告、版本和记录统一沉淀在当前任务内。">
    <RouterLink class="btn primary" to="/expense/anomaly/candidates">继续当前步骤</RouterLink>
    <RouterLink class="btn" to="/records">查看记录中心</RouterLink>
    <RouterLink class="btn" to="/files">查看文件中心</RouterLink>
  </PageHeader>

  <PageState
    v-bind="stateProps"
    primary-text="处理候选异常"
    primary-to="/expense/anomaly/candidates"
    secondary-text="查看报告草稿"
    secondary-to="/audit-report/draft"
  />

  <MetricGrid :metrics="metrics" />

  <section class="panel">
    <div class="panel-title">
      <h3>任务台账页签</h3>
      <span class="pill">所有能力结果必须沉淀到任务</span>
    </div>
    <div class="segmented tab-grid">
      <button
        v-for="tab in store.db.taskDetailTabs"
        :key="tab.tabKey"
        class="btn task-tab"
        :class="{ primary: store.activeTaskTab === tab.tabKey }"
        @click="store.setTaskTab(tab.tabKey)"
      >
        {{ tab.label }}
        <small>{{ tab.count }} / {{ tab.status }}</small>
      </button>
    </div>
  </section>

  <section class="section-grid">
    <div>
      <section v-if="store.activeTaskTab === 'overview'" class="panel">
        <div class="panel-title"><h3>任务概览</h3></div>
        <div class="filter-grid">
          <label><span>任务名称</span><input value="上海分公司二季度费用异常审计" readonly /></label>
          <label><span>权限范围</span><input value="上海分公司 / 经纪业务部、计划财务部" readonly /></label>
          <label><span>审计期间</span><input value="2026Q2" readonly /></label>
          <label><span>当前状态</span><input value="费用异常待确认，报告草稿待审核" readonly /></label>
        </div>
      </section>

      <section v-else-if="store.activeTaskTab === 'materials'" class="panel">
        <div class="panel-title"><h3>输入资料</h3></div>
        <DataTable :columns="fileColumns" :rows="store.db.fileAssetsExtended" row-key="assetId">
          <template #actions>
            <RouterLink class="btn" to="/files/detail">查看引用</RouterLink>
          </template>
        </DataTable>
      </section>

      <section v-else-if="store.activeTaskTab === 'analysis'" class="panel">
        <div class="panel-title"><h3>分析过程</h3></div>
        <DataTable :columns="runColumns" :rows="store.db.capabilityRuns" row-key="runId">
          <template #actions="{ row }">
            <RouterLink v-if="row.capabilityName === '费用审计'" class="btn" to="/expense/anomaly/candidates">处理</RouterLink>
            <RouterLink v-else-if="row.capabilityName === '制度比对'" class="btn" to="/audit-standard/policy">进入</RouterLink>
            <button v-else class="btn" @click="openRunSource(row)">查看依据</button>
          </template>
        </DataTable>
      </section>

      <section v-else-if="store.activeTaskTab === 'results'" class="panel">
        <div class="panel-title"><h3>生成结果</h3></div>
        <DataTable :columns="findingColumns" :rows="store.db.supervisionFindings" row-key="findingId" />
      </section>

      <section v-else-if="store.activeTaskTab === 'reports'" class="panel">
        <div class="panel-title"><h3>报告与附件</h3></div>
        <DataTable :columns="reportColumns" :rows="reportRows" row-key="id">
          <template #actions="{ row }">
            <RouterLink v-if="row.id === 'REP-1'" class="btn primary" to="/audit-report/draft">查看草稿</RouterLink>
            <RouterLink v-else class="btn" to="/files/detail">查看文件</RouterLink>
          </template>
        </DataTable>
      </section>

      <section v-else-if="store.activeTaskTab === 'changes'" class="panel">
        <div class="panel-title"><h3>修改记录</h3></div>
        <DataTable :columns="changeColumns" :rows="changeRows" row-key="id" />
      </section>

      <section v-else-if="store.activeTaskTab === 'reviews'" class="panel">
        <div class="panel-title"><h3>复核记录</h3></div>
        <DataTable :columns="reviewColumns" :rows="store.db.reviewRecords" row-key="reviewLogId" />
      </section>

      <section v-else-if="store.activeTaskTab === 'versions'" class="panel">
        <div class="panel-title"><h3>版本记录</h3></div>
        <DataTable :columns="versionColumns" :rows="store.db.versionRecords" row-key="versionId" />
      </section>

      <section v-else-if="store.activeTaskTab === 'exports'" class="panel">
        <div class="panel-title"><h3>导出记录</h3></div>
        <DataTable :columns="exportColumns" :rows="store.db.exportRecords" row-key="exportId" />
      </section>

      <section v-else class="panel">
        <div class="panel-title"><h3>操作留痕</h3></div>
        <DataTable :columns="logColumns" :rows="store.db.operationLogs" row-key="logId" />
      </section>
    </div>

    <aside class="summary-rail">
      <div class="panel">
        <div class="panel-title"><h3>当前办理条件</h3></div>
        <div class="summary-item">
          <strong>报告动作顺序</strong>
          <p>来源预检、缺口处理、草稿生成、人工确认、锁定、导出、回传比对必须按顺序推进。</p>
        </div>
        <div class="summary-item">
          <strong>引用锁定</strong>
          <p>已被报告或规范引用的资料不能直接修改、失效或删除，只能申请解锁并回退草稿。</p>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><h3>角色路径</h3></div>
        <div class="tree">
          <div v-for="role in store.db.roleJourneys" :key="role.role" class="tree-item">
            <strong>{{ role.role }}</strong>
            <p>{{ role.focus }}</p>
          </div>
        </div>
      </div>
    </aside>
  </section>
  <aside v-if="store.activeDrawer === 'task-run-source'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.capabilityName }}来源依据</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <div class="summary-item"><strong>运行状态</strong><p>{{ store.drawerPayload.status }}</p></div>
    <div class="summary-item"><strong>输出结果</strong><p>{{ store.drawerPayload.output }}</p></div>
    <div class="summary-item"><strong>沉淀位置</strong><p>任务详情 / 分析过程 / 操作留痕</p></div>
  </aside>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import PageState from '../../components/common/PageState.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const stateProps = computed(() => ({
  state: store.db.pageStates.taskDetail.state,
  label: '任务状态',
  title: store.db.pageStates.taskDetail.title,
  description: store.db.pageStates.taskDetail.description
}));
const metrics = computed(() => [
  { label: '任务状态', value: '待确认', hint: '候选异常处理中' },
  { label: '运行能力', value: String(store.db.capabilityRuns.length), hint: '九类能力沉淀 4 项' },
  { label: '资料资产', value: String(store.db.fileAssetsExtended.length), hint: '含入库、生成、回传文件' },
  { label: '报告草稿', value: store.db.reportDraft.status, hint: '审核建议待处理' }
]);
const fileColumns = [
  { key: 'fileName', label: '文件名称' },
  { key: 'assetCategory', label: '文件分类' },
  { key: 'sourceModule', label: '来源模块' },
  { key: 'taskName', label: '所属任务' },
  { key: 'referenceStatus', label: '引用状态' },
  { key: 'versionNo', label: '版本' }
];
const runColumns = [
  { key: 'capabilityName', label: '能力' },
  { key: 'status', label: '状态' },
  { key: 'source', label: '来源' },
  { key: 'output', label: '输出结果' },
  { key: 'nextAction', label: '下一步' }
];
const findingColumns = [
  { key: 'type', label: '结果类型' },
  { key: 'title', label: '结果内容' },
  { key: 'source', label: '来源' },
  { key: 'status', label: '状态' }
];
const reportRows = [
  { id: 'REP-1', name: '营业部常规审计报告草稿', type: '报告草稿', status: store.db.reportDraft.status, version: '草稿' },
  { id: 'REP-2', name: '费用异常候选明细.xlsx', type: '附件', status: '可引用', version: 'V1.0' },
  { id: 'REP-3', name: '线下修改稿_比对结果.docx', type: '回传文件', status: '待归档', version: 'V1.1-离线稿' }
];
const reportColumns = [
  { key: 'name', label: '名称' },
  { key: 'type', label: '类型' },
  { key: 'status', label: '状态' },
  { key: 'version', label: '版本' }
];
const changeRows = [
  { id: 'CHG-1', object: '整改建议', before: '待补充', after: '已补充责任部门说明', operator: '王审计' },
  { id: 'CHG-2', object: '报告审核建议', before: '待处理', after: '采纳', operator: '李复核' }
];
const changeColumns = [
  { key: 'object', label: '对象' },
  { key: 'before', label: '修改前' },
  { key: 'after', label: '修改后' },
  { key: 'operator', label: '操作人' }
];
const reviewColumns = [
  { key: 'objectName', label: '复核对象' },
  { key: 'reviewer', label: '复核人' },
  { key: 'action', label: '动作' },
  { key: 'result', label: '结果' },
  { key: 'createdAt', label: '时间' }
];
const versionColumns = [
  { key: 'objectType', label: '对象类型' },
  { key: 'objectName', label: '对象名称' },
  { key: 'versionNo', label: '版本' },
  { key: 'status', label: '状态' },
  { key: 'createdBy', label: '创建人' }
];
const exportColumns = [
  { key: 'objectType', label: '对象类型' },
  { key: 'objectName', label: '对象名称' },
  { key: 'format', label: '格式' },
  { key: 'exportedBy', label: '导出人' },
  { key: 'exportedAt', label: '导出时间' }
];
const logColumns = [
  { key: 'createdAt', label: '时间' },
  { key: 'operator', label: '操作人' },
  { key: 'action', label: '动作' },
  { key: 'targetType', label: '对象' },
  { key: 'result', label: '结果' }
];
function openRunSource(row) {
  store.openDrawer('task-run-source', row);
  store.addLog('查看能力来源依据', '能力运行', row.runId);
}
</script>
