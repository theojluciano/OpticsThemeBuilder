import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OPTICS_FAMILY_BASELINES as B } from '../../data/optics-baselines';
import {
  LIGHT_MODE_BG, DARK_MODE_BG, LIGHT_MODE_ON, DARK_MODE_ON, LIGHT_MODE_ON_ALT, DARK_MODE_ON_ALT
} from '../../data/defaults';

const STORAGE_KEY = 'optics-theme-builder-state';

// The store only persists when `window` exists; vitest runs in node, so stand
// up the two globals it actually touches rather than pulling in jsdom.
const store = new Map<string, string>();
const fakeLocalStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear()
};
vi.stubGlobal('localStorage', fakeLocalStorage);
vi.stubGlobal('window', { localStorage: fakeLocalStorage });

/** A v1 color type: primary's ramp on every family, and no seed `l`. */
function v1(name: string, h: number, s: number) {
  return {
    id: name.toLowerCase(), name, enabled: true, isCustom: false, collapsed: true, h, s,
    lightBg: { ...LIGHT_MODE_BG }, darkBg: { ...DARK_MODE_BG },
    lightOn: { ...LIGHT_MODE_ON }, darkOn: { ...DARK_MODE_ON },
    lightOnAlt: { ...LIGHT_MODE_ON_ALT }, darkOnAlt: { ...DARK_MODE_ON_ALT }
  };
}

async function loadStoreWith(state: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  vi.resetModules();
  const { colorTypes } = await import('../color-types');
  let snapshot: any;
  colorTypes.subscribe(v => { snapshot = v; })();
  return snapshot;
}

describe('v1 → v2 state migration', () => {
  beforeEach(() => localStorage.clear());

  it("restores each Optics family's own ramp when it was never edited", async () => {
    const state = await loadStoreWith({
      mode: 'light',
      colorTypes: [v1('Primary', 217, 91), v1('Neutral', 217, 4), v1('Warning', 38, 92)]
    });

    const neutral = state.colorTypes.find((c: any) => c.name === 'Neutral');
    const warning = state.colorTypes.find((c: any) => c.name === 'Warning');

    expect(neutral.lightBg['plus-one']).toBe(B.neutral.lightBg['plus-one']);
    expect(warning.lightOn.base).toBe(B['alerts-warning'].lightOn.base);
    // The reviewer's headline case: white-on-warning was a WCAG failure.
    expect(warning.lightOn.base).toBe(12);
  });

  it('leaves a family completely alone if even one stop was edited', async () => {
    const edited = v1('Neutral', 217, 4);
    edited.lightBg.base = 37;

    const state = await loadStoreWith({
      mode: 'light',
      colorTypes: [v1('Primary', 217, 91), edited]
    });

    const neutral = state.colorTypes.find((c: any) => c.name === 'Neutral');
    expect(neutral.lightBg.base).toBe(37);
    // Untouched stops keep the old (primary) values rather than being rewritten.
    expect(neutral.lightBg['plus-one']).toBe(LIGHT_MODE_BG['plus-one']);
  });

  it('never rewrites primary, and never touches hue or saturation', async () => {
    const state = await loadStoreWith({
      mode: 'light',
      colorTypes: [v1('Primary', 217, 91), v1('Neutral', 217, 4)]
    });

    const primary = state.colorTypes.find((c: any) => c.name === 'Primary');
    expect(primary.lightBg).toEqual(LIGHT_MODE_BG);
    expect(primary.h).toBe(217);
    expect(state.colorTypes.map((c: any) => [c.h, c.s])).toEqual([[217, 91], [217, 4]]);
  });

  it('backfills the seed lightness from each family baseline', async () => {
    const state = await loadStoreWith({
      mode: 'light',
      colorTypes: [v1('Primary', 217, 91), v1('Danger', 0, 84), v1('Secondary', 260, 60)]
    });

    const byName = Object.fromEntries(state.colorTypes.map((c: any) => [c.name, c]));
    expect(byName.Primary.l).toBe(B.primary.l);
    expect(byName.Danger.l).toBe(B['alerts-danger'].l);
    expect(byName.Secondary.l).toBe(48); // no Optics family → fallback
  });

  it('is idempotent and skips already-migrated state', async () => {
    const once = await loadStoreWith({
      mode: 'light',
      colorTypes: [v1('Primary', 217, 91), v1('Neutral', 217, 4)]
    });
    expect(once.version).toBe(2);

    // Re-loading migrated state must not touch a now-deliberate primary ramp.
    const deliberate = JSON.parse(JSON.stringify(once));
    deliberate.colorTypes[1].lightBg = { ...LIGHT_MODE_BG };
    const twice = await loadStoreWith(deliberate);
    expect(twice.colorTypes[1].lightBg['plus-one']).toBe(LIGHT_MODE_BG['plus-one']);
  });
});
