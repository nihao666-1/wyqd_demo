<template>
  <div class="config-page" :class="`mode-${currentMode}`">
    <header class="page-head">
      <h2>{{ pageMeta.title }}</h2>
      <span>{{ pageMeta.desc }}</span>
      <button class="initial-return" type="button" @click="goInitial">初始状态</button>
    </header>

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

    <template v-else-if="currentMode === 'records'">
      <nav class="top-tabs wide">
        <button v-for="tab in recordTabs" :key="tab" :class="{ active: tab === '规则配置' }" type="button">{{ tab }}</button>
      </nav>
      <p class="tab-desc">用于管理审计分析、费用审计、制度比对等模块的规则配置与版本，支持启用、停用、试运行与版本管理。</p>

      <div class="config-grid records-grid">
        <aside class="side-card category-card">
          <h3>配置分类</h3>
          <label class="search-box">搜索配置项</label>
          <button
            v-for="item in configCategories.slice(0, 8)"
            :key="item"
            type="button"
            :class="{ active: item === '费用异常规则配置' }"
          >
            <AuditIcon name="records" />
            <span>{{ item }}</span>
          </button>
        </aside>

        <main class="table-card data-panel">
          <div class="toolbar">
            <div>
              <button class="primary" type="button">新增规则</button>
              <button type="button">复制版本</button>
              <button type="button">规则试运行</button>
            </div>
            <div>
              <label>状态：<select><option>全部</option></select></label>
              <input placeholder="搜索规则名称" readonly />
              <button type="button">重置</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>规则名称</th>
                <th>适用模块</th>
                <th>版本号</th>
                <th>状态</th>
                <th>命中样例</th>
                <th>最近修改人</th>
                <th>修改时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in visibleRuleRows" :key="row.name">
                <td>{{ row.name }}</td>
                <td>{{ row.module }}</td>
                <td>{{ row.version }}</td>
                <td><span class="tag" :class="row.tone">{{ row.status }}</span></td>
                <td>{{ row.samples }}</td>
                <td>{{ row.owner }}</td>
                <td>{{ row.time }}</td>
                <td class="op-cell"><button>查看</button><button>复制</button><button>{{ row.status === '已启用' ? '停用' : '启用' }}</button><button>日志</button></td>
              </tr>
            </tbody>
          </table>
          <footer class="pager">
            <span>共 28 条</span>
            <div><button type="button">‹</button><button class="active" type="button">1</button><button>2</button><button>3</button><button>›</button><select><option>10 条/页</option></select><span>跳至</span><input value="1" readonly /><span>页</span></div>
          </footer>
        </main>

        <aside class="right-card trace-side">
          <header><h3>变更与留痕</h3><button type="button">×</button></header>
          <section class="trace-block">
            <h4>版本历史 <span>差旅费报销标准规则</span></h4>
            <table class="mini-table">
              <thead><tr><th>版本号</th><th>状态</th><th>修改人</th><th>修改时间</th></tr></thead>
              <tbody><tr v-for="item in versionHistory" :key="item.version"><td>{{ item.version }}</td><td><span class="tag green">{{ item.status }}</span></td><td>{{ item.owner }}</td><td>{{ item.time }}</td></tr></tbody>
            </table>
            <button class="trace-more" type="button">查看全部版本 ›</button>
          </section>
          <section class="trace-block">
            <h4>操作日志 <span>近 7 天</span></h4>
            <table class="mini-table">
              <tbody><tr v-for="item in operationLogs" :key="item.time"><td>{{ item.time }}</td><td>{{ item.user }}</td><td>{{ item.action }}</td><td class="success">{{ item.result }}</td></tr></tbody>
            </table>
            <button class="trace-more" type="button">查看全部日志 ›</button>
          </section>
          <section class="trace-block">
            <h4>复核意见</h4>
            <table class="mini-table">
              <tbody><tr><td>赵强</td><td>规则逻辑清晰，判定准确，建议启用。</td><td class="success">通过</td></tr><tr><td>刘洋</td><td>补充了特殊场景说明，建议更新示例。</td><td class="success">通过</td></tr></tbody>
            </table>
            <button class="trace-more" type="button">查看全部复核 ›</button>
          </section>
          <section class="trace-block">
            <h4>导出记录 <span>近 7 天</span></h4>
            <table class="mini-table">
              <tbody><tr><td>05-10 16:20</td><td>差旅费报销标准规则 V2.1.0</td><td>Excel</td><td class="success">成功</td></tr><tr><td>05-09 11:12</td><td>费用异常综合判定规则 V1.5.0</td><td>PDF</td><td class="success">成功</td></tr></tbody>
            </table>
            <button class="trace-more" type="button">查看全部导出 ›</button>
          </section>
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
import { useRoute, useRouter } from 'vue-router';
import AuditIcon from '../../components/common/AuditIcon.vue';

const pageModes = [
  { key: 'initial', label: '初始状态' },
  { key: 'records', label: '配置与记录' },
  { key: 'params', label: '系统参数' }
];

const route = useRoute();
const router = useRouter();

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

function goInitial() {
  router.push('/config');
}

