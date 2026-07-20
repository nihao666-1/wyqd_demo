<template>
  <div class="supervision-workbench-page route-fill-page">
    <PageHeader eyebrow="监督共享信息汇总" title="监督共享入口" description="文件导入和汇总分析报告分线办理。">
      <RouterLink class="btn primary" to="/supervision/import/upload">新建文件导入</RouterLink>
      <RouterLink class="btn" to="/supervision/report/source-select">新建汇总分析报告</RouterLink>
    </PageHeader>
    <section class="action-list" aria-label="监督共享办理入口">
      <article>
        <div><h3>文件导入</h3><p>上传共享资料，补全字段并完成入库预检。</p></div>
        <span>3 个批次待处理</span>
        <RouterLink class="btn primary" to="/supervision/import/upload">进入文件导入</RouterLink>
      </article>
      <article>
        <div><h3>汇总分析报告</h3><p>从权限范围内选择来源文件并生成分析报告。</p></div>
        <span>1 份报告待生成</span>
        <RouterLink class="btn" to="/supervision/report/source-select">选择来源文件</RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>

<style scoped>
.supervision-workbench-page {
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.action-list {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: #fff;
}

.action-list article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 20px;
  min-height: 88px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-line);
}

.action-list article:last-child {
  border-bottom: 0;
}

.action-list h3,
.action-list p {
  margin: 0;
}

.action-list p,
.action-list span {
  margin-top: 5px;
  color: var(--color-muted);
  font-size: 12px;
}

@media (max-width: 760px) {
  .action-list article {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
