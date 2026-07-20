<template>
  <div class="config-page route-fill-page" :class="`mode-${currentMode}`">
    <template v-if="currentMode === 'initial'">
      <nav class="top-tabs compact">
        <button v-for="tab in setupTabs" :key="tab" :class="{ active: tab === '模板配置' }" type="button">{{ tab }}</button>
      </nav>

      <section class="metric-strip">
        <article v-for="item in initialMetrics" :key="item.label" class="metric-card">
          <span class="metric-icon" :class="item.tone"><AuditIcon :name="item.icon" /></span>
          <div>
            <p>{{ item.label }}</p>
            <strong>{{ item.value }} <small>{{ item.unit }}</small></strong>
            <em>{{ item.hint }}</em>
          </div>
        </article>
      </section>

      <div class="config-grid initial-grid">
        <aside class="side-card category-card">
          <h3>配置分类</h3>
          <button
            v-for="item in configCategories"
            :key="item"
            type="button"
            :class="{ active: item === '报告模板配置' }"
          >
            <AuditIcon name="records" />
            <span>{{ item }}</span>
          </button>
        </aside>

        <main class="main-stack">
          <section class="empty-panel">
            <div class="empty-art" aria-hidden="true">
              <AuditIcon name="files" />
              <span><AuditIcon name="config" /></span>
            </div>
            <h3>暂无用户自定义配置</h3>
            <p>系统已预置基础模板和规则，请确认适用范围后启用，也可新增模板、规则和参数版本。</p>
            <div class="empty-actions">
              <button class="primary" type="button">新增模板</button>
              <button type="button">确认内置规则</button>
              <button type="button">系统参数配置</button>
            </div>
          </section>

          <section class="table-card">
            <div class="section-title">
              <h3>内置配置列表</h3>
              <span>共 3 条</span>
            </div>
            <div class="table-scroll">
              <table>
              <thead>
                <tr>
                  <th>配置名称</th>
                  <th>配置类型</th>
                  <th>版本号</th>
                  <th>状态</th>
                  <th>适用模块</th>
                  <th>最近修改人</th>
                  <th>修改时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in builtinRows" :key="row.name">
                  <td>{{ row.name }}</td>
                  <td>{{ row.type }}</td>
                  <td>{{ row.version }}</td>
                  <td><span class="tag orange">{{ row.status }}</span></td>
                  <td>{{ row.module }}</td>
                  <td>{{ row.owner }}</td>
                  <td>{{ row.time }}</td>
                  <td><button class="link-btn" type="button">查看详情</button></td>
                </tr>
              </tbody>
              </table>
            </div>
            <footer class="pager">
              <span>共 3 条</span>
              <div><button type="button">‹</button><button class="active" type="button">1</button><button type="button">›</button><select><option>10 条/页</option></select><span>跳至</span><input value="1" readonly /><span>页</span></div>
            </footer>
          </section>
        </main>

        <aside class="right-card setup-side">
          <section>
            <div class="section-title">
              <h3>初始化检查</h3>
              <button class="ghost" type="button">刷新</button>
            </div>
            <ul class="check-list">
              <li v-for="item in initChecks" :key="item.label">
                <span><AuditIcon :name="item.icon" /></span>
                <strong>{{ item.label }}</strong>
                <em :class="item.tone">{{ item.status }}</em>
              </li>
            </ul>
          </section>
          <section>
            <h3>下一步建议</h3>
            <div class="suggest-card" v-for="item in suggestions" :key="item.title">
              <span :class="item.tone"><AuditIcon :name="item.icon" /></span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </div>
              <b>›</b>
            </div>
          </section>
          <p class="info-note">所有配置变更均支持版本管理与操作留痕，确保合规可追溯。</p>
        </aside>
      </div>
    </template>

    <template v-else>
      <div class="param-head">
        <nav class="top-tabs param-tabs">
          <button v-for="tab in paramTabs" :key="tab" :class="{ active: tab === '模型参数' }" type="button">{{ tab }}</button>
        </nav>
        <div class="param-actions">
          <span>草稿待提交</span>
          <button type="button">保存草稿</button>
          <button type="button">参数试运行</button>
          <button type="button" class="danger-lite">提交复核</button>
          <button type="button" class="primary">发布生效</button>
        </div>
      </div>

      <div class="config-grid params-grid">
        <aside class="side-card category-card">
          <h3>参数分类</h3>
          <button
            v-for="item in paramCategories"
            :key="item"
            type="button"
            :class="{ active: item === '模型调用参数' }"
          >
            <span>{{ item }}</span>
          </button>
        </aside>

        <main class="main-stack">
          <section class="form-card">
            <h3>模型参数配置</h3>
            <div class="param-form">
              <label v-for="field in paramFields" :key="field.label">
                <span>{{ field.label }}</span>
                <input v-if="field.kind !== 'switch'" :value="field.value" readonly />
                <b v-else class="switch on"><i></i>{{ field.value }}</b>
              </label>
            </div>
            <p class="form-note">参数修改后需提交复核，审批通过后方可发布生效。</p>
          </section>

          <section class="table-card">
            <div class="section-title"><h3>参数变更预览</h3><span>共 7 项</span></div>
            <div class="table-scroll">
              <table>
              <thead><tr><th>参数项</th><th>当前值</th><th></th><th>修改后</th><th>生效范围</th><th>是否需复核</th></tr></thead>
              <tbody>
                <tr v-for="row in paramChangeRows" :key="row.name">
                  <td>{{ row.name }}</td>
                  <td>{{ row.old }}</td>
                  <td>→</td>
                  <td>{{ row.next }}</td>
                  <td>{{ row.scope }}</td>
                  <td><span class="tag green">{{ row.review }}</span></td>
                </tr>
              </tbody>
              </table>
            </div>
            <footer class="pager"><span>共 7 条</span><div><button>‹</button><button class="active">1</button><button>2</button><button>›</button><select><option>10 条/页</option></select><span>跳至</span><input value="1" readonly /><span>页</span></div></footer>
          </section>
        </main>

        <aside class="right-card param-side">
          <header><h3>参数变更与留痕</h3><button type="button">×</button></header>
          <section class="trace-block">
            <h4>当前版本</h4>
            <div class="version-current">
              <div>
                <p>当前版本：<strong>V2.5.0（草稿）</strong></p>
                <p>创建时间：2025-05-10 14:22</p>
                <p>创建人：张伟</p>
              </div>
              <button type="button">查看历史版本</button>
            </div>
          </section>
          <section class="trace-block">
            <h4>版本历史 <span>近 5 个版本</span></h4>
            <table class="mini-table"><tbody><tr v-for="row in paramVersions" :key="row.version"><td>{{ row.version }}</td><td class="success">{{ row.status }}</td><td>{{ row.time }}</td><td>{{ row.owner }}</td></tr></tbody></table>
            <div class="version-actions">
              <button type="button">查看历史版本</button>
              <button type="button">回滚版本</button>
            </div>
          </section>
          <section class="trace-block">
            <h4>变更摘要</h4>
            <p>本次修改 7 项参数，其中 7 项需复核，涉及默认模型、上下文长度、超时控制等关键配置。</p>
          </section>
          <section class="trace-block">
            <h4>影响模块</h4>
            <div class="chips"><span>费用审计分析</span><span>制度比对</span><span>报告智能化</span><span>专项审计分析</span><span>任务中心</span></div>
          </section>
          <section class="trace-block">
            <h4>操作日志 <span>近 7 条</span></h4>
            <table class="mini-table"><tbody><tr><td>05-10 14:22</td><td>张伟</td><td>创建草稿版本 V2.5.0</td></tr><tr><td>05-10 14:22</td><td>张伟</td><td>修改默认模型参数</td></tr><tr><td>05-10 14:20</td><td>张伟</td><td>修改上下文长度参数</td></tr></tbody></table>
            <button class="log-more" type="button">查看更多日志 ›</button>
          </section>
          <section class="trace-block review-box">
            <h4>复核意见</h4>
            <p>暂无复核意见</p>
            <div class="review-actions">
              <button class="danger-lite">提交复核</button>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AuditIcon from '../../components/common/AuditIcon.vue';

