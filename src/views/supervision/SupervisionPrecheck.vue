<template>
  <PageHeader eyebrow="入库前预检" title="监督共享入库前预检" description="检查文件完整性、三字段、元数据、重复文件、格式和权限范围。">
    <RouterLink class="btn" to="/supervision/import/metadata">返回映射</RouterLink>
    <button class="btn primary" @click="confirmInbound">确认入库</button>
  </PageHeader>

  <MetricGrid :metrics="metrics" />
  <DataTable :columns="columns" :rows="rows" row-key="item" />
  <section class="panel">
    <div class="panel-title"><h3>入库结果说明</h3></div>
    <p>入库后文件进入文件中心，可在报告来源选择中按权限、机构、部门、周期和标签筛选引用。</p>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '检查项', value: '6', hint: '覆盖完整性、权限和重复' },
  { label: '通过', value: '5', hint: '可确认入库' },
  { label: '提示项', value: '1', hint: '重复文件保留新版本' },
  { label: '阻断项', value: '0', hint: '无阻断' }
];
const columns = [
  { key: 'item', label: '检查项' },
  { key: 'result', label: '结果' },
  { key: 'detail', label: '说明' }
];
const rows = [
  { item: '文件完整性', result: '通过', detail: '文件非空且格式可识别' },
  { item: '三字段完整性', result: '通过', detail: '适配机构、适配部门、数据归属周期完整' },
  { item: '元数据完整性', result: '通过', detail: '文件类型、来源部门、标签完整' },
  { item: '重复文件', result: '提示', detail: '整改跟踪表保留新版本并记录差异' },
  { item: '权限范围', result: '通过', detail: '文件归属在当前用户权限内' },
  { item: '可引用状态', result: '通过', detail: '可用于监督共享报告生成' }
];
function confirmInbound() {
  store.addLog('确认入库', '监督共享批次', 'UP-SUP-001');
  store.setNotice('监督共享文件已确认入库，现可在文件中心查询，并可被报告来源选择引用。');
}
</script>
