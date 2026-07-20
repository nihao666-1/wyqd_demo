<template>
  <section class="empty-task-center">
    <div class="empty-center-grid">
      <main class="empty-main-column">
        <section class="empty-filter-card" aria-label="任务中心筛选">
          <form class="empty-filter-grid" @submit.prevent="queryEmptyTasks">
            <label><span>任务名称</span><div class="input-with-icon"><input v-model.trim="filters.name" placeholder="请输入任务名称" /><FontAwesomeIcon :icon="faMagnifyingGlass" /></div></label>
            <label><span>被审计单位</span><select v-model="filters.unit"><option value="">请选择单位</option><option v-for="organization in organizationOptions" :key="organization.orgId" :value="organization.orgName">{{ organization.orgName }}</option></select></label>
            <label><span>审计期间</span><div class="date-range"><input v-model="filters.start" aria-label="开始日期" placeholder="开始日期" /><i>~</i><input v-model="filters.end" aria-label="结束日期" placeholder="结束日期" /><FontAwesomeIcon :icon="faCalendarDays" /></div></label>
            <label><span>任务类型</span><select v-model="filters.type"><option>全部</option><option>常规审计</option><option>专项审计</option><option>费用审计</option></select></label>
            <label><span>任务状态</span><select v-model="filters.status"><option>全部</option><option>草稿</option><option>待解析</option><option>生成中</option><option>待确认</option><option>已完成</option></select></label>
            <label><span>负责人</span><select v-model="filters.owner"><option value="">请选择负责人</option><option v-for="person in personnel" :key="person.userId" :value="person.name">{{ person.name }}</option></select></label>
            <div class="empty-filter-actions">
              <RouterLink class="empty-create-inline" to="/tasks/create">
                <FontAwesomeIcon :icon="faFileCirclePlus" />
                <span>创建审计任务</span>
              </RouterLink>
              <div class="empty-query-actions"><button class="empty-btn primary" type="submit">查询</button><button class="empty-btn" type="button" @click="resetFilters">重置</button></div>
            </div>
          </form>
        </section>

        <section class="empty-metric-strip" aria-label="空任务状态统计">
          <button v-for="item in emptyMetrics" :key="item.label" class="empty-metric-card" type="button" @click="filters.status = item.filter">
            <span class="empty-metric-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
            <div><b>{{ item.label }}</b><strong>0<small> ↑</small></strong><p>较昨日 --</p></div>
          </button>
        </section>

        <section id="empty-task-list" class="empty-list-card">
          <h3>任务列表</h3>
          <div class="empty-table-wrap">
            <table><thead><tr><th>任务编号</th><th>任务名称</th><th>被审计单位</th><th>审计期间</th><th>任务类型</th><th>当前状态</th><th>更新时间</th><th>操作</th></tr></thead></table>
          </div>
          <div class="empty-list-content" role="status">
            <div class="empty-illustration" aria-hidden="true"><FontAwesomeIcon class="empty-shadow" :icon="faCircle" /><FontAwesomeIcon class="empty-plant left" :icon="faSeedling" /><FontAwesomeIcon class="empty-plant right" :icon="faSeedling" /><FontAwesomeIcon class="empty-inbox" :icon="faInbox" /><FontAwesomeIcon class="empty-message" :icon="faCommentDots" /></div>
            <h3>暂无审计任务</h3>
            <p>创建首个任务后，可在这里跟踪资料准备、模型生成、人工确认、复核导出和归档状态。</p>
            <div><RouterLink class="empty-btn primary wide" to="/tasks/create">创建审计任务</RouterLink><button class="empty-btn wide" type="button" @click="importDemoTasks">导入模拟任务</button></div>
          </div>
        </section>

        <section class="demo-path-card" aria-labelledby="demo-path-title">
          <h3 id="demo-path-title">推荐演示路径</h3>
          <div class="demo-path-grid">
            <template v-for="(item, index) in emptyFlow" :key="item.title">
              <article><span class="flow-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span><div><b>{{ item.title }}</b><p v-for="line in item.detail" :key="line">{{ line }}</p></div></article>
              <FontAwesomeIcon v-if="index < emptyFlow.length - 1" class="flow-arrow" :icon="faArrowRight" />
            </template>
          </div>
        </section>
      </main>

      <aside class="empty-side-column">
        <section class="status-guide-card">
          <h3>任务状态说明</h3>
          <div class="status-guide-list">
            <article v-for="item in emptyStatusGuide" :key="item.label"><span class="guide-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span><div><b>{{ item.label }}</b><p>{{ item.detail }}</p></div></article>
          </div>
          <p class="status-tip"><FontAwesomeIcon :icon="faCircleInfo" />双击任意任务可查看详情，更多操作请在任务详情页完成。</p>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, reactive } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowRight, faArrowsRotate, faCalendarDays, faChartColumn, faCircle, faCircleCheck, faCircleInfo, faCloudArrowUp, faCommentDots, faFileCirclePlus, faFileLines, faFolderOpen, faFolderPlus, faInbox, faMagnifyingGlass, faSeedling, faSquareCheck, faUserCheck } from '@fortawesome/free-solid-svg-icons';

