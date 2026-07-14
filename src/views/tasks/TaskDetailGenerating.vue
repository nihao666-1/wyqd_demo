<template>
  <div class="task-detail-generating-page">
    <section class="task-detail-generating-header" data-detail-region="task-header">
      <div class="task-detail-generating-title-row">
        <div class="task-detail-generating-title-copy"><h1>{{ snapshot.task.name }}</h1><span>{{ snapshot.task.status }}</span></div>
        <div class="task-detail-generating-actions">
          <button type="button" @click="runInBackground(snapshot.capabilities[2])"><FontAwesomeIcon :icon="faCirclePlay" />后台运行</button>
          <button class="danger" type="button" @click="pauseTask"><FontAwesomeIcon :icon="isPaused ? faCirclePlay : faCirclePause" />{{ isPaused ? '继续任务' : '暂停任务' }}</button>
          <button type="button" @click="showAllLogs"><FontAwesomeIcon :icon="faFileLines" />查看日志</button>
        </div>
      </div>

      <dl class="task-detail-generating-metadata">
        <div><dt>任务编号</dt><dd>{{ snapshot.task.id }}</dd></div>
        <div><dt>被审计单位</dt><dd>{{ snapshot.task.organization }}</dd></div>
        <div><dt>审计期间</dt><dd>{{ snapshot.task.period }}</dd></div>
        <div><dt>任务类型</dt><dd>{{ snapshot.task.type }}</dd></div>
        <div><dt>负责人</dt><dd>{{ snapshot.task.owner }}</dd></div>
        <div><dt>创建时间</dt><dd>{{ snapshot.task.createdAt }}</dd></div>
        <div class="task-detail-generating-progress">
          <dt>总进度</dt>
          <dd><span role="progressbar" aria-label="任务总进度" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="snapshot.task.progress"><i :style="{ width: `${snapshot.task.progress}%` }"></i></span><strong>{{ snapshot.task.progress }}%</strong></dd>
        </div>
        <div><dt>当前版本</dt><dd>{{ snapshot.task.version }}</dd></div>
      </dl>

      <nav class="task-detail-generating-tabs" aria-label="任务详情页签">
        <button v-for="tab in snapshot.tabs" :key="tab.key" type="button" :class="{ active: activeTab === tab.key }" :aria-current="activeTab === tab.key ? 'page' : undefined" @click="selectTab(tab)">{{ tab.label }}</button>
      </nav>
    </section>

    <div v-if="activeTab === 'analysis'" class="task-detail-generating-workspace">
      <TaskCapabilityExecutionGrid :stages="snapshot.stages" :summary="snapshot.summary" :capabilities="snapshot.capabilities" @view-log="viewCapabilityLog" @view-result="viewResult" @run-background="runInBackground" />
      <TaskExecutionLogRail ref="logRailRef" :logs="snapshot.logs" :model-execution="snapshot.modelExecution" :sources="snapshot.sources" :failures="snapshot.failures" :pending-items="snapshot.pendingItems" :active-capability-id="activeCapabilityId" @show-all-logs="showAllLogs" @view-source="viewSource" @handle-pending="handlePending" />
    </div>

    <section v-else class="task-detail-generating-placeholder" aria-live="polite">
      <FontAwesomeIcon :icon="faFileLines" /><h2>{{ activeTabLabel }}</h2>
      <p>该页签保留任务台账入口；返回“分析过程”可继续查看模型实时执行状态。</p>
      <button type="button" @click="selectTab(snapshot.tabs.find((tab) => tab.key === 'analysis'))">返回分析过程</button>
    </section>

    <p class="task-detail-generating-live" aria-live="polite">{{ liveMessage }}</p>

    <div v-if="drawerState.open" class="task-detail-generating-drawer-layer">
      <button class="task-detail-generating-backdrop" type="button" aria-label="关闭详情" @click="closeDrawer"></button>
      <aside class="task-detail-generating-drawer" role="dialog" aria-modal="true" aria-labelledby="task-detail-generating-drawer-title">
        <header><div><small>{{ drawerState.eyebrow }}</small><h2 id="task-detail-generating-drawer-title">{{ drawerState.title }}</h2></div><button ref="drawerCloseRef" type="button" aria-label="关闭" @click="closeDrawer"><FontAwesomeIcon :icon="faXmark" /></button></header>
        <dl><div v-for="item in drawerState.details" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div></dl>
        <p>{{ drawerState.description }}</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCirclePause, faCirclePlay, faFileLines, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getTaskDetailExecutionSnapshot } from './taskDetailExecutionData.js';
