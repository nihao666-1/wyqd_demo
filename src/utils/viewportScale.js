export const VIEWPORT_BASE = Object.freeze({ width: 2560, height: 1440 });
export const VIEWPORT_LAYOUT_SCALE_LIMITS = Object.freeze({ min: 0.75, max: 1 });

export const UI_BASE_TOKENS = Object.freeze({
  '--ui-font-xs': 14.0625,
  '--ui-font-sm': 15,
  '--ui-font-md': 16,
  '--ui-font-lg': 18,
  '--ui-font-xl': 22,
  '--ui-space-1': 5.333333,
  '--ui-space-2': 8,
  '--ui-space-3': 10.666667,
  '--ui-space-4': 16,
  '--ui-space-5': 21.333333,
  '--ui-space-6': 32,
  '--ui-icon-sm': 21.333333,
  '--ui-icon-md': 24,
  '--ui-icon-lg': 32,
  '--ui-control-sm': 40,
  '--ui-control-md': 48,
  '--ui-topbar-height': 77.333333,
  '--ui-sidebar-width': 352,
  '--ui-page-gutter': 18.666667,
  '--ui-panel-rail-sm': 224,
  '--ui-panel-rail-md': 266.666667,
  '--ui-panel-rail-lg': 400,
  '--ui-radius-sm': 5.333333,
  '--ui-radius-md': 8,
  '--ui-border-width': 1
});

const STABLE_TOKENS = new Set([
  '--ui-border-width',
  '--ui-font-xs',
  '--ui-font-sm',
  '--ui-font-md',
  '--ui-font-lg',
  '--ui-font-xl'
]);
const toPixel = (value) => `${Number(value.toFixed(4))}px`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function calculateViewportScale(width, height) {
  return Math.min(width / VIEWPORT_BASE.width, height / VIEWPORT_BASE.height);
}

export function calculateLayoutScale(width, height) {
  return clamp(
    calculateViewportScale(width, height),
    VIEWPORT_LAYOUT_SCALE_LIMITS.min,
    VIEWPORT_LAYOUT_SCALE_LIMITS.max
  );
}

export function buildViewportTokens(width, height) {
  const scale = calculateViewportScale(width, height);
  const layoutScale = calculateLayoutScale(width, height);
  const cssVariables = Object.fromEntries(
    Object.entries(UI_BASE_TOKENS).map(([name, value]) => [
      name,
      toPixel(STABLE_TOKENS.has(name) ? value : value * layoutScale)
    ])
  );
  return { scale, layoutScale, cssVariables };
}

export function applyViewportScale(root, width, height) {
  const result = buildViewportTokens(width, height);
  for (const [name, value] of Object.entries(result.cssVariables)) {
    root.style.setProperty(name, value);
  }
  root.dataset.uiScale = result.scale.toFixed(6);
  root.dataset.uiLayoutScale = result.layoutScale.toFixed(6);
  return result.scale;
}

export function installViewportScale(root = document.documentElement, viewport = window) {
  let frame = 0;
  const update = () => {
    viewport.cancelAnimationFrame(frame);
    frame = viewport.requestAnimationFrame(() => {
      applyViewportScale(root, viewport.innerWidth, viewport.innerHeight);
    });
  };

  applyViewportScale(root, viewport.innerWidth, viewport.innerHeight);
  viewport.addEventListener('resize', update, { passive: true });

  return () => {
    viewport.cancelAnimationFrame(frame);
    viewport.removeEventListener('resize', update);
  };
}
