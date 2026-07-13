<template>
  <section class="parsing-workspace" aria-labelledby="parsing-title">
    <h2 id="parsing-title" class="visually-hidden">资料解析与预检</h2>

    <section class="parse-summary" aria-label="解析总览">
      <article class="progress-card">
        <div class="summary-label">解析总进度</div>
        <div class="progress-line">
          <strong>{{ summary.percentage }}<small>%</small></strong>
          <div class="progress-track" role="progressbar" :aria-valuenow="summary.percentage" aria-valuemin="0" aria-valuemax="100">
            <span :style="{ width: `${summary.percentage}%` }"></span>
          </div>
        </div>
        <p>已处理 {{ summary.processed }} / {{ summary.total }} 个文件</p>
      </article>

      <article v-for="metric in summaryMetrics" :key="metric.key" class="summary-card">
        <span>{{ metric.label }}</span>
        <div><strong>{{ metric.value }}<small> 个</small></strong><FontAwesomeIcon :icon="metric.icon" :class="metric.tone" /></div>
      </article>
    </section>

    <div class="workspace-grid">
      <div class="workspace-main">
        <div class="mobile-tools">
          <button type="button" @click="treeOpen = !treeOpen"><FontAwesomeIcon :icon="faFolderTree" /> 文件夹预览</button>
          <button type="button" @click="detailOpen = true"><FontAwesomeIcon :icon="faCircleInfo" /> 解析详情</button>
        </div>

        <div class="files-layout">
          <MaterialFileTree
            class="file-tree-slot"
            :class="{ open: treeOpen }"
            :files="files"
            :selected-id="selectedId"
            @select="selectFile"
            @batch-retry="batchRetry"
            @batch-skip="batchSkip"
          />

          <div class="center-stack">
            <MaterialFileTable
              :files="visibleFiles"
              :selected-id="selectedId"
              @select="selectFile"
              @action="handleTableAction"
              @page-change="currentPage = $event"
            />

            <section class="precheck-panel" aria-labelledby="precheck-title">
              <header>
                <h3 id="precheck-title">字段映射与预检结果</h3>
                <span>（已完成 {{ mappedFileCount }} / {{ visibleFiles.length }} 个文件的元数据映射）</span>
              </header>

              <div class="precheck-grid">
                <section ref="mappingSectionRef" class="mapping-column" aria-label="字段映射详情" tabindex="-1">
                  <h4>字段映射示例 <span>（{{ currentFile?.name || '未选择文件' }}）</span></h4>
                  <div class="mapping-table" role="table" aria-label="字段映射表">
                    <div class="mapping-row mapping-head" role="row"><span>源字段</span><span>目标字段</span><span>匹配度</span><span>状态</span></div>
                    <div v-for="mapping in currentMappings" :key="mapping.source" class="mapping-row" role="row">
                      <span>{{ mapping.source }}</span>
                      <button type="button" :class="{ missing: !mapping.target }" @click="completeMapping(mapping)">{{ mapping.target || '选择字段' }}</button>
                      <span>{{ mapping.confidence ?? 0 }}%</span>
                      <em :class="mapping.target ? 'mapped' : 'pending'">{{ mapping.target ? '已映射' : '待确认' }}</em>
                    </div>
                  </div>
                </section>

                <section class="check-column" aria-label="预检结果汇总">
                  <h4>预检结果汇总</h4>
                  <ul>
                    <li v-for="metric in summaryMetrics" :key="metric.key"><FontAwesomeIcon :icon="metric.icon" :class="metric.tone" /><span>{{ metric.label }}</span><b>{{ metric.value }} 个</b></li>
                  </ul>
                </section>

                <section class="blocking-column" aria-label="阻断项和建议处理">
                  <h4>阻断提交项 <b>（{{ currentBlockers.length }} 项）</b></h4>
                  <div class="issue-box danger-box">
                    <ol v-if="currentBlockers.length"><li v-for="item in currentBlockers" :key="item">{{ item }}</li></ol>
                    <p v-else>当前文件无阻断项。</p>
                  </div>
                  <div v-if="currentSuggestions.length" class="issue-box suggestion-box">
                    <strong>建议处理</strong>
                    <ul><li v-for="item in currentSuggestions" :key="item">{{ item }}</li></ul>
                  </div>
                </section>
              </div>
            </section>

            <footer class="parsing-flow-footer">
              <span v-if="!canContinue" role="status"><FontAwesomeIcon :icon="faTriangleExclamation" /> 请先处理阻断项后继续</span>
              <div>
                <button class="flow-btn secondary" type="button" @click="$emit('save-draft')">保存草稿</button>
                <button class="flow-btn outline" type="button" @click="$emit('back')">上一步</button>
                <button class="flow-btn primary" type="button" :disabled="!canContinue" :title="canContinue ? '' : '请先处理解析失败、格式异常和缺失必填字段'" @click="$emit('continue')">下一步：模板与输出设置</button>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <MaterialDetailRail
        ref="detailRailRef"
        :file="currentFile"
        :open="detailOpen"
        @close="detailOpen = false"
        @retry="retryFile"
        @replace="replaceFile"
        @skip="skipFile"
        @map-field="mapField"
        @download-log="downloadLog"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowsRotate, faCircleCheck, faCircleInfo, faCircleXmark, faCopy, faFileCircleExclamation, faFolderTree, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import MaterialFileTree from './MaterialFileTree.vue';
