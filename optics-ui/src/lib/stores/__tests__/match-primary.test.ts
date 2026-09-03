import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OPTICS_FAMILY_BASELINES as B } from '../../data/optics-baselines';
import { exportOpticsCSS } from '../../utils/css-export';

const STORAGE_KEY = 'optics-theme-builder-state';

// Same shim as migration.test.ts: the store only persists when `window`
// exists, and vitest runs in node.
const backing = new Map<string, string>();
const fakeLocalStorage = {
  getItem: (k: string) => backing.get(k) ?? null,
  setItem: (k: string, v: string) => void backing.set(k, v),
  removeItem: (k: string) => void backing.delete(k),
  clear: () => backing.clear()
};
vi.stubGlobal('localStorage', fakeLocalStorage);
vi.stubGlobal('window', { localStorage: fakeLocalStorage });

/** A v2 color type: its own family ramp, a seed `l`, and no lock. */
function v2(id: string, name: string, h: number, s: number, l: number) {
  const baseline = B[id] ?? B.primary;
  return {
    id, name, enabled: true, isCustom: false, collapsed: true, h, s, l,
    lightBg: { ...baseline.lightBg }, darkBg: { ...baseline.darkBg },
    lightOn: { ...baseline.lightOn }, darkOn: { ...baseline.darkOn },
    lightOnAlt: { ...baseline.lightOnAlt }, darkOnAlt: { ...baseline.darkOnAlt }
  };
}

async function freshStore(state?: unknown) {
  if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  vi.resetModules();
  const mod = await import('../color-types');
  const read = () => {
    let snapshot: any;
    mod.colorTypes.subscribe(v => { snapshot = v; })();
    return snapshot;
  };
  const find = (id: string) => read().colorTypes.find((ct: any) => ct.id === id);
  return { ...mod, read, find };
}

describe('matching neutral to primary', () => {
  beforeEach(() => localStorage.clear());

  it('is on by default, mirroring the Optics alias', async () => {
    const { find } = await freshStore();

    expect(find('neutral').matchPrimary).toBe(true);
    expect(find('neutral').h).toBe(find('primary').h);
    expect(find('neutral').l).toBe(find('primary').l);
  });

  it('is offered on neutral alone, because that is the only family Optics aliases', async () => {
    const { canMatchPrimary, read } = await freshStore();

    const offered = read().colorTypes.filter((ct: any) => canMatchPrimary(ct));
    expect(offered.map((ct: any) => ct.id)).toEqual(['neutral']);
  });

  it("pulls neutral's hue and seed lightness along when primary moves", async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.updateSeed('primary', { h: 42, s: 80, l: 61 });

    expect(find('neutral').h).toBe(42);
    expect(find('neutral').l).toBe(61);
    // Saturation is neutral's own — Optics never aliased it.
    expect(find('neutral').s).toBe(4);
  });

  it('does not touch an unlocked family when primary moves', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.setMatchPrimary('neutral', false);
    colorTypes.updateSeed('primary', { h: 42, l: 61 });

    expect(find('neutral').h).toBe(217);
    expect(find('neutral').l).toBe(B.neutral.l);
  });

  it('snaps to primary the moment the lock is switched back on', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.setMatchPrimary('neutral', false);
    colorTypes.updateSeed('neutral', { h: 300, l: 20 });
    colorTypes.updateSeed('primary', { h: 42, l: 61 });
    colorTypes.setMatchPrimary('neutral', true);

    expect(find('neutral').h).toBe(42);
    expect(find('neutral').l).toBe(61);
  });

  it('releases the lock when a color is picked, keeping the picked hue', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.updateSeedFromPicker('neutral', { h: 300, s: 20, l: 30 });

    expect(find('neutral').matchPrimary).toBe(false);
    expect(find('neutral').h).toBe(300);
    expect(find('neutral').l).toBe(30);
  });

  it('survives a reload, and keeps mirroring across it', async () => {
    const first = await freshStore();
    first.colorTypes.updateSeed('primary', { h: 42, l: 61 });

    const second = await freshStore();
    expect(second.find('neutral').matchPrimary).toBe(true);
    expect(second.find('neutral').h).toBe(42);
  });

  it('resets back to locked', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.setMatchPrimary('neutral', false);
    colorTypes.reset();

    expect(find('neutral').matchPrimary).toBe(true);
  });
});

