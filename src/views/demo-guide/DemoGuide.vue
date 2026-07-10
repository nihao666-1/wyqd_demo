<template>
  <PageHeader
    eyebrow="线下演示说明"
    title="演示指南"
    description="本页只承载演示说明，业务办理仍在各业务页面完成。"
  />

  <section class="panel">
    <div class="panel-title"><h3>适用对象与边界</h3></div>
    <div class="three-col">
      <div class="summary-item">
        <strong>适用对象</strong>
        <p>业务方、研发方、测试方，用于理解审计任务从资料准备到报告归档的前端交互闭环。</p>
      </div>
      <div class="summary-item">
        <strong>演示前准备</strong>
        <p>打开工作台，确认当前用户为上海分公司审计部，权限范围、数据源状态和待办任务均已加载。</p>
      </div>
      <div class="summary-item">
        <strong>Demo 边界</strong>
        <p>不接真实后端，不做真实文件解析，不做真实权限系统，不做开放式聊天、审批流和物理删除。</p>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-title"><h3>推荐主线</h3></div>
    <div class="timeline">
      <div v-for="step in mainFlow" :key="step.no" class="timeline-item">
        <strong>{{ step.no }}</strong>
        <span>{{ step.module }}</span>
        <p>{{ step.action }}</p>
      </div>
    </div>
  </section>

  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>五大能力讲法</h3></div>
      <DataTable :columns="moduleColumns" :rows="moduleRows" row-key="module" />
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>常见客户问题口径</h3></div>
      <div class="summary-rail">
        <div v-for="item in faqs" :key="item.q" class="summary-item">
          <strong>{{ item.q }}</strong>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </aside>
  </section>

  <section class="panel">
    <div class="panel-title"><h3>点击顺序与预期结果</h3></div>
    <DataTable :columns="clickColumns" :rows="clickRows" row-key="step" />
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const mainFlow = [
  { no: '01', module: '工作台', action: '从审计工作台查看待办、权限、数据源健康和当前任务。' },
  { no: '02', module: '任务', action: '创建审计任务，选择九类能力，确认资料准备范围。' },
  { no: '03', module: '资料', action: '进入文件或文件夹上传，上传后再查看预览、异常、三字段和元数据。' },
  { no: '04', module: '分析', action: '运行监管、规范、监督共享、费用等能力，查看来源依据和候选结果。' },
  { no: '05', module: '报告', action: '选择报告来源，处理资料缺口，生成草稿，人工确认后锁定和导出。' },
  { no: '06', module: '追溯', action: '在任务详情、文件中心和记录中心回看版本、导出、回传比对和操作留痕。' }
];

const moduleColumns = [
  { key: 'module', label: '能力' },
  { key: 'talkingPoint', label: '演示重点' },
  { key: 'boundary', label: '边界说明' }
];
const moduleRows = [
  { module: '监管案例舆情分析', talkingPoint: '固定任务进入、数据获取、候选建议、来源证据、确认锁定。', boundary: '舆情只作为线索和风险提示。' },
  { module: '审计规范智能化', talkingPoint: '0-1、1-2、上传标准规范、差异分析、规范库版本。', boundary: '制度查询/变更/比对收敛在规范模块。' },
  { module: '监督共享信息分析', talkingPoint: '文件夹预览、三字段、元数据、入库预检、报告来源筛选。', boundary: '资料入库后才可被报告引用。' },
  { module: '费用智能化审计', talkingPoint: '综合看板、异常候选、证据链、人工确认、整改建议。', boundary: '规则和证据为本地 Mock。' },
  { module: '审计报告智能化', talkingPoint: '模板、资料、生成、内容审核、文档规范核验、回传比对。', boundary: '文档规范核验只处理字体、字号、编号和标题层级等格式问题。' }
];

const clickColumns = [
  { key: 'step', label: '步骤' },
  { key: 'page', label: '页面' },
  { key: 'operation', label: '操作' },
  { key: 'expected', label: '预期结果' }
];
const clickRows = [
  { step: '1', page: '/workbench', operation: '查看工作台并进入创建任务', expected: '看到待办、最近任务、数据源状态和权限范围。' },
  { step: '2', page: '/tasks/create', operation: '按步骤选择能力和资料范围', expected: '任务进入资料准备链路。' },
  { step: '3', page: '/supervision/import/upload', operation: '选择文件夹', expected: '跳转文件夹预览，初始页不展示上传后结果。' },
  { step: '4', page: '/audit-report/material/import', operation: '导入审计报告资料', expected: '进入报告资料专属导入链路，不混用监督共享页面。' },
  { step: '5', page: '/audit-report/source-select', operation: '选择来源并预检', expected: '进入缺口处理和草稿生成。' },
  { step: '6', page: '/tasks/detail', operation: '查看任务台账', expected: '回看输入资料、分析过程、结果、报告、版本和操作留痕。' }
];

const faqs = [
  { q: '哪些内容是 Mock？', a: '文件解析、模型结果、权限判断和外部系统数据均为本地 Mock，用于演示前端状态和流程。' },
  { q: '是否能接真实接口？', a: '页面、状态机、Mock 数据结构已按任务、文件、报告、版本和记录分层，后续可替换为真实接口。' },
  { q: '为什么没有开放聊天？', a: '本 Demo 聚焦固定审计任务流程，不提供无边界聊天入口。' }
];
</script>
