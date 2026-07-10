<template>
  <PageHeader eyebrow="任务中心" title="任务列表" description="按状态、部门、人员和时间查询审计任务。">
    <RouterLink class="btn primary" to="/tasks/create">创建审计任务</RouterLink>
  </PageHeader>
  <PageState
    v-bind="stateProps"
    primary-text="创建审计任务"
    primary-to="/tasks/create"
    secondary-text="查看示例任务"
    secondary-to="/tasks/detail"
  />
  <FilterPanel :items="filters" @query="store.setNotice('已按当前权限范围刷新任务列表。')" />
  <DataTable :columns="columns" :rows="store.db.tasks" row-key="taskId">
    <template #actions>
      <RouterLink class="btn primary" to="/tasks/detail">进入详情</RouterLink>
    </template>
  </DataTable>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import PageState from '../../components/common/PageState.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const stateProps = {
  state: store.db.pageStates.taskList.state,
  label: '列表状态',
  title: store.db.pageStates.taskList.title,
  description: store.db.pageStates.taskList.description
};
const filters = [
  { label: '被审计单位', value: '上海分公司' },
  { label: '覆盖部门', value: '经纪业务部、计划财务部' },
  { label: '创建人', value: '王审计' },
  { label: '确认人', value: '全部' },
  { label: '创建时间', value: '2026-07-01 至 2026-07-08' },
  { label: '是否有效', value: '有效' }
];
const columns = [
  { key: 'taskId', label: '任务编号' },
  { key: 'taskName', label: '任务名称' },
  { key: 'auditPeriod', label: '期间' },
  { key: 'status', label: '状态' },
  { key: 'currentStep', label: '当前步骤' },
  { key: 'owner', label: '负责人' }
];
</script>
