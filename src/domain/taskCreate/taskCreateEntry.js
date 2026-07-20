const validMaterialSources = new Set(['local', 'fileCenter', 'simulation']);

export function resolveTaskCreateEntry(query = {}) {
  const source = validMaterialSources.has(query.source) ? query.source : 'local';

  if (query.phase === 'ability') return { step: 0, stage: 'ability', source };
  if (query.phase === 'basic') return { step: 1, stage: 'basic', source };
  if (query.phase === 'materials') return { step: 2, stage: 'materials', source };
  if (query.phase === 'parse') return { step: 3, stage: 'parsing', source };
  if (query.phase === 'confirm' || query.phase === 'template') {
    return { step: 4, stage: 'template', source };
  }

  return { step: 0, stage: 'ability', source };
}
