<template>
  <aside
    ref="railRef"
    class="material-detail-rail"
    :class="{ open }"
    aria-label="当前文件解析详情"
    @keydown.esc="handleEscape"
  >
    <header class="rail-header">
      <div>
        <span class="eyebrow">解析详情</span>
        <h3>{{ file?.name || '请选择文件' }}</h3>
      </div>
      <button ref="closeButtonRef" class="icon-button close-button" type="button" aria-label="关闭解析详情" @click="$emit('close')">
        <FontAwesomeIcon :icon="faXmark" />
      </button>
    </header>

    <div v-if="file" class="rail-scroll">
      <div class="rail-columns">
        <div class="detail-column">
          <section class="detail-section" aria-labelledby="material-basic-title">
            <h4 id="material-basic-title">基本信息</h4>
            <dl class="basic-list">
              <template v-for="item in basicItems" :key="item.label">
                <dt>{{ item.label }}</dt><dd>{{ item.value }}</dd>
              </template>
            </dl>
          </section>

          <section v-if="failureReason" class="detail-section danger-section" aria-labelledby="material-failure-title">
            <h4 id="material-failure-title"><FontAwesomeIcon :icon="faCircleXmark" /> 失败原因</h4>
            <p>{{ failureReason }}</p>
          </section>

          <section class="detail-section" aria-labelledby="material-fields-title">
            <h4 id="material-fields-title">缺失字段 <span>（{{ missingFields.length }}）</span></h4>
            <ul v-if="missingFields.length" class="field-list">
              <li v-for="field in missingFields" :key="field.source">
                <span>{{ field.source }}</span>
                <button type="button" :aria-label="`映射缺失字段 ${field.source}`" @click="mapMissingField(field)">补充映射</button>
              </li>
            </ul>
            <p v-else class="empty-copy"><FontAwesomeIcon :icon="faCircleCheck" /> 必填字段完整</p>
          </section>

          <section class="detail-section" aria-labelledby="material-impact-title">
            <h4 id="material-impact-title">影响能力</h4>
            <div v-if="impactAbilities.length" class="tag-list">
              <span v-for="ability in impactAbilities" :key="ability">{{ ability }}</span>
            </div>
            <p v-else class="empty-copy">暂无能力受影响</p>
          </section>

          <section class="detail-section blocking-section" :class="{ blocked: isBlocked }" aria-labelledby="material-blocking-title">
            <h4 id="material-blocking-title"><FontAwesomeIcon :icon="isBlocked ? faLock : faLockOpen" /> 是否阻断提交</h4>
            <strong>{{ isBlocked ? '是，需处理后继续' : '否，可继续后续流程' }}</strong>
            <ul v-if="blockers.length"><li v-for="item in blockers" :key="item">{{ item }}</li></ul>
          </section>

          <section v-if="suggestions.length" class="detail-section suggestion-section" aria-labelledby="material-suggestion-title">
            <h4 id="material-suggestion-title"><FontAwesomeIcon :icon="faLightbulb" /> 建议处理</h4>
            <ul><li v-for="item in suggestions" :key="item">{{ item }}</li></ul>
          </section>

          <section class="related-groups" aria-label="关联信息">
            <details v-for="group in relatedGroups" :key="group.label">
              <summary><span><FontAwesomeIcon :icon="group.icon" />{{ group.label }}</span><FontAwesomeIcon class="chevron" :icon="faChevronDown" /></summary>
              <ul v-if="group.items.length"><li v-for="item in group.items" :key="item">{{ item }}</li></ul>
              <p v-else>暂无记录</p>
            </details>
          </section>
        </div>

        <section class="timeline-column" aria-labelledby="material-timeline-title">
          <h4 id="material-timeline-title">处理流程追踪</h4>
          <ol class="timeline-list">
            <li v-for="step in timelineSteps" :key="step.label" :class="step.state">
              <span class="timeline-icon" aria-hidden="true"><FontAwesomeIcon :icon="timelineIcon(step.state)" /></span>
              <div>
                <strong>{{ step.label }}</strong>
                <span class="state-text">{{ stateText(step.state) }}</span>
                <time v-if="step.time">{{ step.time }}</time>
                <p v-if="step.detail">{{ step.detail }}</p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </div>

    <div v-else class="rail-empty" role="status">
      <FontAwesomeIcon :icon="faFileCircleQuestion" />
      <p>选择文件后查看解析详情和处理流程。</p>
    </div>

    <footer class="rail-actions">
      <div v-if="skipConfirmation" class="skip-confirmation" role="group" aria-live="polite" aria-labelledby="skip-confirm-title" aria-describedby="skip-confirm-description">
        <strong id="skip-confirm-title">确认跳过此文件？</strong>
        <p id="skip-confirm-description">跳过后该文件不参与后续分析。</p>
        <div>
          <button ref="confirmSkipRef" class="danger-button" type="button" @click="confirmSkip">确认跳过</button>
          <button type="button" @click="cancelSkip">取消</button>
        </div>
      </div>
      <div class="primary-actions">
        <button type="button" :disabled="!file" aria-label="重新解析当前文件" @click="$emit('retry', file.id)"><FontAwesomeIcon :icon="faArrowsRotate" />重新解析</button>
        <button type="button" :disabled="!file" aria-label="替换当前文件" @click="openFilePicker"><FontAwesomeIcon :icon="faFileArrowUp" />替换文件</button>
        <input ref="fileInputRef" class="visually-hidden" type="file" aria-label="选择替换文件" @change="replaceFile" />
        <button class="danger-action" type="button" :disabled="!file" aria-label="跳过当前文件" @click="requestSkip"><FontAwesomeIcon :icon="faForward" />跳过此文件</button>
        <button type="button" :disabled="!file" aria-label="下载当前文件解析日志" @click="$emit('download-log', file.id)"><FontAwesomeIcon :icon="faDownload" />下载日志</button>
      </div>
    </footer>
  </aside>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faArrowsRotate, faChevronDown, faCircle, faCircleCheck, faCircleExclamation, faCircleXmark,
  faClock, faDownload, faFileArrowUp, faFileCircleQuestion, faFileLines, faFolderOpen, faForward,
  faLightbulb, faLink, faLock, faLockOpen, faMessage, faRotate, faXmark
} from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  file: { type: Object, default: null },
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'retry', 'replace', 'skip', 'map-field', 'download-log']);
const railRef = ref(null);
const closeButtonRef = ref(null);
const confirmSkipRef = ref(null);
const fileInputRef = ref(null);
const skipConfirmation = ref(false);
let skipTrigger;