const pageModes = [
  { key: 'initial', label: '初始状态' },
  { key: 'params', label: '系统参数' }
];

const route = useRoute();

function normalizeMode(value) {
  return pageModes.some((mode) => mode.key === value) ? value : 'initial';
}

const currentMode = ref(normalizeMode(route.query.mode));

watch(
  () => route.query.mode,
  (mode) => {
    currentMode.value = normalizeMode(mode);
  }
);

const setupTabs = ['模板配置', '规则配置', '标签配置', '权限配置', '系统参数配置'];
const paramTabs = ['基础参数', '文件参数', '模型参数', 'AI 标识', '安全参数', '通知参数', '导出参数', '审计留痕'];

const initialMetrics = [
  { label: '内置模板', value: '6', unit: '个', hint: '已预置基础模板', icon: 'report', tone: 'red' },
  { label: '用户模板', value: '0', unit: '个', hint: '暂无自定义模板', icon: 'tasks', tone: 'blue' },
  { label: '启用规则', value: '0', unit: '条', hint: '已启用规则数量', icon: 'review', tone: 'green' },
  { label: '待确认规则', value: '4', unit: '条', hint: '需确认适用范围', icon: 'anomaly', tone: 'orange' },
  { label: '参数变更', value: '0', unit: '项', hint: '待发布参数变更', icon: 'config', tone: 'purple' }
];

