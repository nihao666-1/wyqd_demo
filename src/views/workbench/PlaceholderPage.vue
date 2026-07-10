<template>
  <PageHeader
    :eyebrow="route.meta.title"
    :title="route.meta.title"
    description="本页作为第三步 P0 骨架入口，已按生命周期规划保留权限范围、初始筛选、数据状态和待办区域。"
  >
    <RouterLink class="btn primary" to="/tasks/create">创建关联任务</RouterLink>
    <RouterLink class="btn" to="/tasks/detail">查看任务详情</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>入口条件</h3></div>
    <div class="filter-grid">
      <label><span>覆盖部门</span><input value="经纪业务部、计划财务部" readonly /></label>
      <label><span>生效部门</span><input value="审计部" readonly /></label>
      <label><span>审计期间</span><input value="2026Q2" readonly /></label>
      <label><span>是否有效</span><input value="有效" readonly /></label>
    </div>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';

const route = useRoute();
</script>
