<template>
  <div class="record-center-page" :class="{ 'is-empty': isEmptyView }">
    <div class="record-page-head">
      <h2>记录中心</h2>
      <div class="state-switch" aria-label="页面状态切换">
        <button
          v-for="item in viewModes"
          :key="item.key"
          type="button"
          :class="{ active: currentView === item.key }"
          @click="currentView = item.key"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="record-layout">
      <main class="record-main">
        <section class="metric-strip" aria-label="记录统计">
          <article v-for="item in activeMetrics" :key="item.label" class="record-metric">
            <span class="metric-icon" :class="item.tone">
              <AuditIcon :name="item.icon" />
            </span>
            <div>
              <p>{{ item.label }}</p>
              <strong>{{ item.value }} <small>条</small></strong>
              <em :class="item.trendClass">{{ item.hint }}</em>
            </div>
          </article>
        </section>

        <section class="record-board">
          <form class="filter-form" @submit.prevent>
            <label v-for="field in filterFields" :key="field.label" :class="{ 'range-field': field.type === 'dateRange' }">
              <span>{{ field.label }}</span>
              <select v-if="field.type === 'select'" :value="field.value" @change="noop">
                <option>{{ field.value }}</option>
                <option v-for="option in field.options" :key="option">{{ option }}</option>
              </select>
              <div v-else-if="field.type === 'dateRange'" class="date-range">
                <input type="text" :value="field.start" aria-label="开始日期" readonly />
                <b>~</b>
                <input type="text" :value="field.end" aria-label="结束日期" readonly />
                <span class="calendar-mark">□</span>
              </div>
              <input v-else type="text" :placeholder="field.placeholder" :value="field.value" readonly />
            </label>

            <div class="filter-actions">
              <button class="query-btn" type="button">查询</button>
              <button class="reset-btn" type="button">重置</button>
              <button class="export-btn" type="button">导出日志</button>
            </div>
          </form>

          <nav class="record-tabs" aria-label="记录分类">
            <button
              v-for="tab in activeTabs"
              :key="tab.key"
              type="button"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </nav>

          <div class="record-table-wrap">
            <table class="record-table">
              <thead>
                <tr>
                  <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
                </tr>
              </thead>
              <tbody v-if="isEmptyView">
                <tr>
                  <td :colspan="columns.length">
                    <div class="empty-record">
                      <div class="empty-illustration" aria-hidden="true">
                        <AuditIcon name="report" />
                        <span></span>
                      </div>
                      <h3>暂无操作留痕</h3>
                      <p>
                        创建任务、上传文件、生成结果、确认异常、保存版本、提交复核和导出文件后，
                        系统会自动在这里记录全过程。
                      </p>
                      <RouterLink class="create-task" to="/tasks/create">创建审计任务</RouterLink>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr v-for="row in visibleTableRows" :key="row.id">
                  <td>{{ row.time }}</td>
                  <td>{{ row.operator }}</td>
                  <td>{{ row.department }}</td>
                  <td><span class="type-tag" :class="row.tone">{{ row.type }}</span></td>
                  <td>{{ row.objectType }}</td>
                  <td class="object-name">{{ row.objectName }}</td>
                  <td>{{ row.content }}</td>
                  <td><span class="result-tag">{{ row.result }}</span></td>
                  <td>{{ row.entry }}</td>
                  <td>
                    <div class="table-actions">
                      <button type="button" @click="selectedRecord = row">查看详情</button>
                      <button type="button">下载凭证</button>
                      <button v-if="row.hasDiff" type="button">查看前后变化</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="record-pagination">
            <span>共 {{ isEmptyView ? '0' : '3,426' }} 条</span>
            <div>
              <button type="button" :disabled="isEmptyView">‹</button>
              <button type="button" class="active">1</button>
              <template v-if="!isEmptyView">
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">4</button>
                <button type="button">5</button>
                <span>...</span>
                <button type="button">343</button>
              </template>
              <button type="button" :disabled="isEmptyView">›</button>
              <select aria-label="每页条数"><option>10 条/页</option></select>
              <span>跳至</span>
              <input type="text" value="1" readonly aria-label="页码" />
              <span>页</span>
            </div>
          </footer>
        </section>

        <section v-if="isEmptyView" class="trace-preview">
          <h3>追溯流程预览</h3>
          <div class="trace-flow">
            <article v-for="step in traceSteps" :key="step.title" class="trace-step" :class="step.tone">
              <span><AuditIcon :name="step.icon" /></span>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </article>
          </div>
        </section>
      </main>

      <aside v-if="isEmptyView" class="record-side guide-side">
        <h3><AuditIcon name="records" /> 记录中心说明</h3>
        <h4>自动记录范围</h4>
        <ul>
          <li v-for="item in guideItems" :key="item.title">
            <span :class="item.tone"><AuditIcon :name="item.icon" /></span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </div>
          </li>
        </ul>
      </aside>

      <aside v-else class="record-side detail-side">
        <header>
          <h3>记录详情</h3>
          <button type="button" @click="selectedRecord = tableRows[2]">×</button>
        </header>

        <section class="detail-section">
          <h4>基本信息</h4>
          <dl>
            <div><dt>操作时间</dt><dd>{{ selectedRecord.time }}</dd></div>
            <div><dt>操作人</dt><dd>{{ selectedRecord.operator }}（工号：100210）</dd></div>
            <div><dt>部门</dt><dd>{{ selectedRecord.department }}</dd></div>
            <div><dt>操作类型</dt><dd>{{ selectedRecord.type }}</dd></div>
            <div><dt>对象类型</dt><dd>{{ selectedRecord.objectType }}</dd></div>
            <div><dt>对象名称</dt><dd>{{ selectedRecord.objectName }}</dd></div>
            <div><dt>操作结果</dt><dd><span class="result-tag">{{ selectedRecord.result }}</span></dd></div>
            <div><dt>操作入口</dt><dd>{{ selectedRecord.entry }}</dd></div>
          </dl>
        </section>

        <section class="detail-section">
          <div class="section-title-row">
            <h4>操作前后变化</h4>
            <button type="button">查看前后变化</button>
          </div>
        </section>

        <section class="detail-section">
          <h4>关联任务</h4>
          <div class="related-row">
            <p>上海分公司 Q1 常规审计任务</p>
            <button type="button">查看任务详情</button>
          </div>
        </section>

        <section class="detail-section">
          <h4>关联文件</h4>
          <div class="related-row">
            <p><span class="file-dot"></span>费用报销明细_202503.xlsx</p>
            <button type="button">查看关联文件</button>
          </div>
        </section>

        <section class="detail-section">
          <h4>关联版本</h4>
          <div class="related-row">
            <p>V1.0　2025-05-10 15:12　张伟</p>
            <button type="button">查看版本</button>
          </div>
        </section>

        <section class="detail-section">
          <h4>复核意见</h4>
          <p class="review-line">王磊（工号：100115）　2025-05-10 15:40 <span>通过</span></p>
          <p>文件解析准确，数据完整。</p>
        </section>

        <section class="detail-section">
          <h4>导出文件</h4>
          <div class="related-row">
            <p><span class="pdf-dot"></span>文件解析日志_20250510.pdf</p>
            <button type="button">下载</button>
          </div>
        </section>

        <section class="detail-section">
          <h4>操作流程追溯</h4>
          <ol class="detail-timeline">
            <li v-for="item in detailTimeline" :key="item.label" :class="{ current: item.current }">
              <i></i>
              <span>{{ item.label }}</span>
              <time>{{ item.time }}</time>
              <b>{{ item.user }}</b>
            </li>
          </ol>
        </section>

        <footer class="detail-actions">
          <button type="button">下载日志</button>
          <button type="button" class="primary">查看任务详情</button>
        </footer>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import AuditIcon from '../../components/common/AuditIcon.vue';

