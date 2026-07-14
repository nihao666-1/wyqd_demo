<template>
  <aside ref="railRef" class="task-detail-execution-rail" aria-label="执行日志与阻断项">
    <section class="task-detail-log-panel" data-detail-region="execution-log" tabindex="-1">
      <header class="task-detail-rail-header">
        <h2>执行日志与阻断项</h2>
        <FontAwesomeIcon :icon="faChevronUp" aria-hidden="true" />
      </header>

      <section class="task-detail-live-logs">
        <header><h3>实时执行日志 <small>（最近）</small></h3><button type="button" @click="showAllLogs">全部日志</button></header>
        <ol>
          <li v-for="log in visibleLogs" :key="log.id" :class="log.tone">
            <i aria-hidden="true"></i>
            <time>{{ log.time }}</time>
            <span>[{{ log.capability }}] {{ log.message }}</span>
            <em>{{ log.actor }}</em>
          </li>
        </ol>
      </section>

      <section class="task-detail-model-execution">
        <header><h3>当前模型执行步骤</h3></header>
        <div class="task-detail-model-title"><strong>{{ modelExecution.title }}</strong><span>{{ modelExecution.status }}</span></div>
        <ol>
          <li v-for="(step, index) in modelExecution.steps" :key="step" :class="{ completed: index < modelExecution.activeStep, active: index === modelExecution.activeStep }" :aria-current="index === modelExecution.activeStep ? 'step' : undefined">
            <i aria-hidden="true"></i><span>{{ step }}</span>
          </li>
        </ol>
      </section>

      <section class="task-detail-source-snapshot">
        <header><h3>来源资料快照</h3></header>
        <dl>
          <div v-for="source in sources" :key="source.id">
            <dt>{{ source.label }}：</dt><dd>{{ source.value }}</dd>
            <button type="button" @click="viewSource(source)">查看</button>
          </div>
        </dl>
      </section>
    </section>

    <section class="task-detail-failure-panel" data-detail-region="failure-retry">
      <header><h2>失败与重试 <small>（最近 24 小时）</small></h2></header>
      <p v-if="failures.length === 0">暂无失败项</p>
      <button v-else type="button" @click="showAllLogs">查看失败项（{{ failures.length }}）</button>
    </section>

    <section class="task-detail-pending-panel" data-detail-region="pending-reminders">
      <header><h2>待处理提示</h2></header>
      <button v-for="item in pendingItems" :key="item.id" class="task-detail-pending-item" type="button" @click="handlePending(item)">
        <span class="task-detail-pending-icon" :class="item.tone"><FontAwesomeIcon :icon="pendingIcon(item.id)" /></span>
        <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
        <em>{{ item.status }}</em>
      </button>
      <button class="task-detail-pending-all" type="button" @click="handlePending({ id: 'all-pending', title: '全部待处理事项' })">查看全部待处理事项（{{ pendingItems.length }}）<FontAwesomeIcon :icon="faChevronRight" /></button>
    </section>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronRight, faChevronUp, faFileCircleCheck, faFileLines } from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  logs: { type: Array, required: true },
  modelExecution: { type: Object, required: true },
  sources: { type: Array, required: true },
  failures: { type: Array, required: true },
  pendingItems: { type: Array, required: true },
  activeCapabilityId: { type: String, default: '' }
});

const emit = defineEmits(['show-all-logs', 'view-source', 'handle-pending']);
const railRef = ref(null);
const visibleLogs = computed(() => props.activeCapabilityId
  ? props.logs.filter((log) => log.capabilityId === props.activeCapabilityId)
  : props.logs);

function focus() {
  railRef.value?.querySelector('[data-detail-region="execution-log"]')?.focus();
}

function showAllLogs() {
  emit('show-all-logs');
}

function viewSource(source) {
  emit('view-source', source);
}

function handlePending(item) {
  emit('handle-pending', item);
}

function pendingIcon(id) {
  return id === 'pending-report' ? faFileLines : faFileCircleCheck;
}

defineExpose({ focus });
</script>

