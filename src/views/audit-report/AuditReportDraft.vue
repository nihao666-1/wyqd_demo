<template>
  <PageHeader eyebrow="报告草稿工作区" title="报告草稿预览与确认" description="报告草稿生成后才能预览，确认后才能锁定，锁定后才能导出和回传。">
    <button class="btn" @click="store.handleReportAction('preview')">查看草稿预览</button>
    <button class="btn" @click="store.handleReportAction('confirm')">确认草稿</button>
    <button class="btn primary" @click="store.handleReportAction('lock')">锁定报告</button>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title">
      <h3>报告审核建议</h3>
      <span class="pill">报告审核处理内容和依据，报告检查只处理文档规范</span>
    </div>
    <DataTable :columns="reviewColumns" :rows="store.db.reportReviewItems" row-key="reviewId">
      <template #actions="{ row }">
        <button class="btn" @click="store.updateReportReview(row.reviewId, '采纳')">采纳</button>
        <button class="btn" @click="store.updateReportReview(row.reviewId, '忽略')">忽略</button>
        <button class="btn" @click="store.addReviewSupplement(row.reviewId)">补充说明</button>
      </template>
    </DataTable>
  </section>
  <section class="document-workspace">
    <aside class="panel doc-panel">
      <div class="panel-title"><h3>章节目录</h3></div>
      <div class="tree">
        <div v-for="chapter in store.db.reportDraft.chapters" :key="chapter.chapterId" class="tree-item">
          {{ chapter.title }}<br /><small>{{ chapter.sourceStatus }}</small>
        </div>
      </div>
    </aside>
    <main class="panel doc-panel">
      <div class="panel-title"><h3>正文预览</h3></div>
      <div class="doc-page">
        <h3>{{ store.db.reportDraft.reportType }}</h3>
        <p>一、审计范围：本报告覆盖上海分公司 2026H1 经营、费用与监督共享资料。</p>
        <p>二、系统分析结果：费用异常事项已形成候选清单，待确认事项均保留来源依据。</p>
        <p>三、整改建议：依据不足内容不会进入正式结论，需补充责任部门说明。</p>
      </div>
    </main>
    <aside class="panel doc-panel">
      <div class="panel-title"><h3>来源依据</h3></div>
      <p>来源包含风险事项台账、费用异常结果、经营指标快照和补充上传资料。依据不足的段落不能进入正式结论。</p>
      <div class="panel-actions">
        <button class="btn" @click="store.openDrawer('report-source-trace', { title: '报告来源追溯', sources: sourceRows })">来源追溯</button>
        <button class="btn" @click="store.handleReportAction('export')">导出校验</button>
        <RouterLink class="btn" to="/audit-report/offline-upload">上传线下修改稿</RouterLink>
        <RouterLink class="btn" to="/records">查看操作记录</RouterLink>
      </div>
    </aside>
  </section>
  <aside v-if="store.activeDrawer === 'report-source-trace'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.title }}</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <DataTable :columns="sourceColumns" :rows="store.drawerPayload.sources" row-key="id" />
  </aside>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = computed(() => [
  { label: '草稿状态', value: store.db.reportDraft.status, hint: '按报告动作条件控制' },
  { label: '来源完整性', value: store.db.reportDraft.sourceTraceStatus, hint: '一处依据不足' },
  { label: '审核建议', value: String(store.db.reportReviewItems.filter((item) => item.status === '待处理').length), hint: '处理后写入复核记录' },
  { label: '章节数', value: String(store.db.reportDraft.chapters.length), hint: '左目录中间正文右依据' }
]);
const reviewColumns = [
  { key: 'chapter', label: '章节' },
  { key: 'suggestion', label: '审核建议' },
  { key: 'source', label: '来源依据' },
  { key: 'status', label: '状态' },
  { key: 'decision', label: '处理结果' }
];
const sourceRows = [
  { id: 'SRC-1', name: '风险事项台账.xlsx', type: '监督共享资料', status: '已入库' },
  { id: 'SRC-2', name: '费用异常 AN-001', type: '费用审计结果', status: '已确认' },
  { id: 'SRC-3', name: '预算系统快照 SNAP-BUD-001', type: '数据快照', status: '已锁定' }
];
const sourceColumns = [
  { key: 'name', label: '来源名称' },
  { key: 'type', label: '来源类型' },
  { key: 'status', label: '状态' }
];
</script>
