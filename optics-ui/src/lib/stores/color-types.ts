import { derived, writable } from 'svelte/store';
import type { OpticsStopName, StopRamps } from '../data/defaults';
import { OPTICS_STOPS, RAMP_ROLES, DEFAULT_SEED_LIGHTNESS } from '../data/defaults';
import { OPTICS_FAMILY_BASELINES, FALLBACK_BASELINE } from '../data/optics-baselines';
import { opticsFamilyName, familySlug } from '../data/optics-families';
import type { ImportResult } from '../utils/import';

export interface ColorTypeConfig extends StopRamps {
  id: string;
  name: string;
  enabled: boolean;
  isCustom: boolean;
  collapsed: boolean;
  h: number;
  s: number;
  /**
   * Lightness of the *seed* color, not of any stop. Feeds
   * `--op-color-{family}-l` / `-original` in the CSS export. Captured from the
   * color picker; the 19 per-stop sliders are a separate concern.
   */
  l: number;
}

export interface ColorTypesState {
  mode: 'light' | 'dark';
  colorTypes: ColorTypeConfig[];
  /** Schema version of the persisted state; see `migrateState`. */
  version?: number;
}

const STORAGE_KEY = 'optics-theme-builder-state';

/**
 * 1 → 2: every color type used to be seeded with *primary's* lightness ramp,
 * and gained a seed `l`. See `migrateState`.
 */
const SCHEMA_VERSION = 2;

/** The family's own curve where Optics ships one, primary's otherwise. */
function baselineFor(name: string) {
  return OPTICS_FAMILY_BASELINES[opticsFamilyName(name)] ?? FALLBACK_BASELINE;
}

/** Fresh copies of all six ramps, so edits never write through to the table. */
function cloneRamps(baseline: StopRamps): StopRamps {
  return Object.fromEntries(
    RAMP_ROLES.map(role => [role, { ...baseline[role] }])
  ) as StopRamps;
}

type Seed = { h: number; s: number; l?: number };

function createDefaultColorType(
  id: string,
  name: string,
  seed: Seed,
  isCustom: boolean = false
): ColorTypeConfig {
  // Each Optics family ships its own lightness curve — neutral differs from
  // primary at 43 of its 57 tokens — so seed from that family's real table.
  const baseline = baselineFor(name);

  return {
    id,
    name,
    enabled: true,
    isCustom,
    collapsed: true,
    h: seed.h,
    s: seed.s,
    l: seed.l ?? baseline.l,
    ...cloneRamps(baseline)
  };
}

const DEFAULT_COLOR_TYPES: ColorTypeConfig[] = [
  createDefaultColorType('primary', 'Primary', { h: 217, s: 91 }),
  createDefaultColorType('neutral', 'Neutral', { h: 217, s: 4 }),
  createDefaultColorType('secondary', 'Secondary', { h: 260, s: 60 }),
  createDefaultColorType('notice', 'Notice', { h: 142, s: 76 }),
  createDefaultColorType('warning', 'Warning', { h: 38, s: 92 }),
  createDefaultColorType('danger', 'Danger', { h: 0, s: 84 }),
  createDefaultColorType('info', 'Info', { h: 199, s: 89 }),
];

/** True when every one of the 57 ramp values matches `baseline` exactly. */
function rampEquals(colorType: ColorTypeConfig, baseline: StopRamps): boolean {
  return RAMP_ROLES.every(role =>
    OPTICS_STOPS.every(stop => colorType[role]?.[stop] === baseline[role][stop])
  );
}

/**
 * Repair state saved by an older schema.
 *
 * v1 seeded *every* color type with primary's lightness ramp, so a saved
 * neutral or alert family carries the wrong curve — and the CSS export then
 * faithfully reports all 57 of those values as deliberate overrides.
 *
 * The repair is deliberately surgical: a family's ramp is replaced only when it
 * matches primary's ramp *exactly*, which means nobody hand-tuned it (no one
 * enters 57 values that happen to equal another family's curve). A family with
 * even one edited stop is left completely alone, so no real work is lost.
 * Hue and saturation are never touched.
 */
function migrateState(state: ColorTypesState): ColorTypesState {
  if ((state.version ?? 1) >= SCHEMA_VERSION) return state;

  const primaryRamp = OPTICS_FAMILY_BASELINES.primary;

  return {
    ...state,
    version: SCHEMA_VERSION,
    colorTypes: state.colorTypes.map(colorType => {
      const family = opticsFamilyName(colorType.name);
      const baseline = OPTICS_FAMILY_BASELINES[family];

      // v1 had no seed lightness; fall back to this family's Optics default.
      const withSeed = {
        ...colorType,
        l: colorType.l ?? baseline?.l ?? DEFAULT_SEED_LIGHTNESS
      };

      // Only Optics families have a correct ramp to restore, and `primary`'s
      // own ramp is already right.
      if (!baseline || family === 'primary') return withSeed;
      if (!rampEquals(withSeed, primaryRamp)) return withSeed;

      return { ...withSeed, ...cloneRamps(baseline) };
    })
  };
}

