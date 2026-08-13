<template>
  <section class="preview-row">
    <div data-export-preview class="export-preview">
      <h2>输出文件 <small>（成果文件集中展示）</small></h2>
      <div class="file-grid">
        <button v-for="file in files" :key="file.id" type="button" class="file-card" @click="$emit('preview-file', file)">
          <span class="file-type" :class="file.tone">
            <FontAwesomeIcon :icon="iconFor(file.tone)" /> {{ file.type }}
          </span>
          <strong :title="file.name">{{ file.name }}</strong>
          <span v-if="file.category" class="file-category">{{ file.category }}</span>
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
  versions: { type: Array, default: () => [] },
  files: { type: Array, required: true }
});

defineEmits(['select-version', 'preview-file', 'more-files']);

function iconFor(tone) {
  return { excel: faFileExcel, word: faFileWord, pdf: faFilePdf }[tone] || faFileWord;
}
</script>

<style scoped>
.preview-row{display:grid;min-height:133px}.export-preview{min-width:0;padding:9px 12px 12px;border:1px solid #e5eaf0;background:#fff}.export-preview h2{margin:0;color:#202631;font-size:14px;line-height:22px;font-weight:600}.export-preview h2 small{color:#667085;font-size:10px;font-weight:400}.file-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:10px}.file-card{min-width:0;height:96px;padding:8px 7px;border:1px solid #e5eaf0;border-radius:5px;background:#fff;text-align:left}.file-type{display:block;color:#303642;font-size:9px;line-height:16px}.file-type.excel svg{color:var(--color-success)}.file-type.word svg{color:var(--color-info)}.file-type.pdf svg{color:var(--color-primary)}.file-card strong,.file-category{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-card strong{margin-top:7px;color:#303642;font-size:10px;line-height:16px;font-weight:500}.file-category{margin-top:5px;color:#667085;font-size:9px}.file-card small{display:block;margin-top:6px;color:#98a2b3;font-size:8px;text-align:center}.file-card.more strong{margin-top:2px}.file-card.more span{display:block;margin-top:7px;color:#303642;font-size:9px}
@media(max-height:850px){.preview-row{min-height:118px}.file-card{height:74px}.file-card strong{margin-top:4px}.file-card small{margin-top:3px}}
</style>
