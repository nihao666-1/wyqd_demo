const explicitViews = new Set(['pending', 'generating', 'archived']);

export function resolveTaskDetailView(query = {}, task) {
  const explicitState = String(query.state || '');
  if (explicitViews.has(explicitState)) return explicitState;
  if (query.tab === 'results') return 'pending';
  if (task?.statusKey === 'archived') return 'archived';
  if (task?.statusKey === 'generating') return 'generating';
  return 'pending';
}
