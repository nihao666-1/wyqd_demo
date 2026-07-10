<template>
  <PageHeader eyebrow="资料完整性预检" title="资料缺口清单" description="关键资料缺失时，不能锁定正式报告；可选资料缺失可生成带提示草稿。">
    <RouterLink class="btn" to="/audit-report/source-select">返回来源选择</RouterLink>
    <RouterLink class="btn" to="/audit-report/material/supplement-preview">补充上传</RouterLink>
    <button class="btn primary" @click="generateDraft">生成草稿</button>
  </PageHeader>
  <DataTable :columns="columns" :rows="store.db.gapItems" row-key="gapId" />
  <section class="panel">
    <div class="panel-title"><h3>预检结论</h3></div>
    <p>当前存在 1 条关键资料缺口。可先生成待确认草稿，但锁定正式报告必须满足报告确认、关键缺口处理完成等动作条件。</p>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const router = useRouter();
const columns = [
  { key: 'gapId', label: '缺口编号' },
  { key: 'chapter', label: '章节' },
  { key: 'gapType', label: '缺口类型' },
  { key: 'required', label: '是否关键' },
  { key: 'status', label: '状态' },
  { key: 'resolution', label: '处理方式' }
];
function generateDraft() {
  store.handleReportAction('generate');
  router.push('/audit-report/draft');
}
</script>