const viewModes = [
  { key: 'empty', label: '空页面' },
  { key: 'data', label: '有数据页面' }
];

const initialView = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'data' ? 'data' : 'empty';
const currentView = ref(initialView);
const activeTab = ref('operation');

const isEmptyView = computed(() => currentView.value === 'empty');

const emptyMetrics = [
  { label: '版本记录', value: '0', hint: '较昨日 0', icon: 'report', tone: 'red' },
  { label: '操作留痕', value: '0', hint: '较昨日 0', icon: 'analysis', tone: 'orange' },
  { label: '导出记录', value: '0', hint: '较昨日 0', icon: 'upload', tone: 'blue' },
  { label: '复核记录', value: '0', hint: '较昨日 0', icon: 'review', tone: 'purple' },
  { label: '异常操作', value: '0', hint: '较昨日 0', icon: 'anomaly', tone: 'red' }
];

const dataMetrics = [
  { label: '版本记录', value: '128', hint: '较上月 +18 条 ↑', icon: 'files', tone: 'blue', trendClass: 'up' },
  { label: '操作留痕', value: '3,426', hint: '较上月 +326 条 ↑', icon: 'records', tone: 'green', trendClass: 'up' },
  { label: '导出记录', value: '286', hint: '较上月 +32 条 ↑', icon: 'upload', tone: 'orange', trendClass: 'up' },
  { label: '复核记录', value: '74', hint: '较上月 +9 条 ↑', icon: 'review', tone: 'purple', trendClass: 'up' },
  { label: '异常操作', value: '12', hint: '较上月 -3 条 ↓', icon: 'anomaly', tone: 'red', trendClass: 'down' }
];