const parseStatus = computed(() => props.file?.parseStatus || props.file?.status || '待解析');
const blockers = computed(() => normalizeList(props.file?.blockers));
const suggestions = computed(() => normalizeList(props.file?.suggestions));
const failureReason = computed(() => props.file?.failureReason || props.file?.errorMessage || (['解析失败', '格式异常'].includes(parseStatus.value) ? '文件内容无法被解析，请检查文件完整性或格式。' : ''));
const missingFields = computed(() => {
  const explicit = normalizeList(props.file?.missingFields).map((field) => typeof field === 'string' ? { source: field, target: field } : field);
  if (explicit.length) return explicit;
  return (props.file?.mappings || []).filter((item) => !item.target).map((item) => ({ source: item.source, target: item.suggestedTarget || item.source }));
});
const impactAbilities = computed(() => normalizeList(props.file?.impactAbilities || props.file?.abilities || props.file?.ability || props.file?.capability));
const isBlocked = computed(() => typeof props.file?.blocked === 'boolean'
  ? props.file.blocked
  : blockers.value.length > 0 || ['解析失败', '格式异常'].includes(parseStatus.value));
const basicItems = computed(() => [
  { label: '文件类型', value: props.file?.fileType || props.file?.type || fileExtension(props.file?.name) || '-' },
  { label: '所属目录', value: props.file?.selectedDetail?.folderPath || props.file?.folder || props.file?.folderName || props.file?.folderPath || props.file?.path || '-' },
  { label: '文件大小', value: props.file?.size || props.file?.fileSize || '-' },
  { label: '上传状态', value: props.file?.uploadStatus || '已上传' },
  { label: '解析状态', value: parseStatus.value },
  { label: '页数/表格', value: pageTableText(props.file) }
]);
const relatedGroups = computed(() => [
  { label: '关联任务', icon: faLink, items: normalizeList(props.file?.relatedTasks || props.file?.taskName || props.file?.task) },
  { label: '关联文件', icon: faFolderOpen, items: normalizeList(props.file?.relatedFiles) },
  { label: '版本记录', icon: faRotate, items: normalizeList(props.file?.versions || props.file?.version || props.file?.versionNo) },
  { label: '复核意见', icon: faMessage, items: normalizeList(props.file?.reviewComments || props.file?.reviewComment) },
  { label: '导出文件', icon: faDownload, items: normalizeList(props.file?.exports || props.file?.exportFiles) },
  { label: '操作留痕', icon: faFileLines, items: normalizeList(props.file?.operationLogs || props.file?.logs) }
]);
const timelineSteps = computed(() => {
  if (Array.isArray(props.file?.timeline) && props.file.timeline.length) return props.file.timeline;
  const parsingState = ['解析失败', '格式异常'].includes(parseStatus.value) ? 'error' : parseStatus.value === '解析中' ? 'active' : parseStatus.value === '解析成功' ? 'complete' : 'pending';
  return [
    { label: '创建任务', state: 'complete', time: props.file?.createdAt || '' },
    { label: '上传资料', state: 'complete', time: props.file?.uploadedAt || '' },
    { label: '模型生成', state: parsingState, time: props.file?.parsedAt || '', detail: parsingState === 'error' ? failureReason.value : '' },
    { label: '人工确认', state: parsingState === 'complete' ? 'active' : 'pending' },
    { label: '保存版本', state: 'pending' },
    { label: '提交复核', state: 'pending' },
    { label: '导出归档', state: 'pending' }
  ];
});