const configCategories = ['报告模板配置', '审计规范模板配置', '费用异常规则配置', '制度比对规则配置', '文件标签配置', '导出模板配置', 'AI 生成标识配置', '多模型复核配置', '系统参数配置'];
const builtinRows = [
  { name: '常规审计报告模板', type: '报告模板', version: 'V2.0.0', status: '内置待确认', module: '报告智能化', owner: '系统管理员', time: '2025-04-28 09:15' },
  { name: '费用异常规则', type: '费用规则', version: 'V2.1.0', status: '内置待启用', module: '费用审计分析', owner: '系统管理员', time: '2025-04-28 09:15' },
  { name: '制度比对规则', type: '比对规则', version: 'V1.3.0', status: '内置待确认', module: '制度比对', owner: '系统管理员', time: '2025-04-28 09:15' }
];

const initChecks = [
  { label: '报告模板', status: '待确认', icon: 'report', tone: 'orange' },
  { label: '费用规则', status: '待启用', icon: 'expense', tone: 'blue' },
  { label: '标签字典', status: '未配置', icon: 'files', tone: 'red' },
  { label: '权限角色', status: '已内置', icon: 'tasks', tone: 'green' },
  { label: 'AI 标识', status: '待设置', icon: 'config', tone: 'orange' }
];

const suggestions = [
  { title: '确认报告模板', desc: '确认模板结构与输出要求', icon: 'report', tone: 'blue' },
  { title: '启用费用规则', desc: '启用费用异常识别规则', icon: 'expense', tone: 'orange' },
  { title: '设置 AI 生成标识', desc: '配置报告 AI 标识与水印样式', icon: 'review', tone: 'green' },
  { title: '创建首个任务', desc: '创建审计任务并开始资料准备', icon: 'tasks', tone: 'orange' }
];

const ruleRows = [
  { name: '差旅费报销标准规则', module: '费用审计分析', version: 'V2.1.0', status: '已启用', tone: 'green', samples: '1,256', owner: '张伟', time: '2025-05-10 14:32' },
  { name: '业务招待费合规性规则', module: '费用审计分析', version: 'V3.0.2', status: '已启用', tone: 'green', samples: '897', owner: '李娜', time: '2025-05-09 10:11' },
  { name: '费用异常综合判定规则', module: '费用审计分析', version: 'V1.5.0', status: '试运行', tone: 'blue', samples: '532', owner: '王磊', time: '2025-05-08 16:45' },
  { name: '固定资产采购合规性规则', module: '费用审计分析', version: 'V1.2.3', status: '已停用', tone: 'gray', samples: '120', owner: '陈晨', time: '2025-04-28 09:20' },
  { name: '经纪业务外部制度比对规则', module: '制度比对', version: 'V2.0.1', status: '已启用', tone: 'green', samples: '2,134', owner: '赵强', time: '2025-05-07 11:05' },
  { name: '投行业务内部制度比对规则', module: '制度比对', version: 'V1.3.0', status: '试运行', tone: 'blue', samples: '643', owner: '刘洋', time: '2025-05-06 15:22' },
  { name: '制度缺失点判定规则', module: '制度比对', version: 'V1.1.0', status: '已启用', tone: 'green', samples: '1,021', owner: '张伟', time: '2025-04-30 17:30' },
  { name: '审计规范引用规则', module: '报告智能化', version: 'V2.2.0', status: '已启用', tone: 'green', samples: '3,542', owner: '李娜', time: '2025-05-11 09:18' },
  { name: '报告要点生成规则', module: '报告智能化', version: 'V1.6.2', status: '试运行', tone: 'blue', samples: '756', owner: '王磊', time: '2025-05-10 18:40' }
];

