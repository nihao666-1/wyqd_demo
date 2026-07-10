<template>
  <aside class="task-detail-draft-rail" aria-label="任务下一步与操作留痕">
    <section class="task-detail-draft-guidance" aria-labelledby="task-detail-draft-guidance-title">
      <header class="task-detail-draft-panel-header">
        <h2 id="task-detail-draft-guidance-title">下一步提示</h2>
      </header>

      <div class="task-detail-draft-guidance-group">
        <header>
          <h3>待补充资料 <small>（必填）</small></h3>
          <button type="button" @click="emit('edit-materials')">编辑</button>
        </header>
        <ul>
          <li v-for="material in task.requiredMaterials" :key="material.name">
            <span class="task-detail-draft-file-icon" aria-hidden="true"><FontAwesomeIcon :icon="faFileLines" /></span>
            <span :title="material.name">{{ material.name }}</span>
            <em>{{ material.status }}</em>
          </li>
        </ul>
      </div>

      <div class="task-detail-draft-guidance-group">
        <header><h3>所需输出 <small>（生成后可用）</small></h3></header>
        <ul>
          <li v-for="output in task.outputs" :key="output.name">
            <span class="task-detail-draft-file-icon" aria-hidden="true"><FontAwesomeIcon :icon="faFileLines" /></span>
            <span :title="output.name">{{ output.name }}</span>
            <em class="task-detail-draft-output-state">{{ output.status }}</em>
          </li>
        </ul>
      </div>

      <div class="task-detail-draft-blocker" role="status">
        <h3>阻断项</h3>
        <p><span class="task-detail-draft-blocker-icon" aria-hidden="true"><FontAwesomeIcon :icon="faCircleExclamation" /></span><span>尚未上传任何资料，无法进行解析与智能分析。<br>请补齐以上必填资料后继续。</span></p>
      </div>
    </section>

    <section class="task-detail-draft-log" aria-labelledby="task-detail-draft-log-title">
      <header class="task-detail-draft-panel-header">
        <h2 id="task-detail-draft-log-title">操作留痕</h2>
        <RouterLink :to="{ path: '/records', query: { taskId: task.id } }">全部日志 <span aria-hidden="true">›</span></RouterLink>
      </header>
      <div class="task-detail-draft-log-table">
        <table>
          <thead><tr><th scope="col">时间</th><th scope="col">操作人</th><th scope="col">操作</th><th scope="col">结果</th></tr></thead>
          <tbody>
            <tr v-for="log in task.logs" :key="`${log.time}-${log.operator}-${log.action}`">
              <td><time :datetime="log.time.replace(' ', 'T')">{{ log.time }}</time></td>
              <td>{{ log.operator }}</td>
              <td>{{ log.action }}</td>
              <td><span class="task-detail-draft-log-result">{{ log.result }}</span></td>
            </tr>
            <tr v-if="task.logs.length === 0"><td class="task-detail-draft-log-empty" colspan="4">暂无操作记录</td></tr>
          </tbody>
        </table>
      </div>
      <footer class="task-detail-draft-pagination" aria-label="日志分页">
        <button type="button" aria-label="上一页" disabled>‹</button>
        <strong aria-current="page">1</strong>
        <button type="button" aria-label="下一页" disabled>›</button>
        <span>10 条/页⌄</span>
      </footer>
    </section>
  </aside>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircleExclamation, faFileLines } from '@fortawesome/free-solid-svg-icons';

defineProps({ task: { type: Object, required: true } });
const emit = defineEmits(['edit-materials']);
</script>

<style scoped>
.task-detail-draft-rail {
  display: grid;
  min-width: 0;
  gap: 14px;
  color: #232936;
}

.task-detail-draft-guidance,
.task-detail-draft-log {
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #e0e5ec;
  background: #fff;
}

.task-detail-draft-guidance { min-height: 462px; }
.task-detail-draft-log { min-height: 189px; }

