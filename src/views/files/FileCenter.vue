<template>
  <PageHeader
    eyebrow="支撑中心"
    title="文件中心"
    description="统一查询上传、解析、引用、生成、导出和回传文件。"
  >
    <button class="btn" @click="store.setDemoDataMode(isEmptyMode ? 'data' : 'empty')">
      {{ isEmptyMode ? '查看已有文件' : '查看空状态' }}
    </button>
    <RouterLink class="btn primary" to="/supervision/import/upload">上传文件</RouterLink>
  </PageHeader>

  <section class="file-layout">
    <div>
      <FilterPanel :items="filters" @query="store.setNotice('文件中心已按文件类型、所属单位、来源、上传人、解析状态和权限范围刷新。')" />
      <MetricGrid :metrics="currentMetrics" />

      <section class="panel">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" class="tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
        </div>

        <template v-if="isEmptyMode">
          <div class="file-empty">
            <div class="empty-illustration">
              <span></span>
              <i></i>
            </div>
            <h3>文件库为空</h3>
            <p>上传制度文件、费用数据、监督共享文件、报告模板或生成报告后，可在这里统一管理解析状态、引用关系和权限范围。</p>
            <div class="panel-actions">
              <RouterLink class="btn primary" to="/supervision/import/upload">上传文件</RouterLink>
              <RouterLink class="btn" to="/supervision/import/upload">上传文件夹</RouterLink>
              <RouterLink class="btn" to="/tasks">从任务导入</RouterLink>
            </div>
          </div>
        </template>

        <DataTable v-else :columns="columns" :rows="store.db.fileAssetsExtended" row-key="assetId">
          <template #actions="{ row }">
            <RouterLink class="btn" to="/files/detail">详情</RouterLink>
            <button class="btn" @click="store.handleAssetAction(row.assetId, 'delete')">删除校验</button>
          </template>
        </DataTable>
      </section>
    </div>

    <aside class="summary-rail">
      <div class="panel">
        <div class="panel-title"><h3>文件接入流程</h3></div>
        <div class="process-list">
          <div v-for="step in accessFlow" :key="step.title" class="process-item">
            <span>{{ step.no }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title"><h3>支持格式</h3></div>
        <div class="format-grid">
          <span>PDF<br /><small>.pdf</small></span>
          <span>Word<br /><small>.docx/.doc</small></span>
          <span>Excel<br /><small>.xlsx/.xls</small></span>
          <span>ZIP<br /><small>.zip/.rar</small></span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title"><h3>说明</h3></div>
        <ul class="note-list">
          <li>单个文件最大 500MB。</li>
          <li>单次最多上传 20 个文件。</li>
          <li>解析状态将影响文件引用与分析结果。</li>
        </ul>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const activeTab = ref('制度文件');
const isEmptyMode = computed(() => store.demoDataMode === 'empty');

const filters = [
  { label: '文件名称', value: '请输入文件名称' },
  { label: '文件类型', value: '全部' },
  { label: '所属单位', value: '全部' },
  { label: '来源', value: '全部' },
  { label: '上传人', value: '请输入上传人' },
  { label: '解析状态', value: '全部' },
  { label: '权限范围', value: '全部' }
];

const tabs = ['制度文件', '监管案例', '行业研究', '监督共享文件', '费用数据', '业务数据', '报告模板', '生成报告', '导出文件'];

const emptyMetrics = [
  { label: '文件总数', value: '0', hint: '当前文件库为空' },
  { label: '待解析', value: '0', hint: '上传后进入解析队列' },
  { label: '解析成功', value: '0', hint: '解析后可引用' },
  { label: '已引用', value: '0', hint: '引用后锁定' },
  { label: '导出文件', value: '0', hint: '导出后形成记录' }
];

const dataMetrics = [
  { label: '可见文件', value: '4', hint: '当前权限范围内' },
  { label: '已引用', value: '3', hint: '删除和失效被阻断' },
  { label: '待补字段', value: '1', hint: '需补适配机构和部门' },
  { label: '回传文件', value: '1', hint: '已进入比对记录' },
  { label: '导出文件', value: '1', hint: '已形成下载记录' }
];

const currentMetrics = computed(() => (isEmptyMode.value ? emptyMetrics : dataMetrics));

const accessFlow = [
  { no: '1', title: '上传文件', description: '支持单文件或批量上传，自动校验格式与大小。' },
  { no: '2', title: '解析资料', description: '系统解析文件内容，提取文本与表格信息。' },
  { no: '3', title: '补全元数据', description: '补充适配机构、适配部门、数据归属周期等关键信息。' },
  { no: '4', title: '建立引用', description: '与制度、任务、报告等建立引用关系。' },
  { no: '5', title: '加入任务', description: '将文件加入审计任务，支撑分析与报告生成。' }
];

const columns = [
  { key: 'fileName', label: '文件名称' },
  { key: 'assetCategory', label: '分类' },
  { key: 'sourceModule', label: '来源模块' },
  { key: 'taskName', label: '所属任务' },
  { key: 'ownerDepartment', label: '覆盖部门' },
  { key: 'dataPeriod', label: '数据周期' },
  { key: 'parseStatus', label: '解析状态' },
  { key: 'referenceStatus', label: '引用状态' },
  { key: 'versionNo', label: '版本' },
  { key: 'permissionScope', label: '权限范围' }
];
</script>

<style scoped>
.file-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--color-line);
}

.tab {
  padding: 10px 14px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-muted);
  font-weight: 700;
  cursor: pointer;
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.file-empty {
  min-height: 420px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 14px;
  padding: 40px;
  text-align: center;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #fff, #fbfcfe);
}

.file-empty p {
  max-width: 520px;
  color: var(--color-muted);
  line-height: 1.8;
}

.empty-illustration {
  position: relative;
  width: 116px;
  height: 90px;
  border-radius: 16px;
  background: #eef2f7;
}

.empty-illustration span {
  position: absolute;
  left: 24px;
  top: 28px;
  width: 68px;
  height: 44px;
  border: 1px solid #cfd7e3;
  border-radius: 8px;
  background: #fff;
}

.empty-illustration i {
  position: absolute;
  left: 36px;
  top: 16px;
  width: 46px;
  height: 30px;
  border-radius: 6px;
  background: #dfe6f0;
}

.process-list {
  display: grid;
  gap: 14px;
}

.process-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 12px;
}

.process-item span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: var(--color-primary);
  font-weight: 800;
}

.process-item p,
.note-list {
  color: var(--color-muted);
  line-height: 1.8;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.format-grid span {
  padding: 12px;
  text-align: center;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface-strong);
  font-weight: 800;
}

.format-grid small {
  color: var(--color-muted);
  font-weight: 400;
}
</style>
