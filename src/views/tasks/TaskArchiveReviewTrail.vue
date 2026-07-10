<template>
  <section class="review-trail-grid" data-archive-region="review-trail">
    <article class="review-panel">
      <h2>复核记录</h2>
      <table class="review-table">
        <thead><tr><th>复核人</th><th>复核时间</th><th>复核意见</th><th>结论</th><th>附加说明</th></tr></thead>
        <tbody><tr v-for="review in archive.reviews" :key="review.reviewedAt"><td>{{ review.reviewer }}</td><td>{{ review.reviewedAt }}</td><td>{{ review.opinion }}</td><td><span>{{ review.conclusion }}</span></td><td>{{ review.note }}</td></tr></tbody>
      </table>
      <p>共 {{ archive.reviews.length }} 条记录</p>
    </article>

    <article class="trail-panel">
      <h2>操作留痕 <small>（关键节点）</small></h2>
      <ol class="archive-timeline" aria-label="归档任务关键节点">
        <li v-for="step in archive.timeline" :key="step.label" :class="{ archive: step.archive }">
          <span class="timeline-node"><FontAwesomeIcon :icon="step.archive ? faFileExport : faCheck" /></span>
          <strong>{{ step.label }}</strong>
          <time>{{ step.occurredAt.slice(0, 10) }}<br />{{ step.occurredAt.slice(11) }}</time>
        </li>
      </ol>
    </article>
  </section>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faFileExport } from '@fortawesome/free-solid-svg-icons';
defineProps({ archive: { type: Object, required: true } });
</script>

<style scoped>
.review-trail-grid { height: 150px; margin-top: 9px; display: grid; grid-template-columns: 452px 1fr; gap: 9px; }
.review-panel, .trail-panel { min-width: 0; border: 1px solid #e5e8ec; border-radius: 4px; overflow: hidden; }
.review-panel h2, .trail-panel h2 { height: 33px; margin: 0; padding: 0 4px; border-bottom: 1px solid #e5e8ec; display: flex; align-items: center; font-size: 14px; }.trail-panel h2 small { color: #5f6670; font-size: 10px; font-weight: 500; }
.review-table { width: 100%; min-width: 0; border-collapse: collapse; table-layout: fixed; font-size: 9px; }.review-table th { height: 29px; padding: 0 4px; background: #f7f8f9; text-align: left; }.review-table td { height: 55px; padding: 5px 4px; border-top: 1px solid #edf0f3; line-height: 14px; vertical-align: middle; }.review-table th:nth-child(1){width:52px}.review-table th:nth-child(2){width:94px}.review-table th:nth-child(3){width:178px}.review-table th:nth-child(4){width:48px}.review-table th:nth-child(5){width:80px}.review-table td span { color: #079447; }
.review-panel > p { height: 30px; margin: 0; padding: 0 5px; border-top: 1px solid #edf0f3; display: flex; align-items: center; font-size: 9px; }
.archive-timeline { height: 116px; margin: 0; padding: 22px 14px 0; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); list-style: none; }
.archive-timeline li { position: relative; min-width: 0; padding-top: 27px; text-align: center; }.archive-timeline li::before { content:""; position:absolute; top:9px; left:-50%; width:100%; height:2px; background:#0a9c62; }.archive-timeline li:first-child::before { display:none; }.archive-timeline li.archive::before { height:1px; background:repeating-linear-gradient(90deg,#9ba2ad 0 5px,transparent 5px 8px); }
.timeline-node { position:absolute; z-index:1; top:0; left:50%; width:19px; height:19px; border-radius:50%; background:#0a9c62; color:#fff; display:grid; place-items:center; transform:translateX(-50%); font-size:9px; }.archive .timeline-node { top:-7px; width:34px; height:34px; border:1px solid #dce1e7; border-radius:6px; background:#f7f8fa; color:#56606d; font-size:17px; }
.archive-timeline strong { display:block; overflow:hidden; font-size:9px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }.archive-timeline time { display:block; margin-top:3px; color:#58616e; font-size:8px; line-height:12px; }
</style>
