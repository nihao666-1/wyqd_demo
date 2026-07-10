<template>
  <PageHeader eyebrow="报告检查" title="上传线下报告检查" description="报告检查只做文档规范检查，不判断内容真实性。">
    <RouterLink class="btn" to="/audit-report/workbench">返回报告入口</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/check-result">执行检查并查看结果</RouterLink>
  </PageHeader>

  <section class="panel">
    <div class="panel-title"><h3>检查配置</h3></div>
    <div class="filter-grid">
      <label><span>上传文件</span><input value="营业部常规审计报告_线下稿.docx" readonly /></label>
      <label><span>报告类型</span><input value="常规审计报告" readonly /></label>
      <label><span>模板版本</span><input value="营业部常规审计报告模板 V2.1" readonly /></label>
      <label><span>检查规则</span><input value="字体、字号、编号、标题层级、表格、页眉页脚" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>上传预览</h3></div>
    <p>已读取文档页数 18 页，目录 1 个，表格 6 个，附件 2 个。点击执行检查后进入结果页并定位问题。</p>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
