export function canPerform(user, action, target = {}) {
  if (!user?.actionPermissions?.includes(action)) {
    return { allowed: false, reason: 'NO_PERMISSION' };
  }
  if (target.departmentId && !user.departmentScope.includes(target.departmentId)) {
    return { allowed: false, reason: 'NO_PERMISSION' };
  }
  if (target.companyId && !user.companyScope.includes(target.companyId)) {
    return { allowed: false, reason: 'NO_PERMISSION' };
  }
  return { allowed: true, reason: '' };
}
