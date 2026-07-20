<template>
  <div class="expense-audit-overview-page route-fill-page" :class="{ 'has-detail': selectedAnomaly }" aria-label="费用审计分析">
    <section class="overview-main">
      <section class="filter-panel" aria-label="费用审计筛选">
        <label v-for="filter in filters" :key="filter.label">
          <span>{{ filter.label }}</span>
          <select v-if="filter.type === 'select'" :aria-label="filter.label">
            <option>{{ filter.value }}</option>
          </select>
          <input v-else :aria-label="filter.label" :placeholder="filter.value" />
        </label>
        <div class="filter-actions">
          <button class="primary" type="button" @click="store.handleExpenseOverviewAction('analyze')">生成分析</button>
          <button type="button" @click="store.handleExpenseOverviewAction('confirm')">确认结果</button>
          <button type="button" @click="store.handleExpenseOverviewAction('export')">导出 Excel</button>
        </div>
      </section>

      <section class="analysis-status" aria-live="polite">
        <div><strong>费用综合分析结果</strong><span>{{ overviewState.status }}</span></div>
        <p>预算执行、费用结构、人均费用和异常分布已形成演示结论；确认后可导出。</p>
        <small>导出状态：{{ overviewState.exportStatus }}</small>
      </section>

      <section class="metric-grid" aria-label="费用审计指标">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.tone">
          <span class="metric-icon"><FontAwesomeIcon :icon="metric.icon" /></span>
          <div>
            <p>{{ metric.label }}</p>
            <strong>{{ metric.value }}</strong>
            <small>同比 <b>{{ metric.delta }}</b> ↑</small>
          </div>
        </article>
      </section>

      <section class="chart-grid" aria-label="费用审计图表">
        <article class="chart-card trend-card">
          <div class="chart-title">
            <h2>预算执行趋势</h2>
            <span>单位：万元</span>
          </div>
          <div class="trend-legend">
            <span><i class="blue"></i>实际金额（元）</span>
            <span><i class="green"></i>预算金额（元）</span>
            <span><i class="orange"></i>预算使用率（%）</span>
          </div>
          <div class="trend-plot">
            <div class="trend-scale"><span>800万</span><span>600万</span><span>400万</span><span>200万</span><span>0</span></div>
            <div class="trend-bars">
              <div v-for="item in budgetTrend" :key="item.month" class="trend-month">
                <div class="bar-pair">
                  <i class="bar actual" :style="{ height: `${item.actual}%` }"></i>
                  <i class="bar budget" :style="{ height: `${item.budget}%` }"></i>
                </div>
                <span>{{ item.month }}</span>
              </div>
              <svg class="trend-line" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="36,62 150,38 264,38" fill="none" stroke="var(--color-warning)" stroke-width="3" />
                <circle cx="36" cy="62" r="4" fill="#fff" stroke="var(--color-warning)" stroke-width="3" />
                <circle cx="150" cy="38" r="4" fill="#fff" stroke="var(--color-warning)" stroke-width="3" />
                <circle cx="264" cy="38" r="4" fill="#fff" stroke="var(--color-warning)" stroke-width="3" />
              </svg>
            </div>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-title"><h2>费用类别结构</h2></div>
          <div class="donut-layout">
            <div class="donut category-donut"><span>费用总额<br /><b>12,856,230.45</b><br />元</span></div>
            <ul class="chart-list">
              <li v-for="item in categoryStructure" :key="item.name"><i :style="{ background: item.color }"></i><span>{{ item.name }}</span><b>{{ item.value }}</b></li>
            </ul>
          </div>
        </article>

        <article class="chart-card rank-card">
          <div class="chart-title"><h2>人均费用排行（TOP10）</h2><span>单位：元</span></div>
          <ul class="rank-list">
            <li v-for="item in employeeRank" :key="item.name">
              <span>{{ item.name }}</span>
              <i><b :style="{ width: `${item.percent}%` }"></b></i>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </article>

        <article class="chart-card">
          <div class="chart-title"><h2>异常类型分布</h2></div>
          <div class="donut-layout">
            <div class="donut anomaly-donut"><span>异常总额<br /><b>1,256,780.32</b><br />元</span></div>
            <ul class="chart-list">
              <li v-for="item in anomalyTypes" :key="item.name"><i :style="{ background: item.color }"></i><span>{{ item.name }}</span><b>{{ item.value }}</b></li>
            </ul>
          </div>
        </article>
      </section>

      <section class="exception-section" aria-label="费用异常分类明细">
        <div class="exception-tabs">
          <button v-for="tab in anomalyTabs" :key="tab.label" type="button" :class="{ active: tab.active }">{{ tab.label }} <span>({{ tab.count }})</span></button>
          <RouterLink class="export" to="/expense/anomaly/dashboard">进入异常处理</RouterLink>
        </div>
        <div class="table-wrap">
          <table>
            <colgroup>
              <col class="col-id" />
              <col class="col-type" />
              <col class="col-department" />
              <col class="col-employee" />
              <col class="col-amount" />
              <col class="col-voucher" />
              <col class="col-rule" />
              <col class="col-status" />
              <col class="col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>异常编号</th>
                <th>异常类型</th>
                <th>部门</th>
                <th>员工</th>
                <th>金额（元）</th>
                <th>凭证</th>
                <th>依据</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in anomalyRows" :key="row.id" :data-anomaly-id="row.id" :class="{ selected: selectedAnomaly?.id === row.id }">
                <td>{{ row.id }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.department }}</td>
                <td>{{ row.employee }}</td>
                <td>{{ row.amount }}</td>
                <td>{{ row.voucher }}</td>
                <td>{{ row.rule }}</td>
                <td><span class="risk-tag" :class="row.riskClass">{{ row.risk }}</span></td>
                <td class="table-actions"><a :data-testid="`view-anomaly-${row.id}`" :href="`/expense/audit/overview?demo=1&amp;detail=${row.id}`">查看详情</a><button type="button">确认异常</button><button type="button">排除异常</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="table-footer">
          <span>共 86 条</span>
          <div><button type="button">‹</button><button class="active" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">4</button><button type="button">5</button><span>...</span><button type="button">9</button><button type="button">›</button><select aria-label="分页条数"><option>10 条/页</option></select><span>跳至</span><input value="1" aria-label="跳转页码" /><span>页</span></div>
        </footer>
      </section>
    </section>

    <aside v-if="selectedAnomaly" class="detail-drawer" aria-label="费用异常详情">
      <header>
        <h2>费用异常详情</h2>
        <a href="/expense/audit/overview?demo=1" aria-label="关闭">×</a>
      </header>
      <section>
        <h3>基本信息</h3>
        <dl>
          <div v-for="item in baseInfo" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
        </dl>
      </section>
      <section>
        <h3>凭证信息</h3>
        <dl>
          <div v-for="item in voucherInfo" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
        </dl>
      </section>
      <section>
        <h3>审批链路</h3>
        <ol class="approval-chain">
          <li v-for="item in approvalChain" :key="item.text" :class="item.status"><span></span><p>{{ item.text }}</p><time>{{ item.time }}</time></li>
        </ol>
      </section>
      <section>
        <h3>规则命中</h3>
        <dl>
          <div><dt>命中规则</dt><dd>超预算未审批</dd></div>
          <div><dt>规则依据</dt><dd>《费用报销管理办法》第5条</dd></div>
          <div><dt>规则说明</dt><dd>费用超出预算需提前审批或说明原因。</dd></div>
        </dl>
      </section>
      <section>
        <h3>相似记录（3）</h3>
      </section>
      <section>
        <h3>人工处理</h3>
        <div class="drawer-actions"><button class="primary" type="button">确认异常</button><button type="button">排除异常</button><button type="button">补充说明</button></div>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChartLine, faCoins, faGaugeHigh, faReceipt } from '@fortawesome/free-solid-svg-icons';