const activeMetrics = computed(() => (isEmptyView.value ? emptyMetrics : dataMetrics));

const filterFields = computed(() => [
  { label: '所属任务', type: 'select', value: '请选择任务', options: ['上海分公司 Q1 常规审计任务'] },
  { label: '对象类型', type: 'select', value: '全部', options: ['任务', '文件', '分析结果', '报告'] },
  { label: '对象名称', type: 'text', value: '', placeholder: '请输入对象名称' },
  { label: '操作人', type: 'text', value: '', placeholder: isEmptyView.value ? '请输入操作人' : '请输入姓名/工号' },
  { label: '部门', type: 'select', value: '全部', options: ['审计部', '市场部', 'IT 运营部'] },
  { label: '操作类型', type: 'select', value: '全部', options: ['创建任务', '上传文件', '解析文件', '导出文件'] },
  {
    label: '时间范围',
    type: 'dateRange',
    start: isEmptyView.value ? '开始日期' : '2025-05-01',
    end: isEmptyView.value ? '结束日期' : '2025-05-10'
  },
  { label: '操作结果', type: 'select', value: '全部', options: ['成功', '失败', '被阻断'] }
]);

const emptyTabs = [
  { key: 'all', label: '全部记录' },
  { key: 'version', label: '版本记录' },
  { key: 'operation', label: '操作留痕' },
  { key: 'export', label: '导出记录' },
  { key: 'review', label: '复核记录' }
];

const dataTabs = [
  { key: 'all', label: '全部记录（3,926）' },
  { key: 'version', label: '版本记录（128）' },
  { key: 'operation', label: '操作留痕（3,426）' },
  { key: 'export', label: '导出记录（286）' },
  { key: 'review', label: '复核记录（74）' }
];

const activeTabs = computed(() => (isEmptyView.value ? emptyTabs : dataTabs));

const columns = [
  { key: 'time', label: '操作时间' },
  { key: 'operator', label: '操作人' },
  { key: 'department', label: '部门' },
  { key: 'type', label: '操作类型' },
  { key: 'objectType', label: '对象类型' },
  { key: 'objectName', label: '对象名称' },
  { key: 'content', label: '操作内容' },
  { key: 'result', label: '操作结果' },
  { key: 'entry', label: '操作入口' },
  { key: 'action', label: '操作' }
];

