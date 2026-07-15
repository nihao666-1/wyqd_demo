<template>
  <div class="file-center route-fill-page" :class="{ 'file-empty': isEmptyMode, 'is-data-view': !isEmptyMode }" :data-demo-mode="demoDataMode">
    <section v-if="isEmptyView" class="empty-layout">
      <main class="main-stack">
        <section class="panel filter-panel">
          <div class="filter-grid empty-filter-grid">
            <label v-for="field in emptyFilters" :key="field.label">
              <span>{{ field.label }}</span>
              <input v-if="field.kind === 'input'" :placeholder="field.placeholder" />
              <select v-else>
                <option v-for="option in field.options" :key="option">{{ option }}</option>
              </select>
            </label>
            <div class="filter-actions">
              <button class="primary" type="button" @click="showNotice('已按当前条件查询，当前文件库暂无文件。')">查询</button>
              <button type="button" @click="showNotice('筛选条件已重置。')">重置</button>
              <button class="outline-danger" type="button" @click="showNotice('已打开上传文件入口。')">上传文件</button>
            </div>
          </div>

          <div class="metric-strip">
            <article v-for="item in emptyMetrics" :key="item.label" class="metric-tile">
              <span class="metric-icon" :class="item.tone"><AuditIcon :name="item.icon" /></span>
              <div>
                <p>{{ item.label }}</p>
                <strong>{{ item.value }} <small>个</small></strong>
              </div>
            </article>
          </div>
        </section>

        <section class="panel list-panel">
          <nav class="asset-tabs" aria-label="文件分类">
            <button
              v-for="tab in emptyAssetTabs"
              :key="tab"
              type="button"
              :class="{ active: activeAssetTab === tab }"
              @click="activeAssetTab = tab"
            >
              {{ tab }}
            </button>
          </nav>

          <div class="table-shell">
            <table class="file-table empty-table">
              <thead>
                <tr>
                  <th class="check-col"><input type="checkbox" aria-label="全选" /></th>
                  <th>文件名称</th>
                  <th>文件类型</th>
                  <th>所属单位</th>
                  <th>来源</th>
                  <th>上传时间</th>
                  <th>解析状态</th>
                  <th>引用次数</th>
                  <th>权限范围</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="10">
                    <div class="empty-state-card">
                      <div class="empty-illustration" aria-hidden="true">
                        <span class="box-lid"></span>
                        <span class="box-body"></span>
                        <span class="paper one"></span>
                        <span class="paper two"></span>
                      </div>
                      <h3>文件库为空</h3>
                      <p>
                        上传制度文件、费用数据、监督共享文件、报告模板或生成报告后，
                        可在这里统一管理解析状态、引用关系和权限范围。
                      </p>
                      <div class="empty-actions">
                        <button class="primary" type="button" @click="showNotice('已进入上传文件流程。')">
                          <AuditIcon name="upload" />上传文件
                        </button>
                        <button type="button" @click="showNotice('已进入上传文件夹流程。')">
                          <AuditIcon name="files" />上传文件夹
                        </button>
                        <button type="button" @click="showNotice('已打开从任务导入面板。')">
                          <AuditIcon name="report-generate" />从任务导入
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pager">
            <span>共 0 条</span>
            <div>
              <button type="button" disabled>‹</button>
              <button class="active" type="button">1</button>
              <button type="button" disabled>›</button>
              <select aria-label="每页条数"><option>10 条/页</option></select>
              <span>跳至</span>
              <input value="1" aria-label="页码" readonly />
              <span>页</span>
            </div>
          </footer>
        </section>
      </main>

      <aside class="side-rail">
        <section class="rail-card flow-card">
          <h3>文件接入流程</h3>
          <ol>
            <li v-for="step in accessFlow" :key="step.title" :class="step.tone">
              <span class="flow-icon"><AuditIcon :name="step.icon" /></span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.desc }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="rail-card">
          <h3>支持格式</h3>
          <div class="format-grid">
            <article v-for="item in formats" :key="item.name">
              <span class="file-badge" :class="item.tone">{{ item.short }}</span>
              <strong>{{ item.name }}</strong>
              <p>{{ item.ext }}</p>
            </article>
          </div>
        </section>

        <section class="rail-card">
          <h3>说明</h3>
          <ul class="note-list">
            <li>单个文件最大 500MB</li>
            <li>单次最多可上传 20 个文件</li>
            <li>解析状态将影响文件引用与分析结果</li>
          </ul>
        </section>
      </aside>
    </section>

    <section v-else class="data-layout">
      <main class="main-stack">
        <section class="panel data-filter-panel">
          <nav class="top-tabs" aria-label="文件中心功能">
            <button
              v-for="tab in topTabs"
              :key="tab.key"
              type="button"
              :class="{ active: activeTopTab === tab.key }"
              @click="selectTopTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </nav>

          <div class="subpage-summary">
            <strong>{{ activeTopTabInfo.title }}</strong>
            <span>{{ activeTopTabInfo.desc }}</span>
          </div>

          <div class="filter-grid data-filter-grid">
            <label v-for="field in dataFilters" :key="field.label" :class="{ wide: field.kind === 'date' }">
              <span>{{ field.label }}</span>
              <input v-if="field.kind === 'input'" :placeholder="field.placeholder" />
              <div v-else-if="field.kind === 'date'" class="date-range">
                <input value="开始日期" readonly />
                <b>~</b>
                <input value="结束日期" readonly />
              </div>
              <select v-else>
                <option v-for="option in field.options" :key="option">{{ option }}</option>
              </select>
            </label>
            <div class="filter-actions">
              <button class="primary" type="button" @click="showNotice('文件列表已按筛选条件刷新。')">查询</button>
              <button type="button" @click="showNotice('筛选条件已重置。')">重置</button>
            </div>
          </div>
        </section>

        <section class="panel list-panel">
          <nav class="asset-tabs data-tabs" aria-label="文件类型分类">
            <button
              v-for="tab in dataAssetTabs"
              :key="tab.name"
              type="button"
              :class="{ active: activeAssetTab === tab.name }"
              @click="activeAssetTab = tab.name"
            >
              {{ tab.name }} <span>{{ tab.count }}</span>
            </button>
          </nav>

          <div class="table-shell">
            <table class="file-table data-table">
              <colgroup>
                <col class="col-check" />
                <col class="col-name" />
                <col class="col-type" />
                <col class="col-unit" />
                <col class="col-source" />
                <col class="col-uploader" />
                <col class="col-time" />
                <col class="col-status" />
                <col class="col-refs" />
                <col class="col-permission" />
                <col class="col-ops" />
              </colgroup>
              <thead>
                <tr>
                  <th class="check-col"><input type="checkbox" aria-label="全选" /></th>
                  <th>文件名称</th>
                  <th>文件类型</th>
                  <th>所属单位</th>
                  <th>来源</th>
                  <th>上传人</th>
                  <th>上传时间</th>
                  <th>解析状态</th>
                  <th>引用次数</th>
                  <th>权限范围</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in files" :key="file.id" :class="{ selected: selectedFile.id === file.id }">
                  <td><input type="checkbox" :aria-label="`选择 ${file.name}`" /></td>
                  <td>
                    <div class="file-name">
                      <span class="file-badge" :class="file.tone">{{ file.ext }}</span>
                      <div>
                        <strong :title="file.name">{{ file.name }}</strong>
                        <small>{{ file.size }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ file.type }}</td>
                  <td>{{ file.unit }}</td>
                  <td>{{ file.source }}</td>
                  <td>{{ file.uploader }}</td>
                  <td>{{ file.time }}</td>
                  <td><span class="state-tag" :class="file.statusTone">{{ file.status }}</span></td>
                  <td>{{ file.refs }}</td>
                  <td>{{ file.permission }}</td>
                  <td class="ops">
                    <button type="button" @click="selectFile(file, '查看文件详情')">查看</button>
                    <button type="button" @click="showNotice(`已下载：${file.name}`)">下载</button>
                    <span class="more-menu">
                      <button type="button" @click="toggleMore(file.id)">更多⌄</button>
                      <span v-if="expandedMoreFileId === file.id" class="more-popover">
                        <button type="button" @click="selectFile(file, '已加入任务')">加入任务</button>
                        <button type="button" @click="selectFile(file, '查看引用关系')">查看引用</button>
                        <button class="danger-link" type="button" @click="selectFile(file, '作废前已触发引用校验')">作废文件</button>
                      </span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pager">
            <span>共 2,356 条</span>
            <div>
              <button type="button">‹</button>
              <button class="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">4</button>
              <button type="button">5</button>
              <span>...</span>
              <button type="button">236</button>
              <button type="button">›</button>
              <select aria-label="每页条数"><option>10 条/页</option></select>
              <span>跳至</span>
              <input value="1" aria-label="页码" readonly />
              <span>页</span>
            </div>
          </footer>
        </section>
      </main>

      <aside class="reference-rail">
        <header>
          <h3>文件引用详情</h3>
          <button type="button" aria-label="关闭详情" @click="showNotice('已关闭文件引用详情面板。')">×</button>
        </header>

        <section class="file-profile">
          <span class="large-file-badge" :class="selectedFile.tone">{{ selectedFile.ext }}</span>
          <div>
            <h4>{{ selectedFile.name }}</h4>
            <p>{{ selectedFile.type }} · {{ selectedFile.size }} · 上传于 {{ selectedFile.time }}</p>
            <p>解析状态：<span class="state-tag" :class="selectedFile.statusTone">{{ selectedFile.status }}</span></p>
          </div>
        </section>

        <div class="detail-actions">
          <button class="primary" type="button" @click="showNotice(`已将 ${selectedFile.name} 加入审计任务。`)">加入任务</button>
          <button type="button" @click="showNotice(`已定位 ${selectedFile.name} 的引用关系。`)">查看引用</button>
          <button class="danger" type="button" @click="showNotice(`作废 ${selectedFile.name} 前需完成引用校验。`)">作废</button>
        </div>

        <section class="ref-block">
          <div class="block-title">
            <h4>引用的任务（{{ selectedFile.taskRefs.length }}）</h4>
            <button type="button" @click="showNotice('已打开全部任务引用列表。')">全部查看</button>
          </div>
          <article v-for="item in selectedFile.taskRefs" :key="item.title">
            <strong>{{ item.title }}</strong>
            <p>引用时间：{{ item.time }} <span>引用次数：{{ item.count }}</span></p>
          </article>
          <button class="more-btn" type="button" @click="showNotice('已展开更多任务引用。')">展开更多⌄</button>
        </section>

        <section class="ref-block">
          <div class="block-title">
            <h4>引用的报告章节（{{ selectedFile.reportRefs.length }}）</h4>
            <button type="button" @click="showNotice('已打开全部报告章节引用。')">全部查看</button>
          </div>
          <article v-for="item in selectedFile.reportRefs" :key="item.title">
            <strong>{{ item.title }}</strong>
            <p>引用时间：{{ item.time }}</p>
          </article>
          <button class="more-btn" type="button" @click="showNotice('已展开更多报告章节。')">展开更多⌄</button>
        </section>

        <section class="ref-block compact">
          <div class="block-title">
            <h4>来源快照</h4>
            <button type="button" @click="showNotice('已打开来源原文快照。')">查看原文</button>
          </div>
          <p>来源：{{ selectedFile.snapshot.source }}</p>
          <p>发布时间：{{ selectedFile.snapshot.publishAt }}　最新更新：{{ selectedFile.snapshot.updateAt }}</p>
        </section>

        <section class="ref-block compact">
          <h4>解析元数据</h4>
          <p>解析模型：{{ selectedFile.metadata.model }}</p>
          <p>解析时间：{{ selectedFile.metadata.time }}</p>
          <p>抽取页数：{{ selectedFile.metadata.pages }}　条款数量：{{ selectedFile.metadata.clauses }}</p>
          <p>关键词：{{ selectedFile.metadata.keywords }}</p>
        </section>

        <section class="ref-block history-block">
          <div class="block-title">
            <h4>操作历史</h4>
            <button type="button" @click="showNotice('已打开全部操作历史。')">全部查看</button>
          </div>
          <table>
            <thead>
              <tr><th>操作人</th><th>操作时间</th><th>操作</th><th>结果</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedFile.history" :key="`${item.user}-${item.time}-${item.action}`">
                <td>{{ item.user }}</td>
                <td>{{ item.time }}</td>
                <td>{{ item.action }}</td>
                <td class="ok">{{ item.result }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import AuditIcon from '../../components/common/AuditIcon.vue';

const store = inject('store');
const activeAssetTab = ref('制度文件');
const activeTopTab = ref('manage');
const notice = ref('');
const expandedMoreFileId = ref('');

const isEmptyMode = computed(() => store.demoDataMode === 'empty');
const isEmptyView = isEmptyMode;
const demoDataMode = computed(() => (isEmptyMode.value ? 'empty' : 'data'));

watch(isEmptyMode, (empty) => {
  activeAssetTab.value = empty ? '制度文件' : '全部文件';
});

const optionAll = ['全部'];
const emptyFilters = [
  { label: '文件名称', kind: 'input', placeholder: '请输入文件名称' },
  { label: '文件类型', options: optionAll },
  { label: '所属单位', options: optionAll },
  { label: '来源', options: optionAll },
  { label: '上传人', kind: 'input', placeholder: '请输入上传人' },
  { label: '解析状态', options: optionAll },
  { label: '权限范围', options: optionAll }
];

const dataFilters = [
  { label: '文件名称', kind: 'input', placeholder: '请输入文件名称' },
  { label: '文件类型', options: optionAll },
  { label: '所属单位', options: optionAll },
  { label: '来源', options: optionAll },
  { label: '上传人', kind: 'input', placeholder: '请输入上传人' },
  { label: '上传时间', kind: 'date' },
  { label: '解析状态', options: optionAll },
  { label: '权限范围', options: optionAll }
];

const emptyMetrics = [
  { label: '文件总数', value: 0, icon: 'files', tone: 'red' },
  { label: '待解析', value: 0, icon: 'in-progress', tone: 'orange' },
  { label: '解析成功', value: 0, icon: 'review', tone: 'green' },
  { label: '已引用', value: 0, icon: 'compare', tone: 'blue' },
  { label: '导出文件', value: 0, icon: 'upload', tone: 'purple' }
];

const emptyAssetTabs = ['制度文件', '监管案例', '行业研究', '监督共享文件', '费用数据', '业务数据', '报告模板', '生成报告', '导出文件'];
const dataAssetTabs = [
  { name: '全部文件', count: '2,356' },
  { name: '制度文件', count: '856' },
  { name: '监管案例', count: '312' },
  { name: '行业研究', count: '245' },
  { name: '监督共享文件', count: '198' },
  { name: '费用数据', count: '324' },
  { name: '业务数据', count: '324' },
  { name: '报告模板', count: '156' },
  { name: '生成报告', count: '68' },
  { name: '导出文件', count: '111' }
];

const topTabs = [
  { key: 'manage', label: '文件管理', title: '文件管理', desc: '管理文件生命周期、解析状态、权限范围和操作记录。' },
  { key: 'search', label: '文件查询', title: '文件查询', desc: '按名称、类型、来源、单位、上传人和时间快速定位资产。' },
  { key: 'detail', label: '文件详情', title: '文件详情', desc: '查看文件元数据、解析结果、权限和来源快照。' },
  { key: 'reference', label: '引用关系', title: '引用关系', desc: '追踪文件被任务、报告章节和分析结果引用的位置。' },
  { key: 'parse', label: '解析状态', title: '解析状态', desc: '监控待解析、解析中、解析成功和解析失败文件。' }
];

const activeTopTabInfo = computed(() => topTabs.find((tab) => tab.key === activeTopTab.value) || topTabs[0]);

const accessFlow = [
  { title: '上传文件', desc: '支持单文件或批量上传，自动校验格式与大小', icon: 'upload', tone: 'red' },
  { title: '解析资料', desc: '系统解析文件内容，提取文本与表格信息', icon: 'analysis', tone: 'orange' },
  { title: '补全元数据', desc: '补充文件属性、标签、时间范围等关键信息', icon: 'review', tone: 'green' },
  { title: '建立引用', desc: '与制度、任务、报告等建立引用关系', icon: 'compare', tone: 'blue' },
  { title: '加入任务', desc: '将文件加入审计任务，支撑分析与报告生成', icon: 'tasks', tone: 'purple' }
];

const formats = [
  { name: 'PDF', ext: '.pdf', short: 'PDF', tone: 'pdf' },
  { name: 'Word', ext: '.docx/.doc', short: 'W', tone: 'doc' },
  { name: 'Excel', ext: '.xlsx/.xls', short: 'X', tone: 'xls' },
  { name: 'ZIP', ext: '.zip/.rar', short: 'ZIP', tone: 'zip' }
];

const commonRefs = {
  taskRefs: [
    { title: '上海分公司 Q1 常规审计任务', time: '2025-05-11 09:20', count: 12 },
    { title: '深圳分公司 Q1 常规审计任务', time: '2025-05-10 14:18', count: 8 },
    { title: '经纪业务合规专项审计', time: '2025-05-09 16:33', count: 6 }
  ],
  reportRefs: [
    { title: '上海分公司 Q1 常规审计报告 - 第二章 合规性审查', time: '2025-05-11 09:25' },
    { title: '经纪业务合规专项审计报告 - 第三章 监管规则比对', time: '2025-05-09 16:40' }
  ],
  snapshot: {
    source: '证监会官网 > 法律法规 > 部门规章',
    publishAt: '2023-07-01',
    updateAt: '2023-07-15'
  },
  metadata: {
    model: '文档解析模型 v2.1',
    time: '2025-05-10 10:24:15',
    pages: 86,
    clauses: 156,
    keywords: '客户适当性、风险评估、投资者分级'
  },
  history: [
    { user: '张伟', time: '2025-05-11 09:20', action: '加入任务', result: '成功' },
    { user: '系统', time: '2025-05-10 10:24', action: '解析文件', result: '成功' },
    { user: '李娜', time: '2025-05-10 10:23', action: '上传文件', result: '成功' }
  ]
};

const files = [
  makeFile('F001', '《证券公司客户适当性管理办法》（2023年修订）.pdf', 'PDF', 'pdf', '制度文件', '总部', '监管文件', '张伟', '2025-05-10 10:23', '解析成功', 'success', 28, '总部可见', '2.45 MB'),
  makeFile('F002', '经纪业务内部控制管理制度.docx', 'DOC', 'doc', '制度文件', '上海分公司', '内部制度', '李娜', '2025-05-09 16:18', '解析成功', 'success', 15, '本单位可见', '1.18 MB'),
  makeFile('F003', '证监会行政处罚案例（2024年Q1）.pdf', 'PDF', 'pdf', '监管案例', '总部', '监管案例库', '王磊', '2025-05-08 09:42', '解析成功', 'success', 42, '总部可见', '4.30 MB'),
  makeFile('F004', '2025年Q1费用报销明细表.xlsx', 'XLS', 'xls', '费用数据', '深圳分公司', '业务系统', '陈晨', '2025-05-07 14:55', '解析中', 'processing', 3, '本单位可见', '860 KB'),
  makeFile('F005', '证券公司廉洁从业监管要点.pdf', 'PDF', 'pdf', '制度文件', '总部', '监管文件', '张伟', '2025-05-06 11:30', '待解析', 'pending', 0, '总部可见', '1.72 MB'),
  makeFile('F006', '研究报告：财富管理行业发展趋势.docx', 'DOC', 'doc', '行业研究', '总部', '外部研究', '吴迪', '2025-05-05 10:15', '解析成功', 'success', 7, '总部可见', '3.14 MB'),
  makeFile('F007', '上海分公司客户投诉数据分析报告.pdf', 'PDF', 'pdf', '监督共享文件', '上海分公司', '监督共享', '李娜', '2025-05-04 15:50', '解析失败', 'failed', 1, '本单位可见', '5.06 MB'),
  makeFile('F008', '投顾业务交易数据_202504.xlsx', 'XLS', 'xls', '业务数据', '上海分公司', '业务系统', '赵强', '2025-05-03 13:22', '解析成功', 'success', 6, '本单位可见', '1.96 MB'),
  makeFile('F009', '常规审计报告模板（2025版）.docx', 'DOC', 'doc', '报告模板', '总部', '模板库', '王磊', '2025-05-02 09:08', '解析成功', 'success', 12, '总部可见', '640 KB'),
  makeFile('F010', '上海分公司Q1常规审计报告.pdf', 'PDF', 'pdf', '生成报告', '上海分公司', '系统生成', '系统', '2025-05-01 17:35', '已引用', 'used', 0, '本单位可见', '2.20 MB')
];

const selectedFile = ref(files[0]);

function makeFile(id, name, ext, tone, type, unit, source, uploader, time, status, statusTone, refs, permission, size) {
  return {
    id,
    name,
    ext,
    tone,
    type,
    unit,
    source,
    uploader,
    time,
    status,
    statusTone,
    refs,
    permission,
    size,
    ...commonRefs
  };
}

function selectTopTab(key) {
  activeTopTab.value = key;
  const tab = topTabs.find((item) => item.key === key);
  notice.value = `已切换至${tab.label}子页面。`;
}

function selectFile(file, action) {
  selectedFile.value = file;
  expandedMoreFileId.value = '';
  notice.value = `${action}：${file.name}`;
}

function toggleMore(fileId) {
  expandedMoreFileId.value = expandedMoreFileId.value === fileId ? '' : fileId;
}

function showNotice(message) {
  notice.value = message;
}
</script>

<style scoped>
.file-center {
  height: 0;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  color: #111827;
}

.file-center.file-empty {
  overflow: auto;
}

.file-center.is-data-view {
  overflow: hidden;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.filter-actions button,
.empty-actions button,
.pager button,
.pager select,
.pager input,
.detail-actions button {
  border: 1px solid #d7dee9;
  border-radius: 5px;
  background: #fff;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
}

.primary {
  border-color: var(--color-primary) !important;
  background: var(--color-primary) !important;
  color: #fff !important;
}

.empty-layout,
.data-layout {
  flex: 1 1 auto;
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--ui-panel-rail-lg);
  gap: var(--ui-space-3);
  align-items: stretch;
}

.data-layout {
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

.main-stack {
  min-width: 0;
  display: grid;
  gap: 10px;
}

.empty-layout .main-stack {
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr);
}

.data-layout .main-stack {
  min-height: 0;
  grid-template-rows: auto 1fr;
}

.panel,
.rail-card,
.reference-rail {
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.04);
}