<style scoped>
.task-detail-execution-rail{display:grid;grid-template-rows:472px 61px 205px;gap:5px;min-width:0;color:#28313d}.task-detail-log-panel,.task-detail-failure-panel,.task-detail-pending-panel{box-sizing:border-box;overflow:hidden;border:1px solid #e1e6ed;background:#fff}.task-detail-rail-header,.task-detail-failure-panel>header,.task-detail-pending-panel>header{display:flex;height:35px;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid #e6e9ef}.task-detail-rail-header h2,.task-detail-failure-panel h2,.task-detail-pending-panel h2{margin:0;font-size:13px}.task-detail-rail-header svg{font-size:10px}.task-detail-log-panel>section{padding:0 14px;border-bottom:1px solid #e6e9ef}.task-detail-log-panel>section:last-child{border-bottom:0}.task-detail-log-panel section>header{display:flex;height:32px;align-items:center;justify-content:space-between}.task-detail-log-panel h3{margin:0;font-size:11px}.task-detail-log-panel h3 small,.task-detail-failure-panel h2 small{color:#7a8696;font-size:9px;font-weight:400}.task-detail-log-panel header button{padding:0;border:0;background:transparent;color:var(--color-info);font-size:10px}.task-detail-live-logs{height:194px}.task-detail-live-logs ol{display:grid;gap:0;margin:0;padding:0;list-style:none}.task-detail-live-logs li{display:grid;grid-template-columns:7px 45px minmax(0,1fr) 24px;align-items:center;gap:5px;height:24px;min-width:0;color:#4f5b6b;font-size:9px}.task-detail-live-logs li>i{width:6px;height:6px;border-radius:50%;background:#9aa5b3}.task-detail-live-logs li.success>i{background:#0ba25a}.task-detail-live-logs li.running>i{background:#f28b00}.task-detail-live-logs time{color:#657183}.task-detail-live-logs li>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.task-detail-live-logs em{color:#596575;font-size:8px;font-style:normal}.task-detail-model-execution{height:107px}.task-detail-model-execution>header{height:30px!important}.task-detail-model-title{display:flex;align-items:center;justify-content:space-between;height:24px}.task-detail-model-title strong{overflow:hidden;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.task-detail-model-title>span{padding:2px 5px;border-radius:3px;background:#edf9f2;color:#078f43;font-size:8px}.task-detail-model-execution ol{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:4px 0 0;padding:0;list-style:none}.task-detail-model-execution li{position:relative;display:grid;justify-items:center;gap:5px;color:#748094;font-size:8px}.task-detail-model-execution li::before{position:absolute;top:4px;right:50%;left:-50%;height:2px;background:#d5dbe4;content:""}.task-detail-model-execution li:first-child::before{display:none}.task-detail-model-execution li.completed::before,.task-detail-model-execution li.active::before{background:#6f9ad6}.task-detail-model-execution li>i{position:relative;z-index:1;width:9px;height:9px;border:2px solid #b7c0cd;border-radius:50%;background:#fff}.task-detail-model-execution li.completed>i{border-color:#75869c;background:#75869c}.task-detail-model-execution li.active>i{border-color:var(--color-info)}.task-detail-model-execution li.active>span{color:#2d5287}.task-detail-source-snapshot{height:135px}.task-detail-source-snapshot>header{height:30px!important}.task-detail-source-snapshot dl{margin:0}.task-detail-source-snapshot dl>div{display:grid;grid-template-columns:auto minmax(0,1fr) 25px;align-items:center;height:24px;font-size:9px}.task-detail-source-snapshot dt{font-weight:600}.task-detail-source-snapshot dd{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.task-detail-source-snapshot button{padding:0;border:0;background:transparent;color:var(--color-info);font-size:8px}.task-detail-failure-panel{display:grid;grid-template-rows:31px 1fr}.task-detail-failure-panel>header{height:31px;border-bottom:0;padding:0 12px}.task-detail-failure-panel p{margin:0;color:#0a8e48;font-size:10px;text-align:center}.task-detail-failure-panel>button{justify-self:center;padding:0;border:0;background:transparent;color:var(--color-info);font-size:9px}.task-detail-pending-panel>header{height:36px;padding:0 12px}.task-detail-pending-item{display:grid;width:100%;grid-template-columns:30px minmax(0,1fr) 38px;align-items:center;gap:8px;height:52px;padding:0 12px;border:0;border-bottom:1px solid #eef1f4;background:#fff;color:#303a47;text-align:left}.task-detail-pending-item>span:nth-child(2){min-width:0}.task-detail-pending-item strong,.task-detail-pending-item small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.task-detail-pending-item strong{font-size:10px}.task-detail-pending-item small{margin-top:3px;color:#737f90;font-size:8px}.task-detail-pending-item em{color:#ee7d00;font-size:9px;font-style:normal;text-align:right}.task-detail-pending-icon{display:grid;width:27px;height:27px;place-items:center;border-radius:4px;background:#fff2df;color:#ef8500;font-size:14px}.task-detail-pending-icon.blue{background:#eaf2ff;color:var(--color-info)}.task-detail-pending-all{display:flex;width:100%;height:61px;align-items:center;justify-content:center;gap:5px;border:0;background:#fff;color:var(--color-info);font-size:10px}.task-detail-pending-all svg{font-size:8px}.task-detail-execution-rail button:focus-visible,.task-detail-log-panel:focus-visible{outline:2px solid var(--color-info);outline-offset:-2px}
.task-detail-execution-rail{gap:3px}
.task-detail-live-logs li{font-size:10px}
.task-detail-live-logs em{font-size:9px}
.task-detail-model-title strong{font-size:10px}
.task-detail-model-execution li{font-size:9px}
.task-detail-source-snapshot dl>div{font-size:10px}
.task-detail-source-snapshot button{font-size:9px}
.task-detail-pending-item small{font-size:9px}
@media(max-width:1199px){.task-detail-execution-rail{grid-template-rows:auto;grid-template-columns:1fr 1fr;gap:8px}.task-detail-log-panel{grid-column:1/-1;height:472px}.task-detail-failure-panel{height:61px}.task-detail-pending-panel{height:205px}}
</style>