const store = inject('store');
const personnel = computed(() => (store.db.auditPersonnel || []).filter((person) => person.active));
const organizationOptions = computed(() => store.db.organizations || []);
const defaults = { name: '', unit: '', start: '', end: '', type: '全部', status: '全部', owner: '' };
const filters = reactive({ ...defaults });

const emptyMetrics = [
  { label: '全部任务', filter: '全部', tone: 'red', icon: faFileLines },
  { label: '草稿', filter: '草稿', tone: 'orange', icon: faFileLines },
  { label: '待解析', filter: '待解析', tone: 'blue', icon: faFolderOpen },
  { label: '生成中', filter: '生成中', tone: 'green', icon: faArrowsRotate },
  { label: '待确认', filter: '待确认', tone: 'purple', icon: faUserCheck },
  { label: '已完成', filter: '已完成', tone: 'teal', icon: faCircleCheck }
];

const emptyFlow = [
  { title: '创建任务', tone: 'red', icon: faFileCirclePlus, detail: ['填写基础信息', '选择审计能力'] },
  { title: '选择能力', tone: 'orange', icon: faSquareCheck, detail: ['按需选择审计能力', '系统自动匹配资料'] },
  { title: '上传资料', tone: 'blue', icon: faCloudArrowUp, detail: ['上传或选择资料', '系统解析预检'] },
  { title: '生成结果', tone: 'green', icon: faChartColumn, detail: ['模型生成分析结果', '查看依据与建议'] },
  { title: '导出归档', tone: 'purple', icon: faFolderPlus, detail: ['生成报告并导出', '归档留存追溯'] }
];

const emptyStatusGuide = [
  { label: '草稿', detail: '任务创建中，尚未提交。', tone: 'orange', icon: faFileLines },
  { label: '待解析', detail: '资料已上传，等待系统解析。', tone: 'blue', icon: faFolderOpen },
  { label: '解析中', detail: '资料解析中，请耐心等待。', tone: 'azure', icon: faArrowsRotate },
  { label: '待生成', detail: '资料解析完成，等待模型生成。', tone: 'yellow', icon: faCircleCheck },
  { label: '生成中', detail: '模型正在生成分析结果。', tone: 'green', icon: faArrowsRotate },
  { label: '待确认', detail: '结果已生成，等待人工确认。', tone: 'purple', icon: faUserCheck },
  { label: '待复核', detail: '已确认，等待管理员复核。', tone: 'orange', icon: faSquareCheck },
  { label: '已完成', detail: '任务已完成并生成报告。', tone: 'teal', icon: faCircleCheck },
  { label: '已归档', detail: '任务已归档，资料已固化。', tone: 'gray', icon: faInbox }
];