const route = useRoute();
const store = inject('store');
const overviewState = computed(() => store.db.expenseOverviewState || { status: '待分析', exportStatus: '未导出' });

const filters = [
  { label: '被审计单位', value: '上海分公司', type: 'select' },
  { label: '审计期间', value: '2025年Q1（2025-01 ~ 2025-03）', type: 'select' },
  { label: '费用类别', value: '全部', type: 'select' },
  { label: '部门', value: '全部', type: 'select' },
  { label: '员工', value: '请输入员工姓名 / 工号', type: 'input' },
  { label: '数据来源', value: '全部', type: 'select' }
];

const metrics = [
  { label: '费用总额', value: '12,856,230.45 元', delta: '+8.62%', icon: faCoins, tone: 'red' },
  { label: '预算使用率', value: '82.45 %', delta: '+5.21%', icon: faGaugeHigh, tone: 'blue' },
  { label: '异常金额', value: '1,256,780.32 元', delta: '+23.18%', icon: faChartLine, tone: 'orange' },
  { label: '异常笔数', value: '256 笔', delta: '+18.52%', icon: faReceipt, tone: 'green' }
];

const budgetTrend = [
  { month: '2025-01', actual: 44, budget: 58 },
  { month: '2025-02', actual: 51, budget: 64 },
  { month: '2025-03', actual: 54, budget: 68 }
];

