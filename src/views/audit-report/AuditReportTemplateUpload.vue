<template>
  <PageHeader eyebrow="模板上传" title="上传报告模板" description="上传后解析模板结构、配置样式规则并绑定检查规则。">
    <RouterLink class="btn" to="/audit-report/template">返回模板管理</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/template-diff">解析并识别差异</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>上传预览</h3></div>
    <div class="filter-grid">
      <label><span>上传文件</span><input value="营业部常规审计报告模板_V2.2.docx" readonly /></label>
      <label><span>模板结构</span><input value="封面、目录、正文、附件、落款" readonly /></label>
      <label><span>样式规则</span><input value="标题、正文、表格、页眉页脚" readonly /></label>
      <label><span>检查规则</span><input value="字体、字号、编号、目录、附件" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>规则绑定</h3></div>
    <p>新模板默认绑定文档规范检查规则 V2026.07；结构化差异识别失败时，进入人工差异说明。</p>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