describe('what a locked neutral exports', () => {
  beforeEach(() => localStorage.clear());

  it('emits no neutral seed, because the Optics alias still holds', async () => {
    const { colorTypes, read } = await freshStore();

    colorTypes.updateSeed('primary', { h: 42, s: 80, l: 61 });
    const css = exportOpticsCSS(read().colorTypes);

    // Primary is pinned, but neutral inherits both seeds through
    // `var(--op-color-primary-…)` — restating them would say nothing.
    expect(css).toContain('--op-color-primary-h: 42;');
    expect(css).not.toContain('--op-color-neutral-h');
    expect(css).not.toContain('--op-color-neutral-l');
  });

  it('pins the seeds as literals once the lock is off', async () => {
    const { colorTypes, read } = await freshStore();

    colorTypes.updateSeedFromPicker('neutral', { h: 300, s: 20, l: 30 });
    const css = exportOpticsCSS(read().colorTypes);

    expect(css).toContain('--op-color-neutral-h: 300;');
    expect(css).toContain('--op-color-neutral-l: 30%;');
  });
});

describe('v2 → v3 migration of saved state', () => {
  beforeEach(() => localStorage.clear());

  it('locks a saved neutral, which predates the switch entirely', async () => {
    const { find } = await freshStore({
      mode: 'light',
      version: 2,
      colorTypes: [v2('primary', 'Primary', 217, 91, 48), v2('neutral', 'Neutral', 217, 4, 48)]
    });

    expect(find('neutral').matchPrimary).toBe(true);
  });

  it("adopts primary's seeds even where the saved neutral had drifted", async () => {
    const { find } = await freshStore({
      mode: 'light',
      version: 2,
      colorTypes: [v2('primary', 'Primary', 217, 91, 48), v2('neutral', 'Neutral', 30, 4, 62)]
    });

    expect(find('neutral').matchPrimary).toBe(true);
    expect(find('neutral').h).toBe(217);
    expect(find('neutral').l).toBe(48);
    // Saturation was never aliased, so the saved value survives.
    expect(find('neutral').s).toBe(4);
  });

  it('never locks a family Optics does not alias', async () => {
    const { find } = await freshStore({
      mode: 'light',
      version: 2,
      colorTypes: [
        v2('primary', 'Primary', 217, 91, 48),
        v2('alerts-danger', 'Danger', 217, 84, 48)
      ]
    });

    expect(find('alerts-danger').matchPrimary).toBe(false);
  });
});

describe('importing a tokens file', () => {
  beforeEach(() => localStorage.clear());

  /** The shape `importPalette` takes: one mode's three ramps per color type. */
  function imported(name: string, h: number, s: number) {
    const baseline = B[name.toLowerCase()] ?? B.primary;
    return {
      name, h, s,
      bgValues: { ...baseline.lightBg },
      onValues: { ...baseline.lightOn },
      onAltValues: { ...baseline.lightOnAlt }
    };
  }

  it('imports as locked when the file\'s neutral hue still equals primary\'s', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.importPalette({
      mode: 'light',
      colorTypes: [imported('Primary', 217, 91), imported('Neutral', 217, 4)]
    });

    expect(find('neutral').matchPrimary).toBe(true);
  });

  it('keeps a hue the file actually states, rather than snapping it to primary', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.importPalette({
      mode: 'light',
      colorTypes: [imported('Primary', 217, 91), imported('Neutral', 30, 4)]
    });

    expect(find('neutral').matchPrimary).toBe(false);
    expect(find('neutral').h).toBe(30);
  });
});