watch(() => props.open, async (open) => { if (open) { await nextTick(); closeButtonRef.value?.focus(); } else skipConfirmation.value = false; });
watch(() => props.file?.id, () => { skipConfirmation.value = false; });

function normalizeList(value) { return Array.isArray(value) ? value : value ? [value] : []; }
function fileExtension(name = '') { const extension = name.split('.').pop(); return extension && extension !== name ? extension.toUpperCase() : ''; }
function pageTableText(file) { if (file?.pagesOrTables) return file.pagesOrTables; const parts = []; if (file?.pages ?? file?.pageCount) parts.push(`${file.pages ?? file.pageCount} 页`); if (file?.tables ?? file?.tableCount) parts.push(`${file.tables ?? file.tableCount} 表`); return parts.join(' / ') || '-'; }
function stateText(state) { return ({ complete: '已完成', active: '进行中', error: '解析失败', pending: '未开始' })[state] || state; }
function timelineIcon(state) { return ({ complete: faCircleCheck, active: faClock, error: faCircleXmark, pending: faCircle })[state] || faCircleExclamation; }
function mapMissingField(field) { emit('map-field', { id: props.file.id, source: field.source, target: field.target || field.source }); }
function openFilePicker() { fileInputRef.value?.click(); }
function replaceFile(event) { const selected = event.target.files?.[0]; if (selected && props.file) emit('replace', { id: props.file.id, fileName: selected.name }); event.target.value = ''; }
async function requestSkip() { skipTrigger = document.activeElement; skipConfirmation.value = true; await nextTick(); confirmSkipRef.value?.focus(); }
async function cancelSkip() { skipConfirmation.value = false; await nextTick(); skipTrigger?.focus?.(); }
function confirmSkip() { emit('skip', props.file.id); skipConfirmation.value = false; }
function handleEscape() { if (skipConfirmation.value) cancelSkip(); else emit('close'); }

defineExpose({ openFilePicker, requestSkip });
</script>