import MaterialFileTable from './MaterialFileTable.vue';
import MaterialDetailRail from './MaterialDetailRail.vue';
import { batchRetryParsing, batchSkipParsing, canContinueParsing, createMaterialParsingBatch, getParsingSummary, getSelectedFile, mapParsingField, replaceParsingFile, retryParsingFile, skipParsingFile } from '../../domain/taskCreate/materialParsingState.js';

const props = defineProps({ sourceMaterials: { type: Array, default: () => [] } });
defineEmits(['save-draft', 'back', 'continue']);

const files = ref(createMaterialParsingBatch(props.sourceMaterials));
const selectedId = ref(files.value.find((file) => file.parseStatus === '格式异常')?.id || files.value[0]?.id || '');
const detailOpen = ref(false);
const treeOpen = ref(false);
const currentPage = ref(1);
const mappingSectionRef = ref(null);
const detailRailRef = ref(null);

const DESIGN_WIDTH = 1608;
let parsingShell;
let scaleFrame;

function updateParsingScale() {
  if (!parsingShell) return;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scale = viewportWidth < 1500 ? Math.min(1, viewportWidth / DESIGN_WIDTH, viewportHeight / 1014) : 1;
  const horizontalOffset = scale < 1 ? Math.max(0, (viewportWidth - DESIGN_WIDTH * scale) / 2 / scale) : 0;
  parsingShell.style.setProperty('--task-parsing-scale', String(scale));
  parsingShell.style.setProperty('--task-parsing-offset-x', `${horizontalOffset}px`);
}

function connectParsingShell() {
  parsingShell = document.querySelector('.task-parsing-shell');
  if (!parsingShell) {
    scaleFrame = window.requestAnimationFrame(connectParsingShell);
    return;
  }
  updateParsingScale();
}

onMounted(() => {
  window.addEventListener('resize', updateParsingScale);
  connectParsingShell();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateParsingScale);
  window.cancelAnimationFrame(scaleFrame);
  parsingShell?.style.removeProperty('--task-parsing-scale');
  parsingShell?.style.removeProperty('--task-parsing-offset-x');
});

const summary = computed(() => getParsingSummary(files.value));
const tableExcludedIds = new Set(['audit-notice', 'fixed-assets', 'pending-supplement']);
const visibleFiles = computed(() => files.value.filter((file) => file.visibleInTable !== false && !tableExcludedIds.has(file.id)));
const currentFile = computed(() => getSelectedFile(files.value, selectedId.value));
const currentMappings = computed(() => currentFile.value?.mappings || []);
const currentBlockers = computed(() => currentFile.value?.blockers || []);
const currentSuggestions = computed(() => {
  if (currentFile.value?.suggestions?.length) return currentFile.value.suggestions;
  if (currentFile.value?.blocksSubmission || ['解析失败', '格式异常'].includes(currentFile.value?.parseStatus)) {
    return ['检查文件内容和格式后重新解析。', '必要时替换为可识别的 PDF、Excel 文件。'];
  }
  return [];
});
const mappedFileCount = computed(() => summary.value.success);
const canContinue = computed(() => canContinueParsing(files.value));
const summaryMetrics = computed(() => [
  { key: 'success', label: '解析成功', value: summary.value.success, icon: faCircleCheck, tone: 'success' },
  { key: 'parsing', label: '解析中', value: summary.value.parsing, icon: faArrowsRotate, tone: 'info' },
  { key: 'failed', label: '解析失败', value: summary.value.failed, icon: faCircleXmark, tone: 'danger' },
  { key: 'duplicate', label: '重复文件', value: summary.value.duplicate, icon: faCopy, tone: 'warning' },
  { key: 'format', label: '格式异常', value: summary.value.abnormal, icon: faFileCircleExclamation, tone: 'danger' }
]);

