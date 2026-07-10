<template>
  <PageHeader eyebrow="新建分析任务" title="监管分析任务配置" description="先确定被审计对象、部门、期间、业务范围、风险标签和来源范围，再执行数据获取。">
    <RouterLink class="btn" to="/regulatory/workbench">返回工作台</RouterLink>
    <RouterLink class="btn primary" to="/regulatory/data-fetch">获取数据</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>初始筛选条件</h3></div>
    <div class="filter-grid">
      <label><span>被审计单位</span><input value="上海分公司" readonly /></label>
      <label><span>可选部门</span><input value="经纪业务部、计划财务部" readonly /></label>
      <label><span>审计期间</span><input value="2026Q2" readonly /></label>
      <label><span>指定业务</span><input value="产品销售、客户服务" readonly /></label>
      <label><span>风险标签</span><input value="投诉集中、监管通报、舆情提示" readonly /></label>
      <label><span>来源范围</span><input value="监管通报、公开舆情、历史案例库" readonly /></label>
      <label><span>数据权限</span><input value="大权限覆盖下属营业部，不可跨分公司" readonly /></label>
      <label><span>任务状态</span><input value="待获取数据" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>来源清单</h3></div>
    <DataTable :columns="columns" :rows="rows" row-key="sourceId" />
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const columns = [
  { key: 'sourceType', label: '来源类型' },
  { key: 'title', label: '来源名称' },
  { key: 'scope', label: '权限范围' },
  { key: 'status', label: '状态' }
];
const rows = [
  { sourceId: 'RS-001', sourceType: '监管通报', title: '客户适当性监管关注事项', scope: '上海分公司', status: '可获取' },
  { sourceId: 'RS-002', sourceType: '公开舆情', title: '产品说明投诉舆情快照', scope: '经纪业务部', status: '可获取' },
  { sourceId: 'RS-003', sourceType: '历史案例', title: '同类检查建议案例', scope: '审计部', status: '可获取' }
];
</script>
