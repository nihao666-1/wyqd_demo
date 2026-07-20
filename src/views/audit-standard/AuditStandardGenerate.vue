<template>
  <PageHeader :eyebrow="mode" :title="`${mode} 审计规范配置`" description="选择公司、部门、时间范围和来源类型，完成生成前预检后进入三栏草稿。">
    <RouterLink class="btn" to="/audit-standard/workbench">返回工作台</RouterLink>
    <RouterLink class="btn primary" to="/audit-standard/draft" @click="store.setNotice('来源预检通过，审计规范演示结果已生成。')">开始生成演示结果</RouterLink>
  </PageHeader>
  <section v-if="route.query.step === 'precheck'" class="panel merge-hint">
    <strong>生成前预检已并入配置页</strong>
    <p>请在生成条件下方确认来源完整性、权限范围和引用约束，确认后进入审计规范草稿。</p>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>生成条件</h3></div>
    <div class="filter-grid">
      <label><span>模式</span><input :value="mode" readonly /></label>
      <label><span>公司/子公司</span><input value="上海分公司" readonly /></label>
      <label><span>部门多选</span><input value="经纪业务部、计划财务部" readonly /></label>
      <label><span>时间范围</span><input value="2025-01-01 至 2026-07-08" readonly /></label>
      <label><span>来源类型</span><input value="内部制度、外部法规、法规库扩展、案例库、历史规范" readonly /></label>
      <label><span>模板</span><input value="费用审计规范模板 V1.3" readonly /></label>
      <label><span>权限规则</span><input value="大权限覆盖小权限，不允许跨分公司" readonly /></label>
      <label><span>后续状态</span><input value="来源完整，可生成" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>来源选择</h3></div>
    <DataTable :columns="columns" :rows="store.db.standardSources" row-key="sourceId" />
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const route = useRoute();
const store = inject('store');
const mode = computed(() => route.query.mode || '0-1');
const columns = [
  { key: 'sourceType', label: '来源类型' },
  { key: 'title', label: '名称' },
  { key: 'period', label: '时间范围' },
  { key: 'version', label: '版本' },
  { key: 'status', label: '可引用状态' }
];
</script>