function resetFilters() { Object.assign(filters, defaults); }
function queryEmptyTasks() { document.getElementById('empty-task-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function importDemoTasks() { store.setDemoDataMode('data'); store.notice = ''; }
</script>

<style scoped>
.empty-task-center{--empty-red:var(--color-primary);--empty-line:#dfe5ee;--empty-text:#202938;--empty-muted:#778398;width:100%;max-width:none;margin:0;padding:0 8px 22px;color:var(--empty-text)}.empty-center-grid{display:grid;grid-template-columns:minmax(0,1fr) 218px;gap:16px;align-items:start}.empty-main-column{min-width:0}.empty-filter-card,.empty-list-card,.demo-path-card,.status-guide-card{border:1px solid var(--empty-line);border-radius:4px;background:#fff}.empty-filter-card{padding:14px 10px 15px}.empty-filter-card h2{margin:0 0 14px;font-size:24px;line-height:1.2}.empty-filter-grid{display:grid;grid-template-columns:1.15fr 1fr 1.35fr .85fr .85fr 1fr auto;gap:12px;align-items:end}.empty-filter-grid label{display:grid;min-width:0;gap:7px;font-size:12px}.empty-filter-grid input,.empty-filter-grid select{box-sizing:border-box;width:100%;height:36px;border:1px solid #d5dde8;border-radius:4px;background:#fff;color:#39465a;font-size:12px}.empty-filter-grid input{padding:0 32px 0 10px}.empty-filter-grid select{padding:0 8px}.input-with-icon,.date-range{position:relative}.input-with-icon svg{position:absolute;top:12px;right:10px;color:#8c9ab0;font-size:12px}.date-range{display:grid;grid-template-columns:minmax(0,1fr) 12px minmax(0,1fr);align-items:center}.date-range input{padding:0 5px;text-align:center}.date-range i{color:#8a96a8;font-style:normal;text-align:center}.date-range svg{position:absolute;top:12px;right:8px;color:#8c9ab0;font-size:12px}.empty-filter-actions{display:flex;gap:10px}.empty-btn{display:inline-flex;min-width:68px;height:36px;align-items:center;justify-content:center;box-sizing:border-box;border:1px solid #ced7e3;border-radius:4px;background:#fff;color:#344054;font-size:13px;cursor:pointer}.empty-btn.primary,.empty-create-button{border-color:var(--empty-red);background:var(--empty-red);color:#fff;font-weight:700}.empty-metric-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));margin-top:10px;border:1px solid var(--empty-line);border-radius:4px;background:#fff}.empty-metric-card{display:flex;min-height:112px;align-items:center;gap:14px;padding:12px 18px;border:0;border-right:1px solid var(--empty-line);background:#fff;color:inherit;font:inherit;text-align:left;cursor:pointer}.empty-metric-card:last-child{border-right:0}.empty-metric-icon{display:grid;flex:0 0 44px;height:44px;place-items:center;border-radius:7px;font-size:22px}.red{background:#fff0f1;color:#ef2635}.orange{background:#fff3df;color:#f59b00}.blue{background:#edf4ff;color:#3478e7}.green{background:#eaf8f0;color:#2dac68}.purple{background:#f1eaff;color:#8d45e5}.teal{background:#e5f8f5;color:#1eb8aa}.azure{background:#eef5ff;color:#5792ef}.yellow{background:#fff8df;color:#f4b72a}.gray{background:#eef1f5;color:#8390a4}.empty-metric-card b{display:block;font-size:13px}.empty-metric-card strong{display:block;margin-top:5px;font-size:24px;font-weight:500}.empty-metric-card strong small{font-size:12px}.empty-metric-card p{margin:6px 0 0;color:var(--empty-muted);font-size:11px}.empty-list-card{margin-top:10px;overflow:hidden}.empty-list-card>h3,.demo-path-card>h3{margin:0;padding:14px 18px;font-size:16px}.empty-table-wrap{overflow:auto}.empty-table-wrap table{width:100%;min-width:760px;border-collapse:collapse;table-layout:fixed}.empty-table-wrap th{height:38px;padding:0 12px;border-top:1px solid var(--empty-line);border-bottom:1px solid var(--empty-line);background:#f6f8fb;color:#46546a;font-size:11px;text-align:left}.empty-list-content{display:grid;min-height:314px;place-items:center;align-content:center;padding:16px;text-align:center}.empty-illustration{position:relative;width:190px;height:94px;margin-bottom:6px;color:#cbd4e1}.empty-inbox{position:absolute;left:42px;bottom:4px;width:108px;height:74px}.empty-message{position:absolute;top:0;right:22px;width:38px;height:30px;color:#bfc9d8}.empty-illustration:after{position:absolute;right:0;bottom:0;left:0;height:18px;border-radius:50%;background:#f3f5f8;content:"";z-index:-1}.empty-list-content h3{margin:0 0 10px;font-size:20px}.empty-list-content p{margin:0 0 20px;color:#68768b;font-size:13px}.empty-list-content>div:last-child{display:flex;gap:14px}.empty-btn.wide{min-width:150px;height:42px}.demo-path-card{margin-top:12px;padding-bottom:16px}.demo-path-grid{display:grid;grid-template-columns:1fr 24px 1fr 24px 1fr 24px 1fr 24px 1fr;align-items:center;padding:0 18px}.demo-path-grid article{display:flex;align-items:center;gap:12px;min-width:0}.flow-icon{display:grid;flex:0 0 50px;height:50px;place-items:center;border:1px solid currentColor;border-radius:50%;background:#fff;font-size:23px}.demo-path-grid b{font-size:14px}.demo-path-grid p{margin:4px 0 0;color:#68768b;font-size:11px;white-space:nowrap}.flow-arrow{justify-self:center;color:#8190a6}.empty-side-column{display:grid;gap:44px;padding-top:43px}.empty-create-button{display:flex;min-height:54px;align-items:center;justify-content:center;border-radius:6px;font-size:17px;text-decoration:none}.status-guide-card{padding:14px 12px}.status-guide-card>h3{margin:0;padding-bottom:14px;border-bottom:1px solid var(--empty-line);font-size:16px}.status-guide-list{display:grid;gap:14px;padding:14px 0}.status-guide-list article{display:flex;align-items:flex-start;gap:10px}.guide-icon{display:grid;flex:0 0 22px;height:22px;place-items:center;border-radius:5px;font-size:12px}.status-guide-list b{font-size:13px}.status-guide-list p{margin:4px 0 0;color:#68768b;font-size:11px;line-height:1.4}.status-tip{display:flex;gap:8px;margin:6px 0 0;padding:11px;border:1px solid #e4e9f0;border-radius:4px;background:#f7f9fc;color:#61718a;font-size:10px;line-height:1.5}.status-tip svg{flex:0 0 12px;margin-top:2px;color:#397de6}@media(max-width:1439px){.empty-center-grid{grid-template-columns:minmax(0,1fr) 210px}.empty-filter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.empty-filter-actions{align-items:end}.empty-metric-strip{grid-template-columns:repeat(3,minmax(0,1fr))}.empty-metric-card:nth-child(3n){border-right:0}.empty-metric-card:nth-child(-n+3){border-bottom:1px solid var(--empty-line)}.demo-path-grid{grid-template-columns:1fr}.flow-arrow{display:none}.demo-path-grid article{padding:8px 0;border-bottom:1px solid var(--empty-line)}.demo-path-grid article:last-child{border-bottom:0}}@media(max-width:1024px){.empty-center-grid{grid-template-columns:1fr}.empty-side-column{grid-template-columns:220px minmax(0,1fr);gap:12px;padding-top:0}.status-guide-card{grid-column:2}.empty-create-button{align-self:start}.status-guide-list{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.empty-task-center{padding:0 10px 18px}.empty-filter-grid{grid-template-columns:1fr}.empty-filter-actions .empty-btn{flex:1}.empty-metric-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.empty-metric-card{border-bottom:1px solid var(--empty-line)}.empty-metric-card:nth-child(2n){border-right:0}.empty-metric-card:nth-last-child(-n+2){border-bottom:0}.empty-table-wrap table{min-width:760px}.empty-list-content{min-height:280px}.empty-list-content>div:last-child{flex-direction:column;width:100%}.empty-btn.wide{width:100%}.empty-side-column{grid-template-columns:1fr}.status-guide-card{grid-column:1}.status-guide-list{grid-template-columns:1fr}}@media(max-width:420px){.empty-metric-strip{grid-template-columns:1fr}.empty-metric-card{border-right:0}.empty-metric-card:nth-last-child(2){border-bottom:1px solid var(--empty-line)}.empty-filter-card h2{font-size:21px}}
.empty-task-center{--empty-red:var(--color-primary-dark);padding-right:0;padding-left:0}.empty-center-grid{grid-template-columns:minmax(0,1fr) 228px}.empty-metric-strip{margin-top:12px}.empty-metric-card{min-height:118px}.empty-metric-icon.red{background:#ef2635;color:#fff}.empty-metric-icon.orange{background:#f59b00;color:#fff}.empty-metric-icon.blue{background:#3478e7;color:#fff}.empty-metric-icon.green{background:#2dac68;color:#fff}.empty-metric-icon.purple{background:#8d45e5;color:#fff}.empty-metric-icon.teal{background:#1eb8aa;color:#fff}.guide-icon.orange{background:#f5a338;color:#fff}.guide-icon.blue,.guide-icon.azure{background:#4d88eb;color:#fff}.guide-icon.yellow{background:#f5b82e;color:#fff}.guide-icon.green{background:#2dac68;color:#fff}.guide-icon.purple{background:#8d45e5;color:#fff}.guide-icon.teal{background:#29b99f;color:#fff}.guide-icon.gray{background:#8b98aa;color:#fff}.empty-list-content{min-height:330px}.empty-list-content>*{transform:translateY(8px)}.empty-illustration{width:220px;height:112px}.empty-illustration:after{display:none}.empty-shadow{position:absolute;right:12px;bottom:-6px;left:12px;width:196px;height:22px;color:#f0f3f7}.empty-plant{position:absolute;bottom:7px;width:25px;height:38px;color:#e8edf4}.empty-plant.left{left:12px}.empty-plant.right{right:10px;transform:scaleX(-1)}.empty-inbox{left:45px;width:130px;height:88px}.empty-message{right:18px;width:42px;height:34px}.demo-path-card{min-height:164px}.empty-side-column{padding-top:50px}.status-guide-card{display:flex;min-height:720px;flex-direction:column;padding:12px}.status-guide-list{gap:12px;padding:10px 0}.status-guide-list b{font-size:14px}.status-guide-list p{font-size:12px}.status-tip{margin-top:auto}.empty-filter-card{padding:8px 10px 10px}.empty-filter-grid{gap:8px 12px;align-content:start}.empty-filter-grid label{gap:5px}@media(max-width:1439px){.empty-center-grid{grid-template-columns:minmax(0,1fr) 210px}.demo-path-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.demo-path-grid article{border-bottom:0}}@media(max-width:1024px){.empty-center-grid{grid-template-columns:minmax(0,1fr)}.empty-side-column{grid-template-columns:220px minmax(0,1fr);padding-top:0}.status-guide-card{grid-column:2;min-height:0}}@media(max-width:760px){.empty-side-column{grid-template-columns:1fr}.status-guide-card{grid-column:1}.demo-path-grid{grid-template-columns:1fr}.demo-path-grid article{border-bottom:1px solid var(--empty-line)}}@media(max-width:420px){.empty-metric-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.empty-metric-card:nth-child(odd){border-right:1px solid var(--empty-line)}.empty-metric-card:nth-last-child(-n+2){border-bottom:0}}
</style>

<style scoped>
.empty-task-center {
  padding: 0 var(--ui-space-3) var(--ui-space-6);
  font-size: var(--ui-font-xs);
}

.empty-center-grid {
  grid-template-columns: minmax(0, 1fr) minmax(280px, var(--ui-panel-rail-lg));
  gap: var(--ui-space-5);
}

.empty-filter-card,
.status-guide-card {
  padding: var(--ui-space-4);
}

.empty-filter-grid,
.empty-filter-actions,
.demo-path-grid article,
.status-guide-list article {
  gap: var(--ui-space-3);
}

.empty-filter-grid label,
.empty-filter-grid input,
.empty-filter-grid select,
.empty-table-wrap th,
.empty-metric-card p,
.demo-path-grid p,
.status-guide-list p,
.status-tip {
  font-size: var(--ui-font-xs);
}

.empty-btn,
.empty-filter-grid input,
.empty-filter-grid select {
  height: var(--ui-control-md);
}

.empty-filter-grid {
  grid-template-columns:
    minmax(112px, 1.05fr)
    minmax(112px, 1fr)
    minmax(164px, 1.28fr)
    minmax(96px, .86fr)
    minmax(96px, .86fr)
    minmax(112px, 1fr)
    minmax(148px, 156px);
}

.empty-filter-actions {
  display: grid;
  min-width: 0;
  grid-template-rows: var(--ui-control-md) var(--ui-control-md);
  align-items: stretch;
}

.empty-create-inline {
  display: inline-flex;
  min-width: 0;
  min-height: var(--ui-control-md);
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-2);
  border: 1px solid var(--empty-red);
  border-radius: 4px;
  background: #fff;
  color: var(--empty-red);
  font-size: var(--ui-font-xs);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
}

.empty-create-inline span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-create-inline:hover {
  background: #fff6f6;
}

.empty-query-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ui-space-3);
}

.empty-query-actions .empty-btn {
  width: 100%;
  min-width: 0;
}

.empty-metric-card b,
.demo-path-grid b,
.status-guide-list b {
  font-size: var(--ui-font-sm);
}

.empty-list-card > h3,
.demo-path-card > h3,
.status-guide-card > h3 {
  font-size: var(--ui-font-md);
}

.empty-list-content h3 {
  font-size: var(--ui-font-lg);
}

.empty-metric-card strong {
  font-size: var(--ui-font-xl);
}

.empty-metric-icon,
.flow-icon {
  flex-basis: var(--ui-icon-lg);
  height: var(--ui-icon-lg);
  font-size: var(--ui-icon-md);
}

@media (min-width: 1025px) {
  .empty-task-center {
    height: 100%;
    min-height: 0;
    padding-bottom: 0;
  }

  .empty-center-grid {
    height: 100%;
    min-height: 0;
    align-items: stretch;
    overflow: hidden;
  }

  .empty-main-column {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .empty-list-card {
    display: flex;
    min-height: 0;
    flex-direction: column;
  }

  .empty-list-content {
    flex: 1;
    min-height: 260px;
  }

  .empty-side-column {
    height: 100%;
    min-height: 0;
    grid-template-rows: minmax(0, 1fr);
    gap: var(--ui-space-4);
    padding-top: 0;
  }

  .empty-create-button {
    min-height: var(--ui-control-md);
    font-size: var(--ui-font-sm);
  }

  .status-guide-card {
    min-height: 0;
    overflow: auto;
  }
}

@media (min-width: 1025px) and (max-width: 1439px) {
  .empty-metric-strip {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .empty-metric-card {
    min-height: 92px;
    gap: var(--ui-space-2);
    padding: var(--ui-space-3);
    border-bottom: 0;
  }

  .empty-metric-card:nth-child(3n) {
    border-right: 1px solid var(--empty-line);
  }

  .empty-metric-card:nth-child(-n+3) {
    border-bottom: 0;
  }

  .empty-metric-card:last-child {
    border-right: 0;
  }

  .empty-metric-icon {
    flex-basis: var(--ui-icon-md);
    height: var(--ui-icon-md);
    font-size: var(--ui-font-md);
  }

  .empty-list-content {
    min-height: 180px;
    padding: var(--ui-space-3);
  }

  .empty-list-content > * {
    transform: none;
  }

  .empty-illustration {
    display: none;
  }

  .empty-list-content h3 {
    margin-bottom: var(--ui-space-2);
  }

  .empty-list-content p {
    margin-bottom: var(--ui-space-3);
  }
}

@media (max-width: 1439px) {
  .empty-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .empty-filter-actions {
    grid-column: span 3;
    grid-template-columns: minmax(180px, 1fr) auto;
    grid-template-rows: var(--ui-control-md);
  }

  .empty-query-actions {
    min-width: 156px;
  }
}

@media (max-width: 760px) {
  .empty-filter-grid {
    grid-template-columns: 1fr;
  }

  .empty-filter-actions {
    grid-column: auto;
    grid-template-columns: 1fr;
    grid-template-rows: var(--ui-control-md) var(--ui-control-md);
  }

  .empty-query-actions {
    min-width: 0;
  }
}
</style>
