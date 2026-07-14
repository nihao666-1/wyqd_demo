<template>
  <div class="supervision-report-draft-page route-fill-page">
    <PageHeader eyebrow="监督共享报告" title="监督共享汇总分析报告草稿" description="来源预检通过后生成草稿，草稿确认后才能导出 Word / Excel。">
    <button class="btn" @click="store.handleSupervisionReportAction('confirm')">确认报告</button>
    <button class="btn primary" @click="store.handleSupervisionReportAction('export')">导出 Word / Excel</button>
    <RouterLink class="btn" to="/files/detail">源文件引用阻断</RouterLink>
  </PageHeader>
  <section class="panel state-panel">
    <div>
      <span class="state-label">报告办理状态</span>
      <h3>{{ report.status }} / {{ report.exportStatus }}</h3>
      <p>确认后才允许导出；导出会写入导出记录和操作留痕。</p>
    </div>
  </section>
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>草稿章节</h3></div>
      <DataTable :columns="columns" :rows="rows" row-key="id" />
    </div>
    <div class="panel">
      <div class="panel-title"><h3>引用来源</h3></div>
      <p>草稿引用风险事项台账、监督检查汇总和整改跟踪资料。被引用源文件不能直接逻辑删除或设置失效。</p>
      <button class="btn" @click="store.handleSupervisionReportAction('source')">打开引用来源抽屉</button>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title">
      <h3>监督共享分析结果</h3>
      <div class="pill-list">
        <span class="pill">发现事项</span>
        <span class="pill">整改事项</span>
        <span class="pill">合规事项</span>
        <span class="pill">风险提示</span>
      </div>
    </div>
    <DataTable :columns="findingColumns" :rows="store.db.supervisionFindings" row-key="findingId">
      <template #actions="{ row }">
        <button class="btn" @click="store.handleSupervisionReportAction('cite', { row })">引用到报告</button>
      </template>
    </DataTable>
  </section>
    <aside v-if="store.activeDrawer === 'supervision-source'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.title }}</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <DataTable :columns="sourceColumns" :rows="store.drawerPayload.rows" row-key="sourceId" />
    </aside>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const report = computed(() => store.db.supervisionReport || { status: '草稿待确认', exportStatus: '未导出' });
const rows = [
  { id: 'SR-1', chapter: '一、汇总范围', source: '库内文件筛选条件', status: '来源完整' },
  { id: 'SR-2', chapter: '二、监督事项概览', source: '风险事项台账.xlsx', status: '来源完整' },
  { id: 'SR-3', chapter: '三、整改跟踪情况', source: '整改跟踪表.xlsx', status: '来源完整' }
];
const columns = [
  { key: 'chapter', label: '章节' },
  { key: 'source', label: '来源' },
  { key: 'status', label: '状态' }
];
const findingColumns = [
  { key: 'type', label: '类型' },
  { key: 'title', label: '事项内容' },
  { key: 'source', label: '来源文件' },
  { key: 'status', label: '处理状态' },
  { key: 'referenceStatus', label: '引用状态' }
];
const sourceColumns = [
  { key: 'fileName', label: '文件名' },
  { key: 'adaptOrg', label: '适配机构' },
  { key: 'adaptDepartment', label: '适配部门' },
  { key: 'dataPeriod', label: '数据周期' },
  { key: 'referenceStatus', label: '引用状态' }
];
</script>

<style scoped>
.supervision-report-draft-page {
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.supervision-report-draft-page > .panel:last-of-type {
  min-height: 0;
  flex: 1;
}
</style>