<style scoped>
.material-detail-rail{--rail-red:var(--color-primary);--rail-danger:var(--color-primary);--rail-green:var(--color-success);--rail-blue:var(--color-info);--rail-line:#e2e7ee;--rail-muted:#697586;display:flex;width:358px;max-width:100%;min-width:0;height:100%;min-height:0;box-sizing:border-box;flex-direction:column;border:1px solid var(--rail-line);border-radius:5px;background:#fff;color:#273142;box-shadow:0 2px 8px rgb(28 39 54 / 8%)}
.rail-header{display:flex;min-height:58px;box-sizing:border-box;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-bottom:1px solid var(--rail-line)}.eyebrow{display:block;margin-bottom:3px;color:var(--rail-red);font-size:10px;font-weight:700}.rail-header h3{max-width:280px;margin:0;overflow:hidden;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.icon-button{display:grid;width:30px;height:30px;flex:0 0 30px;place-items:center;border:1px solid var(--rail-line);border-radius:4px;background:#fff;color:#536176}.close-button{display:none}.rail-scroll{min-height:0;flex:1;overflow:auto}.rail-columns{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(122px,.82fr);min-height:100%}.detail-column{min-width:0;border-right:1px solid var(--rail-line)}.detail-section{padding:10px;border-bottom:1px solid var(--rail-line)}.detail-section h4,.timeline-column h4{margin:0 0 8px;font-size:11px}.detail-section h4 svg{margin-right:4px}.detail-section h4 span{color:var(--rail-muted);font-weight:400}.detail-section p,.detail-section ul{margin:0;font-size:10px;line-height:1.55}.detail-section ul{padding-left:16px}.basic-list{display:grid;grid-template-columns:58px minmax(0,1fr);gap:6px 8px;margin:0;font-size:10px;line-height:1.35}.basic-list dt{color:var(--rail-muted)}.basic-list dd{min-width:0;margin:0;overflow-wrap:anywhere}.danger-section{background:#fff4f4;color:#861f25}.danger-section h4{color:var(--rail-danger)}.field-list{padding:0!important;list-style:none}.field-list li{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 0;border-bottom:1px dashed #edf0f4}.field-list li:last-child{border-bottom:0}.field-list button{padding:2px 4px;border:0;background:transparent;color:var(--rail-blue);font-size:9px;white-space:nowrap}.empty-copy{color:var(--rail-green)}.empty-copy svg{margin-right:3px}.tag-list{display:flex;flex-wrap:wrap;gap:4px}.tag-list span{padding:3px 5px;border-radius:3px;background:#edf4ff;color:#286ec5;font-size:9px}.blocking-section{background:#f2fbf6;color:#205f3d}.blocking-section.blocked{background:#fff4f4;color:#861f25}.blocking-section strong{display:block;font-size:10px}.blocking-section ul{margin-top:5px}.suggestion-section{background:#fffaf0;color:#725119}.related-groups details{border-bottom:1px solid var(--rail-line)}.related-groups summary{display:flex;min-height:34px;box-sizing:border-box;align-items:center;justify-content:space-between;padding:7px 10px;font-size:10px;font-weight:700;cursor:pointer;list-style:none}.related-groups summary::-webkit-details-marker{display:none}.related-groups summary span{display:flex;align-items:center;gap:6px}.related-groups .chevron{transition:transform .15s}.related-groups details[open] .chevron{transform:rotate(180deg)}.related-groups ul,.related-groups p{margin:0;padding:0 10px 9px 27px;color:var(--rail-muted);font-size:9px;line-height:1.5}.timeline-column{min-width:0;padding:10px 8px}.timeline-list{margin:0;padding:0;list-style:none}.timeline-list li{position:relative;display:grid;grid-template-columns:18px minmax(0,1fr);gap:5px;min-height:66px}.timeline-list li:not(:last-child)::after{position:absolute;top:17px;bottom:0;left:8px;width:1px;background:#d8dee7;content:""}.timeline-icon{position:relative;z-index:1;display:grid;width:17px;height:17px;place-items:center;border-radius:50%;background:#fff;color:#9aa5b5;font-size:11px}.timeline-list .complete .timeline-icon{color:var(--rail-green)}.timeline-list .active .timeline-icon{color:var(--rail-blue)}.timeline-list .error .timeline-icon{color:var(--rail-danger)}.timeline-list strong,.timeline-list span,.timeline-list time{display:block}.timeline-list strong{font-size:10px}.state-text,.timeline-list time,.timeline-list p{margin-top:3px;color:var(--rail-muted);font-size:8px}.timeline-list .error .state-text,.timeline-list .error p{color:var(--rail-danger)}.timeline-list p{margin-bottom:0;line-height:1.4;overflow-wrap:anywhere}.rail-empty{display:grid;min-height:260px;flex:1;place-content:center;justify-items:center;padding:20px;color:var(--rail-muted);font-size:34px;text-align:center}.rail-empty p{max-width:210px;margin:12px 0 0;font-size:11px}.rail-actions{position:relative;padding:8px;border-top:1px solid var(--rail-line);background:#fff}.primary-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.primary-actions button,.skip-confirmation button{display:inline-flex;min-height:32px;align-items:center;justify-content:center;gap:5px;border:1px solid #ccd4df;border-radius:4px;background:#fff;color:#344054;font-size:10px}.primary-actions .danger-action{border-color:#efb5b8;color:var(--rail-danger)}.primary-actions button:disabled{opacity:.45;cursor:not-allowed}.skip-confirmation{position:absolute;right:8px;bottom:8px;left:8px;z-index:3;padding:9px;border:1px solid #efb5b8;border-radius:4px;background:#fff8f8;box-shadow:0 4px 14px rgb(39 49 66 / 18%)}.skip-confirmation strong{font-size:11px;color:#7d2025}.skip-confirmation p{margin:3px 0 7px;color:var(--rail-muted);font-size:9px}.skip-confirmation>div{display:flex;gap:6px}.skip-confirmation button{min-height:28px;padding:0 9px}.skip-confirmation .danger-button{border-color:var(--rail-danger);background:var(--rail-danger);color:#fff}.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid var(--rail-blue);outline-offset:2px}
@media(max-width:1199px){.material-detail-rail{border-radius:0;box-shadow:-6px 0 20px rgb(29 40 56 / 18%)}.close-button{display:grid}}
@media(max-width:767px){.material-detail-rail{width:100%;height:100%}.rail-header{min-height:56px}.rail-header h3{max-width:calc(100vw - 92px)}.rail-columns{grid-template-columns:1fr}.detail-column{border-right:0}.timeline-column{border-top:1px solid var(--rail-line);padding:12px}.timeline-list li{min-height:55px}.primary-actions{grid-template-columns:1fr 1fr}.rail-actions{position:sticky;bottom:0}}
@media(max-width:390px){.primary-actions{grid-template-columns:1fr}.rail-header h3{font-size:12px}}
@media(min-width:768px){.primary-actions{grid-template-columns:repeat(3,minmax(0,1fr))}.primary-actions button:last-child{grid-column:1/-1}}
</style>