const tableRows = [
  { id: 'LOG-01', time: '2025-05-10 14:32:18', operator: '张伟', department: '市场部', type: '创建任务', objectType: '任务', objectName: '上海分公司 Q1 常规审计任务', content: '创建审计任务并设置基础信息', result: '成功', entry: '任务中心', tone: 'blue' },
  { id: 'LOG-02', time: '2025-05-10 14:31:05', operator: '李娜', department: '审计部', type: '上传文件', objectType: '文件', objectName: '费用报销明细_202503.xlsx', content: '上传文件至任务资料', result: '成功', entry: '任务详情-资料', tone: 'green' },
  { id: 'LOG-03', time: '2025-05-10 14:31:42', operator: '李娜', department: '审计部', type: '解析文件', objectType: '文件', objectName: '费用报销明细_202503.xlsx', content: '解析文件并提取数据', result: '成功', entry: '任务详情-资料', tone: 'orange', hasDiff: true },
  { id: 'LOG-04', time: '2025-05-10 14:32:31', operator: '王磊', department: '审计部', type: '生成结果', objectType: '分析结果', objectName: '费用异常分析结果', content: '生成费用异常分析结果', result: '成功', entry: '任务详情-分析', tone: 'orange' },
  { id: 'LOG-05', time: '2025-05-10 14:40:12', operator: '李娜', department: '审计部', type: '确认异常', objectType: '异常项', objectName: 'AY202504280001', content: '确认异常为有效异常', result: '成功', entry: '任务详情-异常', tone: 'blue' },
  { id: 'LOG-06', time: '2025-05-10 14:45:08', operator: '李娜', department: '审计部', type: '排除异常', objectType: '异常项', objectName: 'AY202504280015', content: '排除异常', result: '成功', entry: '任务详情-异常', tone: 'gray' },
  { id: 'LOG-07', time: '2025-05-10 15:03:27', operator: '张伟', department: '市场部', type: '修改报告', objectType: '报告', objectName: '审计报告（初稿）', content: '修改报告第二章内容', result: '成功', entry: '报告编辑', tone: 'orange', hasDiff: true },
  { id: 'LOG-08', time: '2025-05-10 15:12:03', operator: '张伟', department: '审计部', type: '保存版本', objectType: '报告', objectName: '审计报告（V1.0）', content: '保存报告版本 V1.0', result: '成功', entry: '报告编辑', tone: 'green' },
  { id: 'LOG-09', time: '2025-05-10 15:35:11', operator: '王磊', department: '审计部', type: '提交复核', objectType: '报告', objectName: '审计报告（V1.0）', content: '提交报告复核', result: '成功', entry: '报告管理', tone: 'purple' },
  { id: 'LOG-10', time: '2025-05-10 16:02:45', operator: '赵强', department: '审计部', type: '导出文件', objectType: '报告', objectName: '审计报告（V1.0）.pdf', content: '导出报告 PDF', result: '成功', entry: '报告管理', tone: 'blue' },
  { id: 'LOG-11', time: '2025-05-10 16:18:30', operator: '陈晨', department: 'IT 运营部', type: '配置规则', objectType: '规则', objectName: '费用异常规则 V2.1', content: '新增费用异常规则', result: '成功', entry: '配置中心', tone: 'orange', hasDiff: true },
  { id: 'LOG-12', time: '2025-05-10 16:40:21', operator: '赵强', department: 'IT 运营部', type: '变更权限', objectType: '权限', objectName: '审计人员角色权限', content: '调整角色权限', result: '成功', entry: '配置中心', tone: 'gray', hasDiff: true }
];

const visibleTableRows = computed(() => tableRows.slice(0, 8));
const selectedRecord = ref(tableRows[2]);

const traceSteps = [
  { title: '任务', desc: '创建审计任务', icon: 'tasks', tone: 'red' },
  { title: '文件', desc: '上传与解析资料', icon: 'files', tone: 'orange' },
  { title: '结果', desc: '模型生成结果', icon: 'analysis', tone: 'blue' },
  { title: '报告', desc: '报告生成与编辑', icon: 'report', tone: 'purple' },
  { title: '版本', desc: '保存版本记录', icon: 'records', tone: 'green' },
  { title: '导出', desc: '导出与归档管理', icon: 'upload', tone: 'gray' }
];

