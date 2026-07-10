export const fileStates = {
  BEFORE_UPLOAD: '上传前',
  UPLOADED: '待预览',
  FIELD_EDIT: '待补三字段',
  METADATA: '待元数据映射',
  PRECHECK: '待预检',
  INBOUNDED: '已入库',
  REFERENCED: '已引用',
  LOCKED_REFERENCE: '引用锁定'
};

export const requiredFileFields = ['adaptOrg', 'adaptDepartment', 'dataPeriod'];

export function hasRequiredFileFields(row) {
  return requiredFileFields.every((field) => Boolean(row[field]));
}

export function getFileActionDisabledReason(file, action) {
  if (['delete', 'invalidate', 'replace'].includes(action) && file.referenceCount > 0) return 'ASSET_REFERENCED';
  if (action === 'inbound' && !hasRequiredFileFields(file)) return 'MISSING_REQUIRED_SOURCE';
  return '';
}