.filter-panel {
  padding: 10px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(118px, 1fr));
  gap: 10px 12px;
  align-items: end;
}

.filter-grid label {
  min-width: 0;
  display: grid;
  gap: 5px;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
}

.filter-grid input,
.filter-grid select,
.date-range {
  width: 100%;
  height: 34px;
  border: 1px solid #d7dee9;
  border-radius: 5px;
  padding: 0 10px;
  background: #fff;
  color: #667085;
}

.filter-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.filter-actions button {
  min-width: 76px;
  height: 34px;
}

.filter-actions .outline-danger {
  min-width: 112px;
  border-color: #e8a5a5;
  color: var(--color-primary);
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(110px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.metric-tile {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  background: linear-gradient(180deg, #fff, #fbfcfe);
}

.metric-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 22px;
}

.red { color: #e42f2f; background: #fff0f0; }
.orange { color: #fb8b1e; background: #fff4e6; }
.green { color: var(--color-success); background: #eaf8f1; }
.blue { color: #2676f6; background: #edf5ff; }
.purple { color: #7257e8; background: #f2edff; }

.metric-tile p {
  color: #475467;
  font-size: 12px;
}

.metric-tile strong {
  display: block;
  margin-top: 4px;
  font-size: 24px;
  line-height: 1;
}

.metric-tile small {
  font-size: 12px;
}

.list-panel {
  overflow: hidden;
}

.empty-layout .list-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.data-layout .list-panel,
.reference-rail {
  height: 100%;
}

.data-layout .list-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.asset-tabs,
.top-tabs {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.3vw, 20px);
  min-height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid #edf1f5;
  overflow-x: auto;
  scrollbar-width: thin;
}

.asset-tabs::-webkit-scrollbar,
.top-tabs::-webkit-scrollbar,
.table-shell::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.asset-tabs,
.top-tabs,
.table-shell {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.asset-tabs button,
.top-tabs button {
  position: relative;
  flex: 0 0 auto;
  height: 44px;
  border: 0;
  background: transparent;
  color: #344054;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
}

.asset-tabs button.active,
.top-tabs button.active {
  color: var(--color-primary);
}

.asset-tabs button.active::after,
.top-tabs button.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: var(--color-primary);
}

.data-tabs {
  gap: 0;
  justify-content: space-between;
}

.data-tabs button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: 3px;
  padding: 0 3px;
  font-size: 10.2px;
}

.data-tabs span {
  margin-left: 0;
  color: #667085;
  font-size: 10px;
}

.table-shell {
  overflow-x: auto;
}

.empty-layout .table-shell {
  min-height: 0;
}

.data-layout .table-shell {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.file-table {
  width: 100%;
  min-width: 880px;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table {
  min-width: 0;
}

.file-table th,
.file-table td {
  padding: 8px 5px;
  border-bottom: 1px solid #edf1f5;
  text-align: center;
  font-size: 11px;
  line-height: 1.35;
  vertical-align: middle;
}

.file-table th {
  background: #f8fafc;
  color: #344054;
  font-weight: 800;
}

.check-col {
  width: 38px;
}

.empty-table tbody td {
  padding: 0;
  height: 100%;
}

.empty-state-card {
  min-height: 100%;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 10px;
  padding: 28px 18px;
  color: #667085;
  background: radial-gradient(circle at center 30%, #fbfcff 0, #fff 55%);
}

.empty-state-card h3 {
  color: #1f2937;
  font-size: 18px;
}

.empty-state-card p {
  max-width: 580px;
  text-align: center;
  line-height: 1.6;
  font-size: 12px;
}

.empty-illustration {
  position: relative;
  width: 120px;
  height: 82px;
  opacity: 0.82;
}

.box-lid,
.box-body,
.paper {
  position: absolute;
  display: block;
}

.box-body {
  left: 28px;
  right: 28px;
  bottom: 8px;
  height: 34px;
  border-radius: 4px 4px 10px 10px;
  background: #dfe6f0;
}

.box-lid {
  left: 18px;
  right: 18px;
  bottom: 36px;
  height: 24px;
  border-radius: 5px;
  background: #cfd8e6;
  transform: skewX(-18deg);
}

.paper {
  background: #eef2f8;
  border-radius: 3px;
  box-shadow: 0 2px 0 rgba(148, 163, 184, 0.15);
}

.paper.one {
  width: 30px;
  height: 38px;
  left: 44px;
  top: 2px;
}

.paper.two {
  width: 28px;
  height: 28px;
  left: 64px;
  top: 12px;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
}

.empty-actions button {
  min-width: 112px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.pager {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 12px;
  color: #344054;
  font-size: 12px;
}

.pager > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pager button {
  min-width: 28px;
  height: 28px;
}

.pager button.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.pager select,
.pager input {
  height: 28px;
  padding: 0 8px;
}

.pager input {
  width: 46px;
  text-align: center;
}

.side-rail {
  display: grid;
  gap: 10px;
}

.rail-card {
  padding: 13px;
}

.rail-card h3,
.reference-rail h3 {
  margin-bottom: 12px;
  font-size: 15px;
}

.flow-card ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.flow-card li {
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 9px;
  padding-bottom: 14px;
}

.flow-card li:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 13px;
  top: 31px;
  bottom: 3px;
  border-left: 1px dashed #cbd5e1;
}

.flow-icon {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #cbd5e1;
  font-size: 14px;
}

.flow-card li.red,
.flow-card li.orange,
.flow-card li.green,
.flow-card li.blue,
.flow-card li.purple {
  color: inherit;
  background: transparent;
}

.flow-card li.red .flow-icon { background: #e42f2f; }
.flow-card li.orange .flow-icon { background: #fb8b1e; }
.flow-card li.green .flow-icon { background: var(--color-success); }
.flow-card li.blue .flow-icon { background: #2676f6; }
.flow-card li.purple .flow-icon { background: #7257e8; }

.flow-card strong {
  font-size: 13px;
}

.flow-card p,
.note-list,
.format-grid p {
  color: #667085;
  font-size: 11px;
  line-height: 1.5;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.format-grid article {
  min-width: 0;
  display: grid;
  justify-items: center;
  gap: 5px;
}

.file-badge,
.large-file-badge {
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  line-height: 1;
}

.file-badge {
  width: 25px;
  height: 30px;
  border-radius: 4px;
  font-size: 10px;
}

.format-grid .file-badge {
  width: 26px;
  height: 26px;
  border-radius: 4px;
}

.pdf { background: var(--color-primary); }
.doc { background: var(--color-info); }
.xls { background: var(--color-success); }
.zip { background: #f79009; }

.note-list {
  display: grid;
  gap: 7px;
  padding-left: 16px;
}

.data-filter-panel {
  overflow: hidden;
}

.subpage-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 0 14px;
  border-bottom: 1px solid #edf1f5;
  background: #fffdfd;
  color: #667085;
  font-size: 12px;
}

.subpage-summary strong {
  color: var(--color-primary);
}

.data-filter-grid {
  padding: 12px 14px;
}

.date-range {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr);
  align-items: center;
  padding: 0;
}

.date-range input {
  height: 32px;
  border: 0;
  padding: 0 8px;
  text-align: center;
}

.date-range b {
  color: #98a2b3;
  font-weight: 400;
}

.data-table th:nth-child(2),
.data-table td:nth-child(2) {
  width: auto;
}

.data-table th:nth-child(11),
.data-table td:nth-child(11) {
  width: auto;
}

.data-table .col-check { width: 3.2%; }
.data-table .col-name { width: 21.5%; }
.data-table .col-type { width: 8%; }
.data-table .col-unit { width: 8%; }
.data-table .col-source { width: 8%; }
.data-table .col-uploader { width: 6%; }
.data-table .col-time { width: 9%; }
.data-table .col-status { width: 7%; }
.data-table .col-refs { width: 6%; }
.data-table .col-permission { width: 8%; }
.data-table .col-ops { width: 15.3%; }

.data-table tr.selected td {
  background: #fffafa;
}

.data-table tbody td {
  padding-top: 12px;
  padding-bottom: 12px;
  line-height: 1.45;
}

.file-name {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  text-align: left;
}

.file-name strong {
  display: -webkit-box;
  overflow: hidden;
  white-space: normal;
  word-break: break-all;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.35;
}

.file-name small {
  display: block;
  margin-top: 5px;
  color: #667085;
}

.state-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 800;
  white-space: nowrap;
}

.state-tag.success { color: var(--color-success); background: #eaf8f1; }
.state-tag.processing { color: var(--color-info); background: #eef6ff; }
.state-tag.failed { color: var(--color-primary); background: #fff1f1; }
.state-tag.pending { color: #667085; background: #f2f4f7; }
.state-tag.used { color: #f27a00; background: #fff3df; }

.ops {
  position: relative;
  text-align: center;
  white-space: nowrap;
}

.ops button {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  margin: 0 1px;
  border: 0;
  background: transparent;
  color: var(--color-info);
  font-size: 10px;
  font-weight: 800;
}

.ops .danger-link {
  color: var(--color-primary);
}

.more-menu {
  position: relative;
  display: inline-flex;
}

.more-popover {
  position: absolute;
  right: 0;
  top: 22px;
  z-index: 5;
  min-width: 78px;
  display: grid;
  gap: 2px;
  padding: 5px;
  border: 1px solid #d9e1ec;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
}

.more-popover button {
  justify-content: flex-start;
  min-height: 22px;
  margin: 0;
  padding: 0 5px;
  color: var(--color-info);
  white-space: nowrap;
}

.reference-rail {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reference-rail > header {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #edf1f5;
}

.reference-rail > header button {
  border: 0;
  background: transparent;
  color: #667085;
  font-size: 18px;
}

.file-profile {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  padding: 12px 12px 9px;
}

.large-file-badge {
  width: 38px;
  height: 48px;
  border-radius: 5px;
  font-size: 11px;
}

.file-profile h4 {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 14px;
  line-height: 1.32;
}

.file-profile p {
  margin-top: 5px;
  color: #667085;
  font-size: 11px;
  line-height: 1.45;
}

.detail-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 0 12px 12px;
}

.detail-actions button {
  height: 32px;
}

.detail-actions .danger {
  border-color: #efb2b8;
  color: var(--color-primary);
}

.ref-block {
  padding: 10px 12px;
  border-top: 1px solid #edf1f5;
}

.block-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.block-title h4,
.ref-block h4 {
  font-size: 13px;
}

.block-title button,
.more-btn {
  border: 0;
  background: transparent;
  color: var(--color-info);
  font-size: 11px;
  font-weight: 800;
}

.ref-block article {
  padding: 6px 0;
  border-bottom: 1px solid #f0f2f5;
}

.ref-block article strong {
  font-size: 12px;
}

.ref-block article p,
.ref-block > p {
  margin-top: 5px;
  color: #667085;
  font-size: 11px;
  line-height: 1.45;
}

.ref-block article span {
  float: right;
}

.more-btn {
  width: 100%;
  min-height: 24px;
}

.history-block {
  margin-top: auto;
  padding: 9px 12px 12px;
}

.history-block table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.history-block th:nth-child(1),
.history-block td:nth-child(1) { width: 20%; }
.history-block th:nth-child(2),
.history-block td:nth-child(2) { width: 38%; }
.history-block th:nth-child(3),
.history-block td:nth-child(3) { width: 24%; }
.history-block th:nth-child(4),
.history-block td:nth-child(4) { width: 18%; }

.history-block th,
.history-block td {
  padding: 7px 4px;
  border: 1px solid #edf1f5;
  text-align: center;
  font-size: 11px;
  white-space: nowrap;
}

.history-block th {
  color: #344054;
  background: #f8fafc;
}

.history-block .ok {
  color: var(--color-success);
  font-weight: 800;
}

@media (max-width: 1280px) {
  .empty-layout,
  .data-layout {
    grid-template-columns: minmax(660px, 1fr) 272px;
  }

  .file-table th,
  .file-table td {
    padding: 8px 4px;
    font-size: 10.5px;
  }
}

@media (max-width: 1120px) {
  .empty-layout,
  .data-layout {
    grid-template-columns: 1fr;
  }

  .filter-grid,
  .metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .side-rail {
    grid-template-columns: minmax(260px, 1.4fr) minmax(220px, 0.8fr) minmax(220px, 0.8fr);
  }
}

@media (max-width: 760px) {
  .pager,
  .pager > div,
  .subpage-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-grid,
  .metric-strip,
  .side-rail,
  .format-grid,
  .detail-actions {
    grid-template-columns: 1fr;
  }

  .pager > div {
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
  }
}

/* Viewport-scaled visible dimensions for the shared 2560x1440 baseline. */
.file-center {
  font-size: var(--ui-font-xs);
}

.filter-panel,
.metric-tile,
.rail-card,
.reference-rail {
  padding: var(--ui-space-4);
}

.filter-grid,
.metric-strip,
.main-stack,
.side-rail {
  gap: var(--ui-space-4);
}

.filter-grid label,
.filter-grid input,
.filter-grid select,
.filter-actions button,
.asset-tabs button,
.top-tabs button,
.file-table th,
.file-table td,
.pager,
.flow-card p,
.format-grid p,
.note-list,
.ref-block article p,
.ref-block > p,
.history-block th,
.history-block td {
  font-size: var(--ui-font-xs);
}

.metric-tile p,
.metric-tile small,
.ref-block article strong {
  font-size: var(--ui-font-sm);
}

.metric-tile strong {
  font-size: var(--ui-font-xl);
}

.filter-grid input,
.filter-grid select,
.filter-actions button {
  height: var(--ui-control-md);
}

.metric-icon {
  width: var(--ui-icon-lg);
  height: var(--ui-icon-lg);
  font-size: var(--ui-icon-md);
}
</style>
