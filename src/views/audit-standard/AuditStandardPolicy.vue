<template>
  <div class="audit-standard-policy-page route-fill-page">
  <PageHeader eyebrow="制度能力" title="制度查询、变更与比对" description="制度能力以结构化执行页呈现，结果沉淀到任务详情，不提供开放式聊天入口。">
    <RouterLink class="btn" to="/audit-standard/workbench">返回规范工作台</RouterLink>
    <RouterLink class="btn primary" to="/tasks/detail">沉淀到任务详情</RouterLink>
  </PageHeader>

  <section class="three-col">
    <article class="business-card">
      <h3>制度查询</h3>
      <p>按制度名称、适用部门和时间范围查询现行有效版本，查看是否已被任务或报告引用。</p>
      <button class="btn primary" @click="store.handlePolicyCapability('query')">查询制度</button>
      <span class="pill">{{ executionState.query?.status || '待执行' }}</span>
    </article>
    <article class="business-card">
      <h3>制度变更</h3>
      <p>识别版本差异和影响范围，变更结果必须人工确认后才能进入规范生成。</p>
      <button class="btn" @click="store.handlePolicyCapability('change')">生成变更影响</button>
      <span class="pill">{{ executionState.change?.status || '待执行' }}</span>
    </article>
    <article class="business-card">
      <h3>制度比对</h3>
      <p>比对内部制度和外部法规差异，输出规范优化建议和引用依据。</p>
      <button class="btn" @click="store.handlePolicyCapability('compare')">开始比对</button>
      <span class="pill">{{ executionState.compare?.status || '待执行' }}</span>
    </article>
  </section>

  <section class="section-grid">
    <div>
      <section class="panel">
        <div class="panel-title"><h3>制度查询结果</h3></div>
        <DataTable :columns="policyColumns" :rows="store.db.policyLibrary" row-key="policyId" />
      </section>
      <section class="panel">
        <div class="panel-title"><h3>制度变更影响</h3></div>
        <DataTable :columns="changeColumns" :rows="store.db.policyChangeItems" row-key="changeId" />
      </section>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>制度比对结果</h3></div>
      <DataTable :columns="compareColumns" :rows="store.db.policyCompareItems" row-key="compareId" />
      <div class="workflow-note">被引用制度版本不能直接覆盖或失效，只能形成新版本并触发相关草稿重新确认。</div>
    </aside>
  </section>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const executionState = computed(() => store.db.policyExecutionState || {});
const policyColumns = [
  { key: 'name', label: '制度名称' },
  { key: 'version', label: '版本' },
  { key: 'effectiveDept', label: '生效部门' },
  { key: 'status', label: '状态' },
  { key: 'referenceStatus', label: '引用状态' }
];
const changeColumns = [
  { key: 'policyName', label: '制度名称' },
  { key: 'changeType', label: '变更类型' },
  { key: 'impact', label: '影响范围' },
  { key: 'status', label: '确认状态' }
];
const compareColumns = [
  { key: 'section', label: '比对章节' },
  { key: 'internalRule', label: '内部制度' },
  { key: 'externalRule', label: '外部法规' },
  { key: 'result', label: '结果' },
  { key: 'action', label: '处理动作' }
];
</script>

<style scoped>
.audit-standard-policy-page {
  height: 0;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: var(--ui-space-4);
  overflow: auto;
}

.audit-standard-policy-page > .page-head,
.audit-standard-policy-page > .three-col,
.audit-standard-policy-page > .section-grid,
.audit-standard-policy-page .panel {
  margin-bottom: 0;
}

.audit-standard-policy-page > .section-grid,
.audit-standard-policy-page > .section-grid > div,
.audit-standard-policy-page > .section-grid > aside {
  min-height: 0;
}

.audit-standard-policy-page > .section-grid > div,
.audit-standard-policy-page > .section-grid > aside {
  overflow: auto;
}

.audit-standard-policy-page > .section-grid > div {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: var(--ui-space-4);
}

.audit-standard-policy-page > .section-grid .panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

:deep(.table-wrap) {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-bottom: 0;
}

:deep(.table-wrap > table) {
  height: 100%;
}
</style>
