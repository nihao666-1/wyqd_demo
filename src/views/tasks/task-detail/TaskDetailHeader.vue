<template>
  <header class="task-detail-header">
    <div class="task-heading">
      <div class="task-heading-copy">
        <div class="title-line">
          <h1>{{ task.title }}</h1>
          <span class="pending-tag">{{ task.status }}</span>
        </div>
        <div class="task-meta">
          <span>任务编号：{{ task.id }}</span>
          <span>被审计单位：{{ task.organization }}</span>
          <span>审计期间：{{ task.period }}</span>
          <span>任务类型：{{ task.type }}</span>
          <span>负责人：{{ task.owner }}</span>
          <span>创建时间：{{ task.createdAt }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button type="button" class="header-btn" @click="$emit('save-version')">保存版本</button>
        <button type="button" class="header-btn primary" @click="$emit('submit-review')">提交复核</button>
        <button type="button" class="header-btn danger-outline" @click="$emit('export-results')">导出结果</button>
        <button type="button" class="header-btn" disabled title="复核通过后方可归档">归档任务</button>
      </div>
    </div>

    <div class="summary-strip">
      <div data-summary-metric class="summary-metric red">
        <span class="metric-icon"><FontAwesomeIcon :icon="faFileLines" /></span>
        <span><small>生成完成</small><strong>9 <em>项</em></strong></span>
      </div>
      <div data-summary-metric class="summary-metric orange">
        <span class="metric-icon"><FontAwesomeIcon :icon="faUserCheck" /></span>
        <span><small>待人工确认</small><strong>{{ pendingCount }} <em>项</em></strong></span>
      </div>
      <div data-summary-metric class="summary-metric blue">
        <span class="metric-icon"><FontAwesomeIcon :icon="faFile" /></span>
        <span><small>当前版本</small><strong>{{ version.number }} <em>草稿</em></strong></span>
      </div>
      <div data-summary-metric class="summary-metric gray">
        <span class="metric-icon"><FontAwesomeIcon :icon="faClock" /></span>
        <span><small>更新时间</small><b>{{ task.updatedAt }}</b></span>
      </div>
      <div data-summary-metric class="summary-metric gray">
        <span class="metric-icon"><FontAwesomeIcon :icon="faUser" /></span>
        <span><small>创建人</small><b>{{ task.creator }}</b></span>
      </div>
    </div>

    <nav class="detail-tabs" aria-label="任务详情栏目">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="$emit('tab-change', tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>
  </header>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faClock, faFile, faFileLines, faUser, faUserCheck } from '@fortawesome/free-solid-svg-icons';

defineProps({
  task: { type: Object, required: true },
  tabs: { type: Array, required: true },
  activeTab: { type: String, default: 'results' },
  pendingCount: { type: Number, required: true },
  version: { type: Object, required: true }
});

defineEmits(['save-version', 'submit-review', 'export-results', 'tab-change']);
</script>

<style scoped>
.task-detail-header{background:#fff;border:1px solid #e5eaf0}.task-heading{position:relative;height:83px;padding:14px 14px 10px;display:block;overflow:hidden;border-bottom:1px solid #edf0f4}.task-heading-copy{width:100%;min-width:0}.title-line{display:flex;align-items:center;gap:10px;padding-right:380px}.title-line h1{margin:0;color:#171a22;font-size:20px;line-height:28px;font-weight:600}.pending-tag{padding:1px 6px;border:1px solid #ffd8a8;border-radius:4px;background:#fff6e8;color:#fa8c16;font-size:10px;line-height:18px}.task-meta{display:flex;flex-wrap:nowrap;gap:8px 20px;margin-top:12px;color:#303642;font-size:10px;line-height:16px;white-space:nowrap}.header-actions{position:absolute;top:14px;right:14px;display:flex;gap:8px}.header-btn{height:34px;padding:0 16px;border:1px solid #d8dee8;border-radius:4px;background:#fff;color:#202631;font-size:12px;font-weight:500}.header-btn.primary{border-color:#b40000;background:#b40000;color:#fff}.header-btn.danger-outline{border-color:#ff7875;color:#c40000}.header-btn:disabled{background:#f5f6f8;color:#a8afba}.summary-strip{height:75px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-bottom:1px solid #e9edf2}.summary-metric{display:flex;align-items:center;gap:12px;padding:0 20px;border-right:1px solid #edf0f4}.summary-metric:last-child{border-right:0}.metric-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:19px}.red .metric-icon{background:#fff0f0;color:#d10000}.orange .metric-icon{background:#fff6e8;color:#fa8c16}.blue .metric-icon{background:#eef5ff;color:#1677ff}.gray .metric-icon{background:#f3f5f8;color:#758096}.summary-metric small{display:block;color:#303642;font-size:11px;line-height:18px}.summary-metric strong{display:block;color:#171a22;font-size:19px;line-height:24px;font-weight:600}.summary-metric em{font-size:10px;font-style:normal;font-weight:400}.summary-metric b{display:block;color:#202631;font-size:11px;line-height:24px;font-weight:500;white-space:nowrap}.detail-tabs{height:41px;display:grid;grid-template-columns:repeat(11,minmax(0,1fr));align-items:stretch;padding:0 4px}.detail-tabs button{position:relative;border:0;background:transparent;color:#303642;font-size:11px;white-space:nowrap}.detail-tabs button.active{color:#c40000;font-weight:600}.detail-tabs button.active::after{content:"";position:absolute;left:18%;right:18%;bottom:0;height:3px;background:#d71920}
@media(max-height:850px){.task-heading{height:70px;padding-top:8px}.title-line{padding-right:350px}.task-meta{margin-top:7px;gap:6px 14px;font-size:9px}.header-actions{top:8px}.summary-strip{height:65px}.summary-metric{padding:0 12px}.metric-icon{width:34px;height:34px}.detail-tabs{height:37px}}
</style>
