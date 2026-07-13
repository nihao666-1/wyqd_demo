const tabMatches = {
  all: () => true,
  running: (row) => ['running', 'generating', 'parsing', 'pending-parse', 'pending-generate', 'draft'].includes(row.statusKey),
  confirming: (row) => row.statusKey === 'confirming',
  archived: (row) => row.statusKey === 'archived',
  abnormal: (row) => row.statusKey === 'failed'
};

export function getTaskCenterRows(rows, filters, activeTab) {
  return rows.filter((row) => {
    const keywordMatches = !filters.keyword || `${row.id}${row.name}`.includes(filters.keyword);
    const selectMatches = (filters.organization === '全部' || row.organization === filters.organization)
      && (filters.type === '全部' || row.type === filters.type)
      && (filters.status === '全部' || row.status === filters.status);
    return keywordMatches && selectMatches && tabMatches[activeTab](row);
  });
}

export function paginateTaskRows(rows, requestedPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), page, totalPages };
}