.task-detail-draft-panel-header,
.task-detail-draft-guidance-group > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-detail-draft-panel-header {
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #e8ebf0;
}

.task-detail-draft-panel-header h2,
.task-detail-draft-guidance-group h3,
.task-detail-draft-blocker h3 { margin: 0; }

.task-detail-draft-panel-header h2 { font-size: 16px; }
.task-detail-draft-panel-header a { color: #1677ff; font-size: 12px; text-decoration: none; }
.task-detail-draft-panel-header a:hover { text-decoration: underline; }

.task-detail-draft-guidance-group,
.task-detail-draft-blocker {
  padding: 0 16px;
  border-bottom: 1px solid #e8ebf0;
}

.task-detail-draft-guidance-group > header { min-height: 38px; }
.task-detail-draft-guidance-group h3,
.task-detail-draft-blocker h3 { font-size: 13px; }
.task-detail-draft-guidance-group h3 small { color: #8a94a3; font-size: 11px; font-weight: 400; }
.task-detail-draft-guidance-group:first-of-type h3 small,
.task-detail-draft-guidance-group:first-of-type em { color: #d71920; }
.task-detail-draft-guidance-group button {
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: #1677ff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.task-detail-draft-guidance-group ul { margin: 0; padding: 0 0 4px; list-style: none; }
.task-detail-draft-guidance-group li {
  display: grid;
  min-width: 0;
  min-height: 40px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.task-detail-draft-guidance-group li > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-detail-draft-file-icon { color: #7f8b9d; font-size: 14px; }
.task-detail-draft-guidance-group em { font-size: 12px; font-style: normal; }
.task-detail-draft-output-state { color: #7f8998; }

.task-detail-draft-blocker { min-height: 86px; padding-top: 12px; border-bottom: 0; }
.task-detail-draft-blocker p { display: grid; grid-template-columns: 17px 1fr; margin: 10px 0 0; color: #697586; font-size: 12px; line-height: 1.55; }
.task-detail-draft-blocker-icon { color: #d71920; font-size: 13px; }

.task-detail-draft-log-table { overflow-x: auto; }
.task-detail-draft-log table { width: 100%; min-width: 0 !important; max-width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
.task-detail-draft-log th,
.task-detail-draft-log td { height: 30px; padding: 0 8px; overflow: hidden; border-bottom: 1px solid #eef1f4; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
.task-detail-draft-log th { background: #fafbfc; color: #4d5664; font-weight: 500; }
.task-detail-draft-log th:nth-child(1) { width: 34%; }
.task-detail-draft-log th:nth-child(2) { width: 23%; }
.task-detail-draft-log th:nth-child(3) { width: 23%; }
.task-detail-draft-log th:nth-child(4) { width: 20%; }
.task-detail-draft-log td { color: #6b7584; }
.task-detail-draft-log-result { color: #139657; }
.task-detail-draft-log-empty { text-align: center !important; }

.task-detail-draft-pagination { display: flex; min-height: 54px; align-items: center; justify-content: flex-end; gap: 8px; padding: 0 12px; }
.task-detail-draft-pagination button,
.task-detail-draft-pagination strong { display: grid; width: 24px; height: 24px; box-sizing: border-box; place-items: center; border: 1px solid #dce2ea; border-radius: 4px; background: #fff; color: #9aa4b2; font-size: 12px; }
.task-detail-draft-pagination strong { border-color: #c7000b; background: #c7000b; color: #fff; }
.task-detail-draft-pagination span { padding: 5px 9px; border: 1px solid #dce2ea; border-radius: 4px; color: #4e5968; font-size: 11px; }
.task-detail-draft-guidance-group button:focus-visible,
.task-detail-draft-panel-header a:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }

@media (max-width: 900px) {
  .task-detail-draft-guidance,
  .task-detail-draft-log { min-height: auto; }
}
</style>