const categoryStructure = [
  { name: '差旅费', value: '28.63%', color: 'var(--color-info)' },
  { name: '业务招待费', value: '18.75%', color: 'var(--color-success)' },
  { name: '办公费', value: '15.42%', color: '#5b8790' },
  { name: '会议费', value: '9.88%', color: 'var(--color-primary)' },
  { name: '培训费', value: '7.31%', color: 'var(--color-warning)' },
  { name: '其他', value: '19.01%', color: '#b8944f' }
];

const employeeRank = [
  { name: '张伟', value: '28,650.00', percent: 100 },
  { name: '李娜', value: '24,780.50', percent: 86 },
  { name: '王磊', value: '21,430.30', percent: 75 },
  { name: '刘洋', value: '19,850.20', percent: 69 },
  { name: '陈晨', value: '18,920.10', percent: 66 },
  { name: '赵敏', value: '17,680.40', percent: 62 },
  { name: '周强', value: '16,540.80', percent: 58 },
  { name: '吴迪', value: '15,320.60', percent: 53 },
  { name: '孙悦', value: '14,880.30', percent: 52 },
  { name: '黄凯', value: '13,950.40', percent: 49 }
];

const anomalyTypes = [
  { name: '超预算未审批', value: '34.38%', color: 'var(--color-primary)' },
  { name: '费用违规报销', value: '26.56%', color: 'var(--color-success)' },
  { name: '疑似不合规报销', value: '21.88%', color: 'var(--color-warning)' },
  { name: '重复报销', value: '9.38%', color: '#b8944f' },
  { name: '其他', value: '7.80%', color: '#b97575' }
];

const anomalyTabs = [
  { label: '超预算未审批', count: 86, active: true },
  { label: '费用违规报销', count: 64 },
  { label: '疑似不合规报销', count: 58 },
  { label: '异常汇总', count: 256 },
  { label: '整改建议', count: 18 }
];