const pageMeta = computed(() => {
  if (currentMode.value === 'records') {
    return { eyebrow: '配置中心', title: '配置与记录中心', desc: '统一管理模板、规则、标签、权限，以及版本记录、操作留痕、导出记录和复核记录。' };
  }
  if (currentMode.value === 'params') {
    return { eyebrow: '配置中心', title: '系统参数配置', desc: '管理模型、文件、安全、通知、导出与审计留痕参数，确保参数变更可复核、可追溯。' };
  }
  return { eyebrow: '审计工作台 / 配置中心', title: '配置中心', desc: '集中管理模板、规则、标签、权限与系统参数，支持启用、停用、版本管理与操作追溯。' };
});

const setupTabs = ['模板配置', '规则配置', '标签配置', '权限配置', '系统参数配置'];
const recordTabs = ['模板配置', '规则配置', '标签配置', '权限配置', '版本记录', '操作留痕', '导出记录', '复核记录'];
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
  max-width: 100%;
  overflow-x: hidden;
  color: #101828;
}

.page-head {
  display: flex;
  align-items: center;
  gap: 22px;
  min-height: 48px;
  margin: -2px 0 12px;
  padding: 0 6px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.page-head h2 {
  flex: 0 0 auto;
  font-size: 22px;
  line-height: 1.2;
}

.page-head span,
.tab-desc {
  display: block;
  margin-top: 6px;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}

.page-head span {
  flex: 1;
  min-width: 0;
  margin-top: 0;
}

.initial-return {
  min-width: 92px;
  height: 34px;
  border: 1px solid #d6deea;
  border-radius: 5px;
  background: #fff;
  color: #344054;
  font-weight: 800;
}

.mode-initial .initial-return {
  border-color: #c40000;
  background: #c40000;
  color: #fff;
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
  border-radius: 5px;
  background: #fff;
  color: #344054;
}

.primary,
.pager button.active {
  border-color: #c40000 !important;
  background: #c40000 !important;
  color: #fff !important;
}

.top-tabs {
  display: flex;
  align-items: center;
  gap: 28px;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid #e3e8ef;
  border-radius: 6px 6px 0 0;
  background: #fff;
  overflow-x: auto;
}

.top-tabs button {
  position: relative;
  height: 44px;
  border: 0;
  background: transparent;
  font-weight: 800;
  white-space: nowrap;
}

.top-tabs button.active {
  color: #d00000;
}

.top-tabs button.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: #d00000;
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(130px, 1fr));
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e3e8ef;
  border-top: 0;
  background: #fff;
}

.metric-card {
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid #e3e8ef;
  border-radius: 6px;
  background: #fff;
}

.metric-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 24px;
}

