<template>
  <PageHeader eyebrow="报告检查" title="文档规范检查结果" description="定位字体、字号、编号、标题层级、表格、页眉页脚等问题。">
    <RouterLink class="btn" to="/audit-report/check-upload">返回上传</RouterLink>
    <button class="btn" @click="store.downloadCheckResult()">下载检查结果</button>
    <button class="btn primary" @click="recheck">修改后复查</button>
  </PageHeader>

  <MetricGrid :metrics="metrics" />
  <section class="panel state-panel">
    <div>
      <span class="state-label">检查结果下载状态</span>
      <h3>{{ store.db.checkResultExportStatus || '未下载' }}</h3>
      <p>下载检查结果会写入导出记录；修改后复查会写入复查记录和操作留痕。</p>
    </div>
  </section>
  <section class="two-col">
    <div>
      <DataTable :columns="columns" :rows="store.db.checkIssues" row-key="issueId">
        <template #actions="{ row }">
          <button class="btn" @click="locate(row)">点击定位</button>
        </template>
      </DataTable>
    </div>
    <aside class="panel issue-preview">
      <div class="panel-title"><h3>定位预览</h3></div>
      <p class="doc-line">第 3 页：二、审计发现</p>
      <p class="doc-line highlight">{{ focusedText }}</p>
      <p class="doc-line">第 4 页：整改建议及附件说明</p>
    </aside>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const focusedText = ref('点击问题后在此高亮定位。');
const columns = [
  { key: 'issueId', label: '问题编号' },
  { key: 'type', label: '问题类型' },
  { key: 'severity', label: '严重程度' },
  { key: 'location', label: '位置' },
  { key: 'status', label: '状态' }
];
const metrics = computed(() => [
  { label: '问题总数', value: String(store.db.checkIssues.length), hint: '仅文档规范' },
  { label: '高优先级', value: String(store.db.checkIssues.filter((item) => item.severity === '高').length), hint: '需优先处理' },
  { label: '已定位', value: String(store.db.checkIssues.filter((item) => item.status === '已定位').length), hint: '点击定位后更新' },
  { label: '复查记录', value: String(store.db.recheckRecords.length), hint: '修改后复查生成' }
]);
function locate(row) {
  row.status = '已定位';
  focusedText.value = `${row.location}：${row.type}不符合模板规则`;
  store.addLog('报告检查问题定位', '检查问题', row.issueId);
}
function recheck() {
  store.db.recheckRecords.unshift({ recordId: `RC-${Date.now()}`, result: '复查完成，剩余 1 项待修改', createdBy: store.db.currentUser.name });
  store.addLog('报告检查修改后复查', '报告检查', 'CHK-RPT-001');
  store.setNotice('复查记录已新增，已定位问题状态同步更新。');
}
</script>