const guideItems = [
  { title: '创建任务', desc: '记录任务创建及基础信息', icon: 'report', tone: 'red' },
  { title: '上传文件', desc: '记录文件上传及版本信息', icon: 'upload', tone: 'orange' },
  { title: '解析文件', desc: '记录文件解析状态与结果', icon: 'files', tone: 'green' },
  { title: '生成结果', desc: '记录模型生成过程与输出', icon: 'analysis', tone: 'orange' },
  { title: '确认异常', desc: '记录异常确认与处理意见', icon: 'review', tone: 'blue' },
  { title: '排除异常', desc: '记录异常排除及原因说明', icon: 'failed', tone: 'red' },
  { title: '修改报告', desc: '记录报告编辑与内容变更', icon: 'report', tone: 'orange' },
  { title: '保存版本', desc: '记录版本保存与变更历史', icon: 'records', tone: 'blue' },
  { title: '提交复核', desc: '记录复核提交与意见处理', icon: 'review', tone: 'green' },
  { title: '配置规则', desc: '记录规则配置与参数变更', icon: 'config', tone: 'gray' },
  { title: '变更权限', desc: '记录权限分配与变更情况', icon: 'tasks', tone: 'gray' }
];

const detailTimeline = [
  { label: '创建任务', time: '2025-05-10 14:32:18', user: '张伟' },
  { label: '上传资料', time: '2025-05-10 14:31:05', user: '李娜' },
  { label: '模型生成（解析文件）', time: '2025-05-10 14:31:42', user: '李娜', current: true },
  { label: '人工确认', time: '2025-05-10 14:40:12', user: '李娜' },
  { label: '保存版本', time: '2025-05-10 15:12:03', user: '张伟' },
  { label: '提交复核', time: '2025-05-10 15:35:11', user: '王磊' },
  { label: '导出归档', time: '2025-05-10 16:02:45', user: '赵强' }
];

function noop() {}
</script>

<style scoped>
.record-center-page {
  min-width: 0;
  min-height: calc(100vh - 84px);
  overflow: visible;
  color: #1f2937;
}

.record-page-head {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.record-page-head h2 {
  font-size: 20px;
  line-height: 1.2;
}

.state-switch {
  display: inline-flex;
  padding: 3px;
  border: 1px solid #d9e0ea;
  border-radius: 6px;
  background: #fff;
}

.state-switch button {
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #667085;
  font-weight: 700;
}

.state-switch button.active {
  color: #fff;
  background: #c40000;
}

.record-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 348px;
  gap: 12px;
  align-items: stretch;
}

.record-main {
  min-width: 0;
}

.record-center-page:not(.is-empty) .record-main {
  display: flex;
  flex-direction: column;
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(132px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.record-metric {
  min-height: 78px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e3e8ef;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.04);
}

.metric-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 22px;
}