const visibleRuleRows = computed(() => ruleRows.slice(0, 8));

const versionHistory = [
  { version: 'V2.1.0', status: '已启用', owner: '张伟', time: '2025-05-10 14:32' },
  { version: 'V2.0.0', status: '已停用', owner: '张伟', time: '2025-04-20 10:15' },
  { version: 'V1.3.0', status: '已停用', owner: '李娜', time: '2025-03-28 16:22' }
];

const operationLogs = [
  { time: '05-10 14:32', user: '张伟', action: '更新规则 V2.1.0', result: '成功' },
  { time: '05-10 14:31', user: '张伟', action: '规则试运行', result: '成功' },
  { time: '05-10 16:05', user: '李娜', action: '复制规则版本', result: '成功' },
  { time: '05-08 10:21', user: '王磊', action: '停用规则 V2.0.0', result: '成功' }
];

const paramCategories = ['模型调用参数', '多模型复核参数', '敏感词参数', '生成失败重试', '任务超时控制', '版本保存策略', '导出水印参数', '日志保留周期'];
const paramFields = [
  { label: '默认模型', value: '智审大模型 v2.3（推荐）' },
  { label: '高风险复核模型', value: '智审增强模型 v2.2' },
  { label: '最大上下文长度', value: '32,000 tokens' },
  { label: '单次生成超时时间', value: '120 秒' },
  { label: '失败重试次数', value: '3 次' },
  { label: '生成结果保留天数', value: '180 天' },
  { label: '是否启用多模型复核', value: '已启用', kind: 'switch' },
  { label: '是否启用 AI 生成标识', value: '已启用', kind: 'switch' },
  { label: '敏感词命中处理方式', value: '脱敏并生成告警记录' }
];

const paramChangeRows = [
  { name: '默认模型', old: '智审大模型 v2.2', next: '智审大模型 v2.3', scope: '全局', review: '是' },
  { name: '最大上下文长度', old: '16,000 tokens', next: '32,000 tokens', scope: '全局', review: '是' },
  { name: '单次生成超时时间', old: '60 秒', next: '120 秒', scope: '全局', review: '是' },
  { name: '失败重试次数', old: '2 次', next: '3 次', scope: '全局', review: '是' },
  { name: '高风险复核模型', old: '智审增强模型 v2.1', next: '智审增强模型 v2.2', scope: '高风险任务', review: '是' },
  { name: '生成结果保留天数', old: '90 天', next: '180 天', scope: '全局', review: '是' },
  { name: '是否启用 AI 生成标识', old: '关闭', next: '开启', scope: '全局', review: '是' }
];

const paramVersions = [
  { version: 'V2.4.0', status: '已生效', time: '2025-04-28 10:12', owner: '李娜' },
  { version: 'V2.3.1', status: '已生效', time: '2025-04-10 16:45', owner: '王磊' },
  { version: 'V2.3.0', status: '已生效', time: '2025-03-20 09:30', owner: '张伟' },
  { version: 'V2.2.0', status: '已生效', time: '2025-02-28 14:18', owner: '赵强' },
  { version: 'V2.1.0', status: '已生效', time: '2025-01-15 11:05', owner: '陈晨' }
];
</script>

<style scoped>
.config-page {
  min-width: 0;
  min-height: 0;
  height: 0;
  max-width: 100%;
  overflow: hidden;
  color: #101828;
  font-size: var(--ui-font-xs);
}

.config-page.mode-initial,
.config-page.mode-records {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

.config-page.mode-params {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.tab-desc {
  display: block;
  margin-top: var(--ui-space-2);
  color: #667085;
  font-size: var(--ui-font-sm);
  line-height: 1.5;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.top-tabs button,
.toolbar button,
.param-actions button,
.empty-actions button,
.pager button,
.pager select,
.pager input,
.trace-block button {
  border: 1px solid #d6deea;
  border-radius: var(--ui-radius-sm);
  background: #fff;
  color: #344054;
}

.primary,
.pager button.active {
  border-color: var(--color-primary) !important;
  background: var(--color-primary) !important;
  color: #fff !important;
}

.top-tabs {
  display: flex;
  align-items: center;
  gap: var(--ui-space-6);
  min-height: calc(var(--ui-control-md) + var(--ui-space-3));
  padding: 0 var(--ui-space-5);
  border: 1px solid #e3e8ef;
  border-radius: var(--ui-radius-md) var(--ui-radius-md) 0 0;
  background: #fff;
  overflow-x: auto;
}

.top-tabs button {
  position: relative;
  height: calc(var(--ui-control-md) + var(--ui-space-3));
  border: 0;
  background: transparent;
  font-weight: 800;
  white-space: nowrap;
}

.top-tabs button.active {
  color: var(--color-primary);
}

.top-tabs button.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--ui-border-width);
  background: var(--color-primary);
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(130px, 1fr));
  gap: var(--ui-space-4);
  padding: var(--ui-page-gutter) var(--ui-space-5);
  border: 1px solid #e3e8ef;
  border-top: 0;
  background: #fff;
}

