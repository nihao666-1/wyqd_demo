<template>
  <PageHeader
    eyebrow="首次使用"
    title="新员工与新系统上线引导"
    description="没有任务、没有文件或没有配置时，页面必须给出明确的第一步。"
  >
    <RouterLink class="btn primary" to="/tasks/create">创建第一个审计任务</RouterLink>
  </PageHeader>
  <section class="card-grid">
    <article class="business-card">
      <h3>当前权限范围</h3>
      <p>上海分公司，审计部、经纪业务部、计划财务部；可创建、上传、确认、锁定和导出授权结果。</p>
      <RouterLink class="btn" to="/tasks/create">进入任务创建</RouterLink>
    </article>
    <article class="business-card">
      <h3>资料准备</h3>
      <p>可先导入任务资料或监督共享文件。上传后进入文件夹预览、三字段补全、元数据映射和入库预检。</p>
      <RouterLink class="btn" to="/supervision/import/upload">导入文件夹</RouterLink>
    </article>
    <article class="business-card">
      <h3>费用数据</h3>
      <p>OA、费控、预算、发票、合同、采购和 HR 数据已配置 Mock，同步状态可在费用入口查看。</p>
      <RouterLink class="btn" to="/expense/workbench">查看费用入口</RouterLink>
    </article>
    <article class="business-card">
      <h3>报告主线</h3>
      <p>报告生成必须先做来源选择和资料预检，关键资料缺失时不能锁定正式报告。</p>
      <RouterLink class="btn" to="/audit-report/workbench">进入报告入口</RouterLink>
    </article>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