.red { color: #e52a2a; background: #fff0f0; }
.blue { color: #1f7aff; background: #edf5ff; }
.green { color: #16a36a; background: #eaf8f1; }
.orange { color: #ff8a00; background: #fff4e4; }
.purple { color: #7657ff; background: #f2edff; }
.gray { color: #667085; background: #f2f4f7; }

.metric-card p {
  color: #475467;
  font-size: 13px;
}

.metric-card strong {
  display: block;
  margin-top: 5px;
  font-size: 26px;
  line-height: 1;
}

.metric-card small {
  font-size: 13px;
}

.metric-card em {
  display: block;
  margin-top: 7px;
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.config-grid {
  display: grid;
  gap: 12px;
  align-items: stretch;
}

.initial-grid {
  grid-template-columns: 200px minmax(0, 1fr) 300px;
  margin-top: 12px;
}

.records-grid {
  grid-template-columns: 190px minmax(0, 1fr) 300px;
  margin-top: 10px;
}

.params-grid {
  grid-template-columns: 168px minmax(0, 1fr) 300px;
  margin-top: 10px;
}

.side-card,
.right-card,
.table-card,
.empty-panel,
.form-card {
  border: 1px solid #e3e8ef;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.04);
}

.side-card {
  padding: 14px 12px;
}

.side-card h3,
.right-card h3,
.table-card h3,
.form-card h3 {
  font-size: 14px;
}

.category-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-card button {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 0;
  border-radius: 5px;
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
  color: #d00000;
  background: #fff0f0;
}

.search-box {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid #d6deea;
  border-radius: 5px;
  color: #98a2b3;
  font-size: 12px;
}

.main-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.empty-panel {
  min-height: 245px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.empty-art {
  position: relative;
  width: 96px;
  height: 72px;
  display: grid;
  place-items: center;
  color: #ccd5e2;
  font-size: 58px;
}

.empty-art span {
  position: absolute;
  right: 5px;
  bottom: 0;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #aab4c4;
  background: #eef2f7;
  font-size: 22px;
}

.empty-panel h3 {
  font-size: 22px;
}

.empty-panel p {
  max-width: 620px;
  color: #667085;
  font-size: 14px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.empty-actions button {
  min-width: 128px;
  height: 38px;
  font-weight: 800;
}

.table-card {
  min-width: 0;
  overflow: hidden;
}

.section-title {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
}

.section-title span,
.trace-block h4 span {
  color: #667085;
  font-size: 12px;
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
  padding: 13px 10px;
  border-top: 1px solid #edf1f5;
  text-align: center;
  font-size: 12px;
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
  min-height: 22px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 800;
  white-space: nowrap;
}

.link-btn,
.op-cell button {
  border: 0;
  background: transparent;
  color: #1f7aff;
  font-weight: 800;
}

.trace-more {
  min-height: 22px;
  margin-top: 6px;
  padding: 0 7px;
  border: 1px solid #d6e6ff !important;
  border-radius: 4px !important;
  background: #fff !important;
  color: #1f7aff !important;
  font-size: 11px;
  font-weight: 800;
}

.op-cell {
  white-space: normal;
}

.op-cell button {
  display: inline-block;
  margin: 2px 3px;
  font-size: 11px;
}

.records-grid .data-panel table th,
.records-grid .data-panel table td {
  padding: 11px 4px;
  font-size: 10.2px;
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
  margin: 1px 2px;
  font-size: 10px;
}

.pager {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 14px;
  border-top: 1px solid #edf1f5;
}

.pager > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.pager button {
  min-width: 28px;
  height: 28px;
}

.pager select,
.pager input {
  height: 30px;
  padding: 0 10px;
}

.pager input {
  width: 48px;
  text-align: center;
}

.right-card {
  min-width: 0;
  padding: 12px;
}

.right-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -12px -12px 6px;
  padding: 10px 12px;
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
  gap: 9px;
  margin: 12px 0 18px;
  padding: 0;
  list-style: none;
}

.check-list li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 36px;
}

.check-list em {
  padding: 3px 7px;
  border-radius: 4px;
  font-style: normal;
  font-weight: 800;
  font-size: 12px;
}

.suggest-card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 12px;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #edf1f5;
  border-radius: 6px;
}

.suggest-card > span {
  font-size: 20px;
  background: transparent;
}

.suggest-card p,
.info-note,
.trace-block p {
  color: #667085;
  font-size: 12px;
  line-height: 1.55;
}

.info-note {
  margin-top: 18px;
  padding: 12px;
  border-radius: 5px;
  background: #f5f9ff;
}

.toolbar,
.param-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
}

.toolbar {
  padding: 14px;
  border-bottom: 1px solid #edf1f5;
}

.toolbar > div,
.param-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.toolbar button,
.toolbar input,
.toolbar select,
.param-actions button {
  min-height: 32px;
  padding: 0 12px;
}

.toolbar input {
  width: 150px;
  border: 1px solid #d6deea;
  border-radius: 5px;
}

.trace-block {
  padding: 6px 0;
  border-bottom: 1px solid #edf1f5;
}

.trace-block h4 {
  margin-bottom: 4px;
  font-size: 13px;
  white-space: nowrap;
}

.mini-table th,
.mini-table td {
  padding: 5px 5px;
  font-size: 10.3px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}

.trace-side .trace-block {
  padding: 5px 0;
}

.trace-side .trace-block p,
.param-side .trace-block p {
  margin: 0;
  line-height: 1.35;
}

.param-side .trace-block {
  padding: 8px 0;
}

.param-side .trace-block h4 {
  margin-bottom: 6px;
}

.version-current {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
}

.version-current p {
  margin: 0 0 5px !important;
  line-height: 1.5 !important;
}

.version-current button,
.version-actions button {
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid #d6deea;
  border-radius: 4px;
  background: #fff;
  color: #344054;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.version-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 7px;
}

.log-more {
  display: block;
  width: fit-content;
  min-height: 24px;
  margin: 7px auto 0;
  border: 0 !important;
  background: transparent !important;
  color: #1f7aff !important;
  font-size: 11px;
  font-weight: 800;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.review-actions button {
  min-width: 86px;
  min-height: 28px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
}

.success {
  color: #16a36a;
  font-weight: 800;
}

.param-head {
  margin-bottom: 10px;
}

.param-tabs {
  flex: 1;
  min-width: 0;
}

.param-actions span {
  color: #ff8a00;
  font-size: 12px;
  font-weight: 800;
}

.danger-lite {
  border-color: #d00000 !important;
  color: #d00000 !important;
}

.form-card {
  padding: 18px;
}

.param-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px 34px;
  margin-top: 16px;
}

.param-form label {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.param-form span {
  font-weight: 800;
  font-size: 12px;
}

.param-form input {
  height: 34px;
  border: 1px solid #d6deea;
  border-radius: 5px;
  padding: 0 12px;
  color: #344054;
  background: #fff;
}

.switch {
  width: 78px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #344054;
  font-size: 12px;
  font-style: normal;
}

.switch i {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 99px;
  background: #c40000;
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
  margin-top: 18px;
  padding: 12px;
  border: 1px solid #edf1f5;
  border-radius: 5px;
  color: #1f7aff;
  background: #f8fbff;
  font-weight: 700;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.chips span {
  padding: 5px 8px;
  border: 1px solid #d6deea;
  border-radius: 4px;
  color: #667085;
  background: #fff;
  font-size: 11px;
}

.review-box button {
  width: 100%;
  min-height: 32px;
  margin-top: 10px;
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
  .page-head,
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
