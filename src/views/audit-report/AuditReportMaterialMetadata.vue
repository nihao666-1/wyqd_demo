<template>
  <PageHeader
    eyebrow="元数据映射"
    title="报告资料元数据映射"
    description="配置资料类型、适配报告类型、适配章节、来源部门和可引用状态。"
  >
    <RouterLink class="btn" to="/audit-report/material/field-edit">返回三字段</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/material/precheck">下一步：入库前预检</RouterLink>
  </PageHeader>

  <section class="section-grid">
    <div class="panel">
      <div class="panel-title"><h3>文件级元数据</h3></div>
      <DataTable :columns="columns" :rows="rows" row-key="fileId">
        <template #actions="{ row }">
          <button class="btn" @click="save(row)">保存映射</button>
        </template>
      </DataTable>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>章节匹配规则</h3></div>
      <div class="summary-item">
        <strong>当前模板</strong>
        <p>营业部常规审计报告模板 V2.1，资料将按章节进入来源选择。</p>
      </div>
      <div class="summary-item">
        <strong>引用限制</strong>
        <p>只有预检通过且可引用状态为“可引用”的资料，才能进入报告正式来源。</p>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'materialType', label: '资料类型' },
  { key: 'reportType', label: '适配报告类型' },
  { key: 'chapter', label: '适配章节' },
  { key: 'sourceDepartment', label: '来源部门' },
  { key: 'referenceStatus', label: '可引用状态' }
];
const rows = [
  { fileId: 'RM-F-001', fileName: '客户投诉整改说明.docx', materialType: '整改资料', reportType: '常规审计', chapter: '三、整改建议', sourceDepartment: '经纪业务部', referenceStatus: '待预检' },
  { fileId: 'RM-F-002', fileName: '预算执行明细.xlsx', materialType: '预算资料', reportType: '常规审计', chapter: '二、费用与预算情况', sourceDepartment: '计划财务部', referenceStatus: '待预检' },
  { fileId: 'RM-F-003', fileName: '旧版人员名单.xlsx', materialType: '组织资料', reportType: '常规审计', chapter: '一、审计范围', sourceDepartment: '审计部', referenceStatus: '重复文件待确认' }
];
function save(row) {
  store.addLog('保存审计报告资料元数据', '报告资料', row.fileId);
  store.setNotice(`${row.fileName} 元数据映射已保存，等待入库前预检。`);
}
</script>

