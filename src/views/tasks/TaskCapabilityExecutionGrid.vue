<template>
  <div class="task-detail-execution-main">
    <section class="task-detail-stage-summary" data-detail-region="stage-summary" aria-label="任务阶段与能力统计">
      <ol class="task-detail-stage-list">
        <li v-for="(stage, index) in stages" :key="stage.key" :class="stage.state">
          <span class="task-detail-stage-node" :aria-current="stage.state === 'active' ? 'step' : undefined">
            <FontAwesomeIcon v-if="stage.state === 'completed'" :icon="faCheck" />
            <b v-else>{{ index + 1 }}</b>
          </span>
          <strong>{{ stage.label }}</strong>
          <small>{{ stage.detail }}</small>
        </li>
      </ol>

      <dl class="task-detail-summary-list">
        <div v-for="item in summary" :key="item.key" :class="item.tone">
          <dt>{{ item.label }}</dt>
          <dd>
            <FontAwesomeIcon :icon="summaryIcon(item.tone)" />
            <strong>{{ item.value }}</strong><span>{{ item.unit }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <section class="task-detail-capability-section" data-detail-region="capability-grid">
      <header><h2>能力执行进度 <small>（共 {{ capabilities.length }} 项能力）</small></h2></header>
      <div class="task-detail-capability-grid">
        <article v-for="capability in capabilities" :key="capability.id" :class="capability.status">
          <div class="task-detail-capability-heading">
            <span class="task-detail-capability-index">{{ capability.index }}</span>
            <div>
              <h3>{{ capability.name }}</h3>
              <p>{{ capability.description }}</p>
            </div>
            <span class="task-detail-status-tag">{{ capability.statusLabel }}</span>
          </div>

          <div class="task-detail-card-progress">
            <span class="task-detail-progress-track" role="progressbar" :aria-label="`${capability.name}执行进度`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="capability.progress">
              <i :style="{ width: `${capability.progress}%` }"></i>
            </span>
            <b>{{ capability.progress }}%</b>
          </div>

          <p v-if="capability.status === 'running'" class="task-detail-current-step">当前步骤：{{ capability.currentStep }}</p>
          <p v-else-if="capability.status === 'pending'" class="task-detail-current-step">等待依赖：{{ capability.dependency }}</p>
          <span v-else class="task-detail-current-step-spacer" aria-hidden="true"></span>

          <div class="task-detail-card-actions">
            <button type="button" :disabled="capability.status === 'pending'" @click="viewLog(capability)">查看日志</button>
            <button v-if="canViewResult(capability)" type="button" @click="viewResult(capability)">查看结果</button>
            <button v-else type="button" :disabled="capability.status === 'pending'" @click="runBackground(capability)">
              <FontAwesomeIcon :icon="faPlay" />后台运行
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="task-detail-table-section" data-detail-region="execution-table">
      <header><h2>执行明细</h2></header>
      <div class="task-detail-table-scroll">
        <table>
          <thead>
            <tr><th>能力</th><th>当前步骤</th><th>输入资料</th><th>输出结果</th><th>进度</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="capability in capabilities" :key="`${capability.id}-detail`">
              <td>{{ capability.name }}</td>
              <td>{{ capability.currentStep }}</td>
              <td>{{ capability.input }}</td>
              <td>{{ capability.output }}</td>
              <td>
                <div class="task-detail-table-progress">
                  <span>{{ capability.progress }}%</span>
                  <i><b :class="capability.status" :style="{ width: `${capability.progress}%` }"></b></i>
                </div>
              </td>
              <td><span class="task-detail-table-status" :class="capability.status">{{ capability.statusLabel }}</span></td>
              <td>
                <div class="task-detail-table-actions">
                  <button type="button" :disabled="capability.status === 'pending'" @click="viewLog(capability)">查看日志</button>
                  <button v-if="canViewResult(capability)" type="button" @click="viewResult(capability)">查看结果</button>
                  <button v-else type="button" :disabled="capability.status === 'pending'" @click="runBackground(capability)">后台运行</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faCircleCheck, faCircleNotch, faCircleXmark, faClock, faPlay } from '@fortawesome/free-solid-svg-icons';

defineProps({
  stages: { type: Array, required: true },
  summary: { type: Array, required: true },
  capabilities: { type: Array, required: true }
});

const emit = defineEmits(['view-log', 'view-result', 'run-background']);

function canViewResult(capability) {
  return capability.status === 'completed' || (capability.id === 'expense-audit' && capability.progress > 0);
}

