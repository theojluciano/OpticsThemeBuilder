import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OPTICS_FAMILY_BASELINES as B } from '../../data/optics-baselines';

const STORAGE_KEY = 'optics-theme-builder-state';

// Same shim as the other store tests: persistence needs `window`, and vitest
// runs in node.
const backing = new Map<string, string>();
const fakeLocalStorage = {
  getItem: (k: string) => backing.get(k) ?? null,
  setItem: (k: string, v: string) => void backing.set(k, v),
  removeItem: (k: string) => void backing.delete(k),
  clear: () => backing.clear()
};
vi.stubGlobal('localStorage', fakeLocalStorage);
vi.stubGlobal('window', { localStorage: fakeLocalStorage });

async function freshStore() {
  vi.resetModules();
  const mod = await import('../color-types');
  const read = () => {
    let snapshot: any;
    mod.colorTypes.subscribe(v => { snapshot = v; })();
    return snapshot;
  };
  return { ...mod, read, find: (id: string) => read().colorTypes.find((ct: any) => ct.id === id) };
}

describe('reset', () => {
  beforeEach(() => localStorage.clear());

  it('restores seeds, ramps and mode, and drops custom types', async () => {
    const { colorTypes, read, find } = await freshStore();

    colorTypes.setMode('dark');
    colorTypes.updateSeed('primary', { h: 42, s: 11, l: 61 });
    colorTypes.updateBg('primary', 'base', 7);
    colorTypes.addCustomColorType('Brand', 300, 50, 40);
    colorTypes.toggleColorType('neutral');
    colorTypes.toggleCollapse('primary');

    colorTypes.reset();

    expect(read().mode).toBe('light');
    expect(read().colorTypes.map((ct: any) => ct.id)).toEqual(
      ['primary', 'neutral', 'secondary', 'notice', 'warning', 'danger', 'info']
    );
    expect(find('primary')).toMatchObject({ h: 217, s: 91, l: 48, collapsed: true });
    expect(find('primary').darkBg.base).toBe(B.primary.darkBg.base);
    expect(find('neutral')).toMatchObject({ enabled: true, matchPrimary: true });
  });

  it('still resets on the second press', async () => {
    const { colorTypes, find } = await freshStore();

    colorTypes.reset();
    colorTypes.updateSeed('primary', { h: 42 });
    colorTypes.updateBg('primary', 'base', 7);
    colorTypes.reset();

    // A shared defaults constant would have carried the first reset's objects
    // back into live state, leaving these edits welded into the defaults.
    expect(find('primary').h).toBe(217);
    expect(find('primary').lightBg.base).toBe(B.primary.lightBg.base);
  });

  it('notifies subscribers', async () => {
    const { colorTypes } = await freshStore();
    colorTypes.updateSeed('primary', { h: 42 });

    const seen: number[] = [];
    const stop = colorTypes.subscribe((state: any) => seen.push(state.colorTypes[0].h));
    colorTypes.reset();
    stop();

    expect(seen).toEqual([42, 217]);
  });
});