.metric-card {
  min-height: calc(var(--ui-control-md) + var(--ui-control-md) + var(--ui-page-gutter));
  display: flex;
  align-items: center;
  gap: var(--ui-page-gutter);
  padding: var(--ui-page-gutter) var(--ui-space-5);
  border: 1px solid #e3e8ef;
  border-radius: var(--ui-radius-md);
  background: #fff;
}

.metric-icon {
  width: calc(var(--ui-icon-lg) + var(--ui-icon-md));
  height: calc(var(--ui-icon-lg) + var(--ui-icon-md));
  flex: 0 0 calc(var(--ui-icon-lg) + var(--ui-icon-md));
  display: grid;
  place-items: center;
  border-radius: calc(var(--ui-radius-md) + var(--ui-radius-sm));
  font-size: var(--ui-icon-lg);
}

.red { color: #e52a2a; background: #fff0f0; }
.blue { color: var(--color-info); background: #edf5ff; }
.green { color: var(--color-success); background: #eaf8f1; }
.orange { color: var(--color-warning); background: #fff4e4; }
.purple { color: #6f668f; background: #f2edff; }
.gray { color: #667085; background: #f2f4f7; }

.metric-card p {
  color: #475467;
  font-size: var(--ui-font-sm);
}

.metric-card strong {
  display: block;
  margin-top: var(--ui-space-1);
  font-size: calc(var(--ui-font-xl) + var(--ui-space-2));
  line-height: 1;
}

.metric-card small {
  font-size: var(--ui-font-sm);
}

.metric-card em {
  display: block;
  margin-top: var(--ui-space-2);
  color: #667085;
  font-size: var(--ui-font-xs);
  font-style: normal;
}

.config-grid {
  display: grid;
  min-height: 0;
  gap: var(--ui-space-4);
  align-items: stretch;
}

.initial-grid {
  grid-template-columns: var(--ui-panel-rail-md) minmax(0, 1fr) var(--ui-panel-rail-lg);
  margin-top: var(--ui-space-4);
}

.records-grid {
  grid-template-columns: var(--ui-panel-rail-md) minmax(0, 1fr) var(--ui-panel-rail-lg);
  margin-top: var(--ui-space-3);
}

.params-grid {
  grid-template-columns: var(--ui-panel-rail-sm) minmax(0, 1fr) var(--ui-panel-rail-lg);
  margin-top: var(--ui-space-3);
}

.side-card,
.right-card,
.table-card,
.empty-panel,
.form-card {
  border: 1px solid #e3e8ef;
  border-radius: var(--ui-radius-md);
  background: #fff;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.04);
}

.side-card {
  min-height: 0;
  padding: var(--ui-page-gutter) var(--ui-space-4);
}

.side-card h3,
.right-card h3,
.table-card h3,
.form-card h3 {
  font-size: var(--ui-font-md);
}

.category-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: var(--ui-space-3);
  overflow: auto;
}

.category-card button {
  min-height: var(--ui-control-md);
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: #344054;
  text-align: left;
  font-weight: 700;
}

.category-card button span {
  white-space: nowrap;
}

.category-card button svg {
  flex: 0 0 auto;
}

.category-card button.active {
  color: var(--color-primary);
  background: #fff0f0;
}

.search-box {
  height: var(--ui-control-sm);
  display: flex;
  align-items: center;
  padding: 0 var(--ui-space-3);
  border: 1px solid #d6deea;
  border-radius: var(--ui-radius-sm);
  color: #98a2b3;
  font-size: var(--ui-font-xs);
}

.main-stack {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: var(--ui-space-4);
  min-width: 0;
}

.initial-grid .main-stack,
.params-grid .main-stack {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.empty-panel {
  min-height: calc(var(--ui-topbar-height) + var(--ui-topbar-height) + var(--ui-topbar-height) + var(--ui-topbar-height) + var(--ui-font-sm));
  display: grid;
  place-items: center;
  align-content: center;
  gap: var(--ui-space-4);
  padding: var(--ui-space-6);
  text-align: center;
}

.empty-art {
  position: relative;
  width: calc(var(--ui-space-6) + var(--ui-space-6) + var(--ui-space-6) + var(--ui-space-6));
  height: calc(var(--ui-space-6) + var(--ui-space-6) + var(--ui-space-6));
  display: grid;
  place-items: center;
  color: #ccd5e2;
  font-size: calc(var(--ui-icon-lg) + var(--ui-icon-lg) + var(--ui-space-3));
}

.empty-art span {
  position: absolute;
  right: var(--ui-space-1);
  bottom: 0;
  width: calc(var(--ui-icon-lg) + var(--ui-icon-md));
  height: calc(var(--ui-icon-lg) + var(--ui-icon-md));
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #aab4c4;
  background: #eef2f7;
  font-size: calc(var(--ui-font-lg) + var(--ui-space-2));
}

.empty-panel h3 {
  font-size: calc(var(--ui-font-lg) + var(--ui-space-2));
}

.empty-panel p {
  max-width: 620px;
  color: #667085;
  font-size: var(--ui-font-md);
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ui-space-4);
}

.empty-actions button {
  min-width: 128px;
  height: calc(var(--ui-control-md) + var(--ui-border-width) + var(--ui-border-width));
  font-weight: 800;
}

.table-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.table-scroll {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
}

.section-title {
  min-height: calc(var(--ui-control-md) + var(--ui-space-3));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-4);
  padding: 0 var(--ui-space-5);
}

.section-title span,
.trace-block h4 span {
  color: #667085;
  font-size: var(--ui-font-xs);
  font-weight: 400;
}

table {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: var(--ui-font-sm) var(--ui-space-3);
  border-top: 1px solid #edf1f5;
  text-align: center;
  font-size: var(--ui-font-xs);
  line-height: 1.45;
  vertical-align: middle;
  overflow-wrap: anywhere;
  word-break: normal;
  white-space: normal;
}

th {
  color: #1f2937;
  font-weight: 800;
  background: #f8fafc;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--ui-icon-sm) + var(--ui-space-2));
  padding: var(--ui-space-1) var(--ui-space-3);
  border-radius: var(--ui-radius-sm);
  font-weight: 800;
  white-space: nowrap;
}

.link-btn,
.op-cell button {
  border: 0;
  background: transparent;
  color: var(--color-info);
  font-weight: 800;
}

.trace-more {
  min-height: calc(var(--ui-icon-sm) + var(--ui-space-2));
  margin-top: var(--ui-space-2);
  padding: 0 var(--ui-space-2);
  border: 1px solid #d6e6ff !important;
  border-radius: var(--ui-radius-sm) !important;
  background: #fff !important;
  color: var(--color-info) !important;
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.op-cell {
  white-space: normal;
}

.op-cell button {
  display: inline-block;
  margin: var(--ui-border-width) var(--ui-space-1);
  font-size: var(--ui-font-xs);
}

.records-grid .data-panel table th,
.records-grid .data-panel table td {
  padding: var(--ui-space-3) var(--ui-space-1);
  font-size: var(--ui-font-xs);
  line-height: 1.42;
  overflow: hidden;
}

.records-grid .data-panel table th:nth-child(1),
.records-grid .data-panel table td:nth-child(1) { width: 18%; }
.records-grid .data-panel table th:nth-child(2),
.records-grid .data-panel table td:nth-child(2) { width: 12%; }
.records-grid .data-panel table th:nth-child(3),
.records-grid .data-panel table td:nth-child(3) { width: 8%; }
.records-grid .data-panel table th:nth-child(4),
.records-grid .data-panel table td:nth-child(4) { width: 9%; }
.records-grid .data-panel table th:nth-child(5),
.records-grid .data-panel table td:nth-child(5) { width: 10%; }
.records-grid .data-panel table th:nth-child(6),
.records-grid .data-panel table td:nth-child(6) { width: 9%; }
.records-grid .data-panel table th:nth-child(7),
.records-grid .data-panel table td:nth-child(7) { width: 15%; }
.records-grid .data-panel table th:nth-child(8),
.records-grid .data-panel table td:nth-child(8) { width: 19%; }

.records-grid .data-panel .op-cell button {
  margin: var(--ui-border-width) var(--ui-space-1);
  font-size: var(--ui-font-xs);
}

.pager {
  min-height: calc(var(--ui-control-md) + var(--ui-space-4));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-4);
  padding: var(--ui-space-3) var(--ui-page-gutter);
  border-top: 1px solid #edf1f5;
}

.pager > div {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.pager button {
  min-width: calc(var(--ui-icon-lg) + var(--ui-space-1));
  height: calc(var(--ui-icon-lg) + var(--ui-space-1));
}

.pager select,
.pager input {
  height: var(--ui-control-sm);
  padding: 0 var(--ui-space-3);
}

.pager input {
  width: calc(var(--ui-control-md) + var(--ui-space-4));
  text-align: center;
}

.right-card {
  min-width: 0;
  min-height: 0;
  padding: var(--ui-space-4);
  overflow-x: hidden;
  overflow-y: auto;
}

.right-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: calc(0px - var(--ui-space-4)) calc(0px - var(--ui-space-4)) var(--ui-space-2);
  padding: var(--ui-space-3) var(--ui-space-4);
  border-bottom: 1px solid #edf1f5;
}

.right-card header button,
.ghost {
  border: 0;
  background: transparent;
  color: #667085;
}

.check-list {
  display: grid;
  gap: var(--ui-space-3);
  margin: var(--ui-space-4) 0 var(--ui-space-5);
  padding: 0;
  list-style: none;
}

.check-list li {
  display: grid;
  grid-template-columns: calc(var(--ui-icon-sm) + var(--ui-space-2)) minmax(0, 1fr) auto;
  gap: var(--ui-space-3);
  align-items: center;
  min-height: var(--ui-control-md);
}

.check-list em {
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  font-style: normal;
  font-weight: 800;
  font-size: var(--ui-font-xs);
}

.suggest-card {
  display: grid;
  grid-template-columns: calc(var(--ui-icon-lg) + var(--ui-space-1)) minmax(0, 1fr) var(--ui-font-xs);
  gap: var(--ui-space-3);
  align-items: center;
  min-height: var(--ui-topbar-height);
  margin-top: var(--ui-space-3);
  padding: var(--ui-space-3);
  border: 1px solid #edf1f5;
  border-radius: var(--ui-radius-md);
}

.suggest-card > span {
  font-size: var(--ui-font-xl);
  background: transparent;
}

.suggest-card p,
.info-note,
.trace-block p {
  color: #667085;
  font-size: var(--ui-font-xs);
  line-height: 1.55;
}

.info-note {
  margin-top: auto;
  padding: var(--ui-space-4);
  border-radius: var(--ui-radius-sm);
  background: #f5f9ff;
}

.toolbar,
.param-head {
  display: flex;
  justify-content: space-between;
  gap: var(--ui-space-4);
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
}

.toolbar {
  padding: var(--ui-page-gutter);
  border-bottom: 1px solid #edf1f5;
}

.toolbar > div,
.param-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
  align-items: center;
  min-width: 0;
}

.toolbar button,
.toolbar input,
.toolbar select,
.param-actions button {
  min-height: calc(var(--ui-control-sm) + var(--ui-border-width) + var(--ui-border-width));
  padding: 0 var(--ui-space-4);
}

.toolbar input {
  width: calc(var(--ui-panel-rail-sm) - var(--ui-space-5));
  border: 1px solid #d6deea;
  border-radius: var(--ui-radius-sm);
}

.trace-block {
  padding: var(--ui-space-2) 0;
  border-bottom: 1px solid #edf1f5;
}

.trace-block h4 {
  margin-bottom: var(--ui-space-1);
  font-size: var(--ui-font-sm);
  white-space: nowrap;
}

.mini-table th,
.mini-table td {
  padding: var(--ui-space-1) var(--ui-space-1);
  font-size: var(--ui-font-xs);
  line-height: 1.24;
}

.trace-side .mini-table,
.param-side .mini-table {
  table-layout: auto;
}

.trace-side .mini-table th,
.trace-side .mini-table td,
.param-side .mini-table th,
.param-side .mini-table td {
  white-space: normal;
  overflow-wrap: anywhere;
  overflow: hidden;
  text-overflow: clip;
}

.trace-side .trace-block {
  padding: var(--ui-space-1) 0;
}

.trace-side .trace-block p,
.param-side .trace-block p {
  margin: 0;
  line-height: 1.35;
}

.param-side .trace-block {
  padding: var(--ui-space-3) 0;
}

.param-side .trace-block h4 {
  margin-bottom: var(--ui-space-2);
}

.version-current {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--ui-space-3);
  align-items: end;
}

.version-current p {
  margin: 0 0 var(--ui-space-1) !important;
  line-height: 1.5 !important;
}

.version-current button,
.version-actions button {
  min-height: calc(var(--ui-icon-lg) + var(--ui-border-width) + var(--ui-border-width));
  padding: 0 var(--ui-space-3);
  border: 1px solid #d6deea;
  border-radius: var(--ui-radius-sm);
  background: #fff;
  color: #344054;
  font-size: var(--ui-font-xs);
  font-weight: 800;
  white-space: nowrap;
}

.version-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ui-space-3);
  margin-top: var(--ui-space-2);
}

