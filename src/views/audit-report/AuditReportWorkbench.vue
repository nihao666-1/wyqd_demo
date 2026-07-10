<template>
  <PageHeader eyebrow="审计报告智能化" title="审计报告入口" description="只包含模板管理、资料导入、报告生成和报告检查四个边界清晰的入口。">
    <RouterLink class="btn primary" to="/audit-report/source-select">新建报告</RouterLink>
  </PageHeader>
  <section class="card-grid">
    <article class="business-card">
      <h3>模板管理</h3>
      <p>管理报告模板、格式模板、模板版本、引用状态和差异识别。</p>
      <RouterLink class="btn" to="/audit-report/template">进入模板管理</RouterLink>
    </article>
    <article class="business-card">
      <h3>资料导入</h3>
      <p>上传报告资料，进入文件夹预览、元数据补全和入库预检。</p>
      <RouterLink class="btn" to="/audit-report/material/import">导入资料</RouterLink>
    </article>
    <article class="business-card">
      <h3>报告生成</h3>
      <p>先选模板和来源，完成预检与缺口处理后才能生成草稿。</p>
      <RouterLink class="btn primary" to="/audit-report/source-select">进入生成</RouterLink>
    </article>
    <article class="business-card">
      <h3>报告检查</h3>
      <p>仅做文档规范检查：字体、字号、编号、标题层级、页眉页脚等。</p>
      <RouterLink class="btn" to="/audit-report/check-upload">上传线下报告检查</RouterLink>
    </article>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
