<template>
  <PageHeader
    eyebrow="入库前预检"
    title="报告资料入库前预检"
    description="检查报告资料完整性、三字段、元数据、重复文件、权限范围和可引用状态。"
  >
    <RouterLink class="btn" to="/audit-report/material/metadata">返回元数据</RouterLink>
    <button class="btn primary" @click="confirmInbound">确认入库</button>
  </PageHeader>

  <MetricGrid :metrics="metrics" />
  <section class="section-grid">
    <div class="panel">
      <div class="panel-title"><h3>预检结果</h3></div>
      <DataTable :columns="columns" :rows="rows" row-key="item" />
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>入库后位置</h3></div>
      <div class="summary-item">
        <strong>文件中心</strong>
        <p>资料入库后可按所属任务、来源模块、覆盖部门、生效部门、创建人、确认人和是否有效查询。</p>
      </div>
      <div class="summary-item">
        <strong>报告来源选择</strong>
        <p>预检通过的资料会出现在报告来源选择中，供当前报告草稿引用。</p>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '检查项', value: '6', hint: '完整性、权限、引用' },
  { label: '通过', value: '5', hint: '可入库资料' },
  { label: '提示', value: '1', hint: '重复文件保留新版本' },
  { label: '阻断', value: '0', hint: '无阻断项' }
];
const columns = [
  { key: 'item', label: '检查项' },
  { key: 'result', label: '结果' },
  { key: 'detail', label: '说明' }
];
const rows = [
  { item: '文件完整性', result: '通过', detail: '报告资料文件非空且格式可识别' },
  { item: '三字段完整性', result: '通过', detail: '适配机构、适配部门、数据归属周期完整' },
  { item: '元数据完整性', result: '通过', detail: '资料类型、报告类型、适配章节和来源部门完整' },
  { item: '重复文件', result: '提示', detail: '旧版人员名单保留新版本并形成版本记录' },
  { item: '权限范围', result: '通过', detail: '资料归属在当前用户可查看范围内' },
  { item: '可引用状态', result: '通过', detail: '资料可被当前报告草稿引用' }
];
function confirmInbound() {
  store.addLog('确认审计报告资料入库', '报告资料批次', 'RM-UP-001');
  store.setNotice('审计报告资料已入库，可在文件中心查询，并可在报告来源选择中引用。');
}
</script>

