<template>
  <section class="preview-row">
    <div data-version-preview class="version-preview">
      <h2>版本与导出预览</h2>
      <h3>版本时间线</h3>
      <div class="timeline">
        <button
          v-for="version in versions"
          :key="version.id"
          type="button"
          class="version-node"
          :class="version.status"
          @click="$emit('select-version', version)"
        >
          <span class="node-dot"></span>
          <strong>{{ version.label }}</strong>
          <small>{{ version.time }}</small>
          <em>{{ version.note }}</em>
        </button>
      </div>
    </div>
    <div data-export-preview class="export-preview">
      <h2>输出文件预览 <small>（待导出）</small></h2>
      <div class="file-grid">
        <button v-for="file in files" :key="file.id" type="button" class="file-card" @click="$emit('preview-file', file)">
          <span class="file-type" :class="file.tone">
            <FontAwesomeIcon :icon="iconFor(file.tone)" /> {{ file.type }}
          </span>
          <strong :title="file.name">{{ file.name }}</strong>
          <small>{{ file.exported ? '已导出' : '未导出' }}</small>
        </button>
        <button type="button" class="file-card more" @click="$emit('more-files')">
          <strong>更多文件</strong>
          <span>共 6 个文件</span>
          <small>未导出</small>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFileExcel, faFilePdf, faFileWord } from '@fortawesome/free-solid-svg-icons';

defineProps({
  versions: { type: Array, required: true },
  files: { type: Array, required: true }
});

defineEmits(['select-version', 'preview-file', 'more-files']);

function iconFor(tone) {
  return { excel: faFileExcel, word: faFileWord, pdf: faFilePdf }[tone] || faFileWord;
}
</script>

<style scoped>
.preview-row{display:grid;grid-template-columns:minmax(0,45fr) minmax(0,55fr);gap:8px;min-height:133px}.version-preview,.export-preview{min-width:0;padding:7px 12px 9px;border:1px solid #e5eaf0;background:#fff}.version-preview h2,.export-preview h2{margin:0;color:#202631;font-size:13px;line-height:20px;font-weight:600}.version-preview h3{margin:6px 0 0;color:#303642;font-size:10px;line-height:16px;font-weight:500}.export-preview h2 small{color:#667085;font-size:9px;font-weight:400}.timeline{position:relative;display:grid;grid-template-columns:repeat(4,1fr);margin-top:3px}.timeline::before{content:"";position:absolute;left:12%;right:12%;top:10px;height:1px;background:#cad3df}.version-node{position:relative;z-index:1;min-width:0;padding:0 3px;border:0;background:transparent;text-align:center}.node-dot{display:block;width:9px;height:9px;margin:6px auto 5px;border:2px solid #98a2b3;border-radius:50%;background:#fff}.version-node.completed .node-dot{border-color:var(--color-success);background:var(--color-success)}.version-node.current .node-dot{border-color:#e34a4a;box-shadow:0 0 0 4px #ffe8e8}.version-node strong,.version-node small,.version-node em{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.version-node strong{color:#4d5563;font-size:8px;line-height:14px;font-weight:500}.version-node.current strong,.version-node.current em{color:var(--color-primary)}.version-node small,.version-node em{color:#667085;font-size:8px;line-height:13px;font-style:normal}.file-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-top:8px}.file-card{min-width:0;height:86px;padding:8px 7px;border:1px solid #e5eaf0;border-radius:5px;background:#fff;text-align:left}.file-type{display:block;color:#303642;font-size:9px;line-height:16px}.file-type.excel svg{color:var(--color-success)}.file-type.word svg{color:var(--color-info)}.file-type.pdf svg{color:var(--color-primary)}.file-card strong{display:block;overflow:hidden;margin-top:7px;color:#303642;font-size:9px;line-height:16px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}.file-card small{display:block;margin-top:6px;color:#98a2b3;font-size:8px;text-align:center}.file-card.more strong{margin-top:2px}.file-card.more span{display:block;margin-top:7px;color:#303642;font-size:9px}
@media(max-height:850px){.preview-row{min-height:118px}.file-card{height:74px}.file-card strong{margin-top:4px}.file-card small{margin-top:3px}}
</style>
