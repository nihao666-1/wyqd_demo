<template>
  <section class="parsing-workspace" aria-labelledby="parsing-title">
   

    <section class="parse-summary" aria-label="解析总览">
      <article v-for="metric in summaryMetrics" :key="metric.key" class="summary-card">
        <span>{{ metric.label }}</span>
        <div><strong>{{ metric.value }}<small> 个</small></strong><FontAwesomeIcon :icon="metric.icon" :class="metric.tone" /></div>
      </article>
    </section>

    <div class="workspace-grid" :class="{ 'detail-visible': detailOpen }">
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
            @select="selectTreeFile"
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
              <p>当前步骤 <strong>4</strong> / 5 <span v-if="!canContinue" class="parse-footer-status" role="status"><FontAwesomeIcon :icon="faTriangleExclamation" /> 请先处理阻断项后继续</span></p>
              <div class="parsing-footer-actions">
                <button class="flow-btn secondary" type="button" @click="$emit('save-draft')">保存草稿</button>
                <button class="flow-btn outline" type="button" @click="$emit('back')">上一步</button>
                <button class="flow-btn primary" type="button" :disabled="!canContinue" :title="canContinue ? '' : '请先处理解析异常和缺失必填字段'" @click="$emit('continue')">下一步：模板与输出设置</button>
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
import { computed, nextTick, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowsRotate, faCircleCheck, faCircleInfo, faCircleXmark, faFolderTree, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import MaterialFileTree from './MaterialFileTree.vue';
import MaterialFileTable from './MaterialFileTable.vue';
import MaterialDetailRail from './MaterialDetailRail.vue';
import { batchRetryParsing, batchSkipParsing, canContinueParsing, createMaterialParsingBatch, getParsingSummary, getSelectedFile, mapParsingField, replaceParsingFile, retryParsingFile, skipParsingFile } from '../../domain/taskCreate/materialParsingState.js';

const props = defineProps({ sourceMaterials: { type: Array, default: () => [] } });
defineEmits(['save-draft', 'back', 'continue']);

const files = ref(createMaterialParsingBatch(props.sourceMaterials));
const selectedId = ref('');
const detailOpen = ref(false);
const treeOpen = ref(false);
const currentPage = ref(1);
const mappingSectionRef = ref(null);
const detailRailRef = ref(null);

const summary = computed(() => getParsingSummary(files.value));
const tableExcludedIds = new Set(['audit-notice', 'fixed-assets', 'pending-supplement']);
const visibleFiles = computed(() => files.value.filter((file) => file.visibleInTable !== false && !tableExcludedIds.has(file.id)));
const currentFile = computed(() => getSelectedFile(files.value, selectedId.value));
const currentMappings = computed(() => currentFile.value?.mappings || []);
const currentBlockers = computed(() => currentFile.value?.blockers || []);
const currentSuggestions = computed(() => {
  if (currentFile.value?.suggestions?.length) return currentFile.value.suggestions;
  if (currentFile.value?.blocksSubmission || currentFile.value?.parseStatus === '解析异常') {
    return ['检查文件内容和格式后重新解析。', '必要时替换为可识别的 PDF、Excel 文件。'];
  }
  return [];
});
const mappedFileCount = computed(() => summary.value.success);
const canContinue = computed(() => canContinueParsing(files.value));
const summaryMetrics = computed(() => [
  { key: 'success', label: '解析成功', value: summary.value.success, icon: faCircleCheck, tone: 'success' },
  { key: 'parsing', label: '解析中', value: summary.value.parsing, icon: faArrowsRotate, tone: 'info' },
  { key: 'abnormal', label: '解析异常', value: summary.value.abnormal, icon: faCircleXmark, tone: 'danger' },
  { key: 'pending', label: '待处理', value: summary.value.pending, icon: faCircleInfo, tone: 'warning' }
]);

function selectTreeFile(id) { selectedId.value = id; detailOpen.value = true; }
function selectFile(id) { selectedId.value = id; }
function retryFile(id) { files.value = retryParsingFile(files.value, id); }
function replaceFile(payload) { files.value = replaceParsingFile(files.value, payload.id, payload.fileName); }
function skipFile(id) { files.value = skipParsingFile(files.value, id); }
function mapField(payload) { files.value = mapParsingField(files.value, payload.id, payload.source, payload.target); }
function batchRetry() { files.value = batchRetryParsing(files.value); }
function batchSkip() {
  if (window.confirm('确定批量跳过解析异常文件吗？')) files.value = batchSkipParsing(files.value);
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
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.parsing-workspace{--parse-red:var(--color-primary);--parse-green:var(--color-success);--parse-blue:var(--color-info);--parse-orange:var(--color-warning);--parse-danger:var(--color-danger);--parse-line:#e2e7ee;--parse-muted:#697586;min-width:0;color:#273142}.parse-summary{display:grid;grid-template-columns:repeat(4,minmax(140px,1fr));gap:7px;margin:8px 4px 14px;background:#fff}.summary-card{display:flex;min-width:0;height:82px;box-sizing:border-box;flex-direction:column;justify-content:space-between;padding:12px 14px;border:1px solid var(--parse-line);border-radius:5px;background:#fff}.summary-card>span{color:#3e4858;font-size:12px;font-weight:700}.summary-card small{font-size:11px}.summary-card>div{display:flex;align-items:center;justify-content:space-between}.summary-card strong{font-size:24px}.summary-card svg{font-size:18px}.success{color:var(--parse-green)}.info{color:var(--parse-blue)}.danger{color:var(--parse-danger)}.warning{color:var(--parse-orange)}.workspace-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;min-width:0;height:calc(var(--shell-viewport-height, 100vh) - 240px);min-height:0;max-height:none}.workspace-grid.detail-visible{grid-template-columns:minmax(0,1fr) 358px}.workspace-main,.center-stack{min-width:0;min-height:0;overflow:hidden}.files-layout{display:grid;grid-template-columns:204px minmax(0,1fr);gap:16px;min-width:0;height:100%;overflow:hidden}.center-stack{display:grid;grid-template-rows:minmax(0,1fr) minmax(0,.58fr) 60px;min-height:0}.mobile-tools{display:none}.file-tree-slot{height:100%}.workspace-grid>:deep(.material-detail-rail){display:none;height:100%}.workspace-grid.detail-visible>:deep(.material-detail-rail){display:flex}.precheck-panel{min-width:0;overflow:hidden;border:1px solid var(--parse-line);background:#fff}.precheck-panel>header{display:flex;align-items:center;min-height:36px;padding:0 10px;border-bottom:1px solid var(--parse-line)}.precheck-panel h3,.precheck-panel h4{margin:0}.precheck-panel h3{font-size:13px}.precheck-panel>header span,.mapping-column h4 span{color:var(--parse-muted);font-size:10px;font-weight:400}.precheck-grid{display:grid;grid-template-columns:minmax(285px,1.25fr) minmax(150px,.65fr) minmax(260px,1.1fr);height:calc(100% - 37px);min-width:0;overflow:hidden}.precheck-grid>section{min-width:0;padding:10px;border-right:1px solid var(--parse-line);overflow:auto}.precheck-grid>section:last-child{border-right:0}.precheck-grid h4{margin-bottom:9px;font-size:11px}.mapping-table{border:1px solid var(--parse-line);border-bottom:0}.mapping-row{display:grid;grid-template-columns:1.1fr 1.1fr 58px 58px;min-height:25px;border-bottom:1px solid var(--parse-line);font-size:10px}.mapping-row>*{display:flex;align-items:center;padding:3px 7px;border-right:1px solid var(--parse-line)}.mapping-row>*:last-child{border-right:0}.mapping-head{background:#f6f8fa;font-weight:700}.mapping-row button{border:0;background:#fff;color:#2f3b4a;font:inherit;text-align:left}.mapping-row button.missing{color:var(--parse-blue);text-decoration:underline}.mapping-row em{justify-content:center;font-style:normal}.mapping-row em.mapped{color:var(--parse-green);background:#edf9f2}.mapping-row em.pending{color:#c87500;background:#fff6e8}.check-column ul{display:grid;gap:11px;margin:0;padding:2px 0;list-style:none}.check-column li{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:7px;font-size:10px}.check-column b{font-size:10px}.blocking-column h4 b{color:var(--parse-danger)}.issue-box{padding:9px 10px;border:1px solid;border-radius:5px;font-size:10px;line-height:1.55}.issue-box ol,.issue-box ul{margin:0;padding-left:17px}.issue-box p{margin:0}.danger-box{border-color:#f4c4c6;background:#fff3f3;color:#7c1f24}.suggestion-box{margin-top:9px;border-color:#bfe2cc;background:#f2fbf6;color:#1f623d}.suggestion-box strong{display:block;margin-bottom:3px}.parsing-flow-footer{display:flex;min-height:60px;box-sizing:border-box;align-items:center;justify-content:space-between;gap:14px;padding:8px 10px;border:1px solid var(--parse-line);border-top:0;background:#fff}.parsing-flow-footer>p{display:flex;align-items:center;gap:8px;margin:0;color:#273142;font-size:13px;white-space:nowrap}.parsing-flow-footer>p strong{padding:0 2px;color:var(--parse-red);font-size:17px}.parse-footer-status{display:inline-flex;align-items:center;gap:5px;color:#a54c00;font-size:11px}.parsing-footer-actions{display:flex;gap:12px}.flow-btn{height:34px;padding:0 22px;border:1px solid #cfd6df;border-radius:4px;background:#fff;color:#344054;font-size:12px}.flow-btn.outline{min-width:126px;border-color:#df5555;color:var(--parse-red)}.flow-btn.primary{min-width:220px;border-color:var(--parse-red);background:var(--parse-red);color:#fff}.flow-btn:disabled{border-color:#e2e5ea;background:#e5e8ed;color:#aeb5c0;cursor:not-allowed}.flow-btn:focus-visible,.mobile-tools button:focus-visible,.mapping-row button:focus-visible{outline:2px solid var(--parse-blue);outline-offset:2px}
.mapping-column:focus-visible{outline:2px solid var(--parse-blue);outline-offset:-2px}
.center-stack{grid-template-columns:minmax(0,1fr)}
@media(max-width:1439px){.parse-summary{grid-template-columns:repeat(2,minmax(0,1fr));margin-right:0}.workspace-grid{height:calc(var(--shell-viewport-height, 100vh) - 328px)}.files-layout{grid-template-columns:204px minmax(0,1fr)}}
@media(max-width:1199px){.workspace-grid,.workspace-grid.detail-visible{grid-template-columns:minmax(0,1fr);height:auto;max-height:none}.workspace-grid>:deep(.material-detail-rail){display:flex;position:fixed;z-index:30;inset:58px 0 76px auto;width:min(420px,94vw);height:auto;margin-top:0;transform:translateX(105%);transition:transform .18s ease}.workspace-grid>:deep(.material-detail-rail.open){transform:translateX(0)}.mobile-tools{display:flex;justify-content:flex-end;gap:8px;margin-bottom:7px}.mobile-tools button{height:32px;border:1px solid var(--parse-line);border-radius:4px;background:#fff;color:#344054}.files-layout{grid-template-columns:minmax(0,1fr)}.file-tree-slot{position:fixed;z-index:29;top:58px;bottom:0;left:72px;width:260px;transform:translateX(calc(-100% - 72px));transition:transform .18s ease}.file-tree-slot.open{transform:translateX(0)}.precheck-grid{grid-template-columns:1fr 1fr}.blocking-column{grid-column:1/-1;border-top:1px solid var(--parse-line)}.center-stack{grid-template-rows:408px auto 64px}.parsing-flow-footer{position:sticky;bottom:0;z-index:4}}
@media(max-width:767px){.summary-card{height:74px}.workspace-grid>:deep(.material-detail-rail){inset:56px 0 0 0;width:auto}.file-tree-slot{left:0;top:56px;width:min(320px,92vw);transform:translateX(-105%)}.precheck-grid{grid-template-columns:1fr}.blocking-column{grid-column:auto}.precheck-grid>section{border-right:0;border-bottom:1px solid var(--parse-line)}.center-stack{display:block}.precheck-panel{margin-top:8px}.parsing-flow-footer{align-items:stretch;flex-direction:column;padding:10px}.parsing-flow-footer>p{white-space:normal}.parsing-footer-actions{display:grid;grid-template-columns:1fr}.flow-btn,.flow-btn.outline,.flow-btn.primary{width:100%;min-width:0}.mobile-tools{padding:0 4px}.mobile-tools button{flex:1}}
@media(min-width:1440px){.workspace-main{margin-left:4px}}

</style>
