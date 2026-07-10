<template>
  <PageHeader eyebrow="数据获取" title="监管分析数据获取执行" description="系统按已确认的权限和来源范围获取数据，完成后进入分析结果总览。">
    <RouterLink class="btn" to="/regulatory/new">返回配置</RouterLink>
    <RouterLink class="btn primary" to="/regulatory/result">查看分析结果</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>执行轨迹</h3></div>
    <div class="timeline">
      <div v-for="item in steps" :key="item.name" class="timeline-item">
        <strong>{{ item.name }}</strong>
        <span>{{ item.status }}</span>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </section>
  <MetricGrid :metrics="metrics" />
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';

const steps = [
  { name: '权限范围校验', status: '通过', desc: '用户可查看上海分公司及下属授权部门数据。' },
  { name: '监管通报获取', status: '完成', desc: '获取 18 条监管关注事项。' },
  { name: '舆情快照获取', status: '完成', desc: '获取 42 条公开舆情摘要。' },
  { name: '历史案例匹配', status: '完成', desc: '匹配 6 条同类审计建议。' }
];
const metrics = [
  { label: '监管关注点', value: '18', hint: '高风险 4 条' },
  { label: '舆情提示', value: '42', hint: '已去重' },
  { label: '历史案例', value: '6', hint: '可引用' },
  { label: '异常来源', value: '0', hint: '无权限异常' }
];
</script>