const anomalyRows = [
  { id: 'AY202504280001', type: '超预算未审批', department: '市场部', employee: '张伟', amount: '28,650.00', voucher: '记-2025-001245', rule: '《费用报销管理办法》第5条', risk: '高风险', riskClass: 'high' },
  { id: 'AY202504280002', type: '超预算未审批', department: '销售部', employee: '李娜', amount: '17,850.00', voucher: '记-2025-001267', rule: '《费用报销管理办法》第5条', risk: '高风险', riskClass: 'high' },
  { id: 'AY202504280003', type: '超预算未审批', department: '技术部', employee: '王磊', amount: '13,420.00', voucher: '记-2025-001289', rule: '《费用报销管理办法》第5条', risk: '中风险', riskClass: 'medium' },
  { id: 'AY202504280004', type: '超预算未审批', department: '综合管理部', employee: '刘洋', amount: '11,280.00', voucher: '记-2025-001301', rule: '《费用报销管理办法》第5条', risk: '中风险', riskClass: 'medium' },
  { id: 'AY202504280005', type: '超预算未审批', department: '市场部', employee: '陈晨', amount: '9,760.00', voucher: '记-2025-001313', rule: '《费用报销管理办法》第5条', risk: '低风险', riskClass: 'low' }
];

const selectedAnomaly = computed(() => anomalyRows.find((row) => row.id === route.query.detail) ?? null);

const baseInfo = computed(() => [
  { label: '异常编号', value: selectedAnomaly.value?.id },
  { label: '异常类型', value: selectedAnomaly.value?.type },
  { label: '部门', value: selectedAnomaly.value?.department },
  { label: '员工', value: selectedAnomaly.value?.employee },
  { label: '申请日期', value: '2025-03-15' },
  { label: '报销日期', value: '2025-03-20' },
  { label: '金额（元）', value: selectedAnomaly.value?.amount },
  { label: '状态', value: selectedAnomaly.value?.risk }
]);

const voucherInfo = [
  { label: '凭证编号', value: '记-2025-001245' },
  { label: '费用类别', value: '差旅费' },
  { label: '发生日期', value: '2025-03-12' },
  { label: '发生地', value: '上海' },
  { label: '附件', value: '发票_20250312.pdf' }
];

const approvalChain = [
  { text: '提交申请 张伟', time: '2025-03-15 09:12', status: 'done' },
  { text: '部门经理审批 李强（已驳回）', time: '2025-03-15 10:05', status: 'warning' },
  { text: '重新提交 张伟', time: '2025-03-15 10:20', status: 'pending' },
  { text: '未走完审批流程', time: '', status: 'pending' }
];
</script>