import TaskCapabilityExecutionGrid from './TaskCapabilityExecutionGrid.vue';
import TaskExecutionLogRail from './TaskExecutionLogRail.vue';

const route = useRoute();
const router = useRouter();
const snapshot = getTaskDetailExecutionSnapshot(route.query.taskId);
const activeTab = ref(snapshot.activeTab);
const requestedTab = snapshot.tabs.find((tab) => tab.key === route.query.tab);
if (requestedTab) activeTab.value = requestedTab.key;

const isPaused = ref(false);
const activeCapabilityId = ref('');
const liveMessage = ref('');
const logRailRef = ref(null);
const drawerCloseRef = ref(null);
const drawerState = ref({ open: false, eyebrow: '', title: '', details: [], description: '' });
let lastTrigger = null;

const activeTabLabel = computed(() => snapshot.tabs.find((tab) => tab.key === activeTab.value)?.label || '任务详情');

function selectTab(tab) {
  if (!tab) return;
  activeTab.value = tab.key;
  router.replace({ query: { ...route.query, tab: tab.key } });
}

function pauseTask() {
  isPaused.value = !isPaused.value;
  liveMessage.value = isPaused.value ? '任务已暂停，当前执行快照保持不变。' : '任务已继续执行。';
}

function runInBackground(capability) {
  activeCapabilityId.value = capability.id;
  liveMessage.value = `${capability.name}已转为后台运行，可在右侧继续查看日志。`;
}

function viewCapabilityLog(capability) {
  activeCapabilityId.value = capability.id;
  liveMessage.value = `正在显示${capability.name}的执行日志。`;
  nextTick(() => logRailRef.value?.focus());
}

function showAllLogs() {
  activeCapabilityId.value = '';
  liveMessage.value = '正在显示全部实时执行日志。';
  nextTick(() => logRailRef.value?.focus());
}

function viewResult(capability) {
  if (capability.id === 'expense-audit') {
    router.push({ path: '/expense/audit/overview', query: { taskId: snapshot.task.id } });
    return;
  }
  if (capability.id === 'supervision-share') {
    router.push({ path: '/tasks/detail/supervision-share', query: { taskId: snapshot.task.id } });
    return;
  }
  openDrawer('生成结果', capability.name, [
    { label: '当前状态', value: capability.statusLabel }, { label: '输出文件', value: capability.output }, { label: '输入资料', value: capability.input }
  ], `${capability.name}的结果已沉淀到任务详情，可继续查看来源和操作留痕。`);
}

function viewSource(source) {
  openDrawer('来源资料', source.label, [
    { label: '资料名称', value: source.label }, { label: '解析快照', value: source.value }, { label: '引用任务', value: snapshot.task.name }
  ], '当前页面展示的是任务启动时锁定的来源快照，不会被浏览器本地状态覆盖。');
}

function handlePending(item) {
  const details = item.id === 'all-pending'
    ? snapshot.pendingItems.map((pending) => ({ label: pending.title, value: pending.description }))
    : [{ label: '当前状态', value: item.status }, { label: '等待条件', value: item.description }];
  openDrawer('待处理事项', item.title, details, '依赖满足后系统会自动开始；当前不会伪造后台轮询或进度跳变。');
}

