<template>
  <PageHeader eyebrow="元数据映射" title="监督共享元数据映射" description="配置文件类型、标签、来源部门和可引用状态。">
    <RouterLink class="btn" to="/supervision/import/field-edit">返回三字段</RouterLink>
    <RouterLink class="btn primary" to="/supervision/import/precheck">下一步：入库前预检</RouterLink>
  </PageHeader>

  <section class="two-col">
    <div>
      <DataTable :columns="columns" :rows="rows" row-key="assetId">
        <template #actions="{ row }">
          <button class="btn" @click="store.saveMetadataMapping(row.assetId)">保存映射</button>
        </template>
      </DataTable>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>标签定义管理</h3></div>
      <p>当前启用标签：经营情况、风险事项、整改跟踪、报告资料。标签影响报告来源筛选和引用范围。</p>
      <button class="btn" @click="store.openTagDrawer()">标签定义管理</button>
    </aside>
  </section>
  <aside v-if="store.activeDrawer === 'tag-definition'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.title }}</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <DataTable :columns="tagColumns" :rows="store.drawerPayload.rows" row-key="tag" />
  </aside>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'fileType', label: '文件类型' },
  { key: 'sourceDepartment', label: '文件来源部门' },
  { key: 'tags', label: '适配标签' },
  { key: 'reportUsable', label: '可用于报告' },
  { key: 'standardUsable', label: '可被规范引用' },
  { key: 'metadataStatus', label: '元数据状态' },
  { key: 'referenceStatus', label: '可引用状态' }
];
const baseRows = [
  { assetId: 'MD-1', fileName: '风险事项台账.xlsx', fileType: '监督共享台账', sourceDepartment: '经纪业务部', tags: '风险事项、整改跟踪', reportUsable: '是', standardUsable: '否', metadataStatus: '待映射', referenceStatus: '可引用' },
  { assetId: 'MD-2', fileName: '整改跟踪表.xlsx', fileType: '整改资料', sourceDepartment: '经纪业务部', tags: '整改跟踪', reportUsable: '是', standardUsable: '是', metadataStatus: '待映射', referenceStatus: '待预检' }
];
const rows = computed(() => {
  const savedRows = store.db.metadataMappingRows || [];
  return baseRows.map((row) => ({
    ...row,
    ...(savedRows.find((item) => item.assetId === row.assetId) || {})
  }));
});
const tagColumns = [
  { key: 'tag', label: '标签' },
  { key: 'scope', label: '适配范围' },
  { key: 'usage', label: '使用位置' }
];
</script>