<style scoped>
.analysis-status{display:flex;align-items:center;gap:16px;margin-top:10px;padding:12px 14px;border:1px solid #f0c7ca;background:#fff;color:#475467}.analysis-status div{display:grid;gap:4px}.analysis-status div span{color:var(--color-primary);font-weight:700}.analysis-status p{flex:1;margin:0}.analysis-status small{white-space:nowrap}.exception-tabs .export{display:inline-flex;height:30px;align-items:center;text-decoration:none}
.expense-audit-overview-page{--audit-red:var(--color-primary);--audit-line:#e6ebf2;--audit-text:#1f2937;--audit-muted:#667085;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) clamp(286px,19vw,318px);min-height:calc(100dvh - 58px);overflow:visible;background:#f5f7fa;color:var(--audit-text);font-size:12px}.overview-main{min-width:0;overflow:visible;padding:12px 10px 10px 14px}.filter-actions,.drawer-actions{display:flex;gap:8px}.expense-audit-overview-page button{height:30px;border:1px solid #d7dee8;border-radius:4px;background:#fff;color:#344054;font-size:12px;cursor:pointer}.expense-audit-overview-page button.primary{border-color:var(--audit-red);background:var(--audit-red);color:#fff}.filter-panel{display:grid;grid-template-columns:1.05fr 1.7fr .95fr .85fr 1.35fr .75fr auto;gap:10px;align-items:end;padding:12px;border:1px solid var(--audit-line);background:#fff}.filter-panel label{display:grid;gap:5px;min-width:0;color:#3f4a5a}.filter-panel span{font-size:11px}.filter-panel select,.filter-panel input{box-sizing:border-box;width:100%;height:30px;border:1px solid #d9e0e9;border-radius:4px;background:#fff;color:#475467;font-size:12px}.filter-actions button{min-width:54px}.metric-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));margin-top:10px;border:1px solid var(--audit-line);background:#fff}.metric-card{display:flex;gap:8px;min-width:0;padding:13px 12px;border-right:1px solid var(--audit-line)}.metric-card:last-child{border-right:0}.metric-icon{display:grid;flex:0 0 36px;height:36px;place-items:center;border-radius:8px;font-weight:700}.metric-card.red .metric-icon{border:1px solid #fecaca;background:#fff1f2;color:var(--color-primary)}.metric-card.blue .metric-icon{border:1px solid #bfdbfe;background:#eff6ff;color:var(--color-info)}.metric-card.orange .metric-icon{border:1px solid #fed7aa;background:#fff7ed;color:var(--color-warning)}.metric-card.green .metric-icon{border:1px solid #bbf7d0;background:#ecfdf5;color:var(--color-success)}.metric-card p{margin:0 0 5px;color:#475467}.metric-card strong{display:block;min-width:0;overflow:hidden;font-size:15px;line-height:24px;text-overflow:clip;white-space:nowrap}.metric-card small{display:block;margin-top:8px;color:#667085}.metric-card small b{color:var(--color-primary);font-weight:500}.chart-grid{display:grid;grid-template-columns:1.18fr 1.05fr 1.08fr 1.05fr;gap:10px;margin-top:10px}.chart-card{box-sizing:border-box;min-width:0;height:272px;padding:12px;border:1px solid var(--audit-line);background:#fff}.chart-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.chart-title h2{margin:0;font-size:14px}.chart-title span,.trend-legend{color:#667085;font-size:10px}.trend-legend{display:flex;gap:12px;margin-bottom:8px}.trend-legend i,.chart-list i{display:inline-block;width:10px;height:10px;margin-right:5px;border-radius:2px;vertical-align:-1px}.trend-legend .blue{background:var(--color-info)}.trend-legend .green{background:var(--color-success)}.trend-legend .orange{background:var(--color-warning)}.trend-plot{display:grid;grid-template-columns:36px minmax(0,1fr);height:200px}.trend-scale{display:flex;flex-direction:column;justify-content:space-between;color:#7b8794;font-size:10px;text-align:right}.trend-bars{position:relative;display:grid;grid-template-columns:repeat(3,1fr);align-items:end;padding:10px 10px 18px;border-bottom:1px solid #dce3eb;background:repeating-linear-gradient(to bottom,#fff 0,#fff 38px,#eef2f6 39px)}.trend-month{display:grid;justify-items:center;gap:6px;color:#667085}.bar-pair{display:flex;height:150px;align-items:end;gap:8px}.bar{width:13px;border-radius:2px 2px 0 0}.bar.actual{background:var(--color-info)}.bar.budget{background:var(--color-success)}.trend-line{position:absolute;right:5px;bottom:36px;left:5px;width:calc(100% - 10px);height:120px;pointer-events:none}.donut-layout{display:grid;grid-template-columns:minmax(104px,1fr) minmax(110px,1fr);gap:12px;align-items:center;height:210px}.donut{position:relative;display:grid;width:min(138px,100%);aspect-ratio:1;margin:auto;place-items:center;border-radius:50%}.category-donut{background:conic-gradient(var(--color-info) 0 28.63%,var(--color-success) 28.63% 47.38%,#5b8790 47.38% 62.8%,var(--color-primary) 62.8% 72.68%,var(--color-warning) 72.68% 79.99%,#b8944f 79.99% 100%)}.anomaly-donut{background:conic-gradient(var(--color-info) 0 34.38%,var(--color-success) 34.38% 60.94%,var(--color-warning) 60.94% 82.82%,#b8944f 82.82% 92.2%,#b97575 92.2% 100%)}.donut::after{position:absolute;inset:28%;border-radius:50%;background:#fff;content:""}.donut span{position:relative;z-index:1;color:#344054;font-size:11px;line-height:1.35;text-align:center}.donut b{font-size:12px}.chart-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.chart-list li{display:grid;grid-template-columns:12px minmax(0,1fr) auto;align-items:center;color:#344054;font-size:11px}.chart-list b{font-weight:500}.rank-list{display:grid;gap:7px;margin:0;padding:0;list-style:none}.rank-list li{display:grid;grid-template-columns:42px minmax(80px,1fr) 66px;gap:8px;align-items:center}.rank-list span,.rank-list strong{font-size:11px;font-weight:500}.rank-list i{height:7px;overflow:hidden;border-radius:4px;background:#e9eef6}.rank-list b{display:block;height:100%;border-radius:inherit;background:var(--color-info)}.exception-section{margin-top:10px;border:1px solid var(--audit-line);background:#fff}.exception-tabs{display:flex;align-items:center;gap:24px;min-height:46px;padding:0 12px;border-bottom:1px solid var(--audit-line)}.exception-tabs button{border:0;background:transparent;color:#344054}.exception-tabs button.active{color:var(--audit-red);font-weight:700}.exception-tabs .export{margin-left:auto;padding:0 14px;border:1px solid #d7dee8;background:#fff}.table-wrap{overflow-x:auto;overflow-y:visible;padding:12px 12px 0}.exception-section table{width:100%;min-width:940px;border-collapse:collapse;font-size:11px}.exception-section th,.exception-section td{height:36px;border:1px solid #edf1f5;padding:0 10px;text-align:left;white-space:nowrap}.exception-section th{background:#f8fafc;color:#344054;font-weight:600}.risk-tag{display:inline-flex;height:20px;align-items:center;padding:0 7px;border-radius:4px;font-size:10px}.risk-tag.high{border:1px solid #fecaca;background:#fff1f2;color:var(--color-primary)}.risk-tag.medium{border:1px solid #fed7aa;background:#fff7ed;color:var(--color-warning)}.risk-tag.low{border:1px solid #bbf7d0;background:#ecfdf5;color:var(--color-success)}.table-actions{display:flex;gap:8px;align-items:center}.table-actions button{height:auto;border:0;background:transparent;color:var(--color-info);font-size:11px}.table-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 14px;color:#475467}.table-footer>div{display:flex;align-items:center;gap:8px}.table-footer button{width:26px;height:26px}.table-footer button.active{border-color:var(--audit-red);background:var(--audit-red);color:#fff}.table-footer select,.table-footer input{height:26px;border:1px solid #d7dee8;border-radius:4px;background:#fff;color:#475467}.table-footer input{width:46px;text-align:center}.detail-drawer{min-width:0;overflow:visible;border-left:1px solid var(--audit-line);background:#fff;padding:16px 16px 20px}.detail-drawer header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.detail-drawer h2{margin:0;font-size:15px}.detail-drawer header button{width:28px;border:0;font-size:20px}.detail-drawer section{padding:12px 0;border-bottom:1px solid var(--audit-line)}.detail-drawer h3{margin:0 0 10px;font-size:13px}.detail-drawer dl{display:grid;gap:10px;margin:0}.detail-drawer dl div{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px}.detail-drawer dt{color:#667085}.detail-drawer dd{margin:0;color:#344054}.approval-chain{display:grid;gap:10px;margin:0;padding:0;list-style:none}.approval-chain li{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:8px;align-items:start;color:#667085}.approval-chain li span{width:7px;height:7px;margin-top:5px;border-radius:50%;background:#cbd5e1}.approval-chain li.done span{background:var(--color-success)}.approval-chain li.warning span{background:var(--color-warning)}.approval-chain p{margin:0}.approval-chain time{font-size:10px}.drawer-actions button{min-width:72px}.drawer-actions button.primary{background:var(--audit-red)}
@media(max-width:1380px){.expense-audit-overview-page{grid-template-columns:minmax(0,1fr) 286px}.filter-panel{grid-template-columns:repeat(3,minmax(0,1fr));}.filter-actions{justify-content:flex-end}.chart-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.chart-card{height:260px}.metric-card{padding:12px}.metric-card strong{font-size:16px}.exception-tabs{gap:12px;overflow-x:auto}.exception-tabs button{flex:0 0 auto}}
@media(max-width:900px){.expense-audit-overview-page{display:block;height:auto;overflow:visible}.overview-main{overflow:visible;padding:12px}.detail-drawer{border-top:1px solid var(--audit-line);border-left:0}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-card:nth-child(2n){border-right:0}.chart-grid{grid-template-columns:1fr}.filter-panel{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.filter-panel,.metric-grid{grid-template-columns:1fr}.metric-card{border-right:0;border-bottom:1px solid var(--audit-line)}.donut-layout{grid-template-columns:1fr}.chart-card{height:auto;min-height:260px}.table-footer{align-items:flex-start;flex-direction:column;gap:10px}.detail-drawer dl div{grid-template-columns:68px minmax(0,1fr)}}
.expense-audit-overview-page {
  height: 0;
  min-height: 0;
  overflow: hidden;
}

.overview-main {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.detail-drawer {
  min-height: 0;
  overflow: auto;
}

.exception-section {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.exception-section .table-wrap {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.exception-section table {
  height: 100%;
  table-layout: fixed;
}

.filter-panel span,
.chart-title span,
.trend-legend,
.trend-scale,
.donut span,
.chart-list li,
.rank-list span,
.rank-list strong,
.exception-section table,
.table-actions button,
.approval-chain time {
  font-size: var(--ui-font-xs);
}

.metric-card strong {
  overflow: visible;
  line-height: 1.25;
  white-space: normal;
}

.risk-tag {
  font-size: var(--ui-font-xs);
}

@media (min-width: 1381px) {
  .chart-grid {
    grid-template-columns: minmax(330px, 1.16fr) minmax(250px, .9fr) minmax(330px, 1.18fr) minmax(300px, 1.06fr);
    gap: 8px;
  }

  .chart-card {
    height: 254px;
    padding: 10px 12px;
  }

  .trend-plot {
    height: 184px;
  }

  .trend-bars {
    padding-bottom: 16px;
  }

  .bar-pair {
    height: 132px;
  }

  .donut-layout {
    height: 190px;
    gap: 8px;
  }

  .donut {
    width: min(124px, 100%);
  }

  .chart-list {
    gap: 6px;
  }

  .rank-card {
    padding-left: 16px;
    padding-right: 14px;
  }

  .rank-list {
    gap: 6px;
  }

  .rank-list li {
    grid-template-columns: 44px minmax(112px, 1fr) 72px;
    gap: 8px;
  }
}

.exception-section table {
  min-width: 1040px;
}

.exception-section th,
.exception-section td {
  height: 40px;
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exception-section tbody {
  height: 1px;
}

.exception-section .table-wrap table {
  height: auto;
}

.col-id {
  width: 136px;
}

.col-type {
  width: 112px;
}

.col-department {
  width: 92px;
}

.col-employee {
  width: 64px;
}

.col-amount {
  width: 94px;
}

.col-voucher {
  width: 132px;
}

.col-rule {
  width: 178px;
}

.col-status {
  width: 82px;
}

.col-actions {
  width: 188px;
}

.table-actions {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.table-actions button,
.table-actions a {
  flex: 0 0 auto;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-info);
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.detail-drawer header a {
  display: grid;
  width: 28px;
  height: 30px;
  place-items: center;
  color: #344054;
  font-size: 20px;
}

.exception-section .table-wrap {
  padding-top: 8px;
}

.expense-audit-overview-page {
  grid-template-columns: minmax(0, 1fr);
}

.expense-audit-overview-page.has-detail {
  grid-template-columns: minmax(0, 1fr) clamp(286px, 19vw, 318px);
}

.metric-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.exception-section tr.selected td {
  background: #fff8f8;
}

@media (max-width: 900px) {
  .expense-audit-overview-page.has-detail {
    display: block;
  }
}
</style>
