<template>
  <PageHeader eyebrow="报告补充上传" title="报告任务补充资料预览" description="补充上传只服务当前报告任务，完成预览、三字段、元数据和重新预检后回流缺口清单。">
    <RouterLink class="btn" to="/audit-report/gap-list">返回缺口清单</RouterLink>
    <button class="btn primary" @click="submitSupplement">保存三字段并重新预检</button>
  </PageHeader>

  <MetricGrid :metrics="metrics" />

  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>补充资料文件夹树</h3></div>
      <div class="tree">
        <div class="tree-item">/当前任务补充资料</div>
        <div class="tree-item">/当前任务补充资料/整改责任部门说明</div>
        <div class="tree-item">整改责任部门说明.docx <StatusTag text="上传成功" tone="success" /></div>
        <div class="tree-item">整改附件补充.xlsx <StatusTag text="上传成功" tone="success" /></div>
      </div>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>回流规则</h3></div>
      <div class="summary-item">
        <strong>报告上下文</strong>
        <p>资料绑定到营业部常规审计报告草稿，不进入无任务归属的公共上传结果。</p>
      </div>
      <div class="summary-item">
        <strong>重新预检</strong>
        <p>三字段、元数据和权限校验通过后，缺口 GAP-001 更新为已补充。</p>
      </div>
    </aside>
  </section>

  <section class="panel">
    <div class="panel-title"><h3>逐文件三字段与元数据</h3></div>
    <DataTable :columns="columns" :rows="rows" row-key="fileId" />
  </section>
</template>

<script setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import StatusTag from '../../components/common/StatusTag.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const router = useRouter();
const metrics = [
  { label: '补充文件', value: '2', hint: '当前报告任务' },
  { label: '三字段', value: '已补全', hint: '适配机构、部门、周期' },
  { label: '元数据', value: '已映射', hint: '资料类型和章节' },
  { label: '重新预检', value: '待执行', hint: '保存后回流缺口清单' }
];
const rows = [
  { fileId: 'RUP-F-001', fileName: '整改责任部门说明.docx', adaptOrg: '上海分公司', adaptDepartment: '审计部', dataPeriod: '2026Q2', materialType: '整改责任说明', chapter: '三、整改建议', status: '待重新预检' },
  { fileId: 'RUP-F-002', fileName: '整改附件补充.xlsx', adaptOrg: '上海分公司', adaptDepartment: '计划财务部', dataPeriod: '2026Q2', materialType: '附件明细', chapter: '附件', status: '待重新预检' }
];
const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'adaptOrg', label: '适配机构' },
  { key: 'adaptDepartment', label: '适配部门' },
  { key: 'dataPeriod', label: '数据归属周期' },
  { key: 'materialType', label: '资料类型' },
  { key: 'chapter', label: '适配章节' },
  { key: 'status', label: '预检状态' }
];
function submitSupplement() {
  store.submitReportSupplement();
  router.push('/audit-report/gap-list');
}
</script>
