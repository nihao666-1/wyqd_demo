<template>
  <PageHeader eyebrow="候选异常处理" title="候选异常清单" description="确认、排除、待补充和整改建议必须形成可见行状态变化。">
    <RouterLink class="btn primary" to="/audit-report/source-select">生成异常审计报告</RouterLink>
  </PageHeader>
  <PageState
    v-bind="stateProps"
    primary-text="查看报告来源"
    primary-to="/audit-report/source-select"
    secondary-text="查看记录"
    secondary-to="/records"
  />
  <DataTable :columns="columns" :rows="store.db.expenseAnomalies" row-key="anomalyId">
    <template #actions="{ row }">
      <button class="btn" @click="selectAnomaly(row)">证据链</button>
      <button class="btn" @click="store.updateAnomaly(row.anomalyId, '已确认')">确认</button>
      <button class="btn" @click="store.updateAnomaly(row.anomalyId, '已排除')">排除</button>
      <button class="btn" @click="store.updateAnomaly(row.anomalyId, '待补充')">待补充</button>
    </template>
  </DataTable>
  <section class="section-grid">
    <div class="panel">
      <div class="panel-title"><h3>异常详情与证据链</h3></div>
      <div class="evidence-layout">
        <div class="summary-item">
          <strong>基本信息</strong>
          <p>{{ currentEvidence.basicInfo }}</p>
        </div>
        <div class="summary-item">
          <strong>规则命中</strong>
          <p>{{ currentEvidence.ruleHit }}</p>
        </div>
        <div class="summary-item">
          <strong>人工处理</strong>
          <p>{{ currentEvidence.manualHandling }}</p>
        </div>
      </div>
      <div class="three-col evidence-columns">
        <div>
          <h4>凭证</h4>
          <div class="tree">
            <div v-for="item in currentEvidence.vouchers" :key="item" class="tree-item">{{ item }}</div>
          </div>
        </div>
        <div>
          <h4>审批链</h4>
          <div class="tree">
            <div v-for="item in currentEvidence.approvalChain" :key="item" class="tree-item">{{ item }}</div>
          </div>
        </div>
        <div>
          <h4>相似记录</h4>
          <div class="tree">
            <div v-for="item in currentEvidence.similarRecords" :key="item" class="tree-item">{{ item }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><h3>整改建议编辑</h3></div>
      <p>{{ current.remediation }}</p>
      <div class="workflow-note">保存后写入记录中心，并可作为审计报告来源。状态为待补充的异常不会直接进入正式结论。</div>
      <button class="btn primary" @click="saveRemediation">保存整改建议</button>
    </div>
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import PageState from '../../components/common/PageState.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const current = computed(() => store.db.expenseAnomalies.find((item) => item.anomalyId === store.selectedAnomalyId) || store.db.expenseAnomalies[0]);
const currentEvidence = computed(() => store.db.expenseEvidenceChains.find((item) => item.anomalyId === current.value.anomalyId) || store.db.expenseEvidenceChains[0]);
const stateProps = computed(() => ({
  state: store.db.pageStates.expenseCandidates.state,
  label: '候选状态',
  title: store.db.pageStates.expenseCandidates.title,
  description: store.db.pageStates.expenseCandidates.description
}));
function selectAnomaly(row) {
  store.selectedAnomalyId = row.anomalyId;
  store.setNotice(`${row.anomalyId} 证据链已打开：凭证、审批链、规则命中和相似记录可核对。`);
}
function saveRemediation() {
  store.addLog('保存整改建议', '费用异常', current.value.anomalyId);
  store.setNotice('整改建议已保存，并写入操作记录。');
}
const columns = [
  { key: 'anomalyId', label: '异常编号' },
  { key: 'type', label: '异常类型' },
  { key: 'department', label: '部门' },
  { key: 'employee', label: '人员' },
  { key: 'amount', label: '金额' },
  { key: 'riskLevel', label: '风险等级' },
  { key: 'status', label: '处理状态' }
];
</script>