function openDrawer(eyebrow, title, details, description) {
  lastTrigger = document.activeElement;
  drawerState.value = { open: true, eyebrow, title, details, description };
  nextTick(() => drawerCloseRef.value?.focus());
}

function closeDrawer() {
  drawerState.value.open = false;
  nextTick(() => lastTrigger?.focus?.());
}

</script>

<style scoped>
.task-detail-generating-page{--detail-red:var(--color-primary);--detail-blue:var(--color-info);--detail-line:#e1e6ed;box-sizing:border-box;width:100%;max-width:none;margin:0;color:#252d38}.task-detail-generating-header{box-sizing:border-box;height:152px;border:1px solid var(--detail-line);background:#fff}.task-detail-generating-title-row{display:flex;height:43px;align-items:center;justify-content:space-between;padding:0 10px}.task-detail-generating-title-copy{display:flex;align-items:center;gap:12px}.task-detail-generating-title-copy h1{margin:0;color:#171d25;font-size:21px;line-height:30px}.task-detail-generating-title-copy>span{height:21px;padding:0 8px;border:1px solid #ffc989;border-radius:4px;background:#fff7e9;color:var(--color-warning);font-size:10px;line-height:19px}.task-detail-generating-actions{display:flex;gap:9px}.task-detail-generating-actions button{display:flex;height:33px;min-width:101px;align-items:center;justify-content:center;gap:7px;padding:0 12px;border:1px solid #d5dce5;border-radius:4px;background:#fff;color:#344052;font-size:11px}.task-detail-generating-actions button.danger{border-color:#efb7ba;color:var(--color-primary)}.task-detail-generating-metadata{display:grid;height:63px;grid-template-columns:145px 108px 245px 92px 75px 220px minmax(190px,1fr) 95px;margin:0;padding:6px 10px 8px}.task-detail-generating-metadata>div{min-width:0;padding:0 12px;border-right:1px solid #e6e9ef}.task-detail-generating-metadata>div:first-child{padding-left:0}.task-detail-generating-metadata>div:last-child{border-right:0}.task-detail-generating-metadata dt{color:#657083;font-size:9px;line-height:18px}.task-detail-generating-metadata dd{margin:3px 0 0;overflow:hidden;color:#202832;font-size:10px;line-height:18px;text-overflow:ellipsis;white-space:nowrap}.task-detail-generating-progress dd{display:flex;align-items:center;gap:8px}.task-detail-generating-progress dd>span{display:block;width:127px;height:6px;overflow:hidden;border-radius:6px;background:#e2e6eb}.task-detail-generating-progress dd i{display:block;height:100%;border-radius:inherit;background:var(--detail-red)}.task-detail-generating-progress dd strong{color:var(--color-danger);font-size:10px}.task-detail-generating-tabs{display:flex;height:45px;align-items:stretch;overflow:auto;padding:0 2px;border-top:1px solid #eef1f4}.task-detail-generating-tabs button{position:relative;flex:0 0 auto;padding:0 13px;border:0;background:#fff;color:#303946;font-size:12px;white-space:nowrap}.task-detail-generating-tabs button.active{color:var(--detail-red);font-weight:700}.task-detail-generating-tabs button.active::after{position:absolute;right:7px;bottom:3px;left:7px;height:2px;background:var(--detail-red);content:""}.task-detail-generating-workspace{display:grid;grid-template-columns:minmax(0,3.23fr) clamp(300px,23.4%,340px);gap:15px;align-items:start;margin-top:2px}.task-detail-generating-placeholder{display:grid;min-height:540px;place-content:center;justify-items:center;margin-top:10px;border:1px solid var(--detail-line);background:#fff;color:#6e7a8c;text-align:center}.task-detail-generating-placeholder>svg{font-size:38px}.task-detail-generating-placeholder h2{margin:14px 0 5px;color:#29323e;font-size:18px}.task-detail-generating-placeholder p{margin:0 0 14px;font-size:12px}.task-detail-generating-placeholder button{height:32px;padding:0 15px;border:1px solid var(--detail-red);border-radius:4px;background:#fff;color:var(--detail-red)}.task-detail-generating-live{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.task-detail-generating-drawer-layer{position:fixed;z-index:80;inset:0}.task-detail-generating-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgb(17 24 39 / 24%)}.task-detail-generating-drawer{position:absolute;top:0;right:0;box-sizing:border-box;width:min(380px,92vw);height:100%;padding:18px;border-left:1px solid #dfe4eb;background:#fff;box-shadow:-8px 0 28px rgb(23 31 43 / 16%)}.task-detail-generating-drawer>header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--detail-line)}.task-detail-generating-drawer>header small{color:var(--detail-red);font-size:10px}.task-detail-generating-drawer h2{margin:4px 0 0;font-size:18px}.task-detail-generating-drawer>header button{display:grid;width:30px;height:30px;place-items:center;border:1px solid var(--detail-line);border-radius:4px;background:#fff}.task-detail-generating-drawer dl{margin:16px 0}.task-detail-generating-drawer dl>div{display:grid;grid-template-columns:78px minmax(0,1fr);gap:10px;padding:9px 0;border-bottom:1px solid #eef1f4;font-size:11px}.task-detail-generating-drawer dt{color:#6d7888}.task-detail-generating-drawer dd{margin:0;overflow-wrap:anywhere}.task-detail-generating-drawer>p{color:#687587;font-size:11px;line-height:1.7}.task-detail-generating-page button:focus-visible{outline:2px solid var(--detail-blue);outline-offset:2px}
:global(.task-detail-density-compact .topbar){min-height:56px}:global(.task-detail-density-compact .task-detail-generating-header){height:140px}:global(.task-detail-density-compact .task-detail-generating-title-row){height:39px}:global(.task-detail-density-compact .task-detail-generating-metadata){height:58px}:global(.task-detail-density-compact .task-detail-generating-tabs){height:42px}:global(.task-detail-density-compact .task-detail-stage-summary){height:95px}:global(.task-detail-density-compact .task-detail-stage-list){padding-top:16px}:global(.task-detail-density-compact .task-detail-capability-section){height:350px}:global(.task-detail-density-compact .task-detail-capability-grid){grid-auto-rows:105px}:global(.task-detail-density-compact .task-detail-table-section){height:210px;margin-top:9px}:global(.task-detail-density-compact .task-detail-execution-rail){grid-template-rows:430px 55px 183px}:global(.task-detail-density-compact .task-detail-pending-all){height:39px}
.task-detail-generating-title-row{padding:0 40px 0 7px}
.task-detail-generating-metadata{grid-template-columns:138px 108px 240px 92px 75px 220px 250px minmax(180px,1fr)}
.task-detail-generating-metadata dt{font-size:10px}
.task-detail-generating-metadata dd{font-size:11px}
.task-detail-generating-actions button{font-size:12px}
.task-detail-generating-tabs button{padding-right:17px;padding-left:17px;font-size:13px}
@media(max-width:1199px){.task-detail-generating-header{height:auto}.task-detail-generating-metadata{height:auto;grid-template-columns:repeat(4,minmax(0,1fr));row-gap:10px}.task-detail-generating-workspace{grid-template-columns:1fr}.task-detail-generating-tabs{overflow-x:auto}.task-detail-generating-title-row{height:auto;min-height:48px;flex-wrap:wrap}.task-detail-generating-actions{padding:7px 0}}
@media(max-width:1500px){.task-detail-generating-metadata{height:auto;grid-template-columns:repeat(4,minmax(0,1fr));row-gap:8px}.task-detail-generating-title-row{height:auto;min-height:48px;flex-wrap:wrap}.task-detail-generating-actions{padding:7px 0}}
</style>
