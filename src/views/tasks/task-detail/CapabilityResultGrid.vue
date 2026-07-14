<template>
  <section class="results-section">
    <div class="section-heading">
      <h2>生成结果总览 <small>（共 9 项）</small></h2>
    </div>
    <div class="ability-grid">
      <article
        v-for="ability in abilities"
        :key="ability.id"
        data-ability-card
        class="ability-card"
        :class="{ selected: selectedAbilityId === ability.id }"
      >
        <span class="ability-index" :class="`tone-${ability.id}`">{{ ability.id }}</span>
        <div class="ability-icon" :class="`tone-${ability.id}`">
          <FontAwesomeIcon :icon="iconFor(ability.id)" />
        </div>
        <div class="ability-copy">
          <h3>{{ ability.name }}</h3>
          <p>{{ ability.summaryLabel }} <strong>{{ ability.summaryValue }}</strong></p>
        </div>
        <span class="status-tag" :class="ability.status">{{ statusLabel(ability.status) }}</span>
        <div class="ability-file">
          <FontAwesomeIcon :icon="faFileLines" />
          <span>{{ ability.fileName || '--' }}</span>
        </div>
        <div v-if="ability.id !== 9" class="card-actions">
          <button type="button" @click="$emit('view-result', ability)">查看结果</button>
          <button type="button" @click="$emit('view-evidence', ability)">查看依据</button>
          <button type="button" @click="$emit('confirm-ability', ability)">确认</button>
          <button type="button" @click="$emit('exclude-ability', ability)">排除</button>
        </div>
        <div v-else class="card-actions report-actions">
          <button type="button" @click="$emit('upload-report', ability)">上传报告</button>
          <button type="button" @click="$emit('run-check', ability)">执行检查</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faBookOpen,
  faClipboardCheck,
  faFileCircleCheck,
  faFileInvoiceDollar,
  faFileLines,
  faFilePen,
  faScaleBalanced,
  faShieldHalved,
  faTableList,
  faTowerBroadcast
} from '@fortawesome/free-solid-svg-icons';

defineProps({
  abilities: { type: Array, required: true },
  selectedAbilityId: { type: Number, default: 3 }
});

defineEmits(['view-result', 'view-evidence', 'confirm-ability', 'exclude-ability', 'upload-report', 'run-check']);

const icons = [
  faBookOpen,
  faFilePen,
  faScaleBalanced,
  faTowerBroadcast,
  faClipboardCheck,
  faShieldHalved,
  faFileInvoiceDollar,
  faFileCircleCheck,
  faTableList
];

function iconFor(id) {
  return icons[id - 1] || faFileLines;
}

function statusLabel(status) {
  return {
    confirmed: '已确认',
    pending: '待确认',
    awaiting_upload: '待上传',
    checking: '检查中',
    check_passed: '已通过',
    excluded: '已排除'
  }[status] || status;
}
</script>

<style scoped>
.results-section{background:#fff;border:1px solid #e5eaf0;border-radius:0}.section-heading{height:34px;display:flex;align-items:center;padding:0 13px}.section-heading h2{margin:0;color:#202631;font-size:13px;line-height:22px;font-weight:600}.section-heading small{color:#667085;font-size:10px;font-weight:400}.ability-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 12px;padding:0 12px 10px}.ability-card{position:relative;min-width:0;height:103px;padding:9px 10px 7px 78px;border:1px solid #e5eaf0;border-radius:6px;background:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:38px 23px 22px;column-gap:8px}.ability-card.selected{border-color:#ff9c9c;background:#fffdfd}.ability-index{position:absolute;left:4px;top:9px;width:20px;height:20px;border-radius:4px;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:600;background:var(--color-info)}.ability-icon{position:absolute;left:30px;top:10px;width:36px;height:36px;border-radius:8px;display:grid;place-items:center;background:#eef5ff;color:var(--color-info);font-size:18px}.ability-index.tone-1{background:#c30000}.ability-index.tone-2{background:var(--color-warning)}.ability-index.tone-3{background:var(--color-success)}.ability-index.tone-4{background:#6f668f}.ability-index.tone-5,.ability-index.tone-9{background:var(--color-info)}.ability-index.tone-6{background:var(--color-success)}.ability-index.tone-7{background:var(--color-warning)}.ability-index.tone-8{background:#f4474d}.ability-icon.tone-1{background:#fff0f0;color:#d30000}.ability-icon.tone-2,.ability-icon.tone-7{background:#fff6e8;color:var(--color-warning)}.ability-icon.tone-3{background:#edf8f1;color:var(--color-success)}.ability-icon.tone-4{background:#f3efff;color:#6f668f}.ability-icon.tone-6{background:#eaf9f7;color:var(--color-success)}.ability-icon.tone-8{background:#fff0f0;color:#f4474d}.ability-copy{min-width:0}.ability-copy h3{margin:0;overflow:hidden;color:#202631;font-size:13px;line-height:20px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.ability-copy p{margin:3px 0 0;color:#667085;font-size:10px;line-height:16px;white-space:nowrap}.ability-copy strong{color:#303642;font-weight:500}.status-tag{height:18px;padding:0 5px;border:1px solid;border-radius:3px;font-size:9px;line-height:16px;white-space:nowrap}.status-tag.confirmed,.status-tag.check_passed{border-color:#bce7c8;background:#ebf8ef;color:var(--color-success)}.status-tag.pending{border-color:#ffd8a8;background:#fff6e8;color:var(--color-warning)}.status-tag.awaiting_upload,.status-tag.checking{border-color:#b8d7ff;background:#eef5ff;color:var(--color-info)}.status-tag.excluded{border-color:#d8dee8;background:#f5f6f8;color:#667085}.ability-file{grid-column:1/2;display:flex;align-items:center;gap:6px;min-width:0;color:#758096;font-size:10px}.ability-file span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card-actions{grid-column:2/3;grid-row:2/4;display:grid;grid-template-columns:repeat(2,auto);align-content:center;justify-content:end;gap:3px 14px}.card-actions button{padding:0;border:0;background:transparent;color:var(--color-info);font-size:10px;line-height:17px}.report-actions{grid-template-columns:auto}
@media(max-height:850px){.ability-card{height:96px;grid-template-rows:35px 21px 21px;padding-top:8px}.ability-icon{top:8px}.ability-index{top:7px}.ability-grid{gap:8px 10px}}
</style>