function selectFile(id) { selectedId.value = id; if (window.innerWidth < 1500) detailOpen.value = true; }
function retryFile(id) { files.value = retryParsingFile(files.value, id); }
function replaceFile(payload) { files.value = replaceParsingFile(files.value, payload.id, payload.fileName); }
function skipFile(id) { files.value = skipParsingFile(files.value, id); }
function mapField(payload) { files.value = mapParsingField(files.value, payload.id, payload.source, payload.target); }
function batchRetry() { files.value = batchRetryParsing(files.value); }
function batchSkip() {
  if (window.confirm('确定批量跳过解析失败、重复和格式异常文件吗？')) files.value = batchSkipParsing(files.value);
}
function completeMapping(mapping) { if (currentFile.value && !mapping.target) mapField({ id: currentFile.value.id, source: mapping.source, target: mapping.suggestedTarget || mapping.source }); }
async function handleTableAction({ type, id }) {
  selectedId.value = id;
  if (type === 'retry') retryFile(id);
  else if (type === 'replace') {
    await nextTick();
    detailRailRef.value?.openFilePicker();
  } else if (type === 'skip') {
    await nextTick();
    detailRailRef.value?.requestSkip();
  } else if (type === 'map-field') {
    await nextTick();
    mappingSectionRef.value?.focus();
  } else detailOpen.value = true;
}
function downloadLog(id) {
  const file = getSelectedFile(files.value, id);
  if (!file) return;
  const blob = new Blob([`文件：${file.name}\n解析状态：${file.parseStatus}\n失败原因：${file.failureReason || '无'}\n`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${file.name}-解析日志.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.parsing-workspace{--parse-red:#c70000;--parse-green:#078a43;--parse-blue:#1677ff;--parse-orange:#f28a00;--parse-danger:#e11923;--parse-line:#e2e7ee;--parse-muted:#697586;min-width:0;color:#273142}.parse-summary{display:grid;grid-template-columns:minmax(260px,2.1fr) repeat(5,minmax(112px,1fr));gap:7px;margin:8px 368px 14px 0;background:#fff}.progress-card,.summary-card{min-width:0;height:93px;box-sizing:border-box;padding:12px 14px;border:1px solid var(--parse-line);border-radius:5px;background:#fff}.summary-label,.summary-card>span{color:#3e4858;font-size:12px;font-weight:700}.progress-line{display:flex;align-items:center;gap:13px;margin-top:7px}.progress-line strong{font-size:25px;line-height:1}.progress-line small,.summary-card small{font-size:11px}.progress-track{height:10px;flex:1;overflow:hidden;border-radius:8px;background:#e2e6ec}.progress-track span{display:block;height:100%;border-radius:inherit;background:var(--parse-red)}.progress-card p{margin:7px 0 0;color:var(--parse-muted);font-size:11px}.summary-card{display:flex;flex-direction:column;justify-content:space-between}.summary-card>div{display:flex;align-items:center;justify-content:space-between}.summary-card strong{font-size:24px}.summary-card svg{font-size:18px}.success{color:var(--parse-green)}.info{color:var(--parse-blue)}.danger{color:var(--parse-danger)}.warning{color:var(--parse-orange)}.workspace-grid{display:grid;grid-template-columns:minmax(0,1fr) 358px;gap:10px;min-width:0;height:calc(100vh - 303px);min-height:620px;max-height:711px}.workspace-main,.center-stack{min-width:0;min-height:0}.files-layout{display:grid;grid-template-columns:204px minmax(0,1fr);gap:10px;min-width:0;height:100%}.center-stack{display:grid;grid-template-rows:417px 239px 55px;min-height:0}.mobile-tools{display:none}.file-tree-slot{height:100%}.workspace-grid>:deep(.material-detail-rail){height:calc(100% + 148px);margin-top:-148px}.precheck-panel{min-width:0;border:1px solid var(--parse-line);background:#fff}.precheck-panel>header{display:flex;align-items:center;min-height:36px;padding:0 10px;border-bottom:1px solid var(--parse-line)}.precheck-panel h3,.precheck-panel h4{margin:0}.precheck-panel h3{font-size:13px}.precheck-panel>header span,.mapping-column h4 span{color:var(--parse-muted);font-size:10px;font-weight:400}.precheck-grid{display:grid;grid-template-columns:minmax(285px,1.25fr) minmax(150px,.65fr) minmax(260px,1.1fr);height:calc(100% - 37px)}.precheck-grid>section{min-width:0;padding:10px;border-right:1px solid var(--parse-line);overflow:auto}.precheck-grid>section:last-child{border-right:0}.precheck-grid h4{margin-bottom:9px;font-size:11px}.mapping-table{border:1px solid var(--parse-line);border-bottom:0}.mapping-row{display:grid;grid-template-columns:1.1fr 1.1fr 58px 58px;min-height:25px;border-bottom:1px solid var(--parse-line);font-size:10px}.mapping-row>*{display:flex;align-items:center;padding:3px 7px;border-right:1px solid var(--parse-line)}.mapping-row>*:last-child{border-right:0}.mapping-head{background:#f6f8fa;font-weight:700}.mapping-row button{border:0;background:#fff;color:#2f3b4a;font:inherit;text-align:left}.mapping-row button.missing{color:var(--parse-blue);text-decoration:underline}.mapping-row em{justify-content:center;font-style:normal}.mapping-row em.mapped{color:var(--parse-green);background:#edf9f2}.mapping-row em.pending{color:#c87500;background:#fff6e8}.check-column ul{display:grid;gap:11px;margin:0;padding:2px 0;list-style:none}.check-column li{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:7px;font-size:10px}.check-column b{font-size:10px}.blocking-column h4 b{color:var(--parse-danger)}.issue-box{padding:9px 10px;border:1px solid;border-radius:5px;font-size:10px;line-height:1.55}.issue-box ol,.issue-box ul{margin:0;padding-left:17px}.issue-box p{margin:0}.danger-box{border-color:#f4c4c6;background:#fff3f3;color:#7c1f24}.suggestion-box{margin-top:9px;border-color:#bfe2cc;background:#f2fbf6;color:#1f623d}.suggestion-box strong{display:block;margin-bottom:3px}.parsing-flow-footer{display:flex;align-items:center;justify-content:flex-end;gap:14px;padding:8px 10px;border:1px solid var(--parse-line);border-top:0;background:#fff}.parsing-flow-footer>span{margin-right:auto;color:#a54c00;font-size:11px}.parsing-flow-footer>div{display:flex;gap:12px}.flow-btn{height:34px;padding:0 22px;border:1px solid #cfd6df;border-radius:4px;background:#fff;color:#344054;font-size:12px}.flow-btn.outline{min-width:126px;border-color:#df5555;color:var(--parse-red)}.flow-btn.primary{min-width:220px;border-color:var(--parse-red);background:var(--parse-red);color:#fff}.flow-btn:disabled{border-color:#e2e5ea;background:#e5e8ed;color:#aeb5c0;cursor:not-allowed}.flow-btn:focus-visible,.mobile-tools button:focus-visible,.mapping-row button:focus-visible{outline:2px solid var(--parse-blue);outline-offset:2px}
.mapping-column:focus-visible{outline:2px solid var(--parse-blue);outline-offset:-2px}
@media(max-width:1439px){.parse-summary{grid-template-columns:repeat(3,minmax(0,1fr));margin-right:0}.progress-card{grid-column:span 3}.workspace-grid{grid-template-columns:minmax(0,1fr);height:auto;max-height:none}.workspace-grid>:deep(.material-detail-rail){position:fixed;z-index:30;inset:58px 0 0 auto;width:min(420px,94vw);height:calc(100vh - 58px);margin-top:0;transform:translateX(105%);transition:transform .18s ease}.workspace-grid>:deep(.material-detail-rail.open){transform:translateX(0)}.mobile-tools{display:flex;justify-content:flex-end;gap:8px;margin-bottom:7px}.mobile-tools button{height:32px;border:1px solid var(--parse-line);border-radius:4px;background:#fff;color:#344054}.files-layout{grid-template-columns:204px minmax(0,1fr)}}
@media(min-width:1200px) and (max-width:1439px){.parse-summary{grid-template-columns:minmax(260px,2.1fr) repeat(5,minmax(112px,1fr))}.progress-card{grid-column:auto}}
@media(max-width:1199px){.files-layout{grid-template-columns:minmax(0,1fr)}.file-tree-slot{position:fixed;z-index:29;top:58px;bottom:0;left:64px;width:260px;transform:translateX(-110%);transition:transform .18s ease}.file-tree-slot.open{transform:translateX(0)}.precheck-grid{grid-template-columns:1fr 1fr}.blocking-column{grid-column:1/-1;border-top:1px solid var(--parse-line)}.center-stack{grid-template-rows:408px auto 64px}.parsing-flow-footer{position:sticky;bottom:0;z-index:4}}
@media(max-width:767px){.parse-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.progress-card{grid-column:span 2}.summary-card{height:74px}.workspace-grid>:deep(.material-detail-rail){inset:56px 0 0 0;width:auto}.file-tree-slot{left:0;top:56px;width:min(320px,92vw)}.precheck-grid{grid-template-columns:1fr}.blocking-column{grid-column:auto}.precheck-grid>section{border-right:0;border-bottom:1px solid var(--parse-line)}.center-stack{display:block}.precheck-panel{margin-top:8px}.parsing-flow-footer{align-items:stretch;flex-direction:column;padding:10px}.parsing-flow-footer>span{margin:0}.parsing-flow-footer>div{display:grid;grid-template-columns:1fr}.flow-btn,.flow-btn.outline,.flow-btn.primary{width:100%;min-width:0}.mobile-tools{padding:0 4px}.mobile-tools button{flex:1}}
@media(min-width:1440px) and (max-width:1499px){.parse-summary{grid-template-columns:minmax(260px,2.1fr) repeat(5,minmax(112px,1fr));margin-right:0}.progress-card{grid-column:auto}.workspace-grid{grid-template-columns:minmax(0,1fr);height:auto;max-height:none}.workspace-grid>:deep(.material-detail-rail){position:fixed;z-index:30;inset:58px 0 0 auto;width:min(420px,94vw);height:calc(100vh - 58px);margin-top:0;transform:translateX(105%);transition:transform .18s ease}.workspace-grid>:deep(.material-detail-rail.open){transform:translateX(0)}.mobile-tools{display:flex;justify-content:flex-end;gap:8px;margin-bottom:7px}.mobile-tools button{height:32px;border:1px solid var(--parse-line);border-radius:4px;background:#fff;color:#344054}.files-layout{grid-template-columns:204px minmax(0,1fr)}}
@media(min-width:1500px){.parse-summary{margin-left:4px}.workspace-main{margin-left:4px}.files-layout{gap:16px}}
@media(min-width:1200px) and (max-width:1499px){
  :global(.task-parsing-shell){width:1608px;min-height:1014px;margin-left:var(--task-parsing-offset-x);zoom:var(--task-parsing-scale);transform-origin:top left}
  :global(.task-parsing-shell .sidebar){height:1014px}
  :global(.task-parsing-shell .main){padding-bottom:12px}
  :global(.task-parsing-shell .task-create-page.parsing-page){padding-right:0;padding-left:0}
  :global(.task-parsing-shell .parse-page-title){margin-left:9px}
  :global(.task-parsing-shell .parsing-downstream>.wizard-steps){margin-right:368px;margin-left:4px}
  .parse-summary{grid-template-columns:minmax(260px,2.1fr) repeat(5,minmax(112px,1fr));margin-right:368px;margin-left:4px}.progress-card{grid-column:auto}
  .workspace-grid{grid-template-columns:minmax(0,1fr) 358px;gap:10px;height:711px;min-height:711px;max-height:711px}
  .workspace-main{margin-left:4px}.mobile-tools{display:none}.files-layout{grid-template-columns:204px minmax(0,1fr);gap:16px;height:100%}.file-tree-slot{position:static;width:auto;height:100%;transform:none}
  .center-stack{display:grid;grid-template-rows:417px 239px 55px}.precheck-grid{grid-template-columns:minmax(285px,1.25fr) minmax(150px,.65fr) minmax(260px,1.1fr)}.blocking-column{grid-column:auto;border-top:0}.parsing-flow-footer{position:static;align-items:center;flex-direction:row;padding:8px 10px}.parsing-flow-footer>span{margin-right:auto}.parsing-flow-footer>div{display:flex}.flow-btn,.flow-btn.outline,.flow-btn.primary{width:auto}.flow-btn.outline{min-width:126px}.flow-btn.primary{min-width:220px}
  .workspace-grid>:deep(.material-detail-rail),.workspace-grid>:deep(.material-detail-rail.open){position:static;inset:auto;width:358px;height:calc(100% + 148px);margin-top:-148px;transform:none;transition:none;border-radius:5px;box-shadow:0 2px 8px rgb(28 39 54 / 8%)}
  .workspace-grid>:deep(.close-button){display:none}
}
</style>
