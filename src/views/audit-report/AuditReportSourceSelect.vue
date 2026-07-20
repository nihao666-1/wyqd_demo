<template>
  <PageHeader eyebrow="来源选择" title="报告来源选择" description="按权限选择模板、API 数据、库内资料、历史报告、费用结果和风险事项。">
    <RouterLink class="btn" to="/audit-report/workbench">返回入口</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/gap-list">执行来源预检</RouterLink>
  </PageHeader>
  <PageState
    v-bind="stateProps"
    primary-text="处理资料缺口"
    primary-to="/audit-report/gap-list"
    secondary-text="补充上传资料"
    secondary-to="/materials/import?scene=audit-report&step=supplement-preview"
  />
  <FilterPanel :items="filters" @query="store.setNotice('已按对象、报告类型、部门和资料权限刷新来源。')" />
  <section class="section-grid">
    <div class="panel">
      <div class="panel-title"><h3>已选择来源</h3></div>
      <DataTable :columns="columns" :rows="rows" row-key="id" />
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>生成条件</h3></div>
      <div class="summary-item">
        <strong>来源预检前置</strong>
        <p>API 数据保存快照，库内资料校验引用状态，费用审计结果按锁定快照引用。</p>
      </div>
      <div class="pill-list">
        <span class="pill">关键资料：待核对</span>
        <span class="pill">模板：V2.1</span>
        <span class="pill">格式：V1.3</span>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import PageState from '../../components/common/PageState.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const stateProps = {
  state: store.db.pageStates.reportSource.state,
  label: '来源预检',
  title: store.db.pageStates.reportSource.title,
  description: store.db.pageStates.reportSource.description
};
const filters = [
  { label: '对象类型', value: '营业部' },
  { label: '报告类型', value: '常规审计报告' },
  { label: '报告模板', value: '营业部常规审计报告模板 V2.1' },
  { label: '格式模板', value: '东方证券报告格式 V1.3' },
  { label: '覆盖部门', value: '经纪业务部、计划财务部' },
  { label: '资料周期', value: '2026H1' }
];
const columns = [
  { key: 'type', label: '来源类型' },
  { key: 'name', label: '来源名称' },
  { key: 'scope', label: '权限范围' },
  { key: 'status', label: '预检状态' }
];
const rows = [
  { id: 'S-1', type: 'API 数据', name: '经营指标快照', scope: '上海分公司', status: '待预检' },
  { id: 'S-2', type: '已入库资料', name: '风险事项台账.xlsx', scope: '经纪业务部', status: '可引用' },
  { id: 'S-2B', type: '报告资料库', name: '客户投诉整改说明.docx', scope: '经纪业务部 / 2026H1', status: '可引用' },
  { id: 'S-3', type: '费用审计结果', name: '费用异常审计结果 TASK-2026-001', scope: '计划财务部', status: '可引用' },
  { id: 'S-4', type: '补充上传', name: '待补充整改责任说明', scope: '审计部', status: '待补充' }
];
</script>