function defaultState(): ColorTypesState {
  return { mode: 'light', colorTypes: DEFAULT_COLOR_TYPES, version: SCHEMA_VERSION };
}

function loadInitialState(): ColorTypesState {
  if (typeof window === 'undefined') return defaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.mode && Array.isArray(parsed.colorTypes)) {
        const migrated = migrateState(parsed);
        // Write the repair back, or every future load redoes it.
        if (migrated !== parsed) saveState(migrated);
        return migrated;
      }
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }

  return defaultState();
}

function saveState(state: ColorTypesState) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
}

function createColorTypesStore() {
  const { subscribe, set, update } = writable<ColorTypesState>(loadInitialState());

  const updateAndSave = (updater: (state: ColorTypesState) => ColorTypesState) => {
    update(state => {
      const newState = updater(state);
      saveState(newState);
      return newState;
    });
  };

  const setAndSave = (state: ColorTypesState) => {
    set(state);
    saveState(state);
  };

  /**
   * Merge `patch` into one color type. Every single-type mutation goes through
   * here, so each one is a single store notification and a single localStorage
   * write — `<input type="color">` fires `input` continuously while dragging.
   */
  const patchColorType = (id: string, patch: Partial<ColorTypeConfig>) =>
    updateAndSave(state => ({
      ...state,
      colorTypes: state.colorTypes.map(ct => (ct.id === id ? { ...ct, ...patch } : ct))
    }));

  /** Replace one stop in whichever ramp the current mode and role select. */
  const patchStop = (
    id: string,
    role: 'Bg' | 'On' | 'OnAlt',
    stop: OpticsStopName,
    value: number
  ) =>
    updateAndSave(state => {
      const ramp = `${state.mode}${role}` as keyof StopRamps;
      return {
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, [ramp]: { ...ct[ramp], [stop]: value } } : ct
        )
      };
    });

  return {
    subscribe,
    setMode: (mode: 'light' | 'dark') => 
      updateAndSave(state => ({ ...state, mode })),
    
    toggleColorType: (id: string) =>
      updateAndSave(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, enabled: !ct.enabled } : ct
        )
      })),

    toggleCollapse: (id: string) =>
      updateAndSave(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, collapsed: !ct.collapsed } : ct
        )
      })),

    /** Any combination of the three seed components, committed once. */
    updateSeed: (id: string, seed: Partial<Seed>) => patchColorType(id, seed),

    
    updateBg: (id: string, stop: OpticsStopName, value: number) =>
      patchStop(id, 'Bg', stop, value),

    updateOn: (id: string, stop: OpticsStopName, value: number) =>
      patchStop(id, 'On', stop, value),

    updateOnAlt: (id: string, stop: OpticsStopName, value: number) =>
      patchStop(id, 'OnAlt', stop, value),

    
    addCustomColorType: (name: string, h: number, s: number, l?: number) =>
      updateAndSave(state => ({
        ...state,
        colorTypes: [
          ...state.colorTypes,
          createDefaultColorType(`custom-${Date.now()}`, name, { h, s, l }, true)
        ]
      })),
    
    removeColorType: (id: string) =>
      updateAndSave(state => ({
        ...state,
        colorTypes: state.colorTypes.filter(ct => ct.id !== id)
      })),
    
    renameColorType: (id: string, name: string) => patchColorType(id, { name }),
    
    reset: () => setAndSave(defaultState()),

    importPalette: (result: ImportResult) => setAndSave({
      mode: result.mode,
      colorTypes: result.colorTypes.map(imported => {
        const builtIn = DEFAULT_COLOR_TYPES.find(
          d => d.name.toLowerCase() === imported.name.toLowerCase()
        );
        // An export only carries one mode, so the other mode falls back to
        // defaults — and those must be *this family's* Optics curve, not
        // primary's. The tokens file has no seed lightness either.
        const baseline = baselineFor(imported.name);
        return {
          id: builtIn?.id ?? `custom-${familySlug(imported.name)}`,
          name: imported.name.charAt(0).toUpperCase() + imported.name.slice(1),
          enabled: true,
          isCustom: !builtIn,
          collapsed: true,
          h: imported.h,
          s: imported.s,
          l: baseline.l,
          ...cloneRamps(baseline),
          [`${result.mode}Bg`]: imported.bgValues,
          [`${result.mode}On`]: imported.onValues,
          [`${result.mode}OnAlt`]: imported.onAltValues,
        };
      }),
      version: SCHEMA_VERSION
    })
  };
}

export const colorTypes = createColorTypesStore();

/** The color types an export or preview should include. */
export const enabledColorTypes = derived(colorTypes, state =>
  state.colorTypes.filter(ct => ct.enabled)
);
