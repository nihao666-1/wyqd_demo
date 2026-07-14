<template>
  <div class="supervision-workbench-page route-fill-page">
    <PageHeader eyebrow="监督共享信息汇总" title="监督共享入口" description="文件导入和汇总分析报告分线办理。">
      <RouterLink class="btn primary" to="/supervision/import/upload">新建文件导入</RouterLink>
      <RouterLink class="btn" to="/supervision/report/source-select">新建汇总分析报告</RouterLink>
    </PageHeader>
    <MetricGrid :metrics="metrics" />
    <section class="card-grid">
      <article class="business-card">
        <h3>文件导入待办</h3>
        <p>待上传、待补三字段、待预检、预检失败和已入库批次分别处理。</p>
        <RouterLink class="btn primary" to="/supervision/import/upload">进入文件导入</RouterLink>
      </article>
      <article class="business-card">
        <h3>报告来源选择</h3>
        <p>必须先按权限选择库内文件，再按机构、部门、周期和标签筛选来源。</p>
        <RouterLink class="btn" to="/supervision/report/source-select">选择库内文件</RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';

const metrics = [
  { label: '入库批次', value: '3', hint: '1 个待补字段' },
  { label: '可引用文件', value: '18', hint: '权限内可选' },
  { label: '删除阻断', value: '2', hint: '已被报告引用' },
  { label: '待生成报告', value: '1', hint: '需来源预检' }
];
</script>

<style scoped>
.supervision-workbench-page {
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.card-grid {
  min-height: 0;
  flex: 1;
  align-items: stretch;
}

.business-card {
  min-height: 0;
  grid-template-rows: auto auto minmax(0, 1fr);
}

.business-card .btn {
  align-self: end;
}
</style>
