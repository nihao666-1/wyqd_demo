<template>
  <PageHeader eyebrow="监督共享报告" title="监督共享报告来源选择" description="生成报告前必须按权限选择库内文件，再按机构、部门、周期和标签筛选来源。">
    <RouterLink class="btn" to="/supervision/workbench">返回入口</RouterLink>
    <RouterLink class="btn primary" to="/supervision/report/draft">来源预检并生成草稿</RouterLink>
  </PageHeader>
  <FilterPanel :items="filters" @query="store.setNotice('已按机构、部门、周期和标签筛选库内文件。')" />
  <section class="section-grid">
    <div class="panel">
      <div class="panel-title"><h3>库内可选文件</h3></div>
      <DataTable :columns="columns" :rows="store.db.supervisionReportSources" row-key="sourceId">
        <template #actions="{ row }">
          <button class="btn" @click="selectSource(row)">选择</button>
          <button class="btn" @click="store.openSupervisionSourceDetail(row)">来源详情</button>
        </template>
      </DataTable>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>来源预检条件</h3></div>
      <div class="summary-item">
        <strong>当前已选 {{ selectedCount }} 份</strong>
        <p>只有权限内、元数据完整、可引用状态为“可引用”的库内文件才能进入报告草稿。</p>
      </div>
      <div class="pill-list">
        <span class="pill">机构：上海分公司</span>
        <span class="pill">部门：经纪业务部</span>
        <span class="pill">周期：2026Q1</span>
      </div>
    </aside>
  </section>
  <aside v-if="store.activeDrawer === 'supervision-source-detail'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.fileName }}</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <div class="summary-rail">
      <div class="summary-item"><strong>适配范围</strong><p>{{ store.drawerPayload.adaptOrg }} / {{ store.drawerPayload.adaptDepartment }} / {{ store.drawerPayload.dataPeriod }}</p></div>
      <div class="summary-item"><strong>标签</strong><p>{{ store.drawerPayload.tags }}</p></div>
      <div class="summary-item"><strong>权限与引用</strong><p>{{ store.drawerPayload.permissionScope }} / {{ store.drawerPayload.referenceStatus }}</p></div>
    </div>
  </aside>
</template>

<script setup>
import { inject, ref } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const selectedCount = ref(1);
function selectSource(row) {
  const before = row.referenceStatus;
  store.selectSupervisionReportSource(row);
  if (before === '可引用' && row.referenceStatus === '已加入报告来源') {
    selectedCount.value += 1;
  }
}
const filters = [
  { label: '适配机构', value: '上海分公司' },
  { label: '适配部门', value: '经纪业务部、计划财务部' },
  { label: '数据归属周期', value: '2026Q1' },
  { label: '适配标签', value: '风险事项、整改跟踪' },
  { label: '可用于报告', value: '是' },
  { label: '权限范围', value: '仅权限内资料' }
];
const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'adaptOrg', label: '适配机构' },
  { key: 'adaptDepartment', label: '适配部门' },
  { key: 'dataPeriod', label: '数据归属周期' },
  { key: 'tags', label: '适配标签' },
  { key: 'referenceStatus', label: '可引用状态' },
  { key: 'permissionScope', label: '权限范围' }
];
</script>
