<template>
  <PageHeader eyebrow="规范草稿" title="审计规范三栏草稿" description="左侧来源、中间草稿、右侧优化建议；确认后才能锁定、下载、回传定稿。">
    <button class="btn" @click="store.handleStandardDraftAction('confirm')">确认草稿</button>
    <button class="btn primary" @click="store.handleStandardDraftAction('lock')">锁定</button>
    <RouterLink class="btn" to="/audit-standard/diff">上传线下定稿并比对</RouterLink>
  </PageHeader>
  <section class="panel state-panel">
    <div>
      <span class="state-label">当前草稿状态</span>
      <h3>{{ draft.status }}</h3>
      <p>确认、锁定和后续入库都会写入记录中心，锁定后形成规范版本记录。</p>
    </div>
    <StatusTag :text="draft.status" :tone="draft.status === '已锁定' ? 'success' : 'warning'" />
  </section>
  <section class="document-workspace">
    <aside class="panel doc-panel">
      <div class="panel-title"><h3>来源依据</h3></div>
      <div class="tree">
        <div v-for="item in draft.chapters" :key="item.chapterId" class="tree-item">{{ item.source }}</div>
      </div>
    </aside>
    <main class="panel doc-panel">
      <div class="panel-title"><h3>草稿内容</h3></div>
      <div class="doc-page">
        <h3>费用报销审计规范</h3>
        <p v-for="item in draft.chapters" :key="item.chapterId">{{ item.draft }}</p>
      </div>
    </main>
    <aside class="panel doc-panel">
      <div class="panel-title"><h3>优化建议</h3></div>
      <div class="tree">
        <div v-for="item in draft.chapters" :key="item.chapterId" class="tree-item">{{ item.suggestion }}</div>
      </div>
    </aside>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>缺点分析</h3></div>
    <p>{{ draft.defectSummary }}</p>
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusTag from '../../components/common/StatusTag.vue';

const store = inject('store');
const draft = computed(() => store.db.standardDraft || { chapters: [], defectSummary: '暂无缺点分析。' });
</script>
