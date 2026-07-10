<template>
  <PageHeader eyebrow="生成前预检" title="审计规范生成前预检" description="检查来源完整性、部门权限、时间范围、模板状态和引用锁定。">
    <RouterLink class="btn" to="/audit-standard/generate">返回配置</RouterLink>
    <RouterLink class="btn primary" to="/audit-standard/draft">生成草稿</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title"><h3>预检明细</h3></div>
    <DataTable :columns="columns" :rows="rows" row-key="item" />
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const metrics = [
  { label: '来源完整性', value: '通过', hint: '5 类来源已选择' },
  { label: '权限范围', value: '通过', hint: '上海分公司内' },
  { label: '模板状态', value: '有效', hint: 'V1.3' },
  { label: '引用锁定', value: '无阻断', hint: '可生成草稿' }
];
const rows = [
  { item: '内部规章制度', result: '通过', desc: '费用报销管理办法 V2.1 可引用' },
  { item: '外部法规', result: '通过', desc: '证券公司内部控制指引为现行有效版本' },
  { item: '案例库', result: '通过', desc: '同类费用舞弊案例 6 条' },
  { item: '部门权限', result: '通过', desc: '用户权限覆盖经纪业务部和计划财务部' }
];
const columns = [
  { key: 'item', label: '预检项' },
  { key: 'result', label: '结果' },
  { key: 'desc', label: '说明' }
];
</script>
