<template>
  <PageHeader eyebrow="三字段补全" title="文件级三字段补全" description="适配机构、适配部门、数据归属周期是入库前必填条件。">
    <RouterLink class="btn" to="/supervision/import/folder-preview">返回预览</RouterLink>
    <RouterLink class="btn primary" to="/supervision/import/metadata">保存并进入元数据映射</RouterLink>
  </PageHeader>
  <DataTable :columns="columns" :rows="rows" row-key="assetId" />
  <section class="panel">
    <div class="panel-title"><h3>后续入库条件</h3></div>
    <div class="workflow-note">保存三字段后必须继续进入元数据映射和入库前预检。只有确认入库后，文件才会出现在文件中心并被报告来源选择引用。</div>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'fileType', label: '文件类型' },
  { key: 'adaptOrg', label: '适配机构' },
  { key: 'adaptDepartment', label: '适配部门' },
  { key: 'dataPeriod', label: '数据归属周期' },
  { key: 'metadataStatus', label: '元数据状态' }
];
const rows = [
  { assetId: 'M-1', fileName: '风险事项台账.xlsx', fileType: '监督共享台账', adaptOrg: '上海分公司', adaptDepartment: '经纪业务部', dataPeriod: '2026Q1', metadataStatus: '已补全' },
  { assetId: 'M-2', fileName: '整改跟踪表.xlsx', fileType: '整改资料', adaptOrg: '上海分公司', adaptDepartment: '经纪业务部', dataPeriod: '2026Q1', metadataStatus: '待预检' }
];
</script>