.metric-icon.red { color: #ef2929; background: #fff0f0; }
.metric-icon.orange { color: #ff8a00; background: #fff4e4; }
.metric-icon.blue { color: #1f7aff; background: #edf5ff; }
.metric-icon.purple { color: #7657ff; background: #f2edff; }
.metric-icon.green { color: #16a36a; background: #eaf8f1; }
.metric-icon.gray { color: #667085; background: #f2f4f7; }

.record-metric p {
  color: #475467;
  font-size: 12px;
  line-height: 1.1;
  white-space: nowrap;
}

.record-metric strong {
  display: block;
  margin-top: 5px;
  color: #101828;
  font-size: clamp(21px, 1.65vw, 25px);
  line-height: 1;
}

.record-metric strong small {
  font-size: 12px;
  font-weight: 700;
}

.record-metric em {
  display: block;
  margin-top: 5px;
  color: #667085;
  font-size: 11px;
  font-style: normal;
  line-height: 1.15;
  white-space: nowrap;
}

.record-metric em.up {
  color: #d92d20;
}

.record-metric em.down {
  color: #12a66a;
}

.record-board,
.trace-preview,
.record-side {
  border: 1px solid #e3e8ef;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.05);
}

.record-board {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.record-center-page:not(.is-empty) .record-board {
  flex: 1;
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  gap: 8px 12px;
  padding: 10px 12px 11px;
  border-bottom: 1px solid #edf1f5;
}

.filter-form label {
  display: grid;
  grid-column: span 4;
  gap: 4px;
  min-width: 0;
  color: #344054;
  font-size: 11.5px;
  font-weight: 700;
}

.filter-form label.range-field {
  grid-column: span 6;
  margin-right: 16px;
}

.filter-form input,
.filter-form select {
  width: 100%;
  height: 30px;
  border: 1px solid #d5dce6;
  border-radius: 4px;
  padding: 0 9px;
  background: #fff;
  color: #667085;
  font-size: 11.5px;
}

.date-range {
  position: relative;
  display: grid;
  grid-template-columns: minmax(76px, 1fr) 16px minmax(76px, 1fr) 16px;
  align-items: center;
  border: 1px solid #d5dce6;
  border-radius: 4px;
  background: #fff;
}

.date-range input {
  border: 0;
  min-width: 0;
  padding: 0 6px;
  text-align: center;
}

.date-range b,
.calendar-mark {
  color: #98a2b3;
  font-weight: 400;
  text-align: center;
}

.filter-actions {
  grid-column: span 14;
  display: flex;
  justify-content: flex-end;
  align-items: end;
  gap: 16px;
  padding-left: 34px;
}

.filter-actions button,
.record-pagination button,
.record-pagination select,
.record-pagination input,
.detail-side button {
  border: 1px solid #d5dce6;
  border-radius: 4px;
  background: #fff;
  color: #344054;
  font-size: 12px;
}

.filter-actions button {
  min-width: 92px;
  height: 30px;
  font-weight: 700;
}

.filter-actions .query-btn,
.detail-actions .primary {
  border-color: #c40000;
  background: #c40000;
  color: #fff;
}

.filter-actions .export-btn {
  color: #8a96a8;
  background: #f4f6f9;
}

.record-tabs {
  display: flex;
  align-items: center;
  gap: clamp(18px, 3vw, 30px);
  height: 42px;
  padding: 0 16px;
  border-bottom: 1px solid #edf1f5;
  overflow: visible;
}

.record-tabs button {
  position: relative;
  height: 42px;
  font-size: 13px;
  border: 0;
  background: transparent;
  color: #344054;
  white-space: nowrap;
  font-weight: 700;
}

.record-tabs button.active {
  color: #d00000;
}

.record-tabs button.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: #d00000;
}

.record-table-wrap {
  overflow: hidden;
}

.record-center-page:not(.is-empty) .record-table-wrap {
  flex: 1;
}

.record-table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.record-table th,
.record-table td {
  padding: 9px 6px;
  border-bottom: 1px solid #edf1f5;
  text-align: center;
  font-size: 10.6px;
  line-height: 1.35;
  vertical-align: middle;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  word-break: keep-all;
}

.record-table th {
  color: #1f2937;
  font-weight: 800;
  background: #f8fafc;
}

.record-table th:nth-child(1),
.record-table td:nth-child(1) { width: 12%; }
.record-table th:nth-child(2),
.record-table td:nth-child(2) { width: 6%; }
.record-table th:nth-child(3),
.record-table td:nth-child(3) { width: 7%; }
.record-table th:nth-child(4),
.record-table td:nth-child(4) { width: 9%; }
.record-table th:nth-child(5),
.record-table td:nth-child(5) { width: 8%; }
.record-table th:nth-child(6),
.record-table td:nth-child(6) { width: 13%; }
.record-table th:nth-child(7),
.record-table td:nth-child(7) { width: 13%; }
.record-table th:nth-child(8),
.record-table td:nth-child(8) { width: 7%; }
.record-table th:nth-child(9),
.record-table td:nth-child(9) { width: 9%; }
.record-table th:nth-child(10),
.record-table td:nth-child(10) { width: 16%; }

.object-name {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.type-tag,
.result-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
  white-space: nowrap;
}

.type-tag.blue { color: #1f7aff; background: #eef6ff; }
.type-tag.green { color: #159a62; background: #eaf8f1; }
.type-tag.orange { color: #f27a00; background: #fff3df; }
.type-tag.purple { color: #6848ef; background: #f2edff; }
.type-tag.gray { color: #667085; background: #f2f4f7; }

.result-tag {
  color: #159a62;
  background: #eaf8f1;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 9px;
}

.table-actions button {
  border: 0;
  background: transparent;
  color: #1f7aff;
  font-weight: 700;
  font-size: 10.5px;
}

.empty-record {
  min-height: clamp(150px, 23vh, 220px);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 9px;
  color: #475467;
}

.empty-illustration {
  position: relative;
  width: 78px;
  height: 58px;
  display: grid;
  place-items: center;
  color: #c9d2df;
  font-size: 56px;
}

.empty-illustration span {
  position: absolute;
  right: 10px;
  bottom: 3px;
  width: 34px;
  height: 34px;
  border: 5px solid #b8c2d0;
  border-radius: 50%;
}

.empty-illustration span::after {
  content: "";
  position: absolute;
  right: -13px;
  bottom: -9px;
  width: 18px;
  height: 5px;
  border-radius: 9px;
  background: #b8c2d0;
  transform: rotate(45deg);
}

.empty-record h3 {
  color: #1f2937;
  font-size: 17px;
}

.empty-record p {
  max-width: 560px;
  color: #667085;
  line-height: 1.45;
  text-align: center;
}

.create-task {
  min-width: 140px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #fff;
  background: #c40000;
  font-weight: 800;
}

.record-pagination {
  min-height: 44px;
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #344054;
  border-top: 1px solid #edf1f5;
}

.record-pagination > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.record-pagination button {
  min-width: 28px;
  height: 28px;
}

.record-pagination button.active {
  color: #fff;
  border-color: #c40000;
  background: #c40000;
}

.record-pagination select {
  height: 30px;
  padding: 0 10px;
}

.record-pagination input {
  width: 48px;
  height: 30px;
  text-align: center;
}

.trace-preview {
  margin-top: 8px;
  padding: 8px 18px 10px;
}

.trace-preview h3 {
  margin-bottom: 8px;
  font-size: 14px;
}

.trace-flow {
  display: grid;
  grid-template-columns: repeat(6, minmax(92px, 1fr));
  gap: 12px;
  align-items: start;
}

.trace-step {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 5px;
  min-width: 0;
  text-align: center;
}

.trace-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 24px;
  left: calc(50% + 34px);
  width: calc(100% - 46px);
  border-top: 2px dashed #b9c4d4;
}

.trace-step span {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid #dbe2ec;
  border-radius: 50%;
  background: #fff;
  font-size: 22px;
}

.trace-step.red span { color: #e52a2a; background: #fff0f0; }
.trace-step.orange span { color: #ff8a00; background: #fff8ed; }
.trace-step.blue span { color: #1f7aff; background: #eef6ff; }
.trace-step.purple span { color: #6848ef; background: #f2edff; }
.trace-step.green span { color: #15a065; background: #eaf8f1; }
.trace-step.gray span { color: #667085; background: #f6f7f9; }

.trace-step strong {
  font-size: 13px;
}

.trace-step p {
  color: #667085;
  font-size: 11px;
  line-height: 1.25;
}

.record-side {
  min-width: 0;
}

.guide-side {
  overflow: visible;
  padding: 18px 18px;
}

.guide-side h3 {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
  font-size: 15px;
}

.guide-side h4 {
  margin-bottom: 14px;
  font-size: 13px;
}

.guide-side ul {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.guide-side li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 9px;
}

.guide-side li > span {
  margin-top: 1px;
  display: grid;
  place-items: center;
  font-size: 17px;
}

.guide-side span.red { color: #ef2929; }
.guide-side span.orange { color: #ff8a00; }
.guide-side span.blue { color: #1f7aff; }
.guide-side span.purple { color: #6848ef; }
.guide-side span.green { color: #16a36a; }
.guide-side span.gray { color: #667085; }

.guide-side strong {
  font-size: 12.5px;
}

.guide-side p {
  margin-top: 2px;
  color: #667085;
  font-size: 11.5px;
  line-height: 1.35;
}

.detail-side {
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.detail-side header {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #edf1f5;
  background: #fff;
}

.detail-side header h3 {
  font-size: 13px;
}

.detail-side header button {
  width: 28px;
  height: 28px;
  border: 0;
  font-size: 18px;
}

.detail-section {
  padding: 8px 13px;
  border-bottom: 1px solid #edf1f5;
}

.detail-section h4 {
  margin-bottom: 6px;
  font-size: 10.5px;
}

.detail-section p {
  color: #344054;
  font-size: 10px;
  line-height: 1.45;
}

.detail-section dl {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
  margin: 0;
}

.detail-section dl div {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.detail-section dt {
  color: #667085;
  font-size: 10px;
}

.detail-section dd {
  margin: 0;
  color: #344054;
  font-size: 10px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.section-title-row,
.related-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.related-row p {
  min-width: 0;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.section-title-row h4 {
  margin: 0;
}

.section-title-row button,
.related-row button {
  min-height: 22px;
  padding: 0 7px;
  color: #1f7aff;
  font-size: 10px;
  white-space: nowrap;
}

.file-dot,
.pdf-dot {
  width: 11px;
  height: 11px;
  display: inline-block;
  margin-right: 6px;
  border-radius: 2px;
  vertical-align: -1px;
}

.file-dot {
  background: #16a36a;
}

.pdf-dot {
  background: #ef2929;
}

.review-line span {
  float: right;
  color: #16a36a;
}

.detail-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-timeline li {
  position: relative;
  display: grid;
  grid-template-columns: 14px minmax(62px, 1fr) minmax(100px, 1.4fr) 32px;
  gap: 5px;
  align-items: start;
  min-height: 18px;
  color: #667085;
  font-size: 9.5px;
  line-height: 1.3;
}

.detail-timeline li::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 13px;
  bottom: -7px;
  border-left: 1px solid #cbd5e1;
}

.detail-timeline li:last-child::before {
  display: none;
}

.detail-timeline i {
  width: 9px;
  height: 9px;
  margin-top: 3px;
  border: 2px solid #98a2b3;
  border-radius: 50%;
  background: #fff;
}

.detail-timeline li.current {
  color: #d00000;
  font-weight: 800;
}

.detail-timeline li.current i {
  border-color: #d00000;
  background: #d00000;
}

.detail-timeline b {
  font-weight: 400;
}

.detail-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: auto;
  padding: 7px 13px;
  border-top: 1px solid #edf1f5;
  background: #fff;
}

.detail-actions button {
  min-height: 28px;
  font-weight: 800;
}

@media (max-width: 1320px) {
  .metric-strip {
    grid-template-columns: repeat(5, minmax(112px, 1fr));
  }

  .record-metric {
    padding: 12px 10px;
    gap: 9px;
  }

  .metric-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
    font-size: 21px;
  }

  .record-metric strong {
    font-size: 22px;
  }

  .record-layout {
    grid-template-columns: minmax(0, 1fr) 348px;
  }
}

@media (max-width: 1180px) {
  .record-layout {
    grid-template-columns: 1fr;
  }

  .record-side {
    max-height: none;
  }
}

@media (max-width: 980px) {
  .metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .trace-flow {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .trace-step::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .record-page-head,
  .record-pagination,
  .record-pagination > div {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-strip,
  .filter-form,
  .trace-flow {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-wrap: wrap;
  }
}
</style>