function summaryIcon(tone) {
  return { success: faCircleCheck, running: faCircleNotch, pending: faClock, failed: faCircleXmark }[tone] || faClock;
}

function viewLog(capability) {
  emit('view-log', capability);
}

function viewResult(capability) {
  emit('view-result', capability);
}

function runBackground(capability) {
  emit('run-background', capability);
}
</script>

<style scoped>
.task-detail-execution-main{min-width:0;color:#252d38}.task-detail-stage-summary,.task-detail-capability-section,.task-detail-table-section{box-sizing:border-box;border:1px solid #e1e6ed;background:#fff}.task-detail-stage-summary{display:grid;grid-template-columns:minmax(0,1.72fr) minmax(340px,1fr);height:105px;margin-bottom:3px}.task-detail-stage-list{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));margin:0;padding:21px 14px 9px;list-style:none;border-right:1px solid #e6e9ef}.task-detail-stage-list li{position:relative;display:grid;grid-template-rows:22px 20px 17px;justify-items:center;min-width:0;color:#7c8797;font-size:11px}.task-detail-stage-list li::before{position:absolute;top:9px;right:50%;left:-50%;height:2px;background:#cfd6e0;content:""}.task-detail-stage-list li:first-child::before{display:none}.task-detail-stage-list li.completed::before,.task-detail-stage-list li.active::before{background:#0b9848}.task-detail-stage-node{position:relative;z-index:1;display:grid;width:20px;height:20px;place-items:center;border-radius:50%;background:#7e8998;color:#fff;font-size:10px}.completed .task-detail-stage-node{background:#079744}.active .task-detail-stage-node{background:#c9090b}.task-detail-stage-list strong{overflow:hidden;max-width:100%;color:#313946;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.task-detail-stage-list .active strong,.task-detail-stage-list .active small{color:#c9090b}.task-detail-stage-list small{font-size:10px;white-space:nowrap}.task-detail-summary-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0;padding:22px 7px 12px}.task-detail-summary-list>div{min-width:0;padding:0 9px;border-right:1px solid #e6e9ef}.task-detail-summary-list>div:last-child{border-right:0}.task-detail-summary-list dt{color:#313946;font-size:11px;text-align:center;white-space:nowrap}.task-detail-summary-list dd{display:flex;align-items:center;justify-content:center;gap:5px;margin:14px 0 0;font-size:11px}.task-detail-summary-list dd svg{font-size:17px}.task-detail-summary-list dd strong{font-size:14px}.task-detail-summary-list .success dd{color:#079744}.task-detail-summary-list .running dd{color:#ef8500}.task-detail-summary-list .pending dd{color:#6f7f95}.task-detail-summary-list .failed dd{color:#e11923}.task-detail-capability-section{height:387px;overflow:hidden}.task-detail-capability-section>header,.task-detail-table-section>header{display:flex;height:25px;align-items:center;padding:0 9px}.task-detail-capability-section h2,.task-detail-table-section h2{margin:0;color:#222a35;font-size:13px;line-height:20px}.task-detail-capability-section h2 small{color:#7a8696;font-size:10px;font-weight:400}.task-detail-capability-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.18fr);grid-auto-rows:117px;gap:5px 6px;padding:0 5px 5px}.task-detail-capability-grid article{min-width:0;overflow:hidden;border:1px solid #e2e7ed;border-radius:6px;background:#fff;padding:8px 11px 7px}.task-detail-capability-heading{display:grid;grid-template-columns:20px minmax(0,1fr) auto;align-items:start;gap:9px}.task-detail-capability-index{display:grid;width:19px;height:19px;place-items:center;border-radius:3px;background:#697789;color:#fff;font-size:11px;font-weight:700}.task-detail-capability-grid article.completed .task-detail-capability-index{background:#079744}.task-detail-capability-grid article.running .task-detail-capability-index{background:#f07e00}.task-detail-capability-heading h3{margin:0;overflow:hidden;color:#202832;font-size:14px;line-height:19px;text-overflow:ellipsis;white-space:nowrap}.task-detail-capability-heading p{margin:1px 0 0;overflow:hidden;color:#687587;font-size:10px;line-height:15px;text-overflow:ellipsis;white-space:nowrap}.task-detail-status-tag{height:20px;padding:0 7px;border:1px solid #d7dee7;border-radius:4px;background:#f6f8fa;color:#5f6c7c;font-size:10px;line-height:18px;white-space:nowrap}.completed .task-detail-status-tag{border-color:#bce6cd;background:#edf9f2;color:#078f43}.running .task-detail-status-tag{border-color:#ffd5a2;background:#fff7ea;color:#ed7900}.task-detail-card-progress{display:flex;align-items:center;gap:7px;margin-top:7px}.task-detail-card-progress>b{min-width:28px;color:#465264;font-size:10px;font-weight:400;text-align:right}.task-detail-progress-track{display:block;height:4px;flex:1;overflow:hidden;border-radius:4px;background:#e6e9ee}.task-detail-progress-track i{display:block;height:100%;border-radius:inherit;background:#7b8797}.completed .task-detail-progress-track i{background:#079744}.running .task-detail-progress-track i{background:#f08a00}.task-detail-current-step{height:15px;margin:3px 0 0;color:#5f6b7c;font-size:9px;line-height:15px}.task-detail-current-step-spacer{display:block;height:18px}.task-detail-card-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.task-detail-card-actions button{display:flex;height:25px;align-items:center;justify-content:center;gap:5px;border:1px solid #dbe1e8;border-radius:4px;background:#fff;color:#445162;font-size:10px}.task-detail-card-actions button:disabled{color:#b7bec8;background:#fafbfc;cursor:not-allowed}.task-detail-card-actions svg{font-size:8px}.task-detail-table-section{height:234px;margin-top:12px;padding:0 7px 7px}.task-detail-table-section>header{padding:0 2px}.task-detail-table-scroll{overflow:auto;border:1px solid #e1e6ed}.task-detail-table-section table{width:100%;min-width:850px;border-collapse:collapse;table-layout:fixed}.task-detail-table-section th,.task-detail-table-section td{height:20px;padding:2px 8px;border-right:1px solid #e6e9ee;border-bottom:1px solid #e6e9ee;overflow:hidden;color:#354052;font-size:9px;text-align:left;text-overflow:ellipsis;white-space:nowrap}.task-detail-table-section th{height:24px;background:#f5f7fa;color:#4b5666;font-weight:600}.task-detail-table-section th:nth-child(1){width:11%}.task-detail-table-section th:nth-child(2){width:13%}.task-detail-table-section th:nth-child(3){width:17.5%}.task-detail-table-section th:nth-child(4){width:18%}.task-detail-table-section th:nth-child(5){width:18.5%}.task-detail-table-section th:nth-child(6){width:9.5%}.task-detail-table-section th:nth-child(7){width:12.5%}.task-detail-table-progress{display:flex;align-items:center;gap:7px}.task-detail-table-progress>span{width:28px;text-align:right}.task-detail-table-progress>i{display:block;height:4px;flex:1;overflow:hidden;border-radius:4px;background:#e6e9ee}.task-detail-table-progress b{display:block;height:100%;border-radius:inherit;background:#7b8797}.task-detail-table-progress b.completed{background:#079744}.task-detail-table-progress b.running{background:#f08a00}.task-detail-table-status{display:inline-block;padding:1px 5px;border-radius:3px;background:#f2f4f7;color:#627083}.task-detail-table-status.completed{background:#edf9f2;color:#078f43}.task-detail-table-status.running{background:#fff7ea;color:#ed7900}.task-detail-table-actions{display:flex;gap:8px}.task-detail-table-actions button{padding:0;border:0;background:transparent;color:#1677ff;font-size:9px;white-space:nowrap}.task-detail-table-actions button:disabled{color:#bbc2cc;cursor:not-allowed}.task-detail-card-actions button:focus-visible,.task-detail-table-actions button:focus-visible{outline:2px solid #1677ff;outline-offset:1px}
.task-detail-stage-list{padding:18px 14px 12px}
.task-detail-stage-list strong{font-size:12px}
.task-detail-stage-list small{font-size:11px}
.task-detail-capability-heading h3{font-size:15px}
.task-detail-capability-heading p{font-size:11px}
.task-detail-current-step{font-size:10px}
.task-detail-card-actions button{font-size:11px}
.task-detail-table-section th,.task-detail-table-section td{font-size:10px}
@media(max-width:1199px){.task-detail-stage-summary{grid-template-columns:1fr;height:auto}.task-detail-stage-list{border-right:0;border-bottom:1px solid #e6e9ef}.task-detail-capability-section{height:auto}.task-detail-capability-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:117px}.task-detail-table-section{height:auto}.task-detail-summary-list{min-height:86px}}
</style>
