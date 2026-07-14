<template>
  <div class="audit-standard-workbench-page route-fill-page">
  <PageHeader eyebrow="审计规范智能化" title="审计规范工作台" description="明确 0-1 生成、1-2 优化、上传标准规范三种入口，来源、部门、时间范围均受权限控制。">
    <RouterLink class="btn primary" to="/audit-standard/generate?mode=0-1">0-1 生成</RouterLink>
    <RouterLink class="btn" to="/audit-standard/generate?mode=1-2">1-2 优化</RouterLink>
    <RouterLink class="btn" to="/audit-standard/upload">上传标准规范</RouterLink>
    <RouterLink class="btn" to="/audit-standard/policy">制度查询/变更/比对</RouterLink>
  </PageHeader>
  <section class="three-col">
    <article class="business-card">
      <h3>0-1 生成</h3>
      <p>从内部制度、外部法规、法规扩展检索、案例库和历史模板形成新规范草稿。</p>
      <RouterLink class="btn primary" to="/audit-standard/generate?mode=0-1">进入配置</RouterLink>
    </article>
    <article class="business-card">
      <h3>1-2 优化</h3>
      <p>基于现有规范版本，按审计对象、部门、周期和来源范围生成优化建议。</p>
      <RouterLink class="btn" to="/audit-standard/generate?mode=1-2">进入优化</RouterLink>
    </article>
    <article class="business-card">
      <h3>上传标准规范</h3>
      <p>校验文件名前缀、版本号和差异结果，确认后进入审计规范库。</p>
      <RouterLink class="btn" to="/audit-standard/upload">上传规范</RouterLink>
    </article>
    <article class="business-card">
      <h3>制度查询/变更/比对</h3>
      <p>结构化查询制度、识别变更影响、比对内外部要求，结果沉淀到任务详情。</p>
      <RouterLink class="btn" to="/audit-standard/policy">进入制度能力</RouterLink>
    </article>
  </section>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title">
      <h3>来源库状态</h3>
      <RouterLink class="btn" to="/audit-standard/library">规范库版本</RouterLink>
    </div>
    <DataTable :columns="columns" :rows="store.db.standardSources" row-key="sourceId" />
  </section>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '0-1 待生成', value: '2', hint: '费用、采购规范' },
  { label: '1-2 待优化', value: '3', hint: '已有规范可优化' },
  { label: '待回传定稿', value: '1', hint: '费用规范 V2.2' },
  { label: '有效版本', value: '18', hint: '4 个被引用锁定' }
];
const columns = [
  { key: 'sourceType', label: '来源类型' },
  { key: 'title', label: '来源名称' },
  { key: 'scope', label: '覆盖范围' },
  { key: 'period', label: '时间范围' },
  { key: 'version', label: '版本' },
  { key: 'status', label: '状态' }
];
</script>

<style scoped>
.audit-standard-workbench-page {
  height: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.audit-standard-workbench-page > .panel {
  min-height: 0;
  flex: 1;
  overflow: auto;
}
</style>
