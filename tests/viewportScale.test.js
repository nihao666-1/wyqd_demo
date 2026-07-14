import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  UI_BASE_TOKENS,
  buildViewportTokens,
  calculateViewportScale
} from '../src/utils/viewportScale.js';

const cases = [
  [1366, 768, 768 / 1440],
  [1440, 900, 1440 / 2560],
  [1920, 1080, 0.75],
  [2048, 1024, 1024 / 1440],
  [2560, 1440, 1],
  [3840, 2160, 1.5]
];

const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

test('viewport scale uses the smaller 2560x1440 ratio without clamping', () => {
  for (const [width, height, expected] of cases) {
    assert.ok(Math.abs(calculateViewportScale(width, height) - expected) < 0.000001);
  }
});

test('all visual tokens scale with the same coefficient', () => {
  const at1366 = buildViewportTokens(1366, 768);
  const at1920 = buildViewportTokens(1920, 1080);
  assert.equal(at1366.cssVariables['--ui-font-xs'], '10px');
  assert.equal(at1920.scale, 0.75);
  assert.equal(at1920.cssVariables['--ui-sidebar-width'], '264px');
  assert.equal(at1920.cssVariables['--ui-topbar-height'], '58px');
  assert.equal(at1920.cssVariables['--ui-font-xs'], '14.0625px');
  assert.equal(at1920.cssVariables['--ui-font-md'], '16px');
  assert.equal(at1920.cssVariables['--ui-panel-rail-sm'], '168px');
  assert.equal(at1920.cssVariables['--ui-panel-rail-md'], '200px');
  assert.equal(at1920.cssVariables['--ui-panel-rail-lg'], '300px');
  assert.equal(UI_BASE_TOKENS['--ui-border-width'], 1);
  assert.equal(at1920.cssVariables['--ui-border-width'], '1px');
});

test('app installs viewport tokens before Vue mounts', () => {
  const installIndex = mainSource.indexOf('installViewportScale()');
  const mountIndex = mainSource.indexOf('createApp(App)');
  assert.ok(installIndex >= 0 && installIndex < mountIndex);
  assert.match(tokenSource, /--ui-sidebar-width:\s*264px/);
  assert.match(tokenSource, /--ui-font-xs:\s*14\.0625px/);
  assert.match(tokenSource, /--ui-font-md:\s*16px/);
  assert.match(tokenSource, /--ui-panel-rail-lg:\s*300px/);
});
