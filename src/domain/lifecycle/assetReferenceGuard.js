import { getFileActionDisabledReason } from '../stateMachines/fileState.js';

export function guardAssetAction(asset, action) {
  const reason = getFileActionDisabledReason(asset, action);
  return {
    allowed: !reason,
    reason,
    message: reason ? '该资料已被引用，不能直接修改、设置失效或删除。请先发起解锁并回退相关草稿。' : ''
  };
}
