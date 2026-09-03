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
  /**
   * Mirror primary's hue *and* seed lightness, exactly as Optics' own tokens
   * do (`--op-color-neutral-h: var(--op-color-primary-h)`). Only offered on
   * the families Optics actually aliases — see `canMatchPrimary`. Enforced by
   * `syncMatchedSeeds` on every write, so `h` and `l` are already correct for
   * every reader (both exporters, the previews, the contrast stats).
   */
  matchPrimary?: boolean;
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
 * and gained a seed `l`.
 * 2 → 3: neutral gained the `matchPrimary` lock. See `migrateState`.
 */
const SCHEMA_VERSION = 3;

const PRIMARY_ID = 'primary';

/**
 * Which color types may lock their seed to primary's.
 *
 * Optics aliases exactly one family: `--op-color-neutral-h` and
 * `--op-color-neutral-l` are `var(--op-color-primary-…)`, while every other
 * family carries literals. Locking one of those would export a seed Optics has
 * no alias for, so the switch is offered on neutral alone.
 */
export function canMatchPrimary(colorType: { id: string }): boolean {
  return colorType.id === 'neutral';
}

/**
 * Apply every active lock.
 *
 * Mirroring is enforced on the way *into* the store rather than derived at
 * read time, so every consumer — CSS export, Figma export, previews, contrast
 * stats — sees a state where the locked seeds are simply already right. Runs
 * on load, on import and after every mutation, and is idempotent.
 */
function syncMatchedSeeds(state: ColorTypesState): ColorTypesState {
  const primary = state.colorTypes.find(ct => ct.id === PRIMARY_ID);
  if (!primary) return state;

  let changed = false;
  const colorTypes = state.colorTypes.map(ct => {
    if (ct.id === PRIMARY_ID || !ct.matchPrimary) return ct;
    if (ct.h === primary.h && ct.l === primary.l) return ct;
    changed = true;
    return { ...ct, h: primary.h, l: primary.l };
  });

  return changed ? { ...state, colorTypes } : state;
}

/**
 * Infer the lock for imported color types.
 *
 * A tokens file carries no lock, but the alias is observable: it still held if
 * both seeds agree with primary's. An imported neutral whose hue was moved
 * away stays unlocked, so importing never overwrites a hue the file states.
 */
function inferMatchPrimary(colorTypes: ColorTypeConfig[]): ColorTypeConfig[] {
  const primary = colorTypes.find(ct => ct.id === PRIMARY_ID);

  return colorTypes.map(ct => ({
    ...ct,
    matchPrimary:
      canMatchPrimary(ct) && !!primary && ct.h === primary.h && ct.l === primary.l
  }));
}

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
    matchPrimary: false,
    h: seed.h,
    s: seed.s,
    l: seed.l ?? baseline.l,
    ...cloneRamps(baseline)
  };
}

/**
 * A fresh set of defaults on every call.
 *
 * Deliberately a factory, not a shared constant: `reset()` hands the result
 * straight to the store, so a constant would put the *same* objects — and the
 * same six ramp records — back into live state after every reset. One stray
 * mutation anywhere downstream would then corrupt the defaults permanently,
 * and reset would quietly stop resetting.
 */
function createDefaultColorTypes(): ColorTypeConfig[] {
  return [
    createDefaultColorType('primary', 'Primary', { h: 217, s: 91 }),
    // Optics ships neutral's hue and seed lightness aliased to primary's, so a
    // fresh theme starts locked — matching the design system's own default.
    { ...createDefaultColorType('neutral', 'Neutral', { h: 217, s: 4 }), matchPrimary: true },
    createDefaultColorType('secondary', 'Secondary', { h: 260, s: 60 }),
    createDefaultColorType('notice', 'Notice', { h: 142, s: 76 }),
    createDefaultColorType('warning', 'Warning', { h: 38, s: 92 }),
    createDefaultColorType('danger', 'Danger', { h: 0, s: 84 }),
    createDefaultColorType('info', 'Info', { h: 199, s: 89 }),
  ];
}

/** True when every one of the 57 ramp values matches `baseline` exactly. */
function rampEquals(colorType: ColorTypeConfig, baseline: StopRamps): boolean {
  return RAMP_ROLES.every(role =>
    OPTICS_STOPS.every(stop => colorType[role]?.[stop] === baseline[role][stop])
  );
}

/**
 * Repair state saved by an older schema, one version at a time.
 *
 * Each step runs only for state older than it, so a v2 state never re-enters
 * the v1 repair — by then its ramps are deliberate, and re-running the repair
 * would revert a neutral someone had chosen to set to primary's curve.
 */
function migrateState(state: ColorTypesState): ColorTypesState {
  let migrated = state;
  if ((migrated.version ?? 1) < 2) migrated = migrateV1toV2(migrated);
  if ((migrated.version ?? 1) < 3) migrated = migrateV2toV3(migrated);
  return migrated;
}

/**
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
function migrateV1toV2(state: ColorTypesState): ColorTypesState {
  const primaryRamp = OPTICS_FAMILY_BASELINES.primary;

  return {
    ...state,
    version: 2,
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

/**
 * v2 had no `matchPrimary`. Saved state predates the concept entirely, so
 * there is no intent recorded to preserve — it starts on, the same as a fresh
 * theme and the same as Optics itself. `syncMatchedSeeds` then pulls neutral's
 * hue and seed lightness onto primary's on that first load; switch it off to
 * take them back.
 */
function migrateV2toV3(state: ColorTypesState): ColorTypesState {
  return {
    ...state,
    version: 3,
    colorTypes: state.colorTypes.map(ct => ({ ...ct, matchPrimary: canMatchPrimary(ct) }))
  };
}

function defaultState(): ColorTypesState {
  return { mode: 'light', colorTypes: createDefaultColorTypes(), version: SCHEMA_VERSION };
}

function loadInitialState(): ColorTypesState {
  if (typeof window === 'undefined') return defaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.mode && Array.isArray(parsed.colorTypes)) {
        const migrated = syncMatchedSeeds(migrateState(parsed));
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
      const newState = syncMatchedSeeds(updater(state));
      saveState(newState);
      return newState;
    });
  };

  const setAndSave = (state: ColorTypesState) => {
    const synced = syncMatchedSeeds(state);
    set(synced);
    saveState(synced);
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

    /**
     * A seed edit made through the color picker. A picked color carries its own
     * hue and lightness, so it is also an instruction to stop matching primary
     * — committed together, or the lock would snap the new hue straight back.
     */
    updateSeedFromPicker: (id: string, seed: Seed) =>
      patchColorType(id, { ...seed, matchPrimary: false }),

    /** Turning the lock on immediately pulls primary's seeds in. */
    setMatchPrimary: (id: string, matchPrimary: boolean) =>
      patchColorType(id, { matchPrimary }),

    
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

    importPalette: (result: ImportResult) => {
      // Only read for its ids and names, to tell a built-in family from a
      // custom one.
      const builtIns = createDefaultColorTypes();

      setAndSave({
        mode: result.mode,
        // An export carries no lock, so it is inferred from the seeds — a
        // file whose neutral hue still equals primary's imports as matched.
        colorTypes: inferMatchPrimary(result.colorTypes.map(imported => {
          const builtIn = builtIns.find(
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
        })),
        version: SCHEMA_VERSION
      });
    }
  };
}

export const colorTypes = createColorTypesStore();

/** The color types an export or preview should include. */
export const enabledColorTypes = derived(colorTypes, state =>
  state.colorTypes.filter(ct => ct.enabled)
);