.log-more {
  display: block;
  width: fit-content;
  min-height: var(--ui-icon-lg);
  margin: var(--ui-space-2) auto 0;
  border: 0 !important;
  background: transparent !important;
  color: var(--color-info) !important;
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--ui-space-3);
}

.review-actions button {
  min-width: 86px;
  min-height: calc(var(--ui-icon-lg) + var(--ui-space-1));
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.success {
  color: var(--color-success);
  font-weight: 800;
}

.param-head {
  margin-bottom: var(--ui-space-3);
}

.param-tabs {
  flex: 1;
  min-width: 0;
}

.param-actions span {
  color: var(--color-warning);
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.danger-lite {
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
}

.form-card {
  padding: var(--ui-space-5);
}

.param-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(var(--ui-panel-rail-md), 1fr));
  gap: var(--ui-space-5) calc(var(--ui-space-6) + var(--ui-space-3));
  margin-top: var(--ui-space-5);
}

.param-form label {
  display: grid;
  grid-template-columns: calc(var(--ui-panel-rail-sm) - var(--ui-space-6) - var(--ui-space-2)) minmax(0, 1fr);
  gap: var(--ui-space-4);
  align-items: center;
}

.param-form span {
  font-weight: 800;
  font-size: var(--ui-font-xs);
}

