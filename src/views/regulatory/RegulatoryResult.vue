<template>
  <PageHeader eyebrow="分析结果" title="监管分析结果总览" description="候选建议纳入或不纳入后形成待确认结果，确认后才能锁定和导出。">
    <button class="btn" @click="store.handleRegulatoryAction('confirm')">确认结果</button>
    <button class="btn primary" @click="store.handleRegulatoryAction('lock')">锁定</button>
    <button class="btn" @click="store.handleRegulatoryAction('export')">导出</button>
    <RouterLink class="btn" to="/regulatory/history">历史查询</RouterLink>
  </PageHeader>
  <section class="panel state-panel">
    <div>
      <span class="state-label">结果办理状态</span>
      <h3>{{ resultState.status }} / {{ resultState.versionNo }} / {{ resultState.exportStatus || '未导出' }}</h3>
      <p>确认后才能锁定，锁定后才能导出；版本和导出均写入记录中心。</p>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>候选池</h3></div>
    <DataTable :columns="columns" :rows="store.db.regulatoryFindings" row-key="findingId">
      <template #actions="{ row }">
        <button class="btn" @click="row.adoptStatus = '已纳入'; store.addLog('纳入候选建议', '监管线索', row.findingId)">纳入</button>
        <button class="btn" @click="row.adoptStatus = '不纳入'; store.addLog('不纳入候选建议', '监管线索', row.findingId)">不纳入</button>
        <button class="btn" @click="drawer = row">来源证据</button>
      </template>
    </DataTable>
  </section>
  <aside v-if="drawer" class="drawer">
    <div class="panel-title">
      <h3>来源证据</h3>
      <button class="btn" @click="drawer = null">关闭</button>
    </div>
    <p><strong>{{ drawer.title }}</strong></p>
    <p>来源：{{ drawer.source }}</p>
    <p>用途：作为审计线索和风险提示，不直接作为审计结论。</p>
  </aside>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const drawer = ref(null);
const resultState = computed(() => store.db.regulatoryResultState || { status: '待确认', versionNo: '草稿版', exportStatus: '未导出' });
const columns = [
  { key: 'type', label: '类型' },
  { key: 'title', label: '关注内容' },
  { key: 'riskLevel', label: '风险等级' },
  { key: 'source', label: '来源' },
  { key: 'adoptStatus', label: '采纳状态' }
];
</script>
