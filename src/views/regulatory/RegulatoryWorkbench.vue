<template>
  <PageHeader eyebrow="监管案例舆情分析" title="监管分析工作台" description="按权限范围、业务范围和风险标签创建分析任务，分析结果必须人工确认后才能锁定导出。">
    <RouterLink class="btn primary" to="/regulatory/new">新建分析任务</RouterLink>
    <RouterLink class="btn" to="/regulatory/history">历史分析</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>任务条件</h3></div>
      <div class="filter-grid">
        <label><span>权限范围</span><input value="上海分公司 / 经纪业务部、计划财务部" readonly /></label>
        <label><span>审计期间</span><input value="2026Q2" readonly /></label>
        <label><span>业务范围</span><input value="产品销售、客户适当性" readonly /></label>
        <label><span>风险标签</span><input value="投诉集中、监管关注、适当性" readonly /></label>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><h3>边界提示</h3></div>
      <p>舆情不等于审计结论，仅作为审计线索和风险提示。候选建议必须经人工确认后才能进入报告或任务结论。</p>
    </div>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';

const metrics = [
  { label: '待确认线索', value: '7', hint: '监管关注 3 条' },
  { label: '数据获取状态', value: '可执行', hint: '权限范围已确认' },
  { label: '历史分析', value: '12', hint: '2 条已锁定' },
  { label: '删除阻断', value: '2', hint: '已被报告引用' }
];
</script>
