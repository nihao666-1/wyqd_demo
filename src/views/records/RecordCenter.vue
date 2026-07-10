<template>
  <PageHeader eyebrow="支撑中心" title="记录中心" description="按任务、文件、报告、版本和用户追溯关键操作。">
    <button class="btn primary" @click="store.setNotice('记录中心已按当前筛选刷新。')">查询记录</button>
  </PageHeader>
  <FilterPanel :items="filters" @query="store.setNotice('已刷新操作、版本、导出和回传记录。')" />
  <section class="panel">
    <div class="segmented">
      <button v-for="tab in tabs" :key="tab.key" class="btn" :class="{ primary: store.activeRecordTab === tab.key }" @click="store.setRecordTab(tab.key)">{{ tab.label }}</button>
    </div>
  </section>
  <DataTable :columns="activeColumns" :rows="activeRows" :row-key="activeRowKey" />
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const filters = [
  { label: '记录类型', value: '任务、操作、版本、导出、回传' },
  { label: '目标对象', value: '全部' },
  { label: '操作人', value: '王审计、系统' },
  { label: '操作时间', value: '2026-07-01 至 2026-07-08' },
  { label: '操作结果', value: '成功、被阻断' },
  { label: '是否有效', value: '有效' }
];
const columns = [
  { key: 'createdAt', label: '操作时间' },
  { key: 'operator', label: '操作人' },
  { key: 'action', label: '动作' },
  { key: 'targetType', label: '对象类型' },
  { key: 'targetId', label: '对象编号' },
  { key: 'result', label: '结果' },
  { key: 'reason', label: '原因' }
];
const tabs = [
  { key: 'operation', label: '操作记录' },
  { key: 'version', label: '版本记录' },
  { key: 'export', label: '导出记录' },
  { key: 'callback', label: '回传比对记录' },
  { key: 'review', label: '复核记录' },
  { key: 'permission', label: '权限变更记录' }
];
const versionColumns = [
  { key: 'objectType', label: '对象类型' },
  { key: 'objectName', label: '对象名称' },
  { key: 'versionNo', label: '版本' },
  { key: 'status', label: '状态' },
  { key: 'createdBy', label: '创建人' },
  { key: 'createdAt', label: '创建时间' }
];
const exportColumns = [
  { key: 'objectType', label: '对象类型' },
  { key: 'objectName', label: '对象名称' },
  { key: 'format', label: '格式' },
  { key: 'exportedBy', label: '导出人' },
  { key: 'exportedAt', label: '导出时间' }
];
const callbackColumns = [
  { key: 'reportName', label: '报告名称' },
  { key: 'lockedVersion', label: '系统锁定版本' },
  { key: 'offlineFile', label: '线下修改稿' },
  { key: 'status', label: '状态' }
];
const reviewColumns = [
  { key: 'objectName', label: '复核对象' },
  { key: 'reviewer', label: '复核人' },
  { key: 'action', label: '动作' },
  { key: 'result', label: '结果' },
  { key: 'createdAt', label: '时间' }
];
const permissionColumns = [
  { key: 'objectName', label: '对象' },
  { key: 'operator', label: '操作人' },
  { key: 'before', label: '变更前' },
  { key: 'after', label: '变更后' },
  { key: 'result', label: '结果' }
];
const activeColumns = computed(() => ({
  operation: columns,
  version: versionColumns,
  export: exportColumns,
  callback: callbackColumns,
  review: reviewColumns,
  permission: permissionColumns
}[store.activeRecordTab]));
const activeRows = computed(() => ({
  operation: store.db.operationLogs,
  version: store.db.versionRecords,
  export: store.db.exportRecords,
  callback: store.db.callbackRecords,
  review: store.db.reviewRecords,
  permission: store.db.permissionChangeLogs
}[store.activeRecordTab]));
const activeRowKey = computed(() => ({
  operation: 'logId',
  version: 'versionId',
  export: 'exportId',
  callback: 'callbackId',
  review: 'reviewLogId',
  permission: 'permissionLogId'
}[store.activeRecordTab]));
</script>