.param-form input {
  height: calc(var(--ui-control-sm) + var(--ui-space-1));
  border: 1px solid #d6deea;
  border-radius: var(--ui-radius-sm);
  padding: 0 var(--ui-space-4);
  color: #344054;
  background: #fff;
}

.switch {
  width: 78px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-3);
  color: #344054;
  font-size: var(--ui-font-xs);
  font-style: normal;
}

.switch i {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 99px;
  background: var(--color-primary);
}

.switch i::after {
  content: "";
  position: absolute;
  right: 2px;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
}

.form-note {
  margin-top: var(--ui-space-5);
  padding: var(--ui-space-4);
  border: 1px solid #edf1f5;
  border-radius: var(--ui-radius-sm);
  color: var(--color-info);
  background: #f8fbff;
  font-weight: 700;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.chips span {
  padding: var(--ui-space-1) var(--ui-space-3);
  border: 1px solid #d6deea;
  border-radius: var(--ui-radius-sm);
  color: #667085;
  background: #fff;
  font-size: var(--ui-font-xs);
}

.review-box button {
  width: 100%;
  min-height: calc(var(--ui-control-sm) + var(--ui-border-width) + var(--ui-border-width));
  margin-top: var(--ui-space-3);
}

@media (max-width: 1280px) {
  .records-grid,
  .params-grid {
    grid-template-columns: 184px minmax(0, 1fr) 292px;
  }

  th,
  td {
    padding: 10px 5px;
    font-size: 10.5px;
  }

  .op-cell button,
  .link-btn {
    font-size: 10.5px;
  }

  .right-card {
    padding: 12px;
  }
}

@media (max-width: 1180px) {
  .initial-grid,
  .records-grid,
  .params-grid {
    grid-template-columns: 1fr;
  }

  .metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-card {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-card h3,
  .search-box {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .toolbar,
  .param-head,
  .pager {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-strip,
  .param-form,
  .category-card {
    grid-template-columns: 1fr;
  }

  .param-form label {
    grid-template-columns: 1fr;
  }
}
</style>
