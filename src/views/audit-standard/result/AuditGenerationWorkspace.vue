<template>
  <section class="generation-workspace">
    <div class="generation-overview" data-audit-region="generation-progress">
      <ol class="generation-steps" aria-label="规范生成步骤">
        <li v-for="(step, index) in steps" :key="step" :class="stepClass(index)">
          <span>{{ index + 1 }}</span><b>{{ step }}</b><small>{{ index < 2 ? '已完成' : index === 2 ? '运行中' : '等待中' }}</small>
        </li>
      </ol>

      <h2>来源完整性预检</h2>
      <div class="source-grid" aria-label="内部制度、外部法规、监管案例、风险事项">
        <article v-for="card in sourceCards" :key="card.id">
          <div class="source-head">
            <span class="source-icon" :class="card.tone"><FontAwesomeIcon :icon="sourceIcon(card.id)" /></span>
            <div><b>{{ card.name }}</b><strong>{{ card.count }} <small>{{ card.unit }}</small></strong></div>
          </div>
          <div class="source-completeness"><span>完整率</span><b>{{ card.completeness }}%</b></div>
        </article>
      </div>

      <div class="generation-log-row">
        <section data-generation-log>
          <h2>生成日志 <small>（实时）</small></h2>
          <ul>
            <li><i></i><time>10:23:45</time><span>匹配完成，共匹配到 48 份相关资料</span></li>
            <li><i></i><time>10:24:12</time><span>开始生成审计规范条目...</span></li>
            <li><i></i><time>10:25:30</time><span>已生成条目 186 条 / 320 条（58%）</span></li>
            <li><i></i><time>10:25:45</time><span>AI 正在提炼重点关注方向...</span></li>
          </ul>
        </section>
        <section class="generation-meter" data-generation-progress>
          <div class="meter-track"><i :style="{ width: `${generation.percent}%` }"></i></div>
          <p>条目生成进度：<strong>186 / 320（58%）</strong></p>
          <dl><div><dt>当前模型：</dt><dd>审计大模型 V2.3</dd></div><div><dt>并行能力：</dt><dd>4 / 6</dd></div></dl>
          <button type="button" @click="$emit('expand-log')">展开日志⌄</button>
        </section>
      </div>
    </div>

    <div class="draft-row" data-audit-region="standard-draft">
      <section class="standard-table-panel" data-standard-table>
        <h2>规范条目草稿 <small>（共 186 条）</small></h2>
        <div class="table-scroll">
          <table>
            <thead><tr><th>条目编号</th><th>条目名称</th><th>条目类型</th><th>风险等级</th><th>生成来源</th><th>确认状态</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" :class="{ selected: item.id === selectedItemId }">
                <td>{{ item.id }}</td><td :title="item.title">{{ item.title }}</td><td>{{ item.category }}</td>
                <td><span class="risk-tag" :class="item.risk">{{ item.risk === 'high' ? '高风险' : '中风险' }}</span></td>
                <td :title="item.source">{{ item.source }}</td><td><span class="status-tag" :class="item.status">{{ statusLabel(item.status) }}</span></td>
                <td><div class="row-actions"><button @click="$emit('view-evidence', item)">查看依据</button><button @click="$emit('edit-item', item)">编辑条目</button><button @click="$emit('confirm-item', item)">确认</button><button @click="$emit('exclude-item', item)">排除</button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="pagination" data-pagination>
          <span>共 186 条</span>
          <div><button :disabled="page === 1" @click="$emit('page-change', page - 1)">‹</button><button v-for="number in visiblePages" :key="number" :class="{ active: page === number }" @click="$emit('page-change', number)">{{ number }}</button><span>…</span><button @click="$emit('page-change', 19)">19</button><button :disabled="page === 19" @click="$emit('page-change', page + 1)">›</button><select :value="pageSize" @change="$emit('page-size-change', Number($event.target.value))"><option :value="10">10 条/页</option><option :value="20">20 条/页</option></select><label>跳至 <input :value="page" inputmode="numeric" @change="$emit('page-change', Number($event.target.value))" /> 页</label></div>
        </footer>
      </section>

      <aside class="suggestions-panel" data-standard-suggestions>
        <h2>审计重点建议 <small>（生成中）</small></h2>
        <ol><li v-for="suggestion in suggestions" :key="suggestion">{{ suggestion }}</li></ol>
        <button type="button" @click="$emit('more-suggestions')">查看更多建议 ›</button>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBookOpen, faFileLines, faScaleBalanced, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  sourceCards: { type: Array, required: true }, generation: { type: Object, required: true },
  items: { type: Array, required: true }, suggestions: { type: Array, required: true },
  selectedItemId: { type: String, default: '' }, page: { type: Number, default: 1 }, pageSize: { type: Number, default: 10 }
});
defineEmits(['expand-log', 'view-evidence', 'edit-item', 'confirm-item', 'exclude-item', 'page-change', 'page-size-change', 'more-suggestions']);

