<template>
  <PageHeader
    eyebrow="三字段补全"
    title="报告资料文件级三字段补全"
    description="适配机构、适配部门、数据归属周期是报告资料入库和引用前的必填条件。"
  >
    <RouterLink class="btn" to="/audit-report/material/folder-preview">返回预览</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/material/metadata">保存并进入元数据映射</RouterLink>
  </PageHeader>

  <DataTable :columns="columns" :rows="rows" row-key="fileId" />
  <section class="panel">
    <div class="panel-title"><h3>入库条件说明</h3></div>
    <div class="workflow-note">未补全三字段的报告资料不能入库，也不能被报告来源选择引用。</div>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'adaptOrg', label: '适配机构' },
  { key: 'adaptDepartment', label: '适配部门' },
  { key: 'dataPeriod', label: '数据归属周期' },
  { key: 'fieldStatus', label: '字段状态' }
];
const rows = [
  { fileId: 'RM-F-001', fileName: '客户投诉整改说明.docx', adaptOrg: '上海分公司', adaptDepartment: '经纪业务部', dataPeriod: '2026H1', fieldStatus: '已补全' },
  { fileId: 'RM-F-002', fileName: '预算执行明细.xlsx', adaptOrg: '上海分公司', adaptDepartment: '计划财务部', dataPeriod: '2026H1', fieldStatus: '已补全' },
  { fileId: 'RM-F-003', fileName: '旧版人员名单.xlsx', adaptOrg: '上海分公司', adaptDepartment: '审计部', dataPeriod: '2026H1', fieldStatus: '重复文件待确认' }
];
</script>
