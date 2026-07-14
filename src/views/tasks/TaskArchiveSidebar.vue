<template>
  <aside class="archive-sidebar" data-archive-region="sidebar" aria-label="归档详情">
    <header><h2>归档详情</h2><button type="button" aria-label="关闭归档详情" @click="$emit('close')"><FontAwesomeIcon :icon="faXmark" /></button></header>

    <section class="sidebar-section summary"><h3>归档摘要</h3><dl><div><dt>归档版本</dt><dd>{{ archive.sidebar.version }}</dd></div><div><dt>归档时间</dt><dd>{{ archive.sidebar.archivedAt }}</dd></div><div><dt>归档人</dt><dd>{{ archive.sidebar.archivedBy }}</dd></div><div><dt>归档备注</dt><dd>{{ archive.sidebar.note }}</dd></div></dl></section>

    <section class="sidebar-section"><div class="section-heading"><h3>关联文件 <small>（共 {{ archive.sidebar.relatedFileCount }} 份）</small></h3><button type="button" @click="$emit('archive-action', '查看全部关联文件')">查看全部⌄</button></div><ul><li v-for="item in archive.sidebar.fileGroups" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.count }} 份</strong></li></ul></section>

    <section class="sidebar-section"><div class="section-heading"><h3>引用关系</h3><button type="button" @click="$emit('archive-action', '查看引用关系')">查看引用关系⌄</button></div><ul><li v-for="item in archive.sidebar.references" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></li></ul></section>

    <section class="sidebar-section"><div class="section-heading"><h3>权限范围</h3><button type="button" @click="$emit('archive-action', '查看权限详情')">查看详情⌄</button></div><p v-for="permission in archive.sidebar.permissions" :key="permission">{{ permission }}</p></section>

    <section class="sidebar-section downloads"><div class="section-heading"><h3>下载记录 <small>（近 7 天）</small></h3><button type="button" @click="$emit('archive-action', '查看全部下载记录')">查看全部⌄</button></div><table class="download-table"><thead><tr><th>时间</th><th>下载人</th><th>文件</th><th>结果</th></tr></thead><tbody><tr v-for="item in archive.sidebar.downloads" :key="`${item.time}-${item.file}`"><td>{{ item.time }}</td><td>{{ item.user }}</td><td>{{ item.file }}</td><td>{{ item.result }}</td></tr></tbody></table></section>

    <footer><button type="button" class="primary" @click="$emit('archive-action', '下载归档包')">下载归档包</button><button type="button" @click="$emit('archive-action', '查看引用关系')">查看引用关系</button><button type="button" @click="$emit('archive-action', '导出日志')">导出日志</button></footer>
  </aside>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
defineProps({ archive: { type: Object, required: true } });
defineEmits(['archive-action', 'close']);
</script>

<style scoped>
.archive-sidebar { position: relative; height: 100%; min-height: 0; padding: 0 15px 54px; border: 1px solid #e5e8ec; border-radius: 4px; background:#fff; overflow:auto; color:#252930; }
.archive-sidebar > header { height:45px; border-bottom:1px solid #e5e8ec; display:flex; align-items:center; justify-content:space-between; }.archive-sidebar > header h2 { margin:0; font-size:16px; }.archive-sidebar > header button { width:26px;height:26px;border:0;background:transparent;color:#30343b;font-size:15px; }
.sidebar-section { padding:14px 0 13px; border-bottom:1px solid #e5e8ec; }.sidebar-section:nth-of-type(1){height:157px}.sidebar-section:nth-of-type(2){height:157px}.sidebar-section:nth-of-type(3){height:110px}.sidebar-section:nth-of-type(4){height:113px}.sidebar-section:nth-of-type(5){height:160px}.sidebar-section h3 { margin:0; font-size:13px; }.sidebar-section h3 small { font-size:10px;font-weight:500; }.summary { padding-top:13px; }.summary dl { margin:10px 0 0; }.summary dl div { min-height:26px; display:grid;grid-template-columns:70px 1fr;gap:10px; }.summary dt,.summary dd { margin:0;font-size:10px;line-height:18px; }.summary dt { color:#656d79; }.summary dd { color:#252930; }
.section-heading { display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:9px; }.section-heading button { padding:0;border:0;background:transparent;color:var(--color-info);font-size:9px;white-space:nowrap; }
.sidebar-section ul { margin:0;padding:0;list-style:none; }.sidebar-section li { min-height:24px;display:flex;align-items:center;justify-content:space-between;font-size:10px; }.sidebar-section li strong { font-weight:500; }.sidebar-section > p { margin:8px 0 0;font-size:10px;line-height:16px; }
.downloads { border-bottom:0; }.download-table { width:100%;min-width:0;border-collapse:collapse;table-layout:fixed;font-size:8px; }.download-table th { height:24px;padding:0 2px;background:#f7f8f9;text-align:left;font-weight:600; }.download-table td { height:27px;padding:0 2px;border-top:1px solid #edf0f3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }.download-table th:nth-child(1){width:60px}.download-table th:nth-child(2){width:48px}.download-table th:nth-child(3){width:56px}.download-table th:nth-child(4){width:36px}.download-table td:last-child{color:#079447;}
.archive-sidebar > footer { position:absolute;left:0;right:0;bottom:47px;height:54px;padding:10px 6px;border-top:1px solid #e5e8ec;background:#fff;display:flex;gap:6px;justify-content:center; }.archive-sidebar > footer button { height:32px;padding:0;border:1px solid var(--color-primary);border-radius:4px;background:#fff;color:var(--color-primary);font-size:10px;white-space:nowrap; }.archive-sidebar > footer button:nth-child(1){width:68px}.archive-sidebar > footer button:nth-child(2){width:82px}.archive-sidebar > footer button:nth-child(3){width:64px}.archive-sidebar > footer .primary { background:var(--color-primary);color:#fff;border-color:var(--color-primary); }
</style>