const steps = ['选择模板', '匹配来源', '生成条目', '生成重点建议', '人工审阅', '导出入库'];
const visiblePages = computed(() => props.page <= 4 ? [1, 2, 3, 4, 5] : [props.page - 2, props.page - 1, props.page, props.page + 1, props.page + 2].filter((page) => page < 19));
function stepClass(index) { return index < 2 ? 'done' : index === 2 ? 'active' : 'waiting'; }
function sourceIcon(id) { return { internal: faBookOpen, external: faScaleBalanced, cases: faFileLines, risks: faTriangleExclamation }[id] || faFileLines; }
function statusLabel(status) { return { pending: '待确认', confirmed: '已确认', excluded: '已排除' }[status] || status; }
</script>

<style scoped>
.generation-workspace{height:628px;display:grid;grid-template-rows:309px 309px;gap:10px;color:#27313f}.generation-overview,.standard-table-panel,.suggestions-panel{border:1px solid #dfe5ec;border-radius:4px;background:#fff}.generation-overview{padding:10px 16px}.generation-steps{display:grid;height:54px;grid-template-columns:repeat(6,1fr);margin:0 0 9px;padding:0;list-style:none}.generation-steps li{position:relative;display:grid;grid-template-rows:25px 15px 13px;justify-items:center;color:#8b929e;font-size:9px}.generation-steps li:before{position:absolute;z-index:0;top:11px;right:50%;left:-50%;height:1px;background:#d8dde5;content:""}.generation-steps li:first-child:before{display:none}.generation-steps li.done:before{background:#12a05b}.generation-steps li span{z-index:1;display:grid;width:23px;height:23px;place-items:center;border-radius:50%;background:#9097a2;color:#fff;font-size:12px;font-weight:700}.generation-steps li.done span{background:#079850}.generation-steps li.active span{background:#cc0000}.generation-steps li b{color:#4b5563;font-size:10px}.generation-steps li small{padding:1px 5px;border-radius:3px;background:#f3f4f6;color:#9097a2}.generation-steps li.done small{background:#eaf7ef;color:#079850}.generation-steps li.active small{background:#fff0f0;color:#cc0000}.generation-overview>h2,.standard-table-panel>h2,.suggestions-panel>h2,.generation-log-row h2{margin:0;color:#202733;font-size:12px;line-height:22px}.generation-overview h2 small,.standard-table-panel h2 small,.suggestions-panel h2 small,.generation-log-row h2 small{color:#7b8491;font-size:9px;font-weight:400}.source-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:6px}.source-grid article{height:86px;padding:9px 12px;border:1px solid #dfe5ec;border-radius:4px}.source-head{display:flex;align-items:center;gap:9px}.source-icon{display:grid;width:36px;height:36px;place-items:center;border-radius:7px;font-size:20px}.source-icon.green{background:#e9f8ef;color:#0a9a52}.source-icon.blue{background:#edf5ff;color:#1677ff}.source-icon.purple{background:#f2ecff;color:#7d43e6}.source-icon.orange{background:#fff3e6;color:#f27b13}.source-head b,.source-head strong{display:block}.source-head b{font-size:10px}.source-head strong{margin-top:2px;font-size:17px}.source-head small{font-size:9px;font-weight:400}.source-completeness{display:flex;gap:12px;margin-top:7px;padding-top:6px;border-top:1px solid #edf0f4;font-size:9px}.source-completeness b{font-weight:500}.generation-log-row{display:grid;grid-template-columns:248px 1fr;gap:16px;margin-top:8px}.generation-log-row ul{display:grid;gap:3px;margin:3px 0 0;padding:0;list-style:none}.generation-log-row li{display:grid;grid-template-columns:6px 45px 1fr;gap:5px;align-items:center;font-size:8px;white-space:nowrap}.generation-log-row li i{width:4px;height:4px;border-radius:50%;background:#08a15a}.generation-log-row time{color:#667181}.generation-meter{position:relative;padding:13px 0 0}.meter-track{width:372px;height:8px;border-radius:8px;background:#dfe3e9}.meter-track i{display:block;height:100%;border-radius:inherit;background:#cf0000}.generation-meter p{margin:7px 0 0;font-size:9px}.generation-meter p strong{color:#c80000}.generation-meter dl{display:flex;gap:56px;margin:5px 0 0;font-size:9px}.generation-meter dl div{display:flex}.generation-meter dd{margin:0}.generation-meter button{position:absolute;right:0;bottom:0;height:27px;padding:0 10px;border:1px solid #d8dee7;border-radius:4px;background:#fff;color:#4d5968;font-size:9px}.draft-row{display:grid;grid-template-columns:594px 184px;gap:10px}.standard-table-panel{display:grid;grid-template-rows:33px 242px 33px;overflow:hidden}.standard-table-panel>h2,.suggestions-panel>h2{padding:6px 10px}.table-scroll{min-width:0;overflow:hidden}.table-scroll table{width:100%;min-width:0;table-layout:fixed;border-collapse:collapse;font-size:8px}.table-scroll th,.table-scroll td{height:25px;padding:3px 5px;border-top:1px solid #edf0f4;overflow:hidden;text-align:left;text-overflow:ellipsis;white-space:nowrap}.table-scroll thead th{height:34px;background:#fafbfc;color:#505967;font-weight:600}.table-scroll th:nth-child(1){width:60px}.table-scroll th:nth-child(2){width:95px}.table-scroll th:nth-child(3){width:58px}.table-scroll th:nth-child(4){width:54px}.table-scroll th:nth-child(5){width:85px}.table-scroll th:nth-child(6){width:58px}.table-scroll th:nth-child(7){width:182px}.table-scroll tr.selected td{background:#fffafa}.risk-tag,.status-tag{display:inline-flex;height:17px;min-height:17px;align-items:center;padding:0 4px;border:1px solid;border-radius:3px;font-size:8px}.risk-tag.high{border-color:#ffc7c7;background:#fff1f1;color:#dd2029}.risk-tag.medium,.status-tag.pending{border-color:#ffd7a8;background:#fff6e8;color:#f07d00}.status-tag.confirmed{border-color:#bce9cb;background:#ecf9f1;color:#119650}.status-tag.excluded{border-color:#d6dce5;background:#f5f6f8;color:#687487}.row-actions{display:flex;gap:6px}.row-actions button{padding:0;border:0;background:transparent;color:#1677ff;font-size:8px;white-space:nowrap}.pagination{display:flex;align-items:center;justify-content:space-between;padding:0 9px;border-top:1px solid #edf0f4;color:#5f6978;font-size:8px}.pagination>div{display:flex;align-items:center;gap:4px}.pagination button{display:grid;width:19px;height:19px;place-items:center;border:1px solid #d9dfe7;border-radius:3px;background:#fff;font-size:8px}.pagination button.active{border-color:#c90000;background:#c90000;color:#fff}.pagination button:disabled{opacity:.45}.pagination select{height:22px;border:1px solid #d9dfe7;border-radius:3px;background:#fff;font-size:8px}.pagination label{display:flex;align-items:center;gap:3px}.pagination input{width:30px;height:21px;border:1px solid #d9dfe7;border-radius:3px;text-align:center;font-size:8px}.suggestions-panel{display:grid;grid-template-rows:33px 1fr 30px;overflow:hidden}.suggestions-panel ol{margin:0;padding:3px 13px 0 27px;font-size:9px;line-height:18px}.suggestions-panel li{margin-bottom:5px}.suggestions-panel>button{justify-self:center;padding:0;border:0;background:transparent;color:#1677ff;font-size:9px}.generation-workspace button:focus-visible{outline:2px solid #1677ff;outline-offset:1px}
.table-scroll th:nth-child(2){width:112px}.table-scroll th:nth-child(5){width:90px}.table-scroll th:nth-child(7){width:160px}
.table-scroll th,.table-scroll td{font-size:8px}
</style>
